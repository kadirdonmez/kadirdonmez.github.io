// =============================================
// CV PDF Generator — Assoc. Prof. Kadir Dönmez
// Uses html2canvas + jsPDF for high-resolution client-side PDF generation
// =============================================

let cvGenerationInProgress = false;

async function generateCV() {
    if (cvGenerationInProgress) return;
    if (typeof html2pdf === 'undefined') {
        alert('PDF library is currently loading. Please wait a few seconds and try again.');
        return;
    }
    cvGenerationInProgress = true;
    const button = document.getElementById('downloadCvBtn');
    const overlay = document.getElementById('cv-loading-overlay');
    if (button) button.disabled = true;
    overlay?.classList.add('active');
    try {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await buildAndDownloadPDF();
    } catch (error) {
        console.error('CV Generation Error:', error);
        alert('An error occurred while generating the CV. Please try again.');
    } finally {
        cvGenerationInProgress = false;
        if (button) button.disabled = false;
        overlay?.classList.remove('active');
        const container = document.getElementById('cv-print-container');
        if (container) {
            container.innerHTML = '';
            container.style.left = '-9999px';
        }
    }
}

async function buildAndDownloadPDF() {
    // 1. Data Definition
    const generatedAt = new Date();
    const generatedOnLabel = new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(generatedAt);
    // Read every record, including inactive tabs and filtered project cards.
    // The website is the source of truth; no separate CV publication/project list.
    const textOf = (element) => (element?.textContent || '').replace(/\s+/g, ' ').trim();
    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
    const safeUrl = (value) => {
        try {
            if (!value) return '';
            const url = new URL(value, document.baseURI);
            return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
        } catch { return ''; }
    };
    const readPublication = (item) => ({
        t: textOf(item.querySelector('.pub-content p')),
        q: textOf(item.querySelector('.pub-q')),
        year: Number(textOf(item.querySelector('.pub-year'))) || 0,
        doi: safeUrl(item.querySelector('.doi-link')?.getAttribute('href') || ''),
        selected: Boolean(item.querySelector('.selected-badge'))
    });
    const journals = Array.from(document.querySelectorAll('#journals .pub-item'), readPublication);
    const proceedings = Array.from(document.querySelectorAll('#proceedings .pub-item'), readPublication);
    const otherRecords = Array.from(document.querySelectorAll('#books .bento-card'), (card) => ({
        category: textOf(card.querySelector('.label')),
        title: textOf(card.querySelector('h3')),
        description: textOf(card.querySelector('p')),
        doi: card.querySelector('.doi-link') ? safeUrl(card.querySelector('.doi-link').href) : ''
    }));
    const books = otherRecords.filter((item) => /book/i.test(item.category));
    otherRecords.filter((item) => /journal/i.test(item.category)).forEach((item) => {
        if (!journals.some((journal) => journal.doi && journal.doi === item.doi)) {
            journals.push({
                t: `${item.title}. ${item.description}`, q: '', doi: item.doi,
                year: Number(item.description.match(/\((\d{4})\)/)?.[1]) || 0, selected: false
            });
        }
    });
    journals.sort((a, b) => b.year - a.year);
    const projects = Array.from(document.querySelectorAll('#projects .bento-card'), (card) => ({
        label: textOf(card.querySelector('.label')),
        title: textOf(card.querySelector('h3')),
        description: Array.from(card.querySelectorAll('p'), textOf).join(' '),
        budget: textOf(card.querySelector('.project-budget')),
        url: card.querySelector('a[href]') ? safeUrl(card.querySelector('a[href]').href) : ''
    }));
    if (!journals.length || !proceedings.length || !projects.length) {
        throw new Error('The website publication and project sections could not be read.');
    }
    const totalPublications = journals.length + proceedings.length + books.length;
    const q1Count = journals.filter((item) => item.q === 'Q1').length;
    const q2Count = journals.filter((item) => item.q === 'Q2').length;
    const metricsAsOfLabel = textOf(document.querySelector('#analysis .metrics-note'))
        .replace(/^Citation data last updated:\s*/i, '') || 'Date not specified';
    const citationMetrics = Array.from(document.querySelectorAll('#analysis .metric-card'), (card) => ({
        source: textOf(card.querySelector('.metric-source')),
        value: textOf(card.querySelector('.metric-number')),
        indices: Array.from(card.querySelectorAll('div span'), textOf).join(' · ')
    }));
    const renderLink = (url, label) => url
        ? ` <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;">${label}</a>` : '';
    const buildPublicationList = (items) => items.map((item, index) => `
        <div class="pub-item avoid-break${item.selected ? ' selected-work-row' : ''}">
            <div class="pub-num">[${items.length - index}]</div>
            <div class="pub-text">${item.selected ? '<span class="selected-star">&#9733;</span>' : ''}<span class="pub-entry">${escapeHtml(item.t)}${renderLink(item.doi, '[DOI]')}</span></div>
            ${/^Q[1-4]$/.test(item.q) ? `<span class="q-badge">${escapeHtml(item.q)}</span>` : ''}
        </div>
    `).join('');
    const buildProjectList = () => projects.map((project) => `
        <div class="entry-row avoid-break">
            <div class="entry-date">${escapeHtml(project.label)}</div>
            <div class="entry-content">
                <div class="entry-title">${escapeHtml(project.title)}</div>
                <div class="entry-desc">${escapeHtml(project.description)}</div>
                <div class="entry-desc">${project.budget ? `Budget: ${escapeHtml(project.budget)}` : ''}${renderLink(project.url, '[Project]')}</div>
            </div>
        </div>
    `).join('');
    const renderMetric = (value, label, sublabel = '') => `
        <div style="padding: 4px 2px;">
            <div style="font-size:16px;font-weight:bold;color:#ef4444;line-height:1.15;">${escapeHtml(value)}</div>
            <div style="font-size:9px;font-weight:600;color:#475569;text-transform:uppercase;margin-top:2px;">${escapeHtml(label)}</div>
            ${sublabel ? `<div style="font-size:8.5px;color:#64748b;margin-top:1px;">${escapeHtml(sublabel)}</div>` : ''}
        </div>
    `;

    // 2. Build HTML Structure
    const cvBodyHTML = `
        <style>
            #cv-print-container { width: 794px; background: #fff; color: #1e293b; color-scheme: light; }
            #cv-print-container *, #cv-print-container *::before, #cv-print-container *::after { box-sizing: border-box; animation: none !important; transition: none !important; }
            #cv-print-container .section-title { display: block; }
            #cv-print-container .entry-content:only-child { grid-column: 1 / -1; }

            #cv-print-container .cv-body {
                font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
                color: #1e293b;
                line-height: 1.3;
                font-size: 11px; 
                padding: 10px 15px;
                background: white;
                margin: 0;
            }
            #cv-print-container .cv-header {
                display: flex;
                justify-content: space-between; 
                align-items: flex-start;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #e2e8f0;
            }
            #cv-print-container .cv-header-text { max-width: 80%; }
            #cv-print-container .cv-profile-img {
                width: 110px;
                height: 110px;
                border-radius: 8px;
                object-fit: cover;
                border: 2px solid #cbd5e1;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            }
            #cv-print-container .cv-title { font-size: 30px; font-family: 'Instrument Serif', serif; color: #0f172a; margin: 0 0 5px 0; font-weight: bold; }
            #cv-print-container .cv-subtitle { font-size: 15px; color: #3b82f6; margin: 0 0 8px 0; font-weight: 600; }
            #cv-print-container .cv-contact { font-size: 11px; color: #64748b; margin-bottom: 4px; }
            #cv-print-container .cv-contact a { color: #3b82f6; text-decoration: none; display: inline-block; }
            
            #cv-print-container .section-title {
                font-size: 14px;
                font-weight: bold;
                color: #0f172a;
                text-transform: uppercase;
                border-left: 4px solid #93c5fd;
                border-radius: 8px;
                padding: 5px 10px;
                margin: 6mm 0 1.2mm 0;
                letter-spacing: 0.5px;
                break-after: avoid-page;
                page-break-after: avoid;
            }

            #cv-print-container .section-title.first-section-title {
                margin-top: 0;
            }

            #cv-print-container .section-title.section-tone-blue { background: #eff6ff; border-left-color: #60a5fa; }
            #cv-print-container .section-title.section-tone-orange { background: #fff7ed; border-left-color: #fb923c; }
            #cv-print-container .section-title.section-tone-green { background: #ecfdf5; border-left-color: #34d399; }
            #cv-print-container .section-title.section-tone-rose { background: #fff1f2; border-left-color: #fb7185; }
            #cv-print-container .section-title.section-tone-amber { background: #fffbeb; border-left-color: #f59e0b; }

            #cv-print-container .section-keep-together, #cv-print-container .project-tail-keep, #cv-print-container .entry-row, #cv-print-container .pub-item, #cv-print-container .avoid-break, #cv-print-container .entry-content, #cv-print-container .entry-title, #cv-print-container .entry-inst, #cv-print-container .entry-desc, #cv-print-container .pub-text {
                break-inside: avoid-page !important;
                page-break-inside: avoid !important;
            }

            #cv-print-container .entry-row {
                display: grid;
                grid-template-columns: 130px minmax(0, 1fr);
                column-gap: 12px;
                align-items: start;
                width: 100%;
                margin-bottom: 4px;
                break-inside: avoid-page !important;
                page-break-inside: avoid !important;
            }
            #cv-print-container .entry-date {
                color: #64748b;
                font-weight: 600;
                font-size: 11px;
                line-height: 1.25;
            }
            #cv-print-container .entry-content {
                min-width: 0;
            }
            #cv-print-container .entry-title { font-weight: bold; color: #1e293b; font-size: 11.5px; margin-bottom: 1px; }
            #cv-print-container .entry-inst { color: #64748b; font-size: 11px; font-style: italic; }
            #cv-print-container .entry-desc { color: #64748b; font-size: 11px; margin-top: 2px; }
            
            #cv-print-container .pub-item { 
                display: grid;
                grid-template-columns: 30px minmax(0, 1fr) auto;
                column-gap: 8px;
                margin-bottom: 0px; 
                padding-bottom: 0px;
                align-items: flex-start;
                break-inside: avoid-page !important;
                page-break-inside: avoid !important;
            }
            #cv-print-container .pub-num { font-weight: bold; color: #3b82f6; width: 30px; line-height: 1.2; }
            #cv-print-container .pub-text {
                color: #334155;
                display: flex;
                align-items: flex-start;
                gap: 6px;
                padding-right: 15px;
                line-height: 1.2;
                min-width: 0;
            }
            #cv-print-container .pub-entry {
                flex: 1 1 auto;
                min-width: 0;
            }
            #cv-print-container .selected-star {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex: 0 0 14px;
                width: 14px;
                color: #d4a017;
                font-size: 11px;
                line-height: 1;
                text-shadow: 0 1px 2px rgba(153, 105, 0, 0.2);
            }
            #cv-print-container .selected-work-row {
                background: linear-gradient(180deg, #fff7d6 0%, #ffefb3 100%);
                border-left: 3px solid #d4a017;
                border-radius: 8px;
                box-shadow: inset 0 0 0 1px rgba(212,160,23,0.18), 0 6px 12px rgba(212,160,23,0.08);
                padding: 7px 8px 6px;
                margin: 10px 0 3px;
                align-items: center;
            }
            #cv-print-container .selected-work-row .pub-num, #cv-print-container .selected-work-row .q-badge, #cv-print-container .selected-work-row .selected-star {
                align-self: center;
            }
            #cv-print-container .selected-work-row .pub-text {
                align-items: center;
            }
            #cv-print-container .pub-legend {
                font-size: 10px;
                color: #8a6d1d;
                background: linear-gradient(180deg, #fffaf0 0%, #fff1c7 100%);
                border: 1px solid #f0d78c;
                box-shadow: 0 4px 10px rgba(212,160,23,0.08);
                border-radius: 999px;
                display: inline-block;
                padding: 3px 10px;
                margin: 4px 0 8px 0;
            }
            #cv-print-container .q-badge { 
                font-weight: bold; 
                color: #ef4444; 
                font-size: 11px;
                background: #fee2e2;
                padding: 1px 4px;
                border-radius: 4px;
                white-space: nowrap;
            }
            
            #cv-print-container .avoid-break {
                break-inside: avoid-page;
                page-break-inside: avoid;
            }

            #cv-print-container .cv-page-spacer {
                display: block;
                width: 100%;
                break-inside: avoid-page;
                page-break-inside: avoid;
            }
        </style>

        <div class="cv-body" id="cv-content">
            <!-- HEADER -->
            <div class="cv-header">
                <div class="cv-header-text">
                    <h1 class="cv-title">KADIR DÖNMEZ</h1>
                    <h2 class="cv-subtitle">Associate Professor</h2>
                    <div class="cv-contact">Samsun University — Özdemir Bayraktar Faculty of Aeronautics and Astronautics</div>
                    <div class="cv-contact">
                        <a href="mailto:kadir.donmez@samsun.edu.tr">kadir.donmez@samsun.edu.tr</a> &nbsp;|&nbsp; +90 362 313 00 55 (Ext: 2104) &nbsp;|&nbsp; Samsun, Türkiye
                    </div>
                    <div class="cv-contact" style="margin-top:4px;">
                        <span style="display:inline-block; margin-right: 15px;">ORCID: <a href="https://orcid.org/0000-0002-1236-0498">0000-0002-1236-0498</a></span> 
                        <span style="display:inline-block; margin-right: 15px;">Google Scholar: <a href="https://scholar.google.com/citations?user=vpywJdsAAAAJ">vpywJdsAAAAJ</a></span>
                        <span style="display:inline-block;">Website: <a href="https://kadirdonmez.github.io/">kadirdonmez.github.io</a></span>
                    </div>
                </div>
                <!-- To avoid CORS issues during local generation without server, 
                     this relies on html2pdf base64 trick or proper paths. -->
                <img src="data:image/jpeg;base64,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" class="cv-profile-img" onerror="this.style.display='none'" />
            </div>

            <!-- RESEARCH INTERESTS -->
            <div class="avoid-break">
                <div class="section-title">Research Interests</div>
                <div style="font-size: 11.5px; color: #334155;">
                    Air Traffic Management · Airport Operations · Optimization · Machine Learning · Stochastic Programming · Decision Support Systems · Human Factors · Deep Learning · Multi-Objective Programming · Urban Air Mobility · Intelligent Transportation Systems
                </div>
            </div>

            <!-- BIOGRAPHY -->
            <div class="avoid-break" style="margin-bottom: 10px;">
                <div class="section-title">Biography</div>
                <p style="color: #475569; font-size: 10.75px; line-height: 1.32; margin: 0; text-align: justify;">
                    I earned my Bachelor’s degree in Aircraft Avionics Maintenance from Kocaeli University in 2015, gaining foundational knowledge in avionics systems. In 2016, I began a Master’s in Air Traffic Control (ATC) at Anadolu University, researching how organizational practices affect aviation incidents. This work underscored the impact of operational and management factors on safety, earning me the Master’s Thesis Success Award (best MS thesis). From 2017–2018, as a Research Assistant at Anadolu University, I contributed to academic and national ATM projects, expanding my expertise.
                    <br/><br/>
                    In 2018, I began a Ph.D. in Air Traffic Control at Eskişehir Technical University. My doctoral research developed multi-objective stochastic optimization models for multi-runway airports, addressing wind uncertainties and taxi-time variability—improving fuel efficiency, punctuality, performance, and emissions. I received the Article Performance Award for high-impact publications. From 2018–2022, I served as a Research Assistant and participated in the Erasmus+ ATCOSIMA project, which established standardized ATC simulation training criteria for Pan-European Single Sky objectives. My role involved designing metrics, running simulations, analyzing data, and co-authoring papers with international partners.
                    <br/><br/>
                    Alongside research, I spent six years as a pseudo-pilot in ATCo training, simulating multiple ATC positions (Aerodrome Control, Radar Approach/Area Control, Coordination, Procedural Control), providing hands-on insights into ATM operations.
                    <br/><br/>
                    In 2023, I was appointed Head of the Aircraft Maintenance Department at Samsun University, overseeing course scheduling, Civil Aviation Regulation compliance, and internship/OJT collaborations. In 2024, I became an Associate Professor of Aircraft, Aeronautics, and Aerospace Engineering (Inter-University Council of Türkiye) and received a Certificate of Appreciation from the Rector of Samsun University for advancing aviation education, research, and the university’s reputation in aviation and space sciences.
                    <br/><br/>
                    I have been actively teaching for two years, delivering a range of undergraduate and graduate courses. These include Basic Aircraft Knowledge and Basic Aerodynamics for undergraduate students in the Department of Aircraft Maintenance, as well as Aerospace Instruments for students in Aeronautics and Astronautics Engineering. It offers students a comprehensive understanding of working principles of instruments. At the graduate level, I teach Optimization Techniques in Engineering, guiding students through nearly 50 optimization problems, model formulation, Python coding, and solution analysis. In 2023, I mentored my first Master’s student on terminal airspace complexity using multi-criteria decision-making tools.
                    <br/><br/>
                    From October 2025 to August 2026, I served as Vice Dean of the Faculty of Aeronautics and Astronautics. I serve on the University Education Commission and the Strategic Planning Commission, shaping educational strategies and long-term goals. I also mentor several student teams. Throughout my professional career, I have been actively involved in various research and development projects, including those funded by TÜBİTAK, serving as a project coordinator, advisor, and expert. Additionally, I currently provide project-based consultancy services to a company in the defense industry.
                    <br/><br/>
                    My publication record features 44 works (30 journal papers, 13 conference proceedings, and 1 book chapter). Of these, 23 are Q1/Q2 indexed papers (11 in Q1, 12 in Q2).
                    <br/><br/>
                    In my courses and research, I use a variety of technologies and tools. My expertise includes coding optimization models with GAMS and Pyomo, focusing on Linear, Multi-Objective, and Stochastic Programming, as well as Metaheuristics and Matheuristics. I have practical experience with MICRONAV BEST for real-time ATC simulations, SIMMOD PRO for fast-time ATC simulations, and I am integrating machine learning techniques into my research.
                    <br/><br/>
                    Between June and September 2025, I spent four months at Nanyang Technological University (NTU) in Singapore as a Research Fellow, where I had the opportunity to observe and work on next-generation airside operations and intelligent decision support systems for airport surface movement.
                </p>
            </div>

            <!-- FOREIGN LANGUAGE -->
            <div class="section-title">Foreign Language</div>
            <div class="entry-row">
                <div class="entry-date">English</div>
                <div class="entry-content">
                    <div class="entry-title">YDS: 88.75 &nbsp;·&nbsp; YÖKDİL: 95</div>
                </div>
            </div>

            <!-- EDUCATION -->
            <div class="section-title">Education</div>
            <div class="entry-row">
                <div class="entry-date">2018 – 2022</div>
                <div class="entry-content">
                    <div class="entry-title">Ph.D. — Air Traffic Control</div>
                    <div class="entry-inst">Eskişehir Technical University — Graduate School of Education</div>
                    <div class="entry-desc">Thesis: "Multi-objective stochastic programming model for runway scheduling problem in multi-runway airports with parallel point merge system" — Advisors: Cem Çetek & Onur Kaya</div>
                </div>
            </div>
            <div class="entry-row">
                <div class="entry-date">2016 – 2018</div>
                <div class="entry-content">
                    <div class="entry-title">M.Sc. — Air Traffic Control</div>
                    <div class="entry-inst">Anadolu University — Graduate School of Sciences</div>
                    <div class="entry-desc">Thesis: "The relationship between operation and organization in 21st century aviation incidents: HFACS application" — Advisor: Dr. Suat Uslu</div>
                </div>
            </div>
            <div class="entry-row">
                <div class="entry-date">2011 – 2015</div>
                <div class="entry-content">
                    <div class="entry-title">B.Sc. — Aircraft Electrical & Electronics</div>
                    <div class="entry-inst">Kocaeli University — School of Civil Aviation</div>
                </div>
            </div>

            <!-- ACADEMIC POSITIONS -->
            <div class="section-title">Academic Positions</div>
            <div class="entry-row"><div class="entry-date">Jun–Sep 2025</div><div class="entry-content"><div class="entry-title">Visiting Researcher</div><div class="entry-inst">Nanyang Technological University — ATMRI, Singapore</div></div></div>
            <div class="entry-row"><div class="entry-date">2024 – Present</div><div class="entry-content"><div class="entry-title">Associate Professor</div><div class="entry-inst">Samsun University — Aircraft Maintenance & Repair Dept.</div></div></div>
            <div class="entry-row"><div class="entry-date">2022 – 2024</div><div class="entry-content"><div class="entry-title">Assistant Professor</div><div class="entry-inst">Samsun University — Aircraft Maintenance & Repair Dept.</div></div></div>
            <div class="entry-row"><div class="entry-date">May–Sep 2022</div><div class="entry-content"><div class="entry-title">Research Assistant</div><div class="entry-inst">Samsun University — Air Traffic Control Dept.</div></div></div>
            <div class="entry-row"><div class="entry-date">2018 – 2022</div><div class="entry-content"><div class="entry-title">Research Assistant</div><div class="entry-inst">Eskişehir Technical University — Air Traffic Control</div></div></div>
            <div class="entry-row"><div class="entry-date">2016 – 2018</div><div class="entry-content"><div class="entry-title">Research Assistant</div><div class="entry-inst">Anadolu University — Air Traffic Control</div></div></div>

            <!-- ADMINISTRATIVE ROLES -->
            <div class="section-title">Administrative Roles</div>
            <div class="entry-row"><div class="entry-date">Oct 2025 – Aug 2026</div><div class="entry-content"><div class="entry-title">Vice Dean</div><div class="entry-inst">Özdemir Bayraktar Faculty of Aeronautics & Astronautics</div></div></div>
            <div class="entry-row"><div class="entry-date">2023 – 2025</div><div class="entry-content"><div class="entry-title">Head of Department</div><div class="entry-inst">Aircraft Maintenance & Repair Dept., Samsun University</div></div></div>

            <!-- JOURNAL PUBLICATIONS -->
            <div class="section-title">Journal Publications</div>
            <div class="pub-legend avoid-break"><span class="selected-star">&#9733;</span> indicates selected works</div>
            ${buildPublicationList(journals, true)}

            <!-- CONFERENCE PROCEEDINGS -->
            <div class="section-title avoid-break">Conference Proceedings</div>
            ${buildPublicationList(proceedings, false)}

            <!-- RESEARCH PROJECTS -->
            <div class="section-title avoid-break">Research Projects</div>
            ${buildProjectList()}

            <!-- LABS & RESEARCH GROUPS -->
            <div class="section-title avoid-break">Research Labs & Groups</div>
            <div class="entry-row"><div class="entry-date">2026 – Present</div><div class="entry-content"><div class="entry-title">DARE Lab — Founder & Co-Director</div><div class="entry-inst">Decentralized Aviation Research & Education Lab</div><div class="entry-desc">A global, decentralized non-profit community dedicated to top-quality scientific outputs across the aviation ecosystem.</div></div></div>
            <div class="entry-row"><div class="entry-date">Jun–Sep 2025</div><div class="entry-content"><div class="entry-title">ATMRI (NTU Singapore) — Visiting Researcher</div><div class="entry-inst">Air Traffic Management Research Institute</div></div></div>

            <!-- TEACHING & AWARDS -->
            <div class="section-title avoid-break">Teaching</div>
            <div class="entry-row"><div class="entry-date">2022 – Present</div><div class="entry-content"><div class="entry-title">Aerospace Instruments (Undergraduate)</div><div class="entry-inst">English · 3 hrs weekly</div></div></div>
            <div class="entry-row"><div class="entry-date">2022 – Present</div><div class="entry-content"><div class="entry-title">Optimization Techniques in Engineering (Graduate)</div><div class="entry-inst">English · 3 hrs weekly</div></div></div>
            <div class="entry-row"><div class="entry-date">2022 – 2024</div><div class="entry-content"><div class="entry-title">Basic Aircraft Knowledge / Basic Aerodynamics (Undergraduate)</div><div class="entry-inst">English</div></div></div>

            <div class="section-title avoid-break">Awards</div>
            <div class="entry-row"><div class="entry-date">2024</div><div class="entry-content"><div class="entry-title">Certificate of Appreciation — Samsun University</div><div class="entry-desc">For support and contributions to the recognition of the university in aviation and space sciences</div></div></div>
            <div class="entry-row"><div class="entry-date">2021</div><div class="entry-content"><div class="entry-title">Article Performance Award — Eskişehir Technical University</div><div class="entry-desc">Recognition for outstanding publication performance</div></div></div>
            <div class="entry-row"><div class="entry-date">2020</div><div class="entry-content"><div class="entry-title">M.Sc. Thesis Achievement Award — Eskişehir Technical University</div><div class="entry-desc">Award for excellence in master's thesis work</div></div></div>

            <div class="section-title avoid-break">Certifications</div>
            <div class="entry-row"><div class="entry-date">2024</div><div class="entry-content"><div class="entry-title">ML & Data Science A-Z</div><div class="entry-desc">NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn, Scipy — Python</div></div></div>
            <div class="entry-row"><div class="entry-date">2023</div><div class="entry-content"><div class="entry-title">Multi-Objective Optimization with Python (pymoo)</div></div></div>
            <div class="entry-row"><div class="entry-date">2023</div><div class="entry-content"><div class="entry-title">Pyomo Bootcamp A-Z</div><div class="entry-desc">CPLEX, IPOPT, COUENNE — LP, NLP, IP</div></div></div>
            <div class="entry-row"><div class="entry-date">2023</div><div class="entry-content"><div class="entry-title">Optimization with Python</div><div class="entry-desc">CPLEX, Gurobi, Pyomo — Operations Research</div></div></div>

            <!-- BOOK CHAPTERS -->
            <div class="section-title avoid-break">Book Chapters</div>
            ${books.map((book) => {
                const yearMatch = book.description.match(/\((\d{4})\)/);
                const dateLabel = yearMatch ? yearMatch[1] : (book.category || 'Book Chapter');
                return `<div class="entry-row avoid-break"><div class="entry-date">${escapeHtml(dateLabel)}</div><div class="entry-content"><div class="entry-title">${escapeHtml(book.title)}</div><div class="entry-desc">${escapeHtml(book.description)}${renderLink(book.doi, '[DOI]')}</div></div></div>`;
            }).join('')}

            <!-- ACADEMIC METRICS (Final summary at bottom) -->
            <div class="avoid-break cv-metrics-panel" style="width:100%; background:transparent; border:1px solid #e2e8f0; border-radius:6px; padding:12px; margin-top: 14px;">
                <div style="text-align:center; margin-bottom:10px;">
                    <div style="font-size:11px; font-weight:bold; color:#0f172a; text-transform:uppercase; letter-spacing:0.8px;">Academic Metrics Snapshot</div>
                    <div style="font-size:9px; color:#64748b;">Generated on ${generatedOnLabel} · Citation data as of ${escapeHtml(metricsAsOfLabel)} · Publication and project totals from current website</div>
                </div>
                <div style="display:grid; grid-template-columns:repeat(7, minmax(0, 1fr)); gap:8px; align-items:start; text-align:center;">
                    ${citationMetrics.map((metric) => renderMetric(metric.value, `${metric.source} Citations`, metric.indices)).join('')}
                    ${renderMetric(totalPublications, 'Publications')}
                    ${renderMetric(projects.length, 'Projects')}
                    ${renderMetric(q1Count + q2Count, 'Q1/Q2 Papers')}
                    ${renderMetric(books.length, 'Book Chapters')}
                </div>
            </div>
        </div>
    `;

    // 3. Inject into hidden container
    let container = document.getElementById('cv-print-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'cv-print-container';
        document.body.appendChild(container);
    }
    container.innerHTML = cvBodyHTML;

    const sectionTitles = Array.from(container.querySelectorAll('.section-title'));
    const findSectionTitle = (title) => sectionTitles.find(el => el.textContent.trim() === title);

    const replaceSectionRows = (title, rowsHtml) => {
        const titleEl = findSectionTitle(title);
        if (!titleEl) return;
        let node = titleEl.nextElementSibling;
        while (node && !node.classList.contains('section-title')) {
            const next = node.nextElementSibling;
            node.remove();
            node = next;
        }
        titleEl.insertAdjacentHTML('afterend', rowsHtml);
    };

    const biographyTitle = findSectionTitle('Biography');
    const biographyParagraph = biographyTitle?.nextElementSibling;
    if (biographyParagraph?.tagName === 'P') {
        biographyParagraph.innerHTML = `
            I earned my Bachelor's degree in Aircraft Avionics Maintenance from Kocaeli University in 2015, gaining foundational knowledge in avionics systems. In 2016, I began a Master's in Air Traffic Control at Anadolu University, researching how organizational practices affect aviation incidents. This work underscored the impact of operational and management factors on safety and earned me the <strong>Master's Thesis Success Award</strong>.
            <br/><br/>
            In 2018, I began a Ph.D. in Air Traffic Control at Eskisehir Technical University. My doctoral research developed multi-objective stochastic optimization models for multi-runway airports, addressing wind uncertainties and taxi-time variability to improve fuel efficiency, punctuality, operational performance, and emissions. I received the <strong>Article Performance Award</strong> for high-impact publications. From 2018 to 2022, I served as a Research Assistant and participated in the <strong>Erasmus+ ATCOSIMA project</strong>, contributing to simulation design, performance metrics, data analysis, and joint academic outputs with international partners.
            <br/><br/>
            Alongside research, I spent <strong>six years as a pseudo-pilot</strong> in ATCo training, simulating multiple ATC positions including Aerodrome Control, Radar Approach/Area Control, Coordination, and Procedural Control, which gave me direct operational insight into ATM practice.
            <br/><br/>
            In 2023, I was appointed <strong>Head of the Aircraft Maintenance Department</strong> at Samsun University, overseeing course scheduling, civil aviation regulation compliance, and internship and on-the-job training collaborations. In 2024, I became an <strong>Associate Professor of Aircraft, Aeronautics, and Aerospace Engineering</strong> and received a <strong>Certificate of Appreciation</strong> from the Rector of Samsun University.
            <br/><br/>
            Since 2022, I have been <strong>actively teaching</strong> undergraduate and graduate courses. These include Basic Aircraft Knowledge and Basic Aerodynamics for Aircraft Maintenance students, Aerospace Instruments for Aeronautics and Astronautics students, and Optimization Techniques in Engineering at the graduate level, where I guide students through model formulation, Python coding, and solution analysis. In 2023, I mentored my first Master's student on terminal airspace complexity using multi-criteria decision-making tools.
            <br/><br/>
            From October 2025 to August 2026, I served as <strong>Vice Dean</strong> of the Faculty of Aeronautics and Astronautics. I also serve on the University Education Commission and the Strategic Planning Commission, mentor several student teams, and frequently act as a <strong>jury member</strong> in numerous M.Sc. and Ph.D. thesis defenses.
            <br/><br/>
            Throughout my professional career, I have been actively involved in research and development projects funded by <strong>EU, TUBITAK, and university programs</strong>, serving as a project coordinator, advisor, researcher, and expert. I also provide <strong>project-based consultancy services</strong> to a company in the defense industry.
            <br/><br/>
            The website currently lists ${totalPublications} publications, including ${journals.length} journal papers, ${proceedings.length} conference proceedings, and ${books.length} book chapter(s). Of these, ${q1Count + q2Count} are marked Q1/Q2, with ${q1Count} in Q1 and ${q2Count} in Q2.
            <br/><br/>
            In my courses and research, I use GAMS, Pyomo, machine learning methods, MICRONAV BEST, and SIMMOD PRO, with a particular focus on optimization, decision support, and intelligent ATM applications. Between June and September 2025, I also worked at <strong>Nanyang Technological University in Singapore as a Visiting Researcher</strong> on next-generation airside operations and intelligent decision support systems.
        `;
    }

    replaceSectionRows('Administrative Roles', `
        <div class="entry-row"><div class="entry-date">Oct 2025 - Aug 2026</div><div class="entry-content"><div class="entry-title">Vice Dean</div><div class="entry-inst">Ozdemir Bayraktar Faculty of Aeronautics & Astronautics</div></div></div>
        <div class="entry-row"><div class="entry-date">2023 - 2025</div><div class="entry-content"><div class="entry-title">Head of Department</div><div class="entry-inst">Aircraft Maintenance & Repair Dept., Samsun University</div></div></div>
    `);

    const journalTitle = findSectionTitle('Journal Publications');
    if (journalTitle) {
        journalTitle.insertAdjacentHTML('beforebegin', `
            <div class="section-title">Academic Service</div>
            <div class="entry-row"><div class="entry-date">Ongoing</div><div class="entry-content"><div class="entry-title">Jury Member</div><div class="entry-inst">Numerous M.Sc. and Ph.D. thesis defenses in related fields</div></div></div>
        `);
    }

    replaceSectionRows('Research Labs & Groups', `
        <div class="entry-row"><div class="entry-date">2026 - Present</div><div class="entry-content"><div class="entry-title">DARE Lab - Founder & Co-Director</div><div class="entry-inst">Decentralized Aviation Research & Education Lab</div><div class="entry-desc">A global, decentralized non-profit community dedicated to high-quality scientific outputs across the aviation ecosystem.</div></div></div>
        <div class="entry-row"><div class="entry-date">Apr 2026 - Present</div><div class="entry-content"><div class="entry-title">CA24122 mSPACE Action - Working Group Member</div><div class="entry-inst">multiscale Stochastics, Patterns, and Analysis of Combinatorial Environments</div></div></div>
        <div class="entry-row"><div class="entry-date">Jun - Sep 2025</div><div class="entry-content"><div class="entry-title">ATMRI (NTU Singapore) - Visiting Researcher</div><div class="entry-inst">Air Traffic Management Research Institute</div></div></div>
    `);

    const keepResearchProjectTailTogether = () => {
        const titleEl = findSectionTitle('Research Projects');
        if (!titleEl) return;

        const projectRows = [];
        let node = titleEl.nextElementSibling;
        while (node && !node.classList.contains('section-title')) {
            if (node.classList.contains('entry-row')) {
                projectRows.push(node);
            }
            node = node.nextElementSibling;
        }

        if (projectRows.length < 2) return;

        const tailRows = projectRows.slice(-2);
        const wrapper = document.createElement('div');
        wrapper.className = 'project-tail-keep avoid-break';
        tailRows[0].parentNode.insertBefore(wrapper, tailRows[0]);
        tailRows.forEach((row) => wrapper.appendChild(row));
    };

    const keepSectionStartsTogether = () => {
        const titles = Array.from(container.querySelectorAll('.section-title'));
        const sectionToneClasses = [
            'section-tone-blue',
            'section-tone-orange',
            'section-tone-green',
            'section-tone-rose',
            'section-tone-amber'
        ];

        if (titles[0]) {
            titles[0].classList.add('first-section-title');
        }

        titles.forEach((titleEl, index) => {
            titleEl.classList.add(sectionToneClasses[index % sectionToneClasses.length]);
            if (titleEl.parentElement?.classList.contains('section-keep-together')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'section-keep-together';
            titleEl.parentNode.insertBefore(wrapper, titleEl);
            wrapper.appendChild(titleEl);

            let node = wrapper.nextSibling;
            let keptRows = 0;

            while (node) {
                const next = node.nextSibling;
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    wrapper.appendChild(node);
                    node = next;
                    continue;
                }

                if (node.classList.contains('section-title') || node.classList.contains('cv-metrics-panel')) {
                    break;
                }

                wrapper.appendChild(node);

                if (node.classList.contains('entry-row') || node.classList.contains('pub-item')) {
                    keptRows += 1;
                    if (keptRows >= 2) {
                        break;
                    }
                } else {
                    break;
                }

                node = next;
            }
        });
    };

    keepResearchProjectTailTogether();
    keepSectionStartsTogether();

    // 4. Generate PDF
    const element = document.getElementById('cv-content');

    // Ensure container is capture-ready (some browsers ignore elements at -9999px)
    container.style.left = '0';
    container.style.opacity = '1';
    container.style.zIndex = '-1';

    const insertStablePageSpacers = () => {
        const contentWidthMm = 210 - 20; // A4 width minus left/right PDF margins
        const contentHeightMm = 297 - 16; // A4 height minus top/bottom PDF margins
        const pageHeightPx = element.offsetWidth * (contentHeightMm / contentWidthMm);
        const pageSafetyPx = 12;

        if (!Number.isFinite(pageHeightPx) || pageHeightPx <= 0) return;

        const candidates = Array.from(element.querySelectorAll([
            '.section-keep-together',
            '.project-tail-keep',
            '.entry-row',
            '.pub-item',
            '.pub-legend',
            '.cv-metrics-panel'
        ].join(',')));

        candidates.forEach((node) => {
            if (!node.isConnected || node.classList.contains('cv-page-spacer')) return;

            const elementTop = element.getBoundingClientRect().top;
            const rect = node.getBoundingClientRect();
            const height = Math.ceil(rect.height);
            if (height <= 0 || height >= pageHeightPx - pageSafetyPx) return;

            const top = rect.top - elementTop;
            const pageOffset = ((top % pageHeightPx) + pageHeightPx) % pageHeightPx;
            const bottomOffset = pageOffset + height;

            if (pageOffset > pageSafetyPx && bottomOffset > pageHeightPx - pageSafetyPx) {
                const spacer = document.createElement('div');
                spacer.className = 'cv-page-spacer';
                spacer.style.height = `${Math.ceil(pageHeightPx - pageOffset + pageSafetyPx)}px`;
                node.parentNode.insertBefore(spacer, node);
            }
        });
    };

    // Fonts and portraits must settle before measuring page boundaries.
    if (document.fonts?.ready) await document.fonts.ready;
    await Promise.all(Array.from(element.querySelectorAll('img'), (img) =>
        typeof img.decode === 'function' ? img.decode().catch(() => {}) : Promise.resolve()
    ));
    insertStablePageSpacers();

    const pdfSettings = {
        filename: 'Assoc_Prof_Kadir_Donmez_CV.pdf',
        targetDpi: 400,
        scale: 400 / 96,
        marginMm: { top: 8, right: 10, bottom: 8, left: 10 },
        pageMm: { width: 210, height: 297 }
    };

    const saveWithHtml2PdfFallback = () => {
        const opt = {
            margin: [pdfSettings.marginMm.top, pdfSettings.marginMm.left, pdfSettings.marginMm.bottom, pdfSettings.marginMm.right],
            filename: pdfSettings.filename,
            image: { type: 'png', quality: 1 },
            html2canvas: {
                scale: pdfSettings.scale,
                useCORS: true,
                scrollY: 0,
                windowWidth: element.scrollWidth,
                logging: false,
                letterRendering: true
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
            pagebreak: {
                mode: ['css', 'legacy'],
                avoid: ['.entry-row', '.pub-item', '.avoid-break', '.section-keep-together', '.project-tail-keep', '.entry-content', '.cv-metrics-panel', '.section-title', '.pub-text']
            },
            enableLinks: true
        };

        return html2pdf().set(opt).from(element).save();
    };

    const saveHighResolutionPdf = async () => {
        const jsPDFCtor = window.jspdf?.jsPDF || window.jsPDF;
        if (typeof html2canvas === 'undefined' || !jsPDFCtor) {
            return saveWithHtml2PdfFallback();
        }

        const contentWidthMm = pdfSettings.pageMm.width - pdfSettings.marginMm.left - pdfSettings.marginMm.right;
        const contentHeightMm = pdfSettings.pageMm.height - pdfSettings.marginMm.top - pdfSettings.marginMm.bottom;
        const pageWidthPx = element.offsetWidth;
        const pageHeightPx = pageWidthPx * (contentHeightMm / contentWidthMm);
        const totalHeightPx = Math.ceil(element.scrollHeight);
        const pageCount = Math.ceil(totalHeightPx / pageHeightPx);
        const pdf = new jsPDFCtor({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true
        });

        for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
            const canvas = await html2canvas(element, {
                scale: pdfSettings.scale,
                useCORS: true,
                backgroundColor: '#ffffff',
                x: 0,
                y: Math.floor(pageIndex * pageHeightPx),
                width: pageWidthPx,
                height: Math.ceil(pageHeightPx),
                scrollX: 0,
                scrollY: 0,
                windowWidth: pageWidthPx,
                windowHeight: Math.ceil(pageHeightPx),
                logging: false,
                letterRendering: true
            });

            if (pageIndex > 0) {
                pdf.addPage();
            }

            pdf.addImage(
                canvas.toDataURL('image/png'),
                'PNG',
                pdfSettings.marginMm.left,
                pdfSettings.marginMm.top,
                contentWidthMm,
                contentHeightMm,
                undefined,
                'FAST'
            );

            if (typeof pdf.link === 'function') {
                const elementTop = element.getBoundingClientRect().top;
                const elementLeft = element.getBoundingClientRect().left;
                const pageTopPx = pageIndex * pageHeightPx;
                const anchors = Array.from(element.querySelectorAll('a[href]'));

                anchors.forEach((anchor) => {
                    const rect = anchor.getBoundingClientRect();
                    const anchorTop = rect.top - elementTop;
                    const anchorLeft = rect.left - elementLeft;
                    const anchorBottom = anchorTop + rect.height;

                    if (anchorBottom < pageTopPx || anchorTop > pageTopPx + pageHeightPx) return;

                    pdf.link(
                        pdfSettings.marginMm.left + (anchorLeft / pageWidthPx) * contentWidthMm,
                        pdfSettings.marginMm.top + ((anchorTop - pageTopPx) / pageHeightPx) * contentHeightMm,
                        (rect.width / pageWidthPx) * contentWidthMm,
                        (rect.height / pageHeightPx) * contentHeightMm,
                        { url: anchor.href }
                    );
                });
            }

            canvas.width = 0;
            canvas.height = 0;
            await new Promise((resolve) => requestAnimationFrame(resolve));
        }

        pdf.save(pdfSettings.filename);
    };

    try {
        await saveHighResolutionPdf();
    } finally {
        document.getElementById('cv-loading-overlay')?.classList.remove('active');
        container.innerHTML = '';
        container.style.left = '-9999px'; // Move back
        container.style.opacity = '1';
    }
}
