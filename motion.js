/* ==========================================================================
   DOOMUTECH — ANIMATIONS LÉGÈRES (sans dépendance externe)
   - Intro du hero : 100 % CSS (premium.css), rien ne bloque l'affichage
   - Révélations au défilement via IntersectionObserver (+ cascade)
   - Compteurs animés, parallaxe douce, header intelligent
   - Animations du filtre réalisations et du simulateur
   Respecte prefers-reduced-motion : tout reste visible et statique.
   ========================================================================== */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- 1. Header : fond au scroll, se cache en descendant ---------- */
  function smartHeader() {
    const header = $(".site-header");
    if (!header) return;
    let last = window.scrollY;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        header.classList.toggle("is-scrolled", y > 40);
        const menuOpen = $(".top-nav-pill-bar.open");
        header.classList.toggle("is-hidden", y > last && y > 500 && !menuOpen);
        last = y;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- 2. Marquage des éléments à révéler ---------- */
  function tag(el, type, index) {
    if (!el || el.dataset.reveal !== undefined) return;
    // Un élément déjà visible au chargement n'est pas masqué (évite un clignotement)
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.9 && r.bottom > 0) { el.classList.add("is-in"); return; }
    el.dataset.reveal = type || "";
    if (index) el.style.setProperty("--i", index);
  }

  function markReveals() {
    // En-têtes de section
    $$(".section-header, .section-header-row > div:first-child, .eng-content-col, .contact-info-col").forEach((h) => {
      tag($(".section-eyebrow", h), "left");
      tag($(".section-title", h), "title");
      $$(".section-desc, .contact-lead", h).forEach((d) => tag(d, "", 2));
    });

    // Grilles : cascade des enfants
    [
      ".activities-bento-grid", ".portfolio-grid", ".testimonials-grid",
      ".eng-feature-list", ".contact-cards", ".install-steps-grid",
      ".portfolio-filters", ".brands-list", ".sim-appliance-grid"
    ].forEach((sel) => {
      $$(sel).forEach((grid) => {
        Array.from(grid.children).forEach((kid, i) => tag(kid, sel === ".brands-list" ? "zoom" : "", Math.min(i, 5)));
      });
    });

    // Blocs isolés
    tag($(".brands-strip .section-eyebrow"), "left");
    $$(".simple-sim-inputs").forEach((el) => tag(el, "left"));
    $$(".simple-sim-output").forEach((el) => tag(el, "right", 1));
    $$(".quote-form").forEach((el) => tag(el, "right"));
    $$(".footnote, .footer .container > *").forEach((el) => tag(el));

    // Grandes photos : effet rideau
    $$(".eng-image-col .hero-image-frame").forEach((el) => tag(el, "image"));
  }

  function observeReveals() {
    const items = $$("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    // Les éléments masqués par clip-path (titres, photos) sont « invisibles » pour
    // l'IntersectionObserver : on observe alors leur parent.
    const targets = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        (targets.get(e.target) || []).forEach((el) => el.classList.add("is-in"));
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    items.forEach((el) => {
      const clipped = el.dataset.reveal === "title" || el.dataset.reveal === "image";
      const watch = clipped ? el.parentElement : el;
      if (!targets.has(watch)) targets.set(watch, []);
      targets.get(watch).push(el);
      io.observe(watch);
    });
  }

  /* ---------- 3. Compteurs (data-count / data-prefix / data-suffix) ---------- */
  function counters() {
    const els = $$("[data-count]");
    if (!els.length) return;
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const pre = el.dataset.prefix || "";
      const suf = el.dataset.suffix || "";
      const final = el.textContent;
      const t0 = performance.now();
      const dur = 1600;
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + Math.round(target * eased) + suf;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = final;
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        // Laisse l'intro du hero se jouer avant de compter
        setTimeout(() => run(e.target), e.target.closest(".hero-section") ? 650 : 0);
        io.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- 4. Parallaxe douce des grandes photos (desktop uniquement) ---------- */
  function parallax() {
    if (!window.matchMedia("(min-width: 1025px)").matches) return;
    const imgs = $$(".eng-image-col .hero-img");
    if (!imgs.length) return;
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      imgs.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const progress = (r.top + r.height / 2 - vh / 2) / vh; // -1 → 1
        img.style.translate = `0 ${(progress * -30).toFixed(1)}px`;
      });
      ticking = false;
    };
    imgs.forEach((img) => { img.style.scale = "1.08"; });
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- 5. Halo qui suit le pointeur sur les cartes ---------- */
  function cardGlow() {
    if (!window.matchMedia("(hover: hover)").matches) return;
    $$(".activity-bento-card, .project-card, .testimonial-card, .eng-feature-item").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- 6. Filtre des réalisations : réapparition animée ---------- */
  function filterAnimation() {
    const filters = $("#portfolioFilters");
    if (!filters) return;
    filters.addEventListener("click", (e) => {
      if (!e.target.closest(".filter-btn")) return;
      // app.js a déjà changé l'affichage ; on rejoue l'entrée des cartes visibles
      requestAnimationFrame(() => {
        $$("#portfolioGrid .project-card").forEach((card, i) => {
          card.classList.remove("is-filtered-in");
          if (card.style.display === "none") return;
          card.classList.add("is-in");
          void card.offsetWidth;
          card.style.animationDelay = `${i * 70}ms`;
          card.classList.add("is-filtered-in");
        });
      });
    });
  }

  /* ---------- 7. Simulateur : les résultats « pulsent » quand ils changent ---------- */
  function simulatorBump() {
    const targets = $$(".sim-out-box strong, #simResultTitle");
    if (!targets.length || !("MutationObserver" in window)) return;
    targets.forEach((el) => {
      let prev = el.textContent;
      new MutationObserver(() => {
        if (el.textContent === prev) return;
        prev = el.textContent;
        el.classList.remove("bump");
        void el.offsetWidth;
        el.classList.add("bump");
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  /* ---------- Démarrage ---------- */
  function init() {
    smartHeader();
    if (reduced) return;
    markReveals();
    observeReveals();
    counters();
    parallax();
    cardGlow();
    filterAnimation();
    simulatorBump();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
