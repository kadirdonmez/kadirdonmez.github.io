// ============================================================
// Kadir Dönmez — Academic Portfolio · interactions
// Hero flight network, theme, navigation, reveals, counters,
// news carousel, filters, publications, metrics feed and charts.
// ============================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ------------------------------------------------------------
// News items (newest first). Add a new item at the top.
// Preview images live in photos/news-previews/.
// ------------------------------------------------------------
const NEWS_ITEMS = [
    {
        source: 'Samsun University',
        meta: 'Project Award',
        title: 'TUBITAK 1501 Project Accepted for Drone-Based Damage Detection',
        summary: 'Our project on a drone-based damage detection platform for aircraft maintenance was accepted under the TUBITAK 1501 Industrial R&D Support Program.',
        url: 'https://samsun.edu.tr/ogretim-elemanlarimizdan-tubitak-proje-basarisi/',
        image: 'photos/news-previews/samsun-tubitak-1501.png'
    },
    {
        source: 'Samsun University',
        meta: 'International Recognition',
        title: 'Accepted to the CA24122 mSPACE Action Working Group',
        summary: 'I was accepted to the CA24122 mSPACE Action Working Group, marking a new step in my international academic collaboration activities.',
        url: 'https://samsun.edu.tr/ogretim-uyemiz-dr-ogr-uyesi-doc-dr-kadir-donmezden-uluslararasi-calismalara-katki/',
        image: 'photos/news-previews/samsun-mspace.png'
    },
    {
        source: 'Samsun University',
        meta: 'Project Award',
        title: 'TUBITAK 1002 Project Awarded for UAV-Based Aircraft Damage Detection',
        summary: 'My project was accepted under the TUBITAK 1002 program, supporting research on UAV-assisted deep learning for aircraft damage detection.',
        url: 'https://samsun.edu.tr/doc-dr-kadir-donmezden-tubitak-proje-basarisi/',
        image: 'photos/news-previews/samsun-tubitak.png'
    },
    {
        source: 'LinkedIn',
        meta: 'Teaching Mobility',
        title: 'Erasmus+ Teaching Mobility Visit to UPC',
        summary: 'I visited UPC as part of an Erasmus+ teaching mobility program and contributed to academic exchange in air traffic management education.',
        url: 'https://www.linkedin.com/posts/kadir-d%C3%B6nmez-4b99b2174_erasmusplus-academiccollaboration-airtrafficmanagement-activity-7452704682860351488-QRZa?utm_source=share&utm_medium=member_desktop&rcm=ACoAAClwN00Bosdl-eYhYzagMpD7Pna8nQxQEsQ',
        image: 'photos/news-previews/linkedin-erasmus.png'
    },
    {
        source: 'LinkedIn',
        meta: 'Invited Speaker',
        title: 'Invited Speaker at TSI for International Civil Aviation Day',
        summary: 'I took part as an invited speaker at TSI during the International Civil Aviation Day program, sharing perspectives on aviation and air traffic management.',
        url: 'https://www.linkedin.com/posts/kadir-d%C3%B6nmez-4b99b2174_internationalcivilaviationday-aviation-atm-activity-7403830846853615616-7rLo?utm_source=share&utm_medium=member_desktop&rcm=ACoAAClwN00Bosdl-eYhYzagMpD7Pna8nQxQEsQ',
        image: 'photos/news-previews/linkedin-civil-aviation.png'
    },
    {
        source: 'LinkedIn',
        meta: 'Professional Training',
        title: 'UAV Training Delivered in Two Cities for the General Directorate of Forestry',
        summary: 'Within the IHA-1 Commercial UAV Pilot Course scope, I delivered training programs for the General Directorate of Forestry in two different cities.',
        url: 'https://www.linkedin.com/posts/kadir-d%C3%B6nmez-4b99b2174_i%CC%87ha-1-ticari-i%CC%87nsans%C4%B1z-hava-arac%C4%B1-pilotu-kurs-activity-7294688054672318464-cv3I?utm_source=share&utm_medium=member_desktop&rcm=ACoAAClwN00Bosdl-eYhYzagMpD7Pna8nQxQEsQ',
        image: 'photos/news-previews/linkedin-pilot-course.png'
    },
    {
        source: 'LinkedIn',
        meta: 'Conference Presentation',
        title: 'Presented a Poster at SESAR Innovation Days',
        summary: 'I participated in SESAR Innovation Days with a poster presentation focused on air traffic management research and innovation.',
        url: 'https://www.linkedin.com/posts/kadir-d%C3%B6nmez-4b99b2174_sesarinnovationdays-airtrafficmanagement-activity-7262490023206256641-lHVQ?utm_source=share&utm_medium=member_desktop&rcm=ACoAAClwN00Bosdl-eYhYzagMpD7Pna8nQxQEsQ',
        image: 'photos/news-previews/linkedin-sesar.png'
    },
    {
        source: 'LinkedIn',
        meta: 'Media Appearance',
        title: 'Joined TRT Trabzon Radio to Introduce Our Department',
        summary: 'I took part in a TRT Trabzon Radio program to share information about our department, its academic structure, and its educational focus.',
        url: 'https://www.linkedin.com/posts/kadir-d%C3%B6nmez-4b99b2174_uaexakbakaftmveonaraftm-aircraftmaintenance-activity-7198251772535046144-C38e?utm_source=share&utm_medium=member_desktop&rcm=ACoAAClwN00Bosdl-eYhYzagMpD7Pna8nQxQEsQ',
        image: 'photos/news-previews/linkedin-maintenance.png'
    }
];

// ------------------------------------------------------------
// Hero background: animated flight network between airports
// connected to the research network (ICAO codes).
// ------------------------------------------------------------
function initHeroNetwork() {
    const canvas = document.getElementById('hero-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;

    const NODES = [
        { id: 'LEBL', x: 0.035, y: 0.25 },
        { id: 'LTBY', x: 0.33, y: 0.11 },
        { id: 'LTFH', x: 0.585, y: 0.15, home: true },
        { id: 'LTFM', x: 0.06, y: 0.86 },
        { id: 'LTAC', x: 0.43, y: 0.93 },
        { id: 'WSSS', x: 0.965, y: 0.9 }
    ];
    const LINKS = [
        ['LTFH', 'LTFM', 0.16], ['LTFH', 'LTAC', -0.2], ['LTFM', 'LEBL', -0.22], ['LTFH', 'WSSS', 0.14],
        ['LTBY', 'LTFM', 0.18], ['LTAC', 'WSSS', 0.12], ['LEBL', 'LTBY', -0.16], ['LTBY', 'LTFH', -0.24]
    ];

    let width = 0;
    let height = 0;
    let routes = [];
    let planes = [];
    let frame = null;
    let visible = true;

    const point = (r, t) => {
        const u = 1 - t;
        return {
            x: u * u * r.a.x + 2 * u * t * r.c.x + t * t * r.b.x,
            y: u * u * r.a.y + 2 * u * t * r.c.y + t * t * r.b.y
        };
    };

    const tangent = (r, t) => ({
        x: 2 * (1 - t) * (r.c.x - r.a.x) + 2 * t * (r.b.x - r.c.x),
        y: 2 * (1 - t) * (r.c.y - r.a.y) + 2 * t * (r.b.y - r.c.y)
    });

    function layout() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = hero.offsetWidth;
        height = hero.offsetHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const pos = id => {
            const n = NODES.find(node => node.id === id);
            return { x: n.x * width, y: n.y * height };
        };

        routes = LINKS.map(([from, to, bend]) => {
            const a = pos(from);
            const b = pos(to);
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const c = { x: mx - (dy / len) * len * bend, y: my + (dx / len) * len * bend };
            return { a, b, c, len };
        });

        const compact = width < 700;
        planes = routes.flatMap((route, i) => {
            const count = compact ? (i % 2 === 0 ? 1 : 0) : (route.len > width * 0.55 ? 2 : 1);
            return Array.from({ length: count }, (_, k) => ({
                route,
                t: (k * 0.5 + Math.random() * 0.5) % 1,
                dir: (i + k) % 2 === 0 ? 1 : -1,
                speed: (0.22 + Math.random() * 0.18) / route.len,
                amber: (i + k) % 4 === 1
            }));
        });
    }

    function drawRoutes() {
        ctx.save();
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 7]);
        ctx.strokeStyle = 'rgba(76, 201, 240, 0.16)';
        routes.forEach(r => {
            ctx.beginPath();
            ctx.moveTo(r.a.x, r.a.y);
            ctx.quadraticCurveTo(r.c.x, r.c.y, r.b.x, r.b.y);
            ctx.stroke();
        });
        ctx.restore();
    }

    function drawNodes(time) {
        const showLabels = width >= 700;
        ctx.save();
        ctx.font = '500 10px "JetBrains Mono", ui-monospace, monospace';
        ctx.textBaseline = 'middle';
        NODES.forEach(n => {
            const x = n.x * width;
            const y = n.y * height;
            const size = n.home ? 5 : 3.5;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 4);
            ctx.strokeStyle = n.home ? 'rgba(245, 181, 68, 0.9)' : 'rgba(76, 201, 240, 0.55)';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(-size, -size, size * 2, size * 2);
            ctx.restore();

            if (n.home) {
                const pulse = (time / 2600) % 1;
                ctx.beginPath();
                ctx.arc(x, y, 6 + pulse * 22, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(245, 181, 68, ${0.45 * (1 - pulse)})`;
                ctx.stroke();
            }

            if (!showLabels) return;
            const alignRight = n.x > 0.9;
            ctx.textAlign = alignRight ? 'right' : 'left';
            ctx.fillStyle = n.home ? 'rgba(255, 226, 166, 0.75)' : 'rgba(156, 173, 198, 0.5)';
            ctx.fillText(n.id, x + (alignRight ? -12 : 12), y - 1);
        });
        ctx.restore();
    }

    function drawPlane(p) {
        const r = p.route;
        const trail = 0.11;
        const steps = 14;
        for (let i = 0; i < steps; i++) {
            const t0 = p.t - p.dir * trail * (i / steps);
            const t1 = p.t - p.dir * trail * ((i + 1) / steps);
            if (t0 < 0 || t0 > 1 || t1 < 0 || t1 > 1) break;
            const a = point(r, t0);
            const b = point(r, t1);
            const alpha = 0.55 * (1 - i / steps);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = p.amber ? `rgba(245, 181, 68, ${alpha})` : `rgba(76, 201, 240, ${alpha})`;
            ctx.lineWidth = 1.4;
            ctx.stroke();
        }

        const head = point(r, p.t);
        const tan = tangent(r, p.t);
        const angle = Math.atan2(tan.y * p.dir, tan.x * p.dir);

        const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 14);
        glow.addColorStop(0, p.amber ? 'rgba(245, 181, 68, 0.45)' : 'rgba(76, 201, 240, 0.45)');
        glow.addColorStop(1, 'rgba(76, 201, 240, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(-4, -3.6);
        ctx.lineTo(-2, 0);
        ctx.lineTo(-4, 3.6);
        ctx.closePath();
        ctx.fillStyle = p.amber ? 'rgba(255, 226, 166, 0.95)' : 'rgba(205, 244, 255, 0.95)';
        ctx.fill();
        ctx.restore();
    }

    function render(time = 0) {
        ctx.clearRect(0, 0, width, height);
        drawRoutes();
        drawNodes(time);
        planes.forEach(drawPlane);
    }

    function tick(time) {
        planes.forEach(p => {
            p.t += p.speed * p.dir;
            if (p.t > 1) p.t -= 1;
            if (p.t < 0) p.t += 1;
        });
        render(time);
        frame = requestAnimationFrame(tick);
    }

    function start() {
        if (frame || prefersReducedMotion || !visible || document.hidden) return;
        frame = requestAnimationFrame(tick);
    }

    function stop() {
        if (frame) cancelAnimationFrame(frame);
        frame = null;
    }

    layout();
    render();
    start();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { layout(); render(); }, 120);
    });

    new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
    }).observe(hero);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop(); else start();
    });
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
const escapeHtml = value => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatNumber = n => Number(n).toLocaleString('en-US');

const formatMonth = iso => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
};

function getTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const body = document.body;
    const header = document.querySelector('.header');
    const themeBtn = document.getElementById('themeBtn');
    const menuBtn = document.getElementById('menuBtn');
    const drawer = document.getElementById('drawer');
    const closeDrawerBtn = document.getElementById('closeDrawer');

    // ---- Theme ----
    function applyThemeUi(theme) {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'light' ? '#f3f6fb' : '#050a16');
        if (themeBtn) {
            themeBtn.setAttribute('aria-pressed', String(theme === 'light'));
            themeBtn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
        }
    }

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        try { localStorage.setItem('kd_theme_v2', theme); } catch (e) { /* storage unavailable */ }
        applyThemeUi(theme);
        document.dispatchEvent(new CustomEvent('kd:themechange', { detail: theme }));
    }

    applyThemeUi(getTheme());
    themeBtn?.addEventListener('click', () => setTheme(getTheme() === 'light' ? 'dark' : 'light'));

    // ---- Year ----
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ---- News section (built from NEWS_ITEMS, placed before Contact) ----
    buildNewsSection();

    // ---- Hero ----
    initHeroNetwork();

    // ---- Drawer ----
    function openDrawer() {
        if (!drawer) return;
        drawer.style.display = 'flex';
        requestAnimationFrame(() => drawer.classList.add('active'));
        menuBtn?.setAttribute('aria-expanded', 'true');
        body.style.overflow = 'hidden';
        closeDrawerBtn?.focus();
    }

    function closeDrawer() {
        if (!drawer || drawer.style.display !== 'flex') return;
        drawer.classList.remove('active');
        setTimeout(() => { drawer.style.display = 'none'; }, 350);
        menuBtn?.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
    }

    menuBtn?.addEventListener('click', () => {
        if (menuBtn.getAttribute('aria-expanded') === 'true') closeDrawer(); else openDrawer();
    });
    closeDrawerBtn?.addEventListener('click', closeDrawer);
    drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

    // ---- Scroll progress, header state, active link ----
    const scrollProgress = document.getElementById('scrollProgress');
    const navLinks = document.querySelectorAll('.nav-pill .menu a, .drawer .menu a');
    const sections = Array.from(document.querySelectorAll('section[id]'));

    function onScroll() {
        const y = window.scrollY;
        header?.classList.toggle('is-scrolled', y > 24);

        if (scrollProgress) {
            const docHeight = root.scrollHeight - window.innerHeight;
            scrollProgress.style.width = (docHeight > 0 ? (y / docHeight) * 100 : 0) + '%';
        }

        let current = '';
        sections.forEach(section => {
            if (y >= section.offsetTop - 160) current = section.id;
        });
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    // ---- Back to top ----
    document.querySelector('.back-to-top')?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    // ---- CV button: only shown where the local CV generator is available ----
    window.addEventListener('load', () => {
        const cvBtn = document.getElementById('downloadCvBtn');
        if (cvBtn && typeof window.generateCV === 'function') cvBtn.hidden = false;
    });

    // ---- Subtle magnetic primary button ----
    const magneticBtn = document.querySelector('.hero-btn');
    if (magneticBtn && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
        magneticBtn.addEventListener('mousemove', e => {
            const rect = magneticBtn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            magneticBtn.style.transform = `translate(${x * 0.12}px, ${y * 0.2}px)`;
        });
        magneticBtn.addEventListener('mouseleave', () => { magneticBtn.style.transform = ''; });
    }

    // ---- Card spotlight ----
    if (window.matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll('.bento-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width) * 100 + '%');
                card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height) * 100 + '%');
            });
        });
    }

    // ---- Quartile badges ----
    document.querySelectorAll('.pub-q').forEach(el => { el.dataset.q = el.textContent.trim(); });

    // ---- Project filters ----
    initProjectFilters();

    // ---- Publication tabs ----
    const pubTabs = document.querySelectorAll('.pub-tab');
    const pubPanels = document.querySelectorAll('.pub-panel');
    pubTabs.forEach(tab => {
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', String(tab.classList.contains('active')));
        tab.addEventListener('click', () => {
            pubTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            pubPanels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            document.getElementById(tab.dataset.target)?.classList.add('active');
        });
    });

    // ---- Publications: show selected first ----
    initPublicationsToggle();

    // ---- Biography toggle ----
    window.toggleBio = function (btn) {
        const more = btn.parentElement.querySelector('.bio-more');
        if (!more) return;
        const opening = more.style.display === 'none' || getComputedStyle(more).display === 'none';
        more.style.display = opening ? 'block' : 'none';
        btn.textContent = opening ? 'Show less' : 'Read more';
        btn.classList.toggle('is-open', opening);
        btn.setAttribute('aria-expanded', String(opening));
        if (!opening) {
            const card = btn.closest('.bento-card');
            const top = card ? card.getBoundingClientRect().top : 0;
            if (top < 0) window.scrollBy({ top: top - 100, behavior: 'smooth' });
        }
    };

    // ---- Scroll reveal ----
    const revealTargets = document.querySelectorAll('.section-title, .bento-card, .timeline-item, .pub-item, .chart-card, .metric-card');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealTargets.forEach(el => el.classList.add('revealed'));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const siblings = Array.from(el.parentElement?.children || []);
                const index = Math.min(Math.max(siblings.indexOf(el), 0), 6);
                el.style.transitionDelay = `${index * 60}ms`;
                el.classList.add('revealed');
                setTimeout(() => { el.style.transitionDelay = ''; }, 900 + index * 60);
                observer.unobserve(el);
            });
        }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

        revealTargets.forEach(el => {
            el.classList.add('reveal-on-scroll');
            revealObserver.observe(el);
        });
    }

    // ---- Counters ----
    function animateCounter(el, duration = 1400) {
        if (prefersReducedMotion) return;
        const start = performance.now();
        el.dataset.animating = '1';
        function step(now) {
            const target = Number(el.dataset.target);
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = formatNumber(Math.round(eased * target));
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = formatNumber(target);
                delete el.dataset.animating;
            }
        }
        requestAnimationFrame(step);
    }

    const counters = document.querySelectorAll('.metric-count, .metric-number');
    counters.forEach(el => {
        const value = parseInt(el.textContent.replace(/[^\d]/g, ''), 10);
        if (!Number.isNaN(value)) el.dataset.target = value;
    });

    const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (el.dataset.target && !el.dataset.counted) {
                el.dataset.counted = '1';
                animateCounter(el);
            }
            counterObserver.unobserve(el);
        });
    }, { threshold: 0.4 });
    counters.forEach(el => counterObserver.observe(el));

    // ---- Citation metrics feed (data/metrics.json, refreshed monthly by GitHub Actions) ----
    loadMetrics();

    // =============================================
    // Analysis & Graphs — Chart.js Integration
    // =============================================
    let chartsInitialized = false;
    let chartInstances = [];

    function getThemeColors() {
        const cs = getComputedStyle(root);
        const isDark = getTheme() !== 'light';
        return {
            text: cs.getPropertyValue('--text').trim() || (isDark ? '#eaf1fb' : '#0a1630'),
            textMuted: cs.getPropertyValue('--text-muted').trim() || (isDark ? '#9cadc6' : '#44556f'),
            textDim: cs.getPropertyValue('--text-dim').trim() || (isDark ? '#6b7e9b' : '#74839b'),
            accent: cs.getPropertyValue('--accent').trim() || '#4cc9f0',
            border: isDark ? 'rgba(148,179,226,0.10)' : 'rgba(16,38,76,0.08)',
            bg: isDark ? '#0b1528' : '#ffffff',
            isDark
        };
    }

    function getCitationTrend() {
        const fallback = {
            labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026*'],
            values: [6, 6, 12, 22, 38, 51, 63, 103, 91]
        };
        const byYear = window.KD_METRICS?.scholar?.by_year;
        if (!byYear || typeof byYear !== 'object') return fallback;
        const years = Object.keys(byYear).map(Number).filter(y => !Number.isNaN(y)).sort((a, b) => a - b);
        if (years.length === 0) return fallback;
        const currentYear = new Date().getUTCFullYear();
        return {
            labels: years.map(y => (y === currentYear ? `${y}*` : String(y))),
            values: years.map(y => Number(byYear[y]) || 0)
        };
    }

    function destroyCharts() {
        chartInstances.forEach(c => c.destroy());
        chartInstances = [];
    }

    function renderAnalysisCharts() {
        destroyCharts();
        const C = getThemeColors();

        // ---- Color Palettes ----
        const accentRGB = '76,201,240';
        const palette = [
            'rgba(76,201,240,0.9)',    // Scope cyan
            'rgba(245,181,68,0.9)',    // Runway amber
            'rgba(52,211,153,0.85)',   // Emerald
            'rgba(167,139,250,0.9)',   // Violet
            'rgba(251,113,133,0.85)',  // Rose
            'rgba(56,189,248,0.7)',    // Sky
            'rgba(250,204,21,0.75)',   // Yellow
            'rgba(45,212,191,0.8)',    // Teal
            'rgba(129,140,248,0.85)',  // Indigo
            'rgba(148,163,184,0.8)',   // Slate
        ];

        // ---- Global Chart.js Defaults ----
        Chart.defaults.color = C.textMuted;
        Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        Chart.defaults.plugins.legend.labels.pointStyleWidth = 10;
        Chart.defaults.plugins.legend.labels.padding = 16;
        Chart.defaults.plugins.tooltip.backgroundColor = C.isDark ? 'rgba(8,16,31,0.96)' : 'rgba(255,255,255,0.97)';
        Chart.defaults.plugins.tooltip.titleColor = C.text;
        Chart.defaults.plugins.tooltip.bodyColor = C.textMuted;
        Chart.defaults.plugins.tooltip.borderColor = C.border;
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.tooltip.padding = 12;
        Chart.defaults.plugins.tooltip.boxPadding = 6;

        // ==============================
        // 1. Publications per Year — Line Chart
        // ==============================
        const pubYears = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027'];
        const journalsByYear = [2, 1, 2, 0, 2, 0, 4, 6, 3, 4, 6, 1];
        const proceedingsByYear = [0, 2, 0, 2, 1, 0, 4, 2, 1, 1, 0, 0];

        const ctxPubYear = document.getElementById('chartPubYear');
        if (ctxPubYear) {
            const ctx = ctxPubYear.getContext('2d');
            const gradJ = ctx.createLinearGradient(0, 0, 0, 280);
            gradJ.addColorStop(0, `rgba(${accentRGB}, 0.25)`);
            gradJ.addColorStop(1, `rgba(${accentRGB}, 0.01)`);
            const gradP = ctx.createLinearGradient(0, 0, 0, 280);
            gradP.addColorStop(0, 'rgba(52,211,153,0.2)');
            gradP.addColorStop(1, 'rgba(52,211,153,0.01)');

            chartInstances.push(new Chart(ctx, {
                type: 'line',
                data: {
                    labels: pubYears,
                    datasets: [
                        {
                            label: 'Journal Articles',
                            data: journalsByYear,
                            borderColor: `rgba(${accentRGB}, 1)`,
                            backgroundColor: gradJ,
                            fill: true,
                            tension: 0.4,
                            borderWidth: 2.5,
                            pointRadius: 4,
                            pointHoverRadius: 7,
                            pointBackgroundColor: `rgba(${accentRGB}, 1)`,
                            pointBorderColor: C.bg,
                            pointBorderWidth: 2,
                        },
                        {
                            label: 'Proceedings',
                            data: proceedingsByYear,
                            borderColor: 'rgba(52,211,153,0.9)',
                            backgroundColor: gradP,
                            fill: true,
                            tension: 0.4,
                            borderWidth: 2.5,
                            pointRadius: 4,
                            pointHoverRadius: 7,
                            pointBackgroundColor: 'rgba(52,211,153,1)',
                            pointBorderColor: C.bg,
                            pointBorderWidth: 2,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, color: C.textDim },
                            grid: { color: C.border, drawBorder: false },
                            border: { display: false }
                        },
                        x: {
                            ticks: { color: C.textDim },
                            grid: { display: false },
                            border: { display: false }
                        }
                    },
                    plugins: { legend: { position: 'top' } }
                }
            }));
        }

        // ==============================
        // 2. Q-Value Distribution — Doughnut
        // ==============================
        const ctxQ = document.getElementById('chartQDist');
        if (ctxQ) {
            chartInstances.push(new Chart(ctxQ.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Q1 (Scopus)', 'Q2 (Scopus)', 'Other / National'],
                    datasets: [{
                        data: [12, 12, 7],
                        backgroundColor: [
                            `rgba(${accentRGB}, 0.85)`,
                            'rgba(52,211,153,0.85)',
                            'rgba(245,181,68,0.85)'
                        ],
                        borderColor: C.bg,
                        borderWidth: 3,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '55%',
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function (ctx) {
                                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                    const pct = ((ctx.parsed / total) * 100).toFixed(1);
                                    return ` ${ctx.label}: ${ctx.parsed} papers (${pct}%)`;
                                }
                            }
                        }
                    }
                }
            }));
        }

        // ==============================
        // 3. Top Journals — Horizontal Bar
        // ==============================
        const ctxTopJ = document.getElementById('chartTopJournals');
        if (ctxTopJ) {
            chartInstances.push(new Chart(ctxTopJ.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: [
                        'J. Air Transport Mgmt.',
                        'The Aeronautical Journal',
                        'Transportation Research Record',
                        'Aerospace',
                        'Transportation Research Part C',
                        'Transportation Research Part E',
                        'Energy',
                        'Expert Systems w/ Applications',
                        'J. Thermal Anal. Calorim.',
                        'Transportation Research Interdisciplinary Perspectives'
                    ],
                    datasets: [{
                        label: 'Papers',
                        data: [4, 4, 3, 2, 1, 1, 1, 1, 1, 1],
                        backgroundColor: palette.slice(0, 10),
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.7,
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, color: C.textDim },
                            grid: { color: C.border, drawBorder: false },
                            border: { display: false }
                        },
                        y: {
                            ticks: { color: C.textMuted, font: { size: 11 } },
                            grid: { display: false },
                            border: { display: false }
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            }));
        }

        // ==============================
        // 4. Citation Trend — Bar Chart
        // ==============================
        const ctxCit = document.getElementById('chartCitations');
        if (ctxCit) {
            const ctx4 = ctxCit.getContext('2d');
            const citationTrend = getCitationTrend();
            const gradCit = ctx4.createLinearGradient(0, 0, 0, 280);
            gradCit.addColorStop(0, `rgba(167,139,250,0.7)`);
            gradCit.addColorStop(1, `rgba(167,139,250,0.15)`);

            chartInstances.push(new Chart(ctx4, {
                type: 'bar',
                data: {
                    labels: citationTrend.labels,
                    datasets: [{
                        label: 'Citations',
                        data: citationTrend.values,
                        backgroundColor: gradCit,
                        borderColor: 'rgba(167,139,250,0.9)',
                        borderWidth: 1.5,
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.65,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: C.textDim },
                            grid: { color: C.border, drawBorder: false },
                            border: { display: false }
                        },
                        x: {
                            ticks: { color: C.textDim },
                            grid: { display: false },
                            border: { display: false }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                afterLabel: function (ctx) {
                                    if (String(ctx.label).endsWith('*')) return '(Partial year)';
                                    return '';
                                }
                            }
                        }
                    }
                }
            }));
        }

        // ==============================
        // 5. Cumulative Growth — Area Chart
        // ==============================
        const ctxCum = document.getElementById('chartCumulative');
        if (ctxCum) {
            const ctx5 = ctxCum.getContext('2d');
            const totalByYear = pubYears.map((_, i) => journalsByYear[i] + proceedingsByYear[i]);
            const cumulative = [];
            totalByYear.reduce((sum, val, i) => {
                cumulative[i] = sum + val;
                return cumulative[i];
            }, 0);

            const gradCum = ctx5.createLinearGradient(0, 0, 0, 280);
            gradCum.addColorStop(0, 'rgba(34,211,238,0.3)');
            gradCum.addColorStop(1, 'rgba(34,211,238,0.02)');

            chartInstances.push(new Chart(ctx5, {
                type: 'line',
                data: {
                    labels: pubYears,
                    datasets: [{
                        label: 'Total Publications',
                        data: cumulative,
                        borderColor: 'rgba(34,211,238,0.9)',
                        backgroundColor: gradCum,
                        fill: true,
                        tension: 0.35,
                        borderWidth: 2.5,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        pointBackgroundColor: 'rgba(34,211,238,1)',
                        pointBorderColor: C.bg,
                        pointBorderWidth: 2,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: C.textDim },
                            grid: { color: C.border, drawBorder: false },
                            border: { display: false }
                        },
                        x: {
                            ticks: { color: C.textDim },
                            grid: { display: false },
                            border: { display: false }
                        }
                    },
                    plugins: { legend: { position: 'top' } }
                }
            }));
        }

        // ==============================
        // 6. Publication Type — Doughnut
        // ==============================
        const ctxType = document.getElementById('chartTypeDist');
        if (ctxType) {
            chartInstances.push(new Chart(ctxType.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Journal Articles', 'Conference Proceedings', 'Book Chapters'],
                    datasets: [{
                        data: [31, 13, 1],
                        backgroundColor: [
                            `rgba(${accentRGB}, 0.85)`,
                            'rgba(245,181,68,0.85)',
                            'rgba(251,113,133,0.85)'
                        ],
                        borderColor: C.bg,
                        borderWidth: 3,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '55%',
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function (ctx) {
                                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                    const pct = ((ctx.parsed / total) * 100).toFixed(1);
                                    return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
                                }
                            }
                        }
                    }
                }
            }));
        }

        // ==============================
        // 7. Project Funding Source — Doughnut
        // ==============================
        const ctxFunding = document.getElementById('chartFundingSource');
        if (ctxFunding) {
            chartInstances.push(new Chart(ctxFunding.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['TÜBİTAK', 'EU Funded', 'University Funded'],
                    datasets: [{
                        data: [6, 1, 4],
                        backgroundColor: [
                            'rgba(245,181,68,0.85)',    // Orange — TÜBİTAK
                            `rgba(${accentRGB}, 0.85)`, // Blue — EU
                            'rgba(52,211,153,0.85)',    // Emerald — University
                        ],
                        borderColor: C.bg,
                        borderWidth: 3,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '55%',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function (ctx) {
                                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                    const pct = ((ctx.parsed / total) * 100).toFixed(1);
                                    return ` ${ctx.label}: ${ctx.parsed} projects (${pct}%)`;
                                }
                            }
                        }
                    }
                }
            }));
        }

        // ==============================
        // 8. Project Budget — Horizontal Bar
        // ==============================
        const ctxBudget = document.getElementById('chartProjectBudget');
        if (ctxBudget) {
            chartInstances.push(new Chart(ctxBudget.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: [
                        'Drone Inspection (TÜBİTAK 1501)',
                        'ATCOSIMA (EU)',
                        'UAM (TÜBİTAK 1001)',
                        'UAV Deep Learning (1002)',
                        'Turbojet ML (1002)',
                        'ATC Workload (1002)',
                        'Stochastic Prog. (Uni)',
                        'HFACS (Uni)',
                        'ATC Students (Uni)',
                        'Communication (Uni)'
                    ],
                    datasets: [{
                        label: 'Budget',
                        data: [9939946, 270000, 165000, 100000, 100000, 75000, 25000, 25000, 25000, 25000],
                        backgroundColor: [
                            'rgba(245,181,68,0.95)',
                            `rgba(${accentRGB}, 0.85)`,
                            'rgba(245,181,68,0.85)',
                            'rgba(245,181,68,0.70)',
                            'rgba(245,181,68,0.55)',
                            'rgba(245,181,68,0.40)',
                            'rgba(52,211,153,0.85)',
                            'rgba(52,211,153,0.70)',
                            'rgba(52,211,153,0.55)',
                            'rgba(52,211,153,0.40)',
                        ],
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.7,
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'logarithmic',
                            min: 10000,
                            max: 10000000,
                            ticks: {
                                color: C.textDim,
                                autoSkip: false,
                                maxRotation: 0,
                                callback: function (value) {
                                    const exp = Math.log10(value);
                                    if (Math.abs(exp - Math.round(exp)) > 1e-9) return '';
                                    if (value >= 1000000) return (value / 1000000).toFixed(0) + 'M';
                                    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
                                    return value;
                                }
                            },
                            grid: {
                                color: function (ctx) {
                                    const exp = Math.log10(ctx.tick?.value || 1);
                                    return Math.abs(exp - Math.round(exp)) < 1e-9 ? C.border : 'transparent';
                                },
                                drawBorder: false
                            },
                            border: { display: false }
                        },
                        y: {
                            ticks: { color: C.textMuted, font: { size: 10 } },
                            grid: { display: false },
                            border: { display: false }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function (ctx) {
                                    if (ctx.label.includes('(EU)')) return ` Budget: €${ctx.parsed.x.toLocaleString()} EUR`;
                                    return ` Budget: ₺${ctx.parsed.x.toLocaleString()} TL`;
                                }
                            }
                        }
                    }
                }
            }));
        }

        // ==============================
        // 9. Project Roles — Doughnut
        // ==============================
        const ctxRoles = document.getElementById('chartProjectRoles');
        if (ctxRoles) {
            chartInstances.push(new Chart(ctxRoles.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['PI', 'Researcher', 'Scholar', 'Expert'],
                    datasets: [{
                        data: [1, 8, 1, 1],
                        backgroundColor: [
                            'rgba(167,139,250,0.85)',    // Violet — PI
                            `rgba(${accentRGB}, 0.85)`, // Blue — Researcher
                            'rgba(245,181,68,0.85)',    // Amber — Scholar
                            'rgba(52,211,153,0.85)',    // Emerald — Expert
                        ],
                        borderColor: C.bg,
                        borderWidth: 3,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '55%',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function (ctx) {
                                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                    const pct = ((ctx.parsed / total) * 100).toFixed(1);
                                    return ` ${ctx.label}: ${ctx.parsed} projects (${pct}%)`;
                                }
                            }
                        }
                    }
                }
            }));
        }

        // ==============================
        // 10. Authorship Distribution — Doughnut
        // ==============================
        const ctxAuth = document.getElementById('chartAuthorship');
        if (ctxAuth) {
            chartInstances.push(new Chart(ctxAuth.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['First+Single Author', 'Co-Author'],
                    datasets: [{
                        data: [29, 15],
                        backgroundColor: [
                            `rgba(${accentRGB}, 0.85)`,
                            'rgba(52,211,153,0.85)',
                        ],
                        borderColor: C.bg,
                        borderWidth: 3,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '55%',
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                            callbacks: {
                                label: function (ctx) {
                                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                    const pct = ((ctx.parsed / total) * 100).toFixed(1);
                                    return ` ${ctx.label}: ${ctx.parsed} papers (${pct}%)`;
                                }
                            }
                        }
                    }
                }
            }));
        }

        chartsInitialized = true;
    }

    window.renderAnalysisCharts = renderAnalysisCharts;

    const renderChartsSafely = () => {
        if (typeof window.Chart === 'undefined') return;
        renderAnalysisCharts();
    };

    pubTabs.forEach(tab => {
        if (tab.dataset.target === 'analysis') {
            tab.addEventListener('click', () => {
                if (!chartsInitialized) setTimeout(renderChartsSafely, 80);
            });
        }
    });

    if (document.getElementById('analysis')?.classList.contains('active') && !chartsInitialized) {
        setTimeout(renderChartsSafely, 120);
    }

    document.addEventListener('kd:themechange', () => {
        if (chartsInitialized) setTimeout(renderChartsSafely, 60);
    });

    document.addEventListener('kd:metricsloaded', () => {
        if (chartsInitialized) renderChartsSafely();
    });
});

// ------------------------------------------------------------
// News section
// ------------------------------------------------------------
function buildNewsSection() {
    const contactSection = document.getElementById('contact');
    if (!contactSection || document.getElementById('news') || NEWS_ITEMS.length === 0) return;

    const renderNewsCard = item => `
        <article class="bento-card news-compact-card">
            <div class="news-preview-shell">
                <img class="news-preview-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)} preview"
                    loading="lazy" onerror="this.style.display='none'">
            </div>
            <div class="news-card-top">
                <span class="news-source-pill">${escapeHtml(item.source)}</span>
                <span class="news-card-meta">${escapeHtml(item.meta)}</span>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="news-card-summary">${escapeHtml(item.summary)}</p>
            <a class="news-read-more" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Read more</a>
        </article>
    `;

    const section = document.createElement('section');
    section.id = 'news';
    section.innerHTML = `
        <div class="container">
            <div class="section-title">
                <h2>News <i>From Me</i></h2>
                <div class="label">Recent Updates</div>
            </div>
            <div class="news-carousel-shell">
                <div class="news-carousel-hint">Scroll for more →</div>
                <div class="news-carousel-track">
                    <button class="news-carousel-arrow news-carousel-arrow-prev" type="button" aria-label="Scroll news left">&#8249;</button>
                    <div class="news-embed-grid">
                        ${NEWS_ITEMS.map(renderNewsCard).join('')}
                    </div>
                    <button class="news-carousel-arrow news-carousel-arrow-next" type="button" aria-label="Scroll news right">&#8250;</button>
                </div>
            </div>
        </div>
    `;
    contactSection.parentNode.insertBefore(section, contactSection);

    const grid = section.querySelector('.news-embed-grid');
    const prev = section.querySelector('.news-carousel-arrow-prev');
    const next = section.querySelector('.news-carousel-arrow-next');

    const step = () => {
        const card = grid.querySelector('.news-compact-card');
        const gap = parseFloat(getComputedStyle(grid).columnGap || '0');
        return card ? card.getBoundingClientRect().width + gap : grid.clientWidth * 0.85;
    };

    const update = () => {
        const max = Math.max(grid.scrollWidth - grid.clientWidth, 0);
        const overflow = max > 12;
        prev.hidden = !overflow;
        next.hidden = !overflow;
        prev.disabled = grid.scrollLeft <= 12;
        next.disabled = grid.scrollLeft >= max - 12;
    };

    prev.addEventListener('click', () => grid.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => grid.scrollBy({ left: step(), behavior: 'smooth' }));
    grid.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    requestAnimationFrame(update);
}

// ------------------------------------------------------------
// Project funding filters
// ------------------------------------------------------------
function initProjectFilters() {
    const section = document.getElementById('projects');
    const grid = section?.querySelector('.bento-grid');
    const title = section?.querySelector('.section-title');
    const cards = Array.from(grid?.querySelectorAll('.bento-card') ?? []);
    if (!section || !grid || !title || cards.length === 0) return;

    const inferGroup = text => {
        const label = (text || '').toLowerCase();
        if (label.includes('eu funded') || label.includes('atcosima')) return 'eu';
        if (label.includes('university funded')) return 'university';
        return 'tubitak';
    };

    cards.forEach(card => {
        card.classList.add('project-card');
        card.dataset.projectGroup = inferGroup(card.querySelector('.label')?.textContent);
    });

    const options = [
        { key: 'tubitak', label: 'TÜBİTAK' },
        { key: 'eu', label: 'EU Funded' },
        { key: 'university', label: 'University' }
    ];

    const filters = document.createElement('div');
    filters.className = 'project-filters';
    filters.setAttribute('role', 'group');
    filters.setAttribute('aria-label', 'Filter projects by funding source');

    const buttons = options.map(option => {
        const count = cards.filter(c => c.dataset.projectGroup === option.key).length;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'project-filter';
        button.dataset.projectFilter = option.key;
        button.innerHTML = `${escapeHtml(option.label)} <span class="count">${count}</span>`;
        button.setAttribute('aria-pressed', 'false');
        filters.appendChild(button);
        return button;
    });

    title.insertAdjacentElement('afterend', filters);

    const setFilter = group => {
        buttons.forEach(b => {
            const active = b.dataset.projectFilter === group;
            b.classList.toggle('active', active);
            b.setAttribute('aria-pressed', String(active));
        });
        cards.forEach(card => {
            const match = card.dataset.projectGroup === group;
            card.classList.toggle('project-card-hidden', !match);
            card.setAttribute('aria-hidden', String(!match));
            if (match) card.classList.add('revealed');
        });
        grid.dataset.activeProjectGroup = group;
    };

    buttons.forEach(b => b.addEventListener('click', () => setFilter(b.dataset.projectFilter)));
    setFilter('tubitak');
}

// ------------------------------------------------------------
// Publications: selected works first, the rest on demand
// ------------------------------------------------------------
function initPublicationsToggle() {
    ['journals', 'proceedings'].forEach(id => {
        const panel = document.getElementById(id);
        if (!panel) return;
        const items = Array.from(panel.querySelectorAll('.pub-item'));
        const extra = items.filter(item => !item.querySelector('.selected-badge'));
        if (extra.length === 0) return;

        extra.forEach(item => item.classList.add('hidden-pub'));

        const wrap = document.createElement('div');
        wrap.className = 'pub-more';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'read-more-btn';
        btn.textContent = `Show all ${items.length}`;
        btn.setAttribute('aria-expanded', 'false');

        btn.addEventListener('click', () => {
            const expanding = btn.getAttribute('aria-expanded') !== 'true';
            extra.forEach(item => {
                item.classList.toggle('hidden-pub', !expanding);
                item.classList.toggle('revealed-pub', expanding);
                if (expanding) item.classList.add('revealed');
            });
            btn.textContent = expanding ? 'Show selected only' : `Show all ${items.length}`;
            btn.classList.toggle('is-open', expanding);
            btn.setAttribute('aria-expanded', String(expanding));
        });

        wrap.appendChild(btn);
        panel.appendChild(wrap);
    });
}

// ------------------------------------------------------------
// Citation metrics feed
// data/metrics.json is refreshed by .github/workflows/update-metrics.yml.
// Values written in the HTML stay as the fallback.
// ------------------------------------------------------------
async function loadMetrics() {
    if (location.protocol === 'file:') return null;
    try {
        const res = await fetch('data/metrics.json', { cache: 'no-cache' });
        if (!res.ok) return null;
        const data = await res.json();
        window.KD_METRICS = data;

        document.querySelectorAll('[data-metric]').forEach(el => {
            const value = el.dataset.metric.split('.').reduce((obj, key) => (obj ? obj[key] : undefined), data);
            if (typeof value !== 'number' || !Number.isFinite(value)) return;
            el.dataset.target = value;
            if (!el.dataset.animating) el.textContent = formatNumber(value);
        });

        document.querySelectorAll('[data-metric-updated]').forEach(el => {
            const source = el.dataset.metricUpdated;
            const iso = source === 'any' ? data.updated : (data[source]?.updated || data.updated);
            if (iso) el.textContent = formatMonth(iso);
        });

        document.dispatchEvent(new CustomEvent('kd:metricsloaded', { detail: data }));
        return data;
    } catch (e) {
        return null;
    }
}
