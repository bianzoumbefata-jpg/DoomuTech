/* ==========================================================================
   DOOMUTECH — MOTION DESIGN PREMIUM "SOLAR NOIR"
   Basé sur ui-ux-pro-max-skill / data/motion.csv :
   #4-5 Scroll Reveal, #8 Stagger Bento, #9 Split headline, #13-14 Parallax,
   #2-3 Hover tilt & magnétique. Respecte prefers-reduced-motion.
   Dépendances : GSAP 3 + ScrollTrigger (CDN, chargés avant ce fichier).
   ========================================================================== */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- 1. Décor injecté (aurora, carte flottante, marquee, scroll cue) ---------- */
  function injectDecor() {
    const hero = $(".hero-section") || $(".service-page-hero");
    if (hero && !$(".aurora", hero)) {
      const aurora = document.createElement("div");
      aurora.className = "aurora";
      aurora.setAttribute("aria-hidden", "true");
      aurora.innerHTML = "<span></span><span></span><span></span>";
      hero.prepend(aurora);
      if (getComputedStyle(hero).position === "static") hero.style.position = "relative";
    }

    const heroSection = $(".hero-section");
    const visual = $(".hero-section .hero-visual");
    if (visual && !$(".hero-float-card", visual)) {
      const card = document.createElement("div");
      card.className = "hero-float-card";
      card.setAttribute("aria-hidden", "true");
      card.innerHTML = "<small>Ensoleillement Dakar</small><b data-count=\"5.8\" data-decimals=\"1\">5,8</b> <small style=\"display:inline\">kWh/m²/jour</small>";
      visual.appendChild(card);
    }

    if (heroSection && !$(".scroll-cue", heroSection)) {
      const cue = document.createElement("div");
      cue.className = "scroll-cue";
      cue.setAttribute("aria-hidden", "true");
      cue.innerHTML = "<span>DÉFILER</span><i></i>";
      heroSection.appendChild(cue);
    }

    if (heroSection && !$(".lux-marquee")) {
      const words = [
        "Énergie solaire", "Victron Energy", "Climatisation Inverter", "Carrier",
        "Vidéosurveillance 4K", "Hikvision", "Lithium LiFePO4", "Dakar & Régions"
      ];
      const items = words.concat(words).map((w) => `<span>${w}</span>`).join("");
      const marquee = document.createElement("div");
      marquee.className = "lux-marquee";
      marquee.setAttribute("aria-hidden", "true");
      marquee.innerHTML = `<div class="lux-marquee-track">${items}</div>`;
      heroSection.insertAdjacentElement("afterend", marquee);
    }
  }

  /* ---------- 2. Découpage du titre en mots (masques) ---------- */
  function splitWords(el) {
    if (!el || el.dataset.split) return [];
    el.dataset.split = "1";
    const inner = [];
    const wrapText = (text, parent, isEm) => {
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { parent.appendChild(document.createTextNode(" ")); return; }
        const w = document.createElement("span");
        w.className = "word";
        const s = document.createElement("span");
        s.textContent = part;
        if (isEm) s.className = "em-word";
        w.appendChild(s);
        parent.appendChild(w);
        inner.push(s);
      });
    };
    const nodes = Array.from(el.childNodes);
    el.textContent = "";
    nodes.forEach((n) => {
      if (n.nodeType === 3) wrapText(n.textContent.trim() ? n.textContent : " ", el, false);
      else if (n.nodeType === 1) {
        const clone = n.cloneNode(false);
        wrapText(n.textContent, clone, n.tagName === "EM");
        el.appendChild(clone);
      }
    });
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    return inner;
  }

  /* ---------- 3. Préchargeur (1 fois par session) ---------- */
  function runLoader(done) {
    if (reduced || sessionStorage.getItem("dt_loader_seen") || !hasGsap) { done(); return; }
    sessionStorage.setItem("dt_loader_seen", "1");
    const loader = document.createElement("div");
    loader.className = "lux-loader";
    loader.innerHTML = `
      <div class="lux-loader-inner">
        <div class="lux-loader-word"><span>Doomu<em>Tech</em></span></div>
        <div class="lux-loader-bar"><i></i></div>
        <div class="lux-loader-count">000</div>
      </div>`;
    document.body.appendChild(loader);
    const count = $(".lux-loader-count", loader);
    const obj = { v: 0 };
    gsap.timeline({
      onComplete: () => { loader.remove(); }
    })
      .from($(".lux-loader-word span", loader), { yPercent: 110, duration: 0.9, ease: "expo.out" })
      .to($(".lux-loader-bar i", loader), { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, "<0.1")
      .to(obj, { v: 100, duration: 1.1, ease: "power2.inOut", onUpdate: () => { count.textContent = String(Math.round(obj.v)).padStart(3, "0"); } }, "<")
      .to($(".lux-loader-word span", loader), { yPercent: -110, duration: 0.6, ease: "expo.in" }, "+=0.1")
      .add(done, "-=0.1")
      .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut" }, "<");
  }

  /* ---------- 4. Intro du hero ---------- */
  function heroIntro() {
    const title = $(".hero-title") || $(".service-page-hero h1");
    const words = splitWords(title);
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".site-header", { yPercent: -100, opacity: 0, duration: 1 })
      .from(".hero-section .eyebrow-badge, .service-page-hero .section-eyebrow", { opacity: 0, x: -20, duration: 0.8 }, "<0.2")
      .from(words, { yPercent: 115, rotate: 4, duration: 1.2, stagger: 0.045 }, "<0.1")
      .from(".hero-subtitle, .service-page-hero p", { opacity: 0, y: 24, duration: 1 }, "<0.5")
      .from(".hero-cta-group > *", { opacity: 0, y: 24, duration: 0.9, stagger: 0.1 }, "<0.15")
      .from(".hero-metrics .metric-item, .hero-metrics .metric-divider", { opacity: 0, y: 20, duration: 0.8, stagger: 0.07 }, "<0.15")
      .from(".hero-section .hero-image-frame", { clipPath: "inset(100% 0 0 0 round 22px)", duration: 1.6, ease: "expo.inOut" }, 0.3)
      .from(".hero-section .hero-img", { scale: 1.35, duration: 2, ease: "expo.out" }, "<0.3")
      .from(".hero-float-card", { opacity: 0, x: -30, duration: 1 }, "-=1")
      .from(".image-location-badge", { opacity: 0, y: 20, duration: 0.8 }, "<0.2");
  }

  /* ---------- 5. Révélations au scroll ---------- */
  function scrollReveals() {
    // En-têtes de section
    $$(".section-header, .section-header-row > div:first-child, .eng-content-col, .contact-info-col").forEach((h) => {
      const title = $(".section-title", h);
      const words = splitWords(title);
      const tl = gsap.timeline({ scrollTrigger: { trigger: h, start: "top 82%" } });
      tl.from($$(".section-eyebrow", h), { opacity: 0, x: -24, duration: 0.8, ease: "power3.out" })
        .from(words, { yPercent: 115, duration: 1.1, stagger: 0.035, ease: "expo.out" }, "<0.1")
        .from($$(".section-desc, .contact-lead", h), { opacity: 0, y: 20, duration: 0.9, ease: "power2.out" }, "<0.35");
    });

    // Grilles en cascade (Stagger Bento)
    const groups = [
      ".activities-bento-grid", ".portfolio-grid", ".testimonials-grid", ".partners-grid",
      ".eng-feature-list", ".contact-cards", ".install-steps-grid", ".sim-out-kpis",
      ".pipeline-steps-grid", ".portfolio-filters"
    ];
    groups.forEach((sel) => {
      $$(sel).forEach((grid) => {
        const kids = Array.from(grid.children);
        if (!kids.length) return;
        gsap.from(kids, {
          opacity: 0, y: 60, scale: 0.97, duration: 1.1, stagger: 0.12, ease: "expo.out",
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: grid, start: "top 85%" }
        });
      });
    });

    // Blocs isolés
    $$(".quote-form, .simple-sim-inputs, .simple-sim-output, .guarantee-box, .footer .container > *").forEach((el) => {
      gsap.from(el, { opacity: 0, y: 50, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });

    // Images : rideau + parallax
    $$(".eng-image-col .hero-image-frame, .service-page-hero img").forEach((frame) => {
      gsap.from(frame, { clipPath: "inset(0 0 100% 0 round 22px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: frame, start: "top 80%" } });
    });
    $$(".hero-section .hero-img, .eng-image-col .hero-img").forEach((img) => {
      gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, {
        yPercent: 6, scale: 1.12, ease: "none",
        scrollTrigger: { trigger: img.closest(".hero-image-frame") || img, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
    $$(".activity-cover-photo, .project-photo").forEach((img) => {
      gsap.fromTo(img, { yPercent: -5 }, {
        yPercent: 5, ease: "none",
        scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    // Aurora : léger parallax
    gsap.to(".hero-section .aurora", { yPercent: 25, ease: "none", scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true } });

    // Marquee : vitesse liée au scroll
    const track = $(".lux-marquee-track");
    if (track) {
      gsap.to(track, { x: -200, ease: "none", scrollTrigger: { trigger: ".lux-marquee", start: "top bottom", end: "bottom top", scrub: 1 } });
    }
  }

  /* ---------- 6. Compteurs animés ---------- */
  function counters() {
    const els = $$(".metric-value, [data-count]");
    els.forEach((el) => {
      const raw = el.dataset.count || el.textContent;
      const m = raw.match(/(\d+(?:[.,]\d+)?)/);
      if (!m) return;
      const target = parseFloat(m[1].replace(",", "."));
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : (m[1].includes(".") || m[1].includes(",") ? 1 : 0);
      const original = el.textContent;
      const prefix = original.slice(0, original.indexOf(m[1]));
      const suffix = original.slice(original.indexOf(m[1]) + m[1].length);
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 2.2, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: () => {
          el.textContent = prefix + obj.v.toFixed(decimals).replace(".", ",") + suffix;
        },
        onComplete: () => { el.textContent = original; }
      });
    });
  }

  /* ---------- 7. Interactions : curseur, magnétisme, halo, tilt ---------- */
  function interactions() {
    // Halo radial qui suit la souris sur les cartes
    $$(".activity-bento-card, .project-card, .testimonial-card, .partner-card-item, .eng-feature-item").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });

    if (!finePointer) return;

    // Tilt 3D discret sur les cartes services
    $$(".activity-bento-card, .project-card").forEach((card) => {
      const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
      const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
      gsap.set(card, { transformPerspective: 1000 });
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 6); rx(-py * 6);
      });
      card.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });

    // Boutons magnétiques (1-2 focales par écran, cf. motion.csv #3)
    $$(".hero-cta-group .btn, .btn-lg.btn-primary, .header-actions .btn-primary").forEach((btn) => {
      const xTo = gsap.quickTo(btn, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      btn.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });

    // Curseur doré personnalisé
    const ring = document.createElement("div");
    ring.className = "lux-cursor";
    const dot = document.createElement("div");
    dot.className = "lux-cursor-dot";
    document.body.append(ring, dot);
    const rX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3.out" });
    const rY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3.out" });
    const dX = gsap.quickTo(dot, "x", { duration: 0.08 });
    const dY = gsap.quickTo(dot, "y", { duration: 0.08 });
    window.addEventListener("pointermove", (e) => { rX(e.clientX); rY(e.clientY); dX(e.clientX); dY(e.clientY); }, { passive: true });
    document.addEventListener("pointerover", (e) => {
      if (e.target.closest("a, button, .btn, input, select, textarea, label, .activity-bento-card, .project-card")) ring.classList.add("is-hover");
    });
    document.addEventListener("pointerout", (e) => {
      if (e.target.closest("a, button, .btn, input, select, textarea, label, .activity-bento-card, .project-card")) ring.classList.remove("is-hover");
    });
  }

  /* ---------- 8. Header intelligent ---------- */
  function smartHeader() {
    const header = $(".site-header");
    if (!header) return;
    let last = window.scrollY;
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 40);
      const menuOpen = $(".top-nav-pill-bar.open");
      header.classList.toggle("is-hidden", y > last && y > 400 && !menuOpen);
      last = y;
    }, { passive: true });
  }

  /* ---------- Démarrage ---------- */
  function init() {
    injectDecor();
    smartHeader();
    if (!hasGsap || reduced) {
      document.documentElement.classList.remove("motion-ready");
      return;
    }
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add("motion-ready");
    // Masque immédiatement le hero pour éviter un flash avant l'intro
    gsap.set(".hero-section .hero-content, .hero-section .hero-visual", { autoAlpha: 0 });
    runLoader(() => {
      gsap.set(".hero-section .hero-content, .hero-section .hero-visual", { autoAlpha: 1 });
      heroIntro();
    });
    scrollReveals();
    counters();
    interactions();
    window.addEventListener("load", () => window.ScrollTrigger && ScrollTrigger.refresh());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
