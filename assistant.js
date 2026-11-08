/* ==========================================================================
   DoomuTech — Widget de l'assistant IA (côté navigateur)
   Parle uniquement à /api/chat : aucune clé API ici.
   Tout le texte est inséré avec textContent (pas de HTML injecté).
   ========================================================================== */
(function () {
  "use strict";

  const WHATSAPP = "https://wa.me/221777019259?text=Bonjour%20DoomuTech%2C%20j%27ai%20une%20question.";
  const SUGGESTIONS = [
    "Combien coûte une installation solaire ?",
    "Quelle clim choisir pour mon bureau ?",
    "Comment obtenir un devis gratuit ?",
  ];
  const WELCOME = "Bonjour ! Je suis l'assistant DoomuTech. Posez-moi vos questions sur le solaire, la climatisation ou la vidéosurveillance.";

  const history = [];
  let busy = false;

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function build() {
    const root = el("div", "dt-assistant");

    const fab = el("button", "dt-assistant-fab");
    fab.type = "button";
    fab.setAttribute("aria-label", "Ouvrir l'assistant DoomuTech");
    fab.setAttribute("aria-expanded", "false");
    fab.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l.9-4.4A8 8 0 1 1 21 12z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg>';

    const panel = el("section", "dt-assistant-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Assistant DoomuTech");
    panel.hidden = true;

    const head = el("header", "dt-assistant-head");
    const titles = el("div");
    titles.append(el("strong", "", "Assistant DoomuTech"), el("span", "", "Réponses instantanées"));
    const close = el("button", "dt-assistant-close");
    close.type = "button";
    close.setAttribute("aria-label", "Fermer l'assistant");
    close.textContent = "×";
    head.append(titles, close);

    const log = el("div", "dt-assistant-log");
    log.setAttribute("aria-live", "polite");

    const chips = el("div", "dt-assistant-chips");
    SUGGESTIONS.forEach((s) => {
      const b = el("button", "dt-assistant-chip", s);
      b.type = "button";
      b.addEventListener("click", () => ask(s));
      chips.append(b);
    });

    const form = el("form", "dt-assistant-form");
    const input = el("input");
    input.type = "text";
    input.maxLength = 500;
    input.placeholder = "Votre question…";
    input.setAttribute("aria-label", "Votre question");
    input.autocomplete = "off";
    const send = el("button", "dt-assistant-send");
    send.type = "submit";
    send.setAttribute("aria-label", "Envoyer");
    send.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    form.append(input, send);

    panel.append(head, log, chips, form);
    root.append(fab, panel);
    document.body.append(root);

    function addMsg(role, text, withWhatsApp) {
      const m = el("div", "dt-msg dt-msg-" + role, text);
      if (withWhatsApp) {
        const a = el("a", "dt-msg-link", "Écrire sur WhatsApp →");
        a.href = WHATSAPP;
        a.target = "_blank";
        a.rel = "noopener";
        m.append(a);
      }
      log.append(m);
      log.scrollTop = log.scrollHeight;
      return m;
    }

    function setOpen(open) {
      panel.hidden = !open;
      root.classList.toggle("is-open", open);
      fab.setAttribute("aria-expanded", String(open));
      if (open) {
        if (!log.children.length) addMsg("bot", WELCOME);
        setTimeout(() => input.focus(), 50);
      } else fab.focus();
    }

    async function ask(text) {
      text = (text || "").trim();
      if (!text || busy) return;
      busy = true;
      chips.hidden = true;
      input.value = "";
      send.disabled = true;
      addMsg("user", text);
      history.push({ role: "user", content: text });
      const typing = addMsg("bot", "…");
      typing.classList.add("is-typing");
      try {
        const r = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history.slice(-10) }),
        });
        const data = await r.json().catch(() => ({}));
        typing.remove();
        if (r.ok && data.reply) {
          history.push({ role: "assistant", content: data.reply });
          addMsg("bot", data.reply);
        } else {
          history.pop();
          addMsg("bot", r.status === 429
            ? "Vous écrivez très vite ! Patientez un instant puis réessayez."
            : "Je ne peux pas répondre pour le moment. Notre équipe vous répond directement sur WhatsApp.", r.status !== 429);
        }
      } catch (_) {
        typing.remove();
        history.pop();
        addMsg("bot", "Connexion impossible pour le moment. Notre équipe vous répond directement sur WhatsApp.", true);
      } finally {
        busy = false;
        send.disabled = false;
        input.focus();
      }
    }

    fab.addEventListener("click", () => setOpen(panel.hidden));
    close.addEventListener("click", () => setOpen(false));
    form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) setOpen(false); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
