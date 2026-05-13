/**
 * AgriPro – Fő JavaScript fájl
 * ────────────────────────────
 * Modulok:
 *  1. Segédfüggvények
 *  2. Toast értesítési rendszer
 *  3. Navigáció (sticky, dropdown, hamburger)
 *  4. Keresés overlay + termékkeresés
 *  5. Termékkártya szűrő (chips)
 *  6. Vélemény carousel (auto-rotate)
 *  7. Scroll-reveal animációk
 *  8. Kedvencek (localStorage)
 *  9. Kapcsolati form validáció
 * 10. Hírlevél form
 * 11. Vissza a tetejére gomb
 * 12. Smooth anchor scroll
 * 13. Inicializálás
 */

'use strict';

/* ══════════════════════════════════════════
   1. SEGÉDFÜGGVÉNYEK
══════════════════════════════════════════ */

/** Elem lekérdezése */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/** Eseményfigyelő hozzáadása, null-safe */
function on(el, event, handler, opts) {
    if (el) el.addEventListener(event, handler, opts);
}

/** Osztály kapcsoló */
function toggle(el, cls, force) {
    if (el) el.classList.toggle(cls, force);
}

/* ══════════════════════════════════════════
   2. TOAST ÉRTESÍTÉSI RENDSZER
══════════════════════════════════════════ */

const toastContainer = $('#toastContainer');

/**
 * Toast értesítés megjelenítése
 * @param {string} message - Megjelenítendő szöveg
 * @param {'default'|'success'|'error'} type - Típus
 * @param {number} duration - Milliszekundumban (alapból 3200)
 */
function showToast(message, type = 'default', duration = 3200) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toastContainer.appendChild(toast);

    // Eltűntetés idő után
    setTimeout(() => {
        toast.style.animation = 'toastOut .3s ease forwards';
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

/* ══════════════════════════════════════════
   3. NAVIGÁCIÓ
══════════════════════════════════════════ */

function initNavigation() {
    const header    = $('#header');
    const hamburger = $('#hamburger');

    // Mobil menü és overlay dinamikus létrehozása
    let mobileNav, mobileOverlay;

    function createMobileMenu() {
        // Overlay
        mobileOverlay = document.createElement('div');
        mobileOverlay.className = 'mobile-overlay';
        mobileOverlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(mobileOverlay);

        // Drawer
        mobileNav = document.createElement('nav');
        mobileNav.className = 'mobile-nav';
        mobileNav.setAttribute('aria-label', 'Mobil főmenü');
        mobileNav.innerHTML = `
            <a class="mobile-nav__link" href="/">🏠 Főoldal</a>
            <div class="mobile-nav__divider"></div>
            <a class="mobile-nav__link" href="pages/termekek.html?kat=traktorok">🚜 Traktorok</a>
            <a class="mobile-nav__link" href="pages/termekek.html?kat=kombajnok">🌾 Kombájnok</a>
            <a class="mobile-nav__link" href="pages/termekek.html?kat=talajmuvelok">⚙️ Talajművelők</a>
            <a class="mobile-nav__link" href="pages/termekek.html?kat=vetogepek">🌱 Vetőgépek</a>
            <a class="mobile-nav__link" href="pages/termekek.html?kat=permetezok">💧 Permetezők</a>
            <a class="mobile-nav__link" href="pages/termekek.html?kat=alkatreszek">🔧 Alkatrészek</a>
            <div class="mobile-nav__divider"></div>
            <a class="mobile-nav__link" href="#markak">Márkák</a>
            <a class="mobile-nav__link" href="#">Rólunk</a>
            <a class="mobile-nav__link" href="#">Szerviz</a>
            <a class="mobile-nav__link" href="pages/kapcsolat.html">Kapcsolat</a>
            <div class="mobile-nav__divider"></div>
            <a class="btn btn--primary mobile-nav__cta" href="pages/kapcsolat.html">Ajánlatkérés</a>
        `;
        document.body.appendChild(mobileNav);

        // Overlay kattintás = bezárás
        on(mobileOverlay, 'click', closeMobileMenu);

        // Mobilmenü linkekre kattintás = bezárás
        $$('.mobile-nav__link, .mobile-nav__cta', mobileNav).forEach(link => {
            on(link, 'click', closeMobileMenu);
        });
    }

    function openMobileMenu() {
        mobileNav.classList.add('open');
        mobileOverlay.classList.add('open');
        hamburger.classList.add('is-active');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileNav.classList.remove('open');
        mobileOverlay.classList.remove('open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    if (hamburger) {
        createMobileMenu();
        on(hamburger, 'click', () => {
            const isOpen = mobileNav.classList.contains('open');
            isOpen ? closeMobileMenu() : openMobileMenu();
        });
    }

    // Sticky header – görgetés érzékelése
    function onScroll() {
        toggle(header, 'scrolled', window.scrollY > 20);

        // Vissza a tetejére gomb megjelenítése/elrejtése
        const scrollBtn = $('#scrollTopBtn');
        if (scrollBtn) {
            scrollBtn.hidden = window.scrollY < 300;
        }
    }
    on(window, 'scroll', onScroll, { passive: true });
    onScroll(); // Kezdeti állapot beállítása

    // Dropdown navigáció (asztali)
    $$('.nav__item--has-dropdown').forEach(item => {
        const toggle_btn = item.querySelector('.nav__dropdown-toggle');
        const dropdown   = item.querySelector('.nav__dropdown');
        if (!toggle_btn || !dropdown) return;

        // Hover alapú megjelenítés
        on(item, 'mouseenter', () => {
            toggle_btn.setAttribute('aria-expanded', 'true');
            dropdown.classList.add('open');
        });
        on(item, 'mouseleave', () => {
            toggle_btn.setAttribute('aria-expanded', 'false');
            dropdown.classList.remove('open');
        });

        // Billentyűzet támogatás
        on(toggle_btn, 'keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const isOpen = dropdown.classList.contains('open');
                dropdown.classList.toggle('open', !isOpen);
                toggle_btn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
            }
            if (e.key === 'Escape') {
                dropdown.classList.remove('open');
                toggle_btn.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Dokumentumra kattintva dropdown bezárása
    on(document, 'click', e => {
        $$('.nav__dropdown.open').forEach(dd => {
            if (!dd.closest('.nav__item--has-dropdown').contains(e.target)) {
                dd.classList.remove('open');
                dd.previousElementSibling?.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

/* ══════════════════════════════════════════
   4. KERESÉS OVERLAY + TERMÉKKERESÉS
══════════════════════════════════════════ */

// Termék adatbázis – 10 gép (valós projektben API-ból jönne)
const PRODUCT_DB = [
    // ── Traktorok ──
    { id: 'jd-6r-155',      name: 'John Deere 6R 155 AutoPowr',  cat: 'Traktorok',     brand: 'John Deere', price: 28500000,  url: 'pages/termekek/jd-6r-155.html' },
    { id: 'fendt-724',      name: 'Fendt 724 Vario GEN7',         cat: 'Traktorok',     brand: 'Fendt',      price: 32000000,  url: 'pages/termekek/fendt-724.html' },
    { id: 'claas-axion960', name: 'Claas Axion 960 CMATIC',       cat: 'Traktorok',     brand: 'Claas',      price: 48000000,  url: 'pages/termekek/claas-axion-960.html' },
    { id: 'case-optum300',  name: 'Case IH Optum 300 CVX',        cat: 'Traktorok',     brand: 'Case IH',    price: 45000000,  url: 'pages/termekek/case-optum-300.html' },
    // ── Kombájnok ──
    { id: 'claas-8700',     name: 'Claas Lexion 8700 TT',         cat: 'Kombájnok',     brand: 'Claas',      price: 85000000,  url: 'pages/termekek/claas-lexion-8700.html' },
    { id: 'jd-x9-1100',    name: 'John Deere X9 1100',            cat: 'Kombájnok',     brand: 'John Deere', price: 110000000, url: 'pages/termekek/jd-x9-1100.html' },
    // ── Vetőgépek ──
    { id: 'horsch-maestro', name: 'Horsch Maestro 16 SW',          cat: 'Vetőgépek',     brand: 'Horsch',     price: 12000000,  url: 'pages/termekek/horsch-maestro-16.html' },
    { id: 'amazone-edx9000',name: 'Amazone EDX 9000-TC',           cat: 'Vetőgépek',     brand: 'Amazone',    price: 18000000,  url: 'pages/termekek/amazone-edx-9000.html' },
    // ── Permetezők ──
    { id: 'amazone-ux11200',name: 'Amazone UX 11200 Super',        cat: 'Permetezők',    brand: 'Amazone',    price: 8500000,   url: 'pages/termekek/amazone-ux-11200.html' },
    // ── Talajművelők ──
    { id: 'lemken-heliodor',name: 'Lemken Heliodor 9/600 KA',      cat: 'Talajművelők',  brand: 'Lemken',     price: 6500000,   url: 'pages/termekek/lemken-heliodor.html' },
];

function initSearch() {
    const searchToggle = $('#searchToggle');
    const searchOverlay = $('#searchOverlay');
    const searchClose   = $('#searchClose');
    const searchInput   = $('#searchInput');
    const searchResults = $('#searchResults');

    if (!searchToggle || !searchOverlay) return;

    function openSearch() {
        searchOverlay.hidden = false;
        searchInput?.focus();
        document.body.style.overflow = 'hidden';
    }

    function closeSearch() {
        searchOverlay.hidden = true;
        if (searchResults) searchResults.hidden = true;
        if (searchInput) searchInput.value = '';
        document.body.style.overflow = '';
    }

    on(searchToggle, 'click', openSearch);
    on(searchClose,  'click', closeSearch);

    // ESC billentyűre bezárás
    on(document, 'keydown', e => {
        if (e.key === 'Escape' && !searchOverlay.hidden) closeSearch();
    });

    // Keresési logika (debounce-al)
    let debounceTimer;
    on(searchInput, 'input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => performSearch(searchInput.value), 200);
    });

    // Mélység érzékelés: root / pages/ / pages/termekek/
    const path = window.location.pathname;
    const depth = path.includes('/pages/termekek/') ? 2
                : path.includes('/pages/')          ? 1
                : 0;

    function resolveUrl(p) {
        if (depth === 2) return p.url.replace('pages/termekek/', '');
        if (depth === 1) return p.url.replace('pages/', '');
        return p.url;
    }

    function performSearch(query) {
        if (!searchResults) return;
        const q = query.trim().toLowerCase();

        if (q.length < 2) {
            searchResults.hidden = true;
            return;
        }

        const hits = PRODUCT_DB.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.cat.toLowerCase().includes(q)
        ).slice(0, 6);

        if (hits.length === 0) {
            searchResults.innerHTML = `<p class="search-no-results">Nincs találat: „${query}"</p>`;
        } else {
            searchResults.innerHTML = hits.map(p => `
                <a class="search-result-item" href="${resolveUrl(p)}">
                    <div>
                        <div class="search-result-item__name">${highlight(p.name, q)}</div>
                        <div class="search-result-item__cat">${p.brand} · ${p.cat}</div>
                    </div>
                </a>
            `).join('');
        }
        searchResults.hidden = false;
    }

    // Keresési találatban a keresett szó kiemelése
    function highlight(text, q) {
        const re = new RegExp(`(${q})`, 'gi');
        return text.replace(re, '<mark style="background:rgba(27,67,50,.15);border-radius:2px">$1</mark>');
    }
}

/* ══════════════════════════════════════════
   5. TERMÉKKÁRTYA SZŰRŐ (HOME CHIPS)
══════════════════════════════════════════ */

function initHomeFilter() {
    const chips   = $$('.chip[data-filter]');
    const cards   = $$('.product-card[data-cat]', $('#homeProductGrid'));
    const noRes   = $('#homeNoResults');
    const resetBtn = $('#resetFilter');

    if (!chips.length) return;

    function applyFilter(activeFilter) {
        let visible = 0;

        cards.forEach(card => {
            const match = activeFilter === 'all' || card.dataset.cat === activeFilter;
            card.classList.toggle('hidden', !match);
            if (match) visible++;
        });

        if (noRes) noRes.hidden = visible > 0;

        // Chip aktív állapot frissítése
        chips.forEach(c => {
            const isActive = c.dataset.filter === activeFilter;
            c.classList.toggle('chip--active', isActive);
            c.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    chips.forEach(chip => {
        on(chip, 'click', () => applyFilter(chip.dataset.filter));
    });

    on(resetBtn, 'click', () => applyFilter('all'));
}

/* ══════════════════════════════════════════
   6. VÉLEMÉNY CAROUSEL
══════════════════════════════════════════ */

function initCarousel() {
    const track   = $('#carouselTrack');
    const dots    = $$('.carousel__dot', document);
    const prevBtn = $('#prevReview');
    const nextBtn = $('#nextReview');

    if (!track) return;

    const cards  = $$('.review-card', track);
    const total  = cards.length;
    let current  = 0;
    let autoTimer;

    // Mobilon 1 kártya látszik, tableten 2, asztalon 3
    function getVisible() {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    }

    // Carousel pozíció frissítése
    function goTo(idx) {
        // Normalizálás
        current = ((idx % total) + total) % total;

        // CSS Grid alapú carousel: az összes kártya megjelenik asztali nézetben,
        // mobilon az aktív kártyát emeljük ki
        const visible = getVisible();
        if (visible >= total) {
            // Minden kártya látszik – nincs eltolás szükséges
            cards.forEach((c, i) => {
                c.style.opacity = '1';
                c.style.transform = 'scale(1)';
            });
        } else {
            // Csak az aktív kártyát mutatjuk kiemelt stílussal
            cards.forEach((c, i) => {
                const isActive = i === current;
                c.style.opacity = isActive ? '1' : '0.45';
                c.style.transform = isActive ? 'scale(1)' : 'scale(.97)';
                c.style.transition = 'opacity .35s ease, transform .35s ease';
            });
        }

        // Dots frissítése
        dots.forEach((d, i) => {
            const isActive = i === current;
            d.classList.toggle('carousel__dot--active', isActive);
            d.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // Auto-rotate (5 másodperc)
    function startAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(next, 5000);
    }
    function pauseAuto() { clearInterval(autoTimer); }

    on(nextBtn, 'click', () => { next(); startAuto(); });
    on(prevBtn, 'click', () => { prev(); startAuto(); });

    dots.forEach(dot => {
        on(dot, 'click', () => { goTo(+dot.dataset.idx); startAuto(); });
    });

    // Érintőképernyő swipe támogatás
    let touchStartX = 0;
    on(track, 'touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    on(track, 'touchend', e => {
        const dx = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 50) { dx > 0 ? next() : prev(); startAuto(); }
    });

    // Hover esetén szünetet tartunk
    on(track, 'mouseenter', pauseAuto);
    on(track, 'mouseleave', startAuto);

    // Inicializálás
    goTo(0);
    startAuto();

    // Átméretezésnél frissítés
    on(window, 'resize', () => goTo(current));
}

/* ══════════════════════════════════════════
   7. SCROLL-REVEAL ANIMÁCIÓK
══════════════════════════════════════════ */

function initScrollReveal() {
    const elements = $$('[data-animate]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const el    = entry.target;
            const delay = parseInt(el.dataset.delay || '0', 10);

            // Késleltetés alkalmazása
            setTimeout(() => el.classList.add('is-visible'), delay);

            // Elemre egyszer animálunk
            observer.unobserve(el);
        });
    }, {
        threshold:   0.10,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════
   8. KEDVENCEK (localStorage)
══════════════════════════════════════════ */

const FAV_KEY = 'agripro_favorites';

function initFavorites() {
    const badge = $('#favBadge');

    /** Kedvencek betöltése */
    function loadFavs() {
        try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); }
        catch { return []; }
    }

    /** Kedvencek mentése */
    function saveFavs(list) {
        localStorage.setItem(FAV_KEY, JSON.stringify(list));
    }

    /** Badge frissítése */
    function updateBadge() {
        const favs = loadFavs();
        if (badge) {
            badge.textContent = favs.length;
            badge.hidden = favs.length === 0;
        }
    }

    /** Egy gomb frissítése az aktuális állapot alapján */
    function updateBtn(btn, id) {
        const favs = loadFavs();
        const isFav = favs.includes(id);
        btn.classList.toggle('is-fav', isFav);
        btn.setAttribute('aria-label',
            isFav
                ? `${btn.dataset.name} eltávolítása a kedvencekből`
                : `${btn.dataset.name} hozzáadása a kedvencekhez`
        );
    }

    /** Kedvenc toggle kezelő */
    function handleFavToggle(e) {
        const btn  = e.currentTarget;
        const { id, name } = btn.dataset;
        if (!id) return;

        const favs  = loadFavs();
        const idx   = favs.indexOf(id);
        const adding = idx === -1;

        if (adding) {
            favs.push(id);
            showToast(`❤️ Hozzáadva: ${name}`, 'success');
        } else {
            favs.splice(idx, 1);
            showToast(`${name} eltávolítva a kedvencekből`);
        }

        saveFavs(favs);
        updateBtn(btn, id);
        updateBadge();

        // Gomb pulse animáció
        btn.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.3)' },
            { transform: 'scale(1)' }
        ], { duration: 320, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    }

    // Kedvencek gombjaira feliratkozás
    $$('.fav-toggle').forEach(btn => {
        on(btn, 'click', handleFavToggle);
        updateBtn(btn, btn.dataset.id);
    });

    // Kedvencek gomb a navban
    const favToggle = $('#favToggle');
    on(favToggle, 'click', () => {
        const favs = loadFavs();
        if (favs.length === 0) {
            showToast('Még nincs kedvenc gép mentve.');
        } else {
            showToast(`${favs.length} kedvenc gép mentve.`, 'success');
        }
    });

    updateBadge();
}

/* ══════════════════════════════════════════
   9. KAPCSOLATI FORM VALIDÁCIÓ
══════════════════════════════════════════ */

function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    /**
     * Egy mező érvényesítése
     * @returns {boolean} - Érvényes-e?
     */
    function validateField(input) {
        const errSpan = input.parentElement.querySelector('.form-error');
        let error = '';

        if (input.required && !input.value.trim()) {
            error = 'Ez a mező kötelező.';
        } else if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
            error = 'Kérem érvényes e-mail címet adjon meg.';
        } else if (input.type === 'checkbox' && input.required && !input.checked) {
            error = 'Az adatkezelési nyilatkozat elfogadása kötelező.';
        }

        if (errSpan) errSpan.textContent = error;
        input.classList.toggle('is-error', !!error);
        return !error;
    }

    /** Összes mező validálása */
    function validateAll() {
        const fields = $$('input[required], textarea[required]', form);
        return fields.map(validateField).every(Boolean);
    }

    // Valós idejű validáció elvesztett fókusznál
    $$('input, textarea, select', form).forEach(input => {
        on(input, 'blur', () => validateField(input));
    });

    on(form, 'submit', e => {
        e.preventDefault();
        if (!validateAll()) return;

        const btn = $('#submitBtn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `
                <svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Küldés...
            `;
        }

        // Szimulált küldés (valós projektben: fetch POST)
        setTimeout(() => {
            showToast('✅ Üzenetét sikeresen fogadtuk! 24 órán belül visszajelzünk.', 'success', 5000);
            form.reset();
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    Üzenet küldése
                `;
            }
        }, 1600);
    });
}

/* ══════════════════════════════════════════
   10. HÍRLEVÉL FORM
══════════════════════════════════════════ */

function initNewsletter() {
    const form   = $('#newsletterForm');
    const input  = $('#newsletterEmail');
    const okMsg  = $('#newsletterOk');
    if (!form) return;

    on(form, 'submit', e => {
        e.preventDefault();
        const email = input?.value.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showToast('Kérem érvényes e-mail címet adjon meg.', 'error');
            return;
        }

        // Szimulált feliratkozás (valós projektben: fetch POST)
        if (okMsg) { okMsg.hidden = false; }
        if (input)  { input.value = ''; }
        showToast('🌱 Sikeresen feliratkoztál a hírlevélre!', 'success');
    });
}

/* ══════════════════════════════════════════
   11. VISSZA A TETEJÉRE GOMB
══════════════════════════════════════════ */

function initScrollTop() {
    const btn = $('#scrollTopBtn');
    if (!btn) return;
    on(btn, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ══════════════════════════════════════════
   12. SMOOTH ANCHOR SCROLL
══════════════════════════════════════════ */

function initSmoothAnchors() {
    const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '80',
        10
    );

    on(document, 'click', e => {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (href === '#') { e.preventDefault(); return; }

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
    });
}

/* ══════════════════════════════════════════
   13. TERMÉKLISTA OLDAL SZŰRŐK (termekek.html)
══════════════════════════════════════════ */

function initProductsPage() {
    const grid = $('#productsGrid');
    if (!grid) return;

    const cards = $$('.product-card', grid);
    if (!cards.length) return;

    // URL paraméter: előválasztott kategória
    const initialKat = new URLSearchParams(window.location.search).get('kat') || '';
    if (initialKat) {
        const cb = $(`[data-filter-cat="${initialKat}"]`);
        if (cb) cb.checked = true;
    }

    // ── Állapot olvasása közvetlenül a DOM-ból ──────────────────
    function getState() {
        const slider = $('#priceRange');
        return {
            cats:    [...$$('[data-filter-cat]:checked')].map(el => el.dataset.filterCat),
            brands:  [...$$('[data-filter-brand]:checked')].map(el => el.dataset.filterBrand),
            price:   slider ? parseInt(slider.value, 10) : Infinity,
            searchQ: ($('#productSearch')?.value || '').trim().toLowerCase(),
            sort:    ($('#sortSelect')?.value || 'default'),
        };
    }

    // ── Fő szűrő + rendező függvény ────────────────────────────
    function applyAll() {
        const s = getState();
        let visible = 0;

        cards.forEach(card => {
            const cat   = card.dataset.cat   || '';
            const brand = card.dataset.brand || '';
            const price = parseInt(card.dataset.price || '0', 10);
            const name  = (card.dataset.name  || '').toLowerCase();

            const catOk    = s.cats.length   === 0 || s.cats.includes(cat);
            const brandOk  = s.brands.length  === 0 || s.brands.includes(brand);
            const priceOk  = price <= s.price;
            const searchOk = !s.searchQ
                || name.includes(s.searchQ)
                || brand.replace(/-/g, ' ').includes(s.searchQ)
                || cat.includes(s.searchQ);

            const show = catOk && brandOk && priceOk && searchOk;
            card.style.display = show ? '' : 'none';
            if (show) visible++;
        });

        const rc = $('#resultsCount');
        const nm = $('#noResultsMsg');
        if (rc) rc.textContent = visible;
        if (nm) nm.hidden = visible > 0;

        if (s.sort !== 'default') {
            const vis = cards.filter(c => c.style.display !== 'none');
            vis.sort((a, b) => {
                if (s.sort === 'name-asc') {
                    return (a.dataset.name || '').localeCompare(b.dataset.name || '', 'hu');
                }
                const pa = parseInt(a.dataset.price || '0', 10);
                const pb = parseInt(b.dataset.price || '0', 10);
                return s.sort === 'price-asc' ? pa - pb : pb - pa;
            });
            vis.forEach(c => grid.appendChild(c));
        }
    }

    // ── Eseménykezelők ──────────────────────────────────────────

    // Checkboxok – event delegation a teljes dokumentumra
    document.addEventListener('change', e => {
        if (e.target.matches('[data-filter-cat], [data-filter-brand]')) applyAll();
    });

    // Ár slider
    const priceRange   = $('#priceRange');
    const priceDisplay = $('#priceDisplay');
    if (priceRange) {
        priceRange.addEventListener('input', () => {
            const val = parseInt(priceRange.value, 10);
            if (priceDisplay) {
                priceDisplay.textContent = `${(val / 1_000_000).toFixed(0)} M Ft`;
            }
            applyAll();
        });
    }

    // Rendezés (oldalsáv)
    const sortSelect = $('#sortSelect');
    if (sortSelect) sortSelect.addEventListener('change', applyAll);

    // Inline kereső
    const inlineSearch = $('#productSearch');
    if (inlineSearch) inlineSearch.addEventListener('input', applyAll);

    // Szűrők törlése
    function resetAll() {
        $$('[data-filter-cat], [data-filter-brand]').forEach(cb => cb.checked = false);
        if (priceRange)   priceRange.value = priceRange.max;
        if (priceDisplay) priceDisplay.textContent = 'Nincs korlát';
        if (sortSelect)   sortSelect.value = 'default';
        const sortTop = $('#sortSelectTop');
        if (sortTop) sortTop.value = 'default';
        applyAll();
    }

    const resetBtn  = $('#resetAllFilters');
    const resetBtn2 = $('#resetAllFilters2');
    if (resetBtn)  resetBtn.addEventListener('click', resetAll);
    if (resetBtn2) resetBtn2.addEventListener('click', resetAll);

    applyAll(); // Betöltéskor
}

/* ══════════════════════════════════════════
   14. CSS SPIN ANIMÁCIÓ (loading)
══════════════════════════════════════════ */

const spinStyle = document.createElement('style');
spinStyle.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin .8s linear infinite; }
`;
document.head.appendChild(spinStyle);

/* ══════════════════════════════════════════
   INICIALIZÁLÁS – DOM betöltés után
══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSearch();
    initHomeFilter();
    initCarousel();
    initScrollReveal();
    initFavorites();
    initContactForm();
    initNewsletter();
    initScrollTop();
    initSmoothAnchors();
    initProductsPage(); // Csak termekek.html-en csinál valamit
});
