#!/usr/bin/env python3
"""Refresh data/metrics.json with citation metrics.

Runs monthly from .github/workflows/update-metrics.yml. Each source is
optional: when its API key is missing or the request fails, the previous
values are kept, so the site never shows empty numbers.

Environment variables (set as GitHub repository secrets):
  SERPAPI_KEY       Google Scholar, via SerpApi (google_scholar_author engine)
  WOS_API_KEY       Web of Science Starter API (institutional plan returns times cited)
  SCOPUS_API_KEY    Elsevier Scopus Author Retrieval API
  SCOPUS_INSTTOKEN  Elsevier institutional token (needed outside the campus network)

Optional overrides:
  SCHOLAR_AUTHOR_ID (default vpywJdsAAAAJ)
  SCOPUS_AUTHOR_ID  (default 57214998748)
  WOS_QUERY         (default AI=(0000-0002-1236-0498), i.e. the ORCID iD)

Only the Python standard library is used.
"""

from __future__ import annotations

import datetime as dt
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
METRICS_PATH = ROOT / "data" / "metrics.json"

SCHOLAR_AUTHOR_ID = os.environ.get("SCHOLAR_AUTHOR_ID", "vpywJdsAAAAJ")
SCOPUS_AUTHOR_ID = os.environ.get("SCOPUS_AUTHOR_ID", "57214998748")
WOS_QUERY = os.environ.get("WOS_QUERY", "AI=(0000-0002-1236-0498)")

# A new citation total below this share of the previous one is treated as a
# glitch (e.g. a partial API response) and ignored.
MIN_RATIO = 0.8
TIMEOUT = 30


def log(message: str) -> None:
    print(message, flush=True)


def warn(message: str) -> None:
    # Rendered as a yellow annotation in the GitHub Actions summary.
    print(f"::warning::{message}", flush=True)


def get_json(url: str, headers: dict[str, str] | None = None) -> dict:
    request = urllib.request.Request(url, headers={"Accept": "application/json", **(headers or {})})
    with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
        return json.loads(response.read().decode("utf-8"))


def h_index(citations: list[int]) -> int:
    ranked = sorted((c for c in citations if c is not None), reverse=True)
    return sum(1 for i, c in enumerate(ranked, start=1) if c >= i)


def to_int(value) -> int | None:
    try:
        return int(str(value).replace(",", "").strip())
    except (TypeError, ValueError):
        return None


# ---------------------------------------------------------------- sources

def fetch_scholar() -> dict | None:
    key = os.environ.get("SERPAPI_KEY")
    if not key:
        log("Google Scholar: SERPAPI_KEY not set, skipping.")
        return None

    params = urllib.parse.urlencode({
        "engine": "google_scholar_author",
        "author_id": SCHOLAR_AUTHOR_ID,
        "hl": "en",
        "api_key": key,
    })
    data = get_json(f"https://serpapi.com/search.json?{params}")
    if data.get("error"):
        raise RuntimeError(data["error"])

    table = (data.get("cited_by") or {}).get("table") or []
    values: dict[str, int | None] = {}
    for row in table:
        for name, cell in row.items():
            if isinstance(cell, dict):
                values[name] = to_int(cell.get("all"))

    citations = values.get("citations")
    h = values.get("h_index")
    i10 = values.get("i10_index")
    if citations is None or h is None:
        raise RuntimeError(f"unexpected response shape: {list(values)}")

    by_year = {}
    for point in (data.get("cited_by") or {}).get("graph") or []:
        year, count = to_int(point.get("year")), to_int(point.get("citations"))
        if year and count is not None:
            by_year[str(year)] = count

    result = {"citations": citations, "h_index": h, "source": "serpapi"}
    if i10 is not None:
        result["i10_index"] = i10
    if by_year:
        result["by_year"] = by_year
    return result


def fetch_wos() -> dict | None:
    key = os.environ.get("WOS_API_KEY")
    if not key:
        log("Web of Science: WOS_API_KEY not set, skipping.")
        return None

    counts: list[int | None] = []
    page, total = 1, None
    while True:
        params = urllib.parse.urlencode({"db": "WOS", "q": WOS_QUERY, "limit": 50, "page": page})
        data = get_json(f"https://api.clarivate.com/apis/wos-starter/v1/documents?{params}",
                        headers={"X-ApiKey": key})
        total = to_int((data.get("metadata") or {}).get("total")) or 0
        hits = data.get("hits") or []
        for hit in hits:
            cited = None
            for entry in hit.get("citations") or []:
                if str(entry.get("db", "")).upper() == "WOS":
                    cited = to_int(entry.get("count"))
            counts.append(cited)
        if not hits or len(counts) >= total or page >= 20:
            break
        page += 1
        time.sleep(1.1)  # stay within the 1 request/second limit of the smallest plan

    if total == 0:
        raise RuntimeError(f"no documents matched {WOS_QUERY!r}")
    known = [c for c in counts if c is not None]
    if not known:
        raise RuntimeError("the API returned no times-cited counts "
                           "(the Free Trial plan does not include them; use the institutional plan)")

    return {"citations": sum(known), "h_index": h_index(known), "documents": total, "source": "wos-starter"}


def _find_key(obj, key):
    if isinstance(obj, dict):
        if key in obj:
            return obj[key]
        for value in obj.values():
            found = _find_key(value, key)
            if found is not None:
                return found
    elif isinstance(obj, list):
        for value in obj:
            found = _find_key(value, key)
            if found is not None:
                return found
    return None


def fetch_scopus() -> dict | None:
    key = os.environ.get("SCOPUS_API_KEY")
    if not key:
        log("Scopus: SCOPUS_API_KEY not set, skipping.")
        return None

    headers = {"X-ELS-APIKey": key}
    token = os.environ.get("SCOPUS_INSTTOKEN")
    if token:
        headers["X-ELS-Insttoken"] = token

    last_error = None
    for view in ("METRICS", "ENHANCED"):
        try:
            data = get_json(f"https://api.elsevier.com/content/author/author_id/{SCOPUS_AUTHOR_ID}?view={view}",
                            headers=headers)
        except urllib.error.HTTPError as error:
            last_error = f"HTTP {error.code} for view={view}"
            continue
        h = to_int(_find_key(data, "h-index"))
        citations = to_int(_find_key(data, "citation-count"))
        documents = to_int(_find_key(data, "document-count"))
        if h is not None and citations is not None:
            result = {"citations": citations, "h_index": h, "source": "scopus-api"}
            if documents is not None:
                result["documents"] = documents
            return result
        last_error = f"view={view} did not include h-index/citation-count"

    raise RuntimeError(last_error or "no data")


# ------------------------------------------------------------------- main

def main() -> int:
    metrics = json.loads(METRICS_PATH.read_text(encoding="utf-8")) if METRICS_PATH.exists() else {}
    today = dt.date.today().isoformat()
    changed = False

    for name, fetch in (("scholar", fetch_scholar), ("wos", fetch_wos), ("scopus", fetch_scopus)):
        try:
            fresh = fetch()
        except Exception as error:  # keep previous values on any failure
            warn(f"{name}: update failed ({error}); keeping previous values.")
            continue
        if not fresh:
            continue

        previous = metrics.get(name) or {}
        old_total = previous.get("citations")
        if isinstance(old_total, int) and old_total > 0 and fresh["citations"] < old_total * MIN_RATIO:
            warn(f"{name}: citations dropped from {old_total} to {fresh['citations']}; ignoring this result.")
            continue

        # "updated" records the last successful check, so it moves every month
        # even when the numbers stay the same.
        merged = {**previous, **fresh, "updated": today}
        log(f"{name}: citations={merged['citations']} h-index={merged['h_index']}")
        metrics[name] = merged
        changed = True

    if not changed:
        log("No source was updated; data/metrics.json left as is.")
        return 0

    metrics["updated"] = today
    METRICS_PATH.parent.mkdir(parents=True, exist_ok=True)
    METRICS_PATH.write_text(json.dumps(metrics, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    log(f"Wrote {METRICS_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
