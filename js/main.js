// Stagger Entrance Helper
function applyStagger(selector, staggerDelay = 40) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
        el.style.setProperty('--stagger', index);
        el.style.setProperty('--stagger-delay', `${staggerDelay}ms`);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeBtn = document.getElementById("themeBtn");
    const menuBtn = document.getElementById("menuBtn");
    const drawer = document.getElementById("drawer");
    const yearEl = document.getElementById("year");

    // Stagger Preparation (Ultra-Snappy)
    applyStagger('.bento-card', 15);
    applyStagger('.timeline-item', 15);
    applyStagger('.pub-item', 10); // Minimal delay for papers

    // Navigation - Scroll Spy
    const navLinks = document.querySelectorAll('.menu a');
    const sections = document.querySelectorAll('section');

    function updateNav() {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateNav);
    window.addEventListener('resize', updateNav);
    updateNav(); // Init

    // Magnetic Button Effect
    const magneticBtn = document.querySelector('.hero-btn');
    if (magneticBtn) {
        magneticBtn.addEventListener('mousemove', (e) => {
            const rect = magneticBtn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            magneticBtn.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
        });

        magneticBtn.addEventListener('mouseleave', () => {
            magneticBtn.style.transform = `translate(0px, 0px)`;
        });
    }

    // Set current year in footer
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Theme Management
    const savedTheme = localStorage.getItem("kd_theme");
    if (savedTheme) {
        body.setAttribute("data-theme", savedTheme);
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const currentTheme = document.body.getAttribute("data-theme") || "dark";
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.body.setAttribute("data-theme", newTheme);
            localStorage.setItem("kd_theme", newTheme);
        });
    }

    // Mobile Menu Toggle
    if (menuBtn && drawer) {
        menuBtn.addEventListener("click", () => {
            const expanded = menuBtn.getAttribute("aria-expanded") === "true";
            menuBtn.setAttribute("aria-expanded", String(!expanded));
            if (!expanded) {
                drawer.style.display = "flex";
                drawer.classList.add('active');
                body.style.overflow = "hidden";
            } else {
                drawer.classList.remove('active');
                setTimeout(() => { drawer.style.display = "none"; }, 400);
                body.style.overflow = "auto";
            }
        });

        const closeBtn = document.getElementById("closeDrawer");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                drawer.classList.remove('active');
                setTimeout(() => { drawer.style.display = "none"; }, 400);
                menuBtn.setAttribute("aria-expanded", "false");
                body.style.overflow = "auto";
            });
        }

        drawer.querySelectorAll("a").forEach(a => {
            a.addEventListener("click", () => {
                drawer.classList.remove('active');
                setTimeout(() => { drawer.style.display = "none"; }, 400);
                menuBtn.setAttribute("aria-expanded", "false");
                body.style.overflow = "auto";
            });
        });
    }

    // Publication Tabs
    const pubTabs = document.querySelectorAll('.pub-tab');
    const pubPanels = document.querySelectorAll('.pub-panel');

    pubTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.target;
            pubTabs.forEach(t => t.classList.remove('active'));
            pubPanels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panel = document.getElementById(target);
            if (panel) {
                panel.classList.add('active');
            }
        });
    });

    // Scroll Reveal Animation (Upgraded)
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stagger = parseInt(getComputedStyle(entry.target).getPropertyValue('--stagger') || 0);
                const baseDelay = parseInt(getComputedStyle(entry.target).getPropertyValue('--stagger-delay') || '30ms');
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, stagger * baseDelay);
                observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.05,
        rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('section, .bento-card, .timeline-item, .pub-item').forEach(el => {
        el.classList.add('reveal-on-scroll');
        revealObserver.observe(el);
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
