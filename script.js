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
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            mobileNav.classList.toggle('open');
        });
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                mobileNav.classList.remove('open');
            });
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

    // ─── PARALLAX on hero tiles ────────────────────────────────
    if (!prefersReducedMotion) {
        const heroTiles = document.querySelectorAll('.hero-v2-tile');
        const heroBadge = document.querySelector('.hero-v2-badge img');
        if (heroTiles.length || heroBadge) {
            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY;
                if (scrollY > 900) return;
                const p = scrollY / 900;
                heroTiles.forEach((tile, i) => {
                    const speed = 15 + (i * 8);
                    const dir = i % 2 === 0 ? 1 : -1;
                    tile.style.translate = `${dir * p * 10}px ${p * speed}px`;
                });
                if (heroBadge) {
                    heroBadge.style.transform = `scale(${1 + p * 0.05}) rotate(${scrollY * 0.04}deg)`;
                }
            }, { passive: true });
        }
    }

    // ─── CHATBOT ─────────────────────────────────────────────
    const chatToggle = document.getElementById('chatbotToggle');
    const chatPanel = document.getElementById('chatbotPanel');
    const chatMessages = document.getElementById('chatbotMessages');
    const chatInput = document.getElementById('chatbotInput');
    const chatSend = document.getElementById('chatbotSend');
    const chatQuickActions = document.getElementById('chatbotQuickActions');
    const chatIconChat = document.getElementById('chatbotIconChat');
    const chatIconClose = document.getElementById('chatbotIconClose');
    const chatBadge = chatToggle ? chatToggle.querySelector('.chatbot-badge') : null;

    if (chatToggle && chatPanel) {
        let chatOpen = false;
        let chatInitialized = false;

        // Knowledge base for the chatbot
        const knowledgeBase = [
            {
                keywords: ['cold brew', 'what is cold brew', 'cold brew coffee'],
                answer: 'Cold brew is coffee brewed with cold water instead of hot. Our 4Jacks cold brew is made by steeping four premium Arabica beans for 20 hours in our FDA-inspected facility. It\'s less acidic, smoother, and has higher caffeine than traditional coffee!'
            },
            {
                keywords: ['nitro', 'what is nitro', 'nitrogen'],
                answer: 'Nitro cold brew is cold brew infused with nitrogen gas. The nitrogen creates micro-bubbles that give it a foamy head, naturally sweet flavor, and creamy texture — all with no sugar, no cream, and only 9 calories per 12oz serving!'
            },
            {
                keywords: ['dispenser', 'machine', 'equipment', 'pour', 'tap'],
                answer: 'We offer two patented dispensers with true nitrogen generation — no gas tanks needed! The <strong>Countertop</strong> (20.3"x16.9"x19.5") holds 5L and pours 210oz. The <strong>Standard</strong> (36"x24.3"x24") has dual faucets for nitro + still cold brew, pouring 760oz. You can also use the included gravity-fed tap without any dispenser!'
            },
            {
                keywords: ['price', 'cost', 'profit', 'revenue', 'money', 'roi'],
                answer: 'Businesses average about <strong>$4 profit per serving</strong> with 4Jacks. Nitro cold brew is a $2.6B industry growing at 26% per year — it\'s a great revenue stream! <a href="contact.html">Contact us</a> for pricing details.'
            },
            {
                keywords: ['distributor', 'order', 'buy', 'purchase', 'supply', 'where to get'],
                answer: 'We\'re distributed by <strong>Sysco, PFG, Driscoll Foods, and US Foods</strong> — all major broadliners. You can order through your existing distributor account. <a href="contact.html">Contact us</a> and we\'ll help you get set up!'
            },
            {
                keywords: ['shelf life', 'expire', 'expiration', 'how long', 'storage'],
                answer: 'Our cold brew has a <strong>6-month shelf life</strong> from brewing, thanks to our FDA-inspected facility and state-of-the-art pasteurization. Once opened, the bag-in-box lasts 60 days.'
            },
            {
                keywords: ['kosher', 'certification', 'certified'],
                answer: 'Yes! 4Jacks cold brew is certified Kosher by Kosher Supervision of America (KSA).'
            },
            {
                keywords: ['gas tank', 'tank', 'compressed', 'co2', 'nitrogen tank'],
                answer: 'No gas tanks needed! Our patented dispensers use <strong>true nitrogen generation</strong> — just plug in and pour. This sets us apart from competitors who often use compressed gas systems.'
            },
            {
                keywords: ['calorie', 'sugar', 'cream', 'healthy', 'nutrition', 'ingredient'],
                answer: 'Our nitro cold brew is just <strong>9 calories per 12oz</strong> serving — with no sugar and no cream. The smooth, sweet taste comes entirely from the nitrogen infusion and our premium 4-bean Arabica blend!'
            },
            {
                keywords: ['demo', 'tasting', 'sample', 'try', 'test'],
                answer: 'We\'d love to come to you! We offer a <strong>free, no-commitment, 15-minute demonstration</strong>. Just <a href="contact.html">fill out our contact form</a> or call us at <a href="tel:+19145880737">(914) 588-0737</a>.'
            },
            {
                keywords: ['contact', 'reach', 'email', 'phone', 'call'],
                answer: 'You can reach us anytime! Email: <a href="mailto:talk@4jacksnitro.com">talk@4jacksnitro.com</a> | Phone: <a href="tel:+19145880737">(914) 588-0737</a> | Or <a href="contact.html">fill out our contact form</a> and we\'ll get right back to you.'
            },
            {
                keywords: ['drink', 'recipe', 'cocktail', 'menu', 'martini', 'menu item'],
                answer: 'Our cold brew is incredibly versatile! From all-ages drinks like Ice Cream Floats and Lemonades to craft cocktails like Espresso Martinis and Irish Bliss Nitro. Check out our <a href="drinks.html">Drink Inspirations</a> page for all the ideas!'
            },
            {
                keywords: ['different', 'competitor', 'unique', 'special', 'why 4jacks', 'better'],
                answer: 'What makes us unique: <strong>1)</strong> Patented dispensers with true nitrogen generation (no tanks!), <strong>2)</strong> Premium 4-bean Arabica blend steeped 20 hours, <strong>3)</strong> Ready-to-drink with no water lines needed, <strong>4)</strong> Recyclable packaging (75% recycled content), <strong>5)</strong> 6-month shelf life. We\'re the most convenient, high-quality nitro system in the industry!'
            },
            {
                keywords: ['restaurant', 'cafe', 'bar', 'hotel', 'office', 'business type', 'who'],
                answer: 'We serve all types of businesses! Restaurants, coffee shops, bars, offices, hotels, event spaces, stadiums, arenas, and college campuses. Anywhere people enjoy great coffee, 4Jacks fits perfectly.'
            }
        ];

        const quickActions = [
            { label: 'What is nitro cold brew?', query: 'what is nitro' },
            { label: 'Tell me about dispensers', query: 'dispenser' },
            { label: 'How much profit?', query: 'profit' },
            { label: 'Book a free demo', query: 'demo' },
            { label: 'How to order?', query: 'distributor' },
            { label: 'Contact info', query: 'contact' }
        ];

        function findAnswer(query) {
            const q = query.toLowerCase().trim();
            let bestMatch = null;
            let bestScore = 0;

            for (const entry of knowledgeBase) {
                for (const keyword of entry.keywords) {
                    // Check if the query contains the keyword or vice versa
                    if (q.includes(keyword) || keyword.includes(q)) {
                        const score = keyword.length;
                        if (score > bestScore) {
                            bestScore = score;
                            bestMatch = entry;
                        }
                    }
                    // Also check individual words
                    const qWords = q.split(/\s+/);
                    const kWords = keyword.split(/\s+/);
                    let wordMatches = 0;
                    for (const qw of qWords) {
                        if (qw.length < 3) continue;
                        for (const kw of kWords) {
                            if (kw.includes(qw) || qw.includes(kw)) {
                                wordMatches++;
                            }
                        }
                    }
                    if (wordMatches > 0 && wordMatches > bestScore) {
                        bestScore = wordMatches;
                        bestMatch = entry;
                    }
                }
            }

            if (bestMatch) return bestMatch.answer;

            // Default fallback
            return 'Great question! I\'d love to help you with that. For the most detailed answer, you can <a href="contact.html">contact our team directly</a> or call <a href="tel:+19145880737">(914) 588-0737</a>. In the meantime, try asking me about our dispensers, pricing, cold brew process, or how to order!';
        }

        function addMessage(text, isBot) {
            const msg = document.createElement('div');
            msg.className = `chat-msg ${isBot ? 'chat-msg-bot' : 'chat-msg-user'}`;
            msg.innerHTML = text;
            chatMessages.appendChild(msg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function showQuickActions() {
            chatQuickActions.innerHTML = '';
            quickActions.forEach(action => {
                const btn = document.createElement('button');
                btn.className = 'chatbot-quick-btn';
                btn.textContent = action.label;
                btn.addEventListener('click', () => {
                    handleUserMessage(action.label);
                });
                chatQuickActions.appendChild(btn);
            });
        }

        function handleUserMessage(text) {
            addMessage(text, false);
            chatQuickActions.innerHTML = '';

            // Typing indicator
            const typing = document.createElement('div');
            typing.className = 'chat-msg chat-msg-bot';
            typing.innerHTML = '<em>typing...</em>';
            typing.id = 'typingIndicator';
            chatMessages.appendChild(typing);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            setTimeout(() => {
                const typingEl = document.getElementById('typingIndicator');
                if (typingEl) typingEl.remove();
                const answer = findAnswer(text);
                addMessage(answer, true);
                // Show quick actions again after a delay
                setTimeout(showQuickActions, 500);
            }, 600 + Math.random() * 400);
        }

        function initChat() {
            if (chatInitialized) return;
            chatInitialized = true;
            addMessage('Hey there! I\'m the 4Jacks assistant. I can help you learn about our nitro cold brew, dispensers, pricing, and more. What can I help you with?', true);
            showQuickActions();
        }

        // Toggle
        chatToggle.addEventListener('click', () => {
            chatOpen = !chatOpen;
            chatPanel.classList.toggle('open', chatOpen);
            chatToggle.classList.toggle('active', chatOpen);
            chatIconChat.style.display = chatOpen ? 'none' : 'block';
            chatIconClose.style.display = chatOpen ? 'block' : 'none';
            if (chatBadge) chatBadge.style.display = 'none';

            if (chatOpen) {
                initChat();
                setTimeout(() => chatInput.focus(), 300);
            }
        });

        // Send message
        function sendMessage() {
            const text = chatInput.value.trim();
            if (!text) return;
            chatInput.value = '';
            handleUserMessage(text);
        }

        if (chatSend) chatSend.addEventListener('click', sendMessage);
        if (chatInput) chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});
