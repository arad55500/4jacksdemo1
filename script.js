/* ============================================================
   4JACKS NITRO COLD BREW — MULTI-PAGE INTERACTIONS
   Poppi-style: scroll reveals, FAQ, accordions, mobile nav
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── SMART HEADER — hide on scroll down, reveal on scroll up ──
    const header = document.getElementById('header');
    if (header) {
        let lastScrollY = 0;
        let ticking = false;
        const SCROLL_THRESHOLD = 8; // minimum px to count as scroll

        const updateHeader = () => {
            const scrollY = window.scrollY;
            const delta = scrollY - lastScrollY;

            // At very top
            if (scrollY < 60) {
                header.classList.add('at-top');
                header.classList.remove('scrolled', 'header-hidden');
            } else {
                header.classList.remove('at-top');
                header.classList.add('scrolled');

                // Scrolling down past threshold → hide
                if (delta > SCROLL_THRESHOLD) {
                    header.classList.add('header-hidden');
                }
                // Scrolling up past threshold → show
                if (delta < -SCROLL_THRESHOLD) {
                    header.classList.remove('header-hidden');
                }
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });

        updateHeader();
    }

    // ─── MOBILE MENU ───────────────────────────────────────────
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileNav = document.getElementById('mobileNav');
    if (mobileToggle && mobileNav) {
        const toggleMenu = (open) => {
            const isOpen = typeof open === 'boolean' ? open : !mobileNav.classList.contains('open');
            mobileToggle.classList.toggle('active', isOpen);
            mobileNav.classList.toggle('open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        };

        mobileToggle.addEventListener('click', () => toggleMenu());

        // Close on link click
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (mobileNav.classList.contains('open') &&
                !mobileNav.contains(e.target) &&
                !mobileToggle.contains(e.target)) {
                toggleMenu(false);
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                toggleMenu(false);
            }
        });
    }

    // ─── SCROLL REVEAL ─────────────────────────────────────────
    const revealEls = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale');
    if (!prefersReducedMotion && revealEls.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
        revealEls.forEach(el => observer.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('visible'));
    }

    // ─── FAQ ACCORDION ─────────────────────────────────────────
    document.querySelectorAll('[data-faq]').forEach(item => {
        const btn = item.querySelector('.faq-q');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            // Close all
            document.querySelectorAll('[data-faq]').forEach(other => other.classList.remove('active'));
            // Toggle
            if (!isActive) item.classList.add('active');
        });
    });

    // ─── FEATURE ACCORDION (Why section on homepage) ───────────
    document.querySelectorAll('[data-accordion]').forEach(item => {
        const head = item.querySelector('.feature-row-head');
        if (!head) return;
        head.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            document.querySelectorAll('[data-accordion]').forEach(other => other.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // ─── ANIMATED NUMBER COUNTERS ──────────────────────────────
    const statNums = document.querySelectorAll('[data-count]');
    if (statNums.length) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statNums.forEach(el => counterObserver.observe(el));
    }

    function animateCounter(el) {
        const target = parseInt(el.dataset.count, 10);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const duration = 1200;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // ─── CONTACT FORM ──────────────────────────────────────────
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(form));

            // Basic validation highlight
            let valid = true;
            form.querySelectorAll('[required]').forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = 'var(--red)';
                    valid = false;
                } else {
                    field.style.borderColor = 'transparent';
                }
            });
            if (!valid) return;

            // Success feedback
            const btn = form.querySelector('.submit-btn');
            const orig = btn.textContent;
            btn.textContent = 'message sent!';
            btn.style.background = '#22c55e';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = orig;
                btn.style.background = '';
                btn.disabled = false;
                form.reset();
            }, 3000);

            console.log('Form submitted:', data);
        });
    }

    // ─── SMOOTH ANCHOR SCROLL (for any in-page links) ──────────
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = header ? header.offsetHeight + 20 : 80;
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - offset,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ─── PARALLAX on hero badge ─────────────────────────────────
    if (!prefersReducedMotion) {
        const heroBadge = document.querySelector('.hb-badge');
        if (heroBadge) {
            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY;
                if (scrollY > 600) return;
                heroBadge.style.transform = `rotate(${scrollY * 0.05}deg)`;
            }, { passive: true });
        }
    }
});
