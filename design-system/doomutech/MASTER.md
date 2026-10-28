# DoomuTech Sénégal — Design System Officiel (`ui-ux-pro-max`)

Ce document de référence (`MASTER.md`) définit l'identité visuelle, l'architecture d'interface et les règles d'accessibilité de **DoomuTech Sénégal**, générées à partir de la base de données d'intelligence de design **[`ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)**.

---

## 1. Profils d'Architecture Sélectionnés (`ui-ux-pro-max`)

- **Catégorie Principale (`colors.csv` & `ui-reasoning.csv`)** :
  - `#90 Sustainable Energy / Climate Tech` (`Data + Trust`)
  - `#55 Home Services (Plumber / Electrician / HVAC)` (`Conversion-Optimized + Trust`)
  - `#5 B2B Service` (`Trust & Authority`)
- **Style UI (`styles.csv`)** :
  - `#39 Bento Box Grid` + `#26 Trust & Authority` + `#8 Accessible & Ethical`
- **Règle Anti-Pattern respectée (`ui-reasoning.csv`)** :
  - *Éviter le mode sombre imposé par défaut pour les services B2B & d'intervention technique* -> **Mode Clair (`Daylight #F8FAFC`) par défaut** pour une lisibilité parfaite en extérieur au Sénégal, avec bascule fluide vers le **Mode Sombre Bleu Nuit (`[data-theme="dark"]`)**.

---

## 2. Palette Chromatique Sémantique (Bleu Nuit, Blanc & Vert Solaire)

| Rôle Sémantique | Token CSS | Mode Clair (Défaut) | Mode Sombre (`[data-theme="dark"]`) | Ratio Contraste |
| :--- | :--- | :--- | :--- | :--- |
| **Fond Principal** | `--bg` | `#F8FAFC` (Slate 50) | `#0B1120` (Deep Navy) | — |
| **Surface Cartes (Bento)** | `--surf` | `#FFFFFF` (Blanc pur) | `#111C33` (Navy Card) | — |
| **Autorité & Titres** | `--ink` | `#0F172A` (Bleu Nuit) | `#F8FAFC` (Blanc) | `16.8:1` (AAA) |
| **Texte Courant** | `--body` | `#334155` (Slate 700) | `#CBD5E1` (Slate 300) | `10.4:1` (AAA) |
| **Texte Secondaire** | `--mut` | `#475569` (Slate 600) | `#94A3B8` (Slate 400) | `7.1:1` (AAA) |
| **Action / Vert Solaire** | `--brand` | `#059669` (Emerald 600) | `#10B981` (Emerald 500) | `4.6:1` (AA+) |
| **Survol Action** | `--brand-dark` | `#047857` (Emerald 700) | `#059669` (Emerald 600) | `5.8:1` (AA+) |
| **Accent Or Solaire** | `--solar-amber` | `#D97706` / `#F59E0B` | `#FBBF24` | — |
| **Bordures Subtiles** | `--line` | `#E2E8F0` (Slate 200) | `#1E293B` (Slate 800) | — |

---

## 3. Système Typographique (`typography.csv` #11 Geometric Modern)

- **Titres & En-têtes (`--font-display`)** : **`Outfit`** (`600`, `700`, `800`) — géométrique, technique, nette et moderne, sans empattements décoratifs.
- **Corps de texte & Formulaires (`--font-sans`)** : **`Plus Jakarta Sans`** (`400`, `500`, `600`, `700`) — lisibilité optimale sur mobile et écran haute densité.
- **Métriques, Devis & Simulateur (`--font-mono`)** : **`JetBrains Mono`** (`500`, `600`) avec `font-variant-numeric: tabular-nums` pour aligner les puissances (`kWc`, `kWh`, `BTU`) et montants (`FCFA`).

---

## 4. Composants & Règles d'Interaction

1. **Boutons d'Action & Cibles Tactiles** :
   - Hauteur minimale `48px` (`52px` pour `.btn-lg`), `border-radius: 12px` à `14px`.
   - Premier écran avec double CTA clair : **« Demander un devis gratuit »** (`.btn-primary`) et **« Parler à un conseiller (WhatsApp) »** (`.btn-whatsapp-hero`).
2. **Cartes Bento (`.activity-bento-card`, `.project-card`, `.testimonial-card`)** :
   - `border-radius: 20px`, bordure `1px solid var(--line)`, ombre douce `var(--sh-md)`.
   - Pas d'emojis décoratifs dans l'interface : utilisation exclusive d'icônes vectorielles SVG (`24x24`, `stroke-width: 2`).
3. **Accessibilité & Performance** :
   - `:focus-visible` avec contour `3px solid var(--brand)` et `outline-offset: 2px`.
   - Prise en charge complète de `@media (prefers-reduced-motion: reduce)`.
