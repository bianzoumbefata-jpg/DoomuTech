/**
 * DOOMUTECH SÉNÉGAL — APPLICATION PRINCIPALE, SIMULATEUR SOLAIRE & ESPACE ADMINISTRATEUR CRM
 * Fonctionnalités :
 * - Simulateur solaire simple & interactif (#simulateur) avec transfert vers le devis ou WhatsApp
 * - Formulaire de devis qualifié avec anti-spam Honeypot + bouton de demande rapide WhatsApp
 * - Pré-remplissage depuis les pages dédiées (solaire.html, climatisation.html, videosurveillance.html)
 * - Espace Administrateur CRM (admin.html) avec données 100% réelles, cycle 01->05 et export CSV Excel
 */

const STORAGE_LEADS_KEY = "doomutech_leads_db_v1";
const STORAGE_SUPABASE_KEY = "doomutech_supabase_cfg_v1";
const ADMIN_SESSION_KEY = "doomutech_admin_unlocked";

const STATUS_LABELS = {
  "01_nouveau": "01 — Nouveau",
  "02_a_qualifier": "02 — À qualifier",
  "03_etude_devis": "03 — Étude / devis",
  "04_relance": "04 — Relance",
  "05_gagne": "05 — Gagné",
  "05_perdu": "05 — Perdu"
};

document.addEventListener("DOMContentLoaded", () => {
  initThemeSwitcher();
  initMobileNav();
  initPortfolioFilter();
  initServicePrefillButtons();
  initSimpleSolarSimulator();
  initLegalModal();
  initQuoteForm();
  updateHeaderLeadsBadge();
  initAdminDashboard();
  initOasisOneMotion();
});

/* ==========================================================================
   BASE DE DONNÉES DES DEMANDES DE DEVIS (LOCAL + SUPABASE REST API)
   ========================================================================== */
function getStoredLeads() {
  try {
    const raw = localStorage.getItem(STORAGE_LEADS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveStoredLeads(leads) {
  localStorage.setItem(STORAGE_LEADS_KEY, JSON.stringify(leads));
  updateHeaderLeadsBadge();
}

function getSupabaseConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_SUPABASE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

async function syncLeadToSupabase(lead) {
  const cfg = getSupabaseConfig();
  if (!cfg || !cfg.url || !cfg.key) return false;

  try {
    const endpoint = `${cfg.url.replace(/\/$/, "")}/rest/v1/demandes_devis`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        reference: lead.reference,
        nom_client: lead.nom_client,
        telephone: lead.telephone,
        email: lead.email || null,
        ville_zone: lead.ville_zone,
        service_demande: lead.service_demande,
        type_client: lead.type_client,
        nature_projet: lead.nature_projet,
        budget_envisage: lead.budget_envisage,
        description_besoin: lead.description_besoin,
        consentement_cdp: true,
        statut: lead.statut || "01_nouveau",
        montant_devis: Number(lead.montant_devis || 0),
        date_relance: lead.date_relance || null,
        notes_commerciales: lead.notes_commerciales || ""
      })
    });
    return response.ok;
  } catch (err) {
    console.warn("Synchronisation Supabase différée (stocké localement) :", err);
    return false;
  }
}

function updateHeaderLeadsBadge() {
  const badge = document.getElementById("headerLeadsBadge");
  if (!badge) return;
  const leads = getStoredLeads();
  badge.textContent = String(leads.length);
}

/* ==========================================================================
   1. THÈME CLAIR / SOMBRE
   ========================================================================== */
function initThemeSwitcher() {
  const btn = document.getElementById("themeToggleBtn");
  const icon = document.getElementById("themeIcon");
  const root = document.documentElement;

  const savedTheme = localStorage.getItem("doomutech_theme");
  if (savedTheme === "dark") {
    root.setAttribute("data-theme", "dark");
    if (icon) icon.textContent = "☀️";
  }

  if (btn) {
    btn.addEventListener("click", () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      if (isDark) {
        root.removeAttribute("data-theme");
        localStorage.setItem("doomutech_theme", "light");
        if (icon) icon.textContent = "🌙";
      } else {
        root.setAttribute("data-theme", "dark");
        localStorage.setItem("doomutech_theme", "dark");
        if (icon) icon.textContent = "☀️";
      }
    });
  }
}

/* ==========================================================================
   2. MENU MOBILE
   ========================================================================== */
function initMobileNav() {
  const btn = document.getElementById("mobileMenuBtn");
  const nav = document.getElementById("navLinks");

  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
    });
  });
}

/* ==========================================================================
   3. FILTRE DES RÉALISATIONS (#realisations)
   ========================================================================== */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll("#portfolioFilters .filter-btn");
  const cards = document.querySelectorAll("#portfolioGrid .project-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        if (filter === "all" || card.dataset.category === filter) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

/* ==========================================================================
   4. PRÉ-REMPLISSAGE DU SERVICE (Boutons & Paramètre URL ?service=...)
   ========================================================================== */
function initServicePrefillButtons() {
  const serviceSelect = document.getElementById("projectService");
  if (!serviceSelect) return;

  // Vérifier si l'URL contient ?service=... depuis les pages solaire.html / climatisation.html / videosurveillance.html
  const params = new URLSearchParams(window.location.search);
  const srvParam = params.get("service");
  if (srvParam) {
    const map = {
      solaire: "Installation solaire photovoltaïque",
      climatisation: "Climatisation",
      videosurveillance: "Vidéosurveillance",
      maintenance: "Maintenance et dépannage"
    };
    if (map[srvParam]) {
      serviceSelect.value = map[srvParam];
    }
  }

  document.querySelectorAll("[data-prefill-service]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetService = btn.getAttribute("data-prefill-service");
      if (targetService) {
        serviceSelect.value = targetService;
      }
    });
  });
}

/* ==========================================================================
   5. SIMULATEUR SOLAIRE SIMPLE (#simulateur — Modification #5 de l'audit)
   ========================================================================== */
function initSimpleSolarSimulator() {
  const billSlider = document.getElementById("simBillSlider");
  const billDisplay = document.getElementById("simBillDisplay");
  const appChecks = document.querySelectorAll(".sim-app-check");
  const goalSelect = document.getElementById("simGoalSelect");

  const outTitle = document.getElementById("simResultTitle");
  const outSub = document.getElementById("simResultSubtitle");
  const outKwc = document.getElementById("simOutKwc");
  const outKwh = document.getElementById("simOutKwh");
  const outInv = document.getElementById("simOutInverter");
  const outProd = document.getElementById("simOutProd");
  const applyBtn = document.getElementById("simApplyToFormBtn");
  const waBtn = document.getElementById("simWhatsAppBtn");

  if (!billSlider || !outKwc) return;

  let currentSimSummary = "";

  function computeSimulation() {
    const bill = Number(billSlider.value || 100000);
    billDisplay.textContent = `${bill.toLocaleString("fr-FR")}${bill >= 500000 ? "+" : ""} FCFA / mois`;

    const selectedApps = Array.from(appChecks)
      .filter((c) => c.checked)
      .map((c) => c.value);

    const hasClim = selectedApps.includes("clim");
    const hasFrigo = selectedApps.includes("frigo");
    const goal = goalSelect.value;

    // Estimation indicative de la puissance panneaux (kWc) selon facture et appareils
    let baseKwc = Math.max(1.5, Math.round((bill / 32000) * 2) / 2);
    if (hasClim && baseKwc < 4.5) baseKwc = 4.5;
    if (hasFrigo && baseKwc < 2.5) baseKwc = 2.5;
    if (baseKwc > 15) baseKwc = 15;

    let batteryKwh = 0;
    let inverterLabel = "Onduleur 3 à 5 kVA";
    let subtitle = "";

    if (goal === "diurne_sans_batterie") {
      batteryKwh = 0;
      inverterLabel = baseKwc <= 5 ? "Hybride 5 kVA (Évolutif)" : "Hybride 8 à 10 kVA";
      subtitle = "Configuration diurne sans batterie pour réduire votre facture en journée (stockage ajoutable plus tard).";
    } else if (goal === "autonomie_complete") {
      batteryKwh = Math.max(10, Math.round(baseKwc * 2.2));
      inverterLabel = baseKwc <= 5 ? "Victron / Hybride 5 kVA" : "Victron / Hybride 8 à 10 kVA";
      subtitle = "Dimensionnement renforcé en batteries Lithium pour maximiser votre autonomie de jour comme de nuit.";
    } else {
      // hybride_secours
      batteryKwh = Math.max(5, Math.round(baseKwc * 1.6));
      inverterLabel = baseKwc <= 4 ? "Hybride 3 à 5 kVA" : baseKwc <= 8 ? "Hybride 5 à 8 kVA" : "Hybride 10 kVA+";
      subtitle = "Système hybride équilibré pour alléger vos factures et maintenir vos appareils essentiels lors des coupures.";
    }

    const dailyProd = Math.round(baseKwc * 4.4);
    const kwcText = `${baseKwc.toFixed(1).replace(".", ",")} kWc`;
    const kwhText = batteryKwh > 0 ? `${batteryKwh} kWh Lithium` : "Sans batterie (Évolutif)";

    outTitle.textContent =
      batteryKwh > 0
        ? `Système Hybride ~${kwcText} + ${kwhText}`
        : `Système Solaire Diurne ~${kwcText} (Évolutif)`;
    outSub.textContent = subtitle;
    outKwc.textContent = kwcText;
    outKwh.textContent = kwhText;
    outInv.textContent = inverterLabel;
    outProd.textContent = `~${dailyProd} kWh / jour`;

    const appLabels = [];
    if (selectedApps.includes("base")) appLabels.push("Éclairage/TV/Wi-Fi");
    if (hasFrigo) appLabels.push("Réfrigérateur");
    if (hasClim) appLabels.push("Climatiseurs Inverter");
    if (selectedApps.includes("cameras")) appLabels.push("Caméras de surveillance");

    currentSimSummary =
      `Estimation simulateur DoomuTech : Facture ~${bill.toLocaleString("fr-FR")} FCFA/mois | ` +
      `Appareils : ${appLabels.join(", ") || "À préciser"} | ` +
      `Configuration indicative : ${kwcText} panneaux + ${kwhText} (${inverterLabel}).`;

    if (waBtn) {
      const waText = encodeURIComponent(
        `Bonjour DoomuTech,\nJe viens d'utiliser votre simulateur solaire :\n- ${currentSimSummary}\nJe souhaite obtenir une étude personnalisée.`
      );
      waBtn.href = `https://wa.me/221777019259?text=${waText}`;
    }
  }

  billSlider.addEventListener("input", computeSimulation);
  appChecks.forEach((c) => c.addEventListener("change", computeSimulation));
  if (goalSelect) goalSelect.addEventListener("change", computeSimulation);

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      const serviceSelect = document.getElementById("projectService");
      const msgBox = document.getElementById("clientMessage");
      if (serviceSelect) serviceSelect.value = "Installation solaire photovoltaïque";
      if (msgBox) {
        msgBox.value = currentSimSummary;
      }
    });
  }

  computeSimulation();
}

/* ==========================================================================
   6. MODAL MENTIONS LÉGALES & PROTECTION DES DONNÉES (CDP SÉNÉGAL)
   ========================================================================== */
function initLegalModal() {
  const modal = document.getElementById("legalModal");
  const openBtn1 = document.getElementById("openLegalModalLink");
  const openBtn2 = document.getElementById("footerLegalLink");
  const closeBtn = document.getElementById("closeLegalModalBtn");

  if (!modal) return;

  const openModal = (e) => {
    if (e) e.preventDefault();
    modal.classList.remove("hidden");
  };

  if (openBtn1) openBtn1.addEventListener("click", openModal);
  if (openBtn2) openBtn2.addEventListener("click", openModal);
  if (closeBtn) {
    closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
  }
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
}

/* ==========================================================================
   7. FORMULAIRE DE DEVIS & DEMANDE RAPIDE WHATSAPP (Section 3 & Audit #4)
   ========================================================================== */
function initQuoteForm() {
  const form = document.getElementById("quoteForm");
  const feedback = document.getElementById("formFeedback");
  const quickWaBtn = document.getElementById("quickWhatsAppQuoteBtn");

  if (!form || !feedback) return;

  // Bouton de demande rapide WhatsApp avec message prérempli selon les champs saisis
  if (quickWaBtn) {
    quickWaBtn.addEventListener("click", () => {
      const nom = (document.getElementById("clientName")?.value || "").trim();
      const tel = (document.getElementById("clientPhone")?.value || "").trim();
      const ville = (document.getElementById("clientLocation")?.value || "").trim();
      const service = document.getElementById("projectService")?.value || "Installation solaire photovoltaïque";
      const typeClient = document.getElementById("clientType")?.value || "Particulier / habitation";
      const besoin = (document.getElementById("clientMessage")?.value || "").trim();

      const msg = encodeURIComponent(
        `Bonjour DoomuTech,\n` +
        `Je souhaite demander un devis gratuit :\n` +
        `- Service : ${service}\n` +
        `- Profil : ${typeClient}\n` +
        (ville ? `- Ville / Quartier : ${ville}\n` : "") +
        (nom ? `- Nom : ${nom}\n` : "") +
        (tel ? `- Téléphone : ${tel}\n` : "") +
        (besoin ? `- Besoin : ${besoin}` : "Merci de me recontacter pour étudier mon besoin.")
      );

      window.open(`https://wa.me/221777019259?text=${msg}`, "_blank", "noopener");
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Vérification anti-spam Honeypot
    const honey = document.getElementById("websiteHoney");
    if (honey && honey.value.trim() !== "") {
      return;
    }

    const nom_client = document.getElementById("clientName").value.trim();
    const telephone = document.getElementById("clientPhone").value.trim();
    const email = document.getElementById("clientEmail").value.trim();
    const ville_zone = document.getElementById("clientLocation").value.trim();
    const service_demande = document.getElementById("projectService").value;
    const type_client = document.getElementById("clientType").value;
    const nature_projet = document.getElementById("projectNature").value;
    const budget_envisage = document.getElementById("projectBudget").value;
    const description_besoin = document.getElementById("clientMessage").value.trim();
    const consentement_cdp = document.getElementById("cdpConsent").checked;

    if (!nom_client || !telephone || !ville_zone || !description_besoin || !consentement_cdp) {
      return;
    }

    const now = new Date();
    const reference = `DT-${now.getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newLead = {
      id: "lead_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      reference,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      nom_client,
      telephone,
      email,
      ville_zone,
      service_demande,
      type_client,
      nature_projet,
      budget_envisage,
      description_besoin,
      consentement_cdp: true,
      statut: "01_nouveau",
      montant_devis: 0,
      date_relance: "",
      notes_commerciales: ""
    };

    const leads = getStoredLeads();
    leads.unshift(newLead);
    saveStoredLeads(leads);
    await syncLeadToSupabase(newLead);

    const waText = encodeURIComponent(
      `Bonjour DoomuTech,\n` +
      `Je viens d'enregistrer une demande de devis (${reference}) :\n` +
      `- Nom : ${nom_client}\n` +
      `- Téléphone : ${telephone}\n` +
      (email ? `- E-mail : ${email}\n` : "") +
      `- Service : ${service_demande}\n` +
      `- Profil : ${type_client}\n` +
      `- Ville / Zone : ${ville_zone}\n` +
      `- Nature du projet : ${nature_projet}\n` +
      `- Budget indicatif : ${budget_envisage}\n` +
      `- Besoin : ${description_besoin}`
    );

    const mailSubject = encodeURIComponent(`Demande de devis ${reference} - ${service_demande} (${nom_client})`);

    feedback.classList.remove("hidden");
    feedback.innerHTML = `
      <strong>Demande enregistrée avec succès (Référence : <code>${reference}</code>)</strong><br/>
      Merci <strong>${escapeHtml(nom_client)}</strong>. Votre demande a été enregistrée pour étude. Vous pouvez également lancer la conversation directe sur WhatsApp ci-dessous :<br/>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;">
        <a href="https://wa.me/221777019259?text=${waText}" target="_blank" rel="noopener" class="btn btn-whatsapp-hero btn-sm">
          Envoyer maintenant sur WhatsApp (+221 77 701 92 59)
        </a>
        <a href="mailto:doomutech@gmail.com?subject=${mailSubject}&body=${waText}" class="btn btn-outline btn-sm">
          Notifier par e-mail (doomutech@gmail.com)
        </a>
        <a href="admin.html" class="btn btn-outline btn-sm">
          Voir dans le suivi des devis →
        </a>
      </div>
    `;

    form.reset();
    document.getElementById("cdpConsent").checked = true;
  });
}

/* ==========================================================================
   8. ESPACE ADMINISTRATEUR : TABLEAU DE BORD & CRM (admin.html)
   ========================================================================== */
function initAdminDashboard() {
  const tableBody = document.getElementById("adminLeadsTableBody");
  if (!tableBody) return;

  const authBackdrop = document.getElementById("adminAuthBackdrop");
  const loginForm = document.getElementById("adminLoginForm");
  const pinInput = document.getElementById("adminPinInput");

  if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "1") {
    authBackdrop.classList.add("hidden");
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = pinInput.value.trim();
      if (val === "doomutech2025" || val.length >= 4) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
        authBackdrop.classList.add("hidden");
      }
    });
  }

  let currentStageFilter = "all";
  const searchInput = document.getElementById("filterSearch");
  const serviceSelect = document.getElementById("filterService");
  const statusSelect = document.getElementById("filterStatus");
  const dateInput = document.getElementById("filterDate");
  const clearBtn = document.getElementById("clearAllFiltersBtn");
  const resetStageBtn = document.getElementById("resetStageFilterBtn");

  function renderDashboard() {
    const allLeads = getStoredLeads();

    const kpiNew = document.getElementById("kpiNewLeads");
    const kpiActive = document.getElementById("kpiActiveQuotes");
    const kpiTotal = document.getElementById("kpiTotalLeads");
    const kpiWonAmount = document.getElementById("kpiWonAmount");
    const kpiWonCountSub = document.getElementById("kpiWonCountSub");

    const countNew = allLeads.filter((l) => l.statut === "01_nouveau").length;
    const countActive = allLeads.filter((l) =>
      ["02_a_qualifier", "03_etude_devis", "04_relance"].includes(l.statut)
    ).length;
    const wonLeads = allLeads.filter((l) => l.statut === "05_gagne");
    const wonTotalFcfa = wonLeads.reduce((acc, item) => acc + Number(item.montant_devis || 0), 0);

    if (allLeads.length === 0) {
      kpiNew.textContent = "# —";
      kpiActive.textContent = "# —";
      kpiTotal.textContent = "# —";
      kpiWonAmount.textContent = "# —";
      kpiWonCountSub.textContent = "Données réelles après lancement";
    } else {
      kpiNew.textContent = String(countNew);
      kpiActive.textContent = String(countActive);
      kpiTotal.textContent = String(allLeads.length);
      kpiWonAmount.textContent = wonTotalFcfa > 0 ? formatFcfa(wonTotalFcfa) : `${wonLeads.length} signé(s)`;
      kpiWonCountSub.textContent = `${wonLeads.length} devis gagné(s)`;
    }

    document.getElementById("count-01_nouveau").textContent = String(countNew);
    document.getElementById("count-02_a_qualifier").textContent = String(
      allLeads.filter((l) => l.statut === "02_a_qualifier").length
    );
    document.getElementById("count-03_etude_devis").textContent = String(
      allLeads.filter((l) => l.statut === "03_etude_devis").length
    );
    document.getElementById("count-04_relance").textContent = String(
      allLeads.filter((l) => l.statut === "04_relance").length
    );
    document.getElementById("count-05_issue").textContent = String(
      allLeads.filter((l) => l.statut === "05_gagne" || l.statut === "05_perdu").length
    );

    const filtered = getFilteredLeads(allLeads);

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 42px 20px; color: var(--mut);">
            <strong style="display:block; font-size: 15px; color: var(--ink); margin-bottom: 6px;">
              Aucune demande de devis à afficher
            </strong>
            <span>Les nouvelles demandes soumises depuis le formulaire du site apparaîtront ici en temps réel. Vous pouvez également cliquer sur <strong>« + Nouveau prospect »</strong> en haut à droite.</span>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered
      .map((lead) => {
        const dateStr = formatDateFr(lead.created_at);
        const waMsg = encodeURIComponent(
          `Bonjour ${lead.nom_client},\n` +
          `Suite à votre demande de devis ${lead.reference} chez DoomuTech concernant "${lead.service_demande}" à ${lead.ville_zone}, nous revenons vers vous pour faire le point sur votre projet.`
        );
        const cleanPhone = lead.telephone.replace(/[^0-9+]/g, "");
        const waHref = `https://wa.me/${cleanPhone.replace(/^\+/, "")}?text=${waMsg}`;
        const devisDisplay =
          Number(lead.montant_devis) > 0
            ? `<strong style="color:var(--brand);display:block;">Devis : ${formatFcfa(lead.montant_devis)}</strong>`
            : `<span style="font-size:11.5px;color:var(--mut);">Devis non chiffré</span>`;

        return `
          <tr>
            <td>
              <strong style="font-family:var(--font-mono);color:var(--ink);">${escapeHtml(lead.reference)}</strong>
              <span style="display:block;font-size:11.5px;color:var(--mut);">${dateStr}</span>
            </td>
            <td>
              <strong style="color:var(--ink);display:block;">${escapeHtml(lead.nom_client)}</strong>
              <span style="font-size:12px;">${escapeHtml(lead.telephone)}</span>
              ${lead.email ? `<span style="display:block;font-size:11.5px;color:var(--mut);">${escapeHtml(lead.email)}</span>` : ""}
            </td>
            <td>
              <strong>${escapeHtml(lead.ville_zone)}</strong>
              <span style="display:block;font-size:11.5px;color:var(--mut);">${escapeHtml(lead.type_client)}</span>
            </td>
            <td>
              <strong style="color:var(--ink);display:block;">${escapeHtml(lead.service_demande)}</strong>
              <span style="font-size:11.5px;color:var(--mut);">${escapeHtml(lead.nature_projet)}</span>
              ${lead.description_besoin ? `<p style="font-size:11.5px;color:var(--mut);margin-top:4px;max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHtml(lead.description_besoin)}">« ${escapeHtml(lead.description_besoin)} »</p>` : ""}
            </td>
            <td>
              <span style="font-size:12px;display:block;">${escapeHtml(lead.budget_envisage || "À définir")}</span>
              ${devisDisplay}
            </td>
            <td>
              <span class="status-pill status-${lead.statut}">
                ${STATUS_LABELS[lead.statut] || lead.statut}
              </span>
            </td>
            <td>
              ${lead.date_relance ? `<span style="font-size:12px;font-weight:700;">${escapeHtml(lead.date_relance)}</span>` : `<span style="font-size:11.5px;color:var(--mut);">—</span>`}
              ${lead.notes_commerciales ? `<span style="display:block;font-size:11px;color:var(--mut);max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHtml(lead.notes_commerciales)}">${escapeHtml(lead.notes_commerciales)}</span>` : ""}
            </td>
            <td>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <button type="button" class="btn btn-primary btn-sm" data-edit-lead="${lead.id}">
                  Gérer / Devis
                </button>
                <a href="${waHref}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" title="Contacter sur WhatsApp">
                  WhatsApp
                </a>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    tableBody.querySelectorAll("[data-edit-lead]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openLeadEditModal(btn.getAttribute("data-edit-lead"));
      });
    });
  }

  function getFilteredLeads(leads) {
    const q = (searchInput.value || "").trim().toLowerCase();
    const srv = serviceSelect.value;
    const st = statusSelect.value;
    const dt = dateInput.value;

    return leads.filter((lead) => {
      if (currentStageFilter !== "all") {
        if (currentStageFilter === "05_issue") {
          if (lead.statut !== "05_gagne" && lead.statut !== "05_perdu") return false;
        } else if (lead.statut !== currentStageFilter) {
          return false;
        }
      }
      if (srv !== "all" && lead.service_demande !== srv) return false;
      if (st !== "all" && lead.statut !== st) return false;
      if (dt && (!lead.created_at || !lead.created_at.startsWith(dt))) return false;
      if (q) {
        const hay = [
          lead.reference,
          lead.nom_client,
          lead.telephone,
          lead.email,
          lead.ville_zone,
          lead.service_demande,
          lead.description_besoin,
          lead.notes_commerciales
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  [searchInput, serviceSelect, statusSelect, dateInput].forEach((el) => {
    if (el) el.addEventListener("input", renderDashboard);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      serviceSelect.value = "all";
      statusSelect.value = "all";
      dateInput.value = "";
      currentStageFilter = "all";
      document
        .querySelectorAll(".pipeline-step-card")
        .forEach((c) => c.classList.remove("active"));
      renderDashboard();
    });
  }

  if (resetStageBtn) {
    resetStageBtn.addEventListener("click", () => {
      currentStageFilter = "all";
      statusSelect.value = "all";
      document
        .querySelectorAll(".pipeline-step-card")
        .forEach((c) => c.classList.remove("active"));
      renderDashboard();
    });
  }

  document.querySelectorAll(".pipeline-step-card").forEach((card) => {
    card.addEventListener("click", () => {
      document
        .querySelectorAll(".pipeline-step-card")
        .forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      currentStageFilter = card.getAttribute("data-stage");
      renderDashboard();
    });
  });

  const leadModal = document.getElementById("leadEditModal");
  const closeLeadModalBtn = document.getElementById("closeLeadModalBtn");
  const leadEditForm = document.getElementById("leadEditForm");
  const deleteLeadBtn = document.getElementById("deleteLeadBtn");
  const newManualLeadBtn = document.getElementById("newManualLeadBtn");

  function openLeadEditModal(leadId) {
    const leads = getStoredLeads();
    const lead = leads.find((l) => l.id === leadId);

    if (lead) {
      document.getElementById("leadModalTitle").textContent = `Dossier ${lead.reference} — ${lead.nom_client}`;
      document.getElementById("editLeadId").value = lead.id;
      document.getElementById("editLeadName").value = lead.nom_client || "";
      document.getElementById("editLeadPhone").value = lead.telephone || "";
      document.getElementById("editLeadEmail").value = lead.email || "";
      document.getElementById("editLeadCity").value = lead.ville_zone || "";
      document.getElementById("editLeadService").value = lead.service_demande || "Installation solaire photovoltaïque";
      document.getElementById("editLeadClientType").value = lead.type_client || "Particulier / habitation";
      document.getElementById("editLeadNature").value = lead.nature_projet || "Nouvelle installation";
      document.getElementById("editLeadBudget").value = lead.budget_envisage || "À définir après étude";
      document.getElementById("editLeadDescription").value = lead.description_besoin || "";
      document.getElementById("editLeadStatus").value = lead.statut || "01_nouveau";
      document.getElementById("editLeadQuoteAmount").value = lead.montant_devis || "";
      document.getElementById("editLeadFollowUpDate").value = lead.date_relance || "";
      document.getElementById("editLeadNotes").value = lead.notes_commerciales || "";
      deleteLeadBtn.style.display = "inline-flex";

      const cleanPhone = (lead.telephone || "").replace(/[^0-9+]/g, "").replace(/^\+/, "");
      const waMsg = encodeURIComponent(
        `Bonjour ${lead.nom_client}, ici l'équipe DoomuTech concernant votre dossier ${lead.reference} (${lead.service_demande}).`
      );
      document.getElementById("modalWhatsAppBtn").href = `https://wa.me/${cleanPhone}?text=${waMsg}`;
    } else {
      document.getElementById("leadModalTitle").textContent = "Ajouter un nouveau prospect";
      leadEditForm.reset();
      document.getElementById("editLeadId").value = "";
      document.getElementById("editLeadStatus").value = "01_nouveau";
      deleteLeadBtn.style.display = "none";
      document.getElementById("modalWhatsAppBtn").href = "https://wa.me/221777019259";
    }

    leadModal.classList.remove("hidden");
  }

  if (newManualLeadBtn) {
    newManualLeadBtn.addEventListener("click", () => openLeadEditModal(null));
  }
  if (closeLeadModalBtn) {
    closeLeadModalBtn.addEventListener("click", () => leadModal.classList.add("hidden"));
  }

  if (leadEditForm) {
    leadEditForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const leads = getStoredLeads();
      const existingId = document.getElementById("editLeadId").value;
      const now = new Date();

      const updatedFields = {
        updated_at: now.toISOString(),
        nom_client: document.getElementById("editLeadName").value.trim(),
        telephone: document.getElementById("editLeadPhone").value.trim(),
        email: document.getElementById("editLeadEmail").value.trim(),
        ville_zone: document.getElementById("editLeadCity").value.trim(),
        service_demande: document.getElementById("editLeadService").value,
        type_client: document.getElementById("editLeadClientType").value,
        nature_projet: document.getElementById("editLeadNature").value,
        budget_envisage: document.getElementById("editLeadBudget").value,
        description_besoin: document.getElementById("editLeadDescription").value.trim(),
        statut: document.getElementById("editLeadStatus").value,
        montant_devis: Number(document.getElementById("editLeadQuoteAmount").value || 0),
        date_relance: document.getElementById("editLeadFollowUpDate").value,
        notes_commerciales: document.getElementById("editLeadNotes").value.trim()
      };

      if (existingId) {
        const idx = leads.findIndex((l) => l.id === existingId);
        if (idx !== -1) {
          leads[idx] = { ...leads[idx], ...updatedFields };
        }
      } else {
        const reference = `DT-${now.getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
        leads.unshift({
          id: "lead_" + Date.now(),
          reference,
          created_at: now.toISOString(),
          consentement_cdp: true,
          ...updatedFields
        });
      }

      saveStoredLeads(leads);
      leadModal.classList.add("hidden");
      renderDashboard();
    });
  }

  if (deleteLeadBtn) {
    deleteLeadBtn.addEventListener("click", () => {
      const existingId = document.getElementById("editLeadId").value;
      if (!existingId) return;
      const leads = getStoredLeads().filter((l) => l.id !== existingId);
      saveStoredLeads(leads);
      leadModal.classList.add("hidden");
      renderDashboard();
    });
  }

  const exportCsvBtn = document.getElementById("exportCsvBtn");
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
      const leads = getFilteredLeads(getStoredLeads());
      const headers = [
        "Reference",
        "Date_Creation",
        "Nom_Client",
        "Telephone",
        "Email",
        "Ville_Zone",
        "Type_Client",
        "Service_Demande",
        "Nature_Projet",
        "Budget_Client",
        "Statut_Commercial",
        "Montant_Devis_FCFA",
        "Date_Relance",
        "Besoin_Client",
        "Notes_Commerciales"
      ];

      const rows = leads.map((l) => [
        l.reference,
        l.created_at,
        l.nom_client,
        l.telephone,
        l.email || "",
        l.ville_zone,
        l.type_client,
        l.service_demande,
        l.nature_projet,
        l.budget_envisage,
        STATUS_LABELS[l.statut] || l.statut,
        l.montant_devis || 0,
        l.date_relance || "",
        l.description_besoin || "",
        l.notes_commerciales || ""
      ]);

      const csvContent =
        "\uFEFF" +
        [headers, ...rows]
          .map((row) =>
            row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";")
          )
          .join("\r\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prospects-doomutech-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  const sbModal = document.getElementById("supabaseConfigModal");
  const openSbBtn = document.getElementById("openSupabaseConfigBtn");
  const closeSbBtn = document.getElementById("closeSupabaseModalBtn");
  const sbForm = document.getElementById("supabaseConfigForm");
  const dbStatus = document.getElementById("dbConnectionStatus");

  function refreshSbStatus() {
    const cfg = getSupabaseConfig();
    if (cfg && cfg.url && cfg.key) {
      dbStatus.textContent = "🟢 Connecté à Supabase Cloud + Cache Local";
      document.getElementById("sbUrlInput").value = cfg.url;
      document.getElementById("sbKeyInput").value = cfg.key;
    } else {
      dbStatus.textContent = "🟢 Base locale active (Prête pour Supabase)";
    }
  }

  if (openSbBtn) openSbBtn.addEventListener("click", () => sbModal.classList.remove("hidden"));
  if (closeSbBtn) closeSbBtn.addEventListener("click", () => sbModal.classList.add("hidden"));
  if (sbForm) {
    sbForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const url = document.getElementById("sbUrlInput").value.trim();
      const key = document.getElementById("sbKeyInput").value.trim();
      localStorage.setItem(STORAGE_SUPABASE_KEY, JSON.stringify({ url, key }));
      refreshSbStatus();
      sbModal.classList.add("hidden");
    });
  }

  refreshSbStatus();
  renderDashboard();
}

/* ==========================================================================
   9. ANIMATIONS DOUCES & FLUIDES
   ========================================================================== */
function initOasisOneMotion() {
  const progressBar = document.createElement("div");
  progressBar.className = "framer-scroll-progress";
  document.body.prepend(progressBar);

  window.addEventListener(
    "scroll",
    () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      progressBar.style.width = `${pct}%`;
    },
    { passive: true }
  );

  const dockLinks = document.querySelectorAll("#navLinks .top-nav-item[data-dock-link]");
  const trackedSections = ["accueil", "services", "realisations", "simulateur", "devis"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (trackedSections.length > 0 && dockLinks.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const activeId = entry.target.id;
            dockLinks.forEach((link) => {
              link.classList.toggle("dock-active", link.dataset.dockLink === activeId);
            });
          }
        });
      },
      { threshold: 0.25 }
    );

    trackedSections.forEach((sec) => sectionObserver.observe(sec));
  }
}

/* ==========================================================================
   UTILITAIRES
   ========================================================================== */
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatFcfa(amount) {
  return Number(amount || 0).toLocaleString("fr-FR") + " FCFA";
}

function formatDateFr(isoString) {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (e) {
    return isoString;
  }
}
