# DoomuTech — Design System MASTER (Thème Agence PumpUp Rouen)

Source d'inspiration & d'identité : **Agence Digitale PumpUp Rouen** ([pumpup.fr/agence-digitale-rouen/](https://www.pumpup.fr/agence-digitale-rouen/)).
Ce thème premium a été définitivement appliqué sur l'ensemble de la plateforme DoomuTech Sénégal (accueil, sous-pages services, espace administrateur et simulateur).

---

## 1. Typographie Éditoriale
| Rôle | Police | Graisse | Notes |
|---|---|---|---|
| **Titres (h1, h2, h3, h4, brand)** | `'Instrument Serif', Georgia, serif` | 400 | Style éditorial, grand format fluide avec `clamp()`, tracking léger `-0.01em` |
| **Accents & Mots-clés (`<em>`, `.pu-highlight`)** | `'Instrument Serif', Georgia, serif` (Italique) | 400 | Teinte Citrus `#E8FE8A`, contraste éclatant sur fond sombre |
| **Texte courant & Composants UI** | `'Hanken Grotesk', system-ui, sans-serif` | 400, 500, 600, 700, 800 | Lisibilité contemporaine, césure soignée, interligne 1.65 |
| **Code & Télémétrie** | `'JetBrains Mono', monospace` | 500, 600 | KPIs, données chiffrées, badges de statut |

---

## 2. Palette de Couleurs (Dark Forest & Citrus)
| Token CSS | Hex / Valeur | Usage | Contraste |
|---|---|---|---|
| `--pu-dark` | `#151C15` | Fond de page principal (Dark Forest) | Base sombre d'exception |
| `--pu-forest` | `#1F2D24` | Surface des cartes bento, formulaires, conteneurs | Élévation subtile |
| `--pu-forest-deep` | `#27382D` | Hover des cartes, fonds d'encarts | Profondeur |
| `--pu-citrus` | `#E8FE8A` | CTA principal, accents titres `<em>`, étoiles, focus ring | ≥ 14:1 sur fond sombre |
| `--pu-citrus-hover` | `#F2FFA6` | Survol des boutons primaires | Éclat dynamique |
| `--pu-citrus-dim` | `rgba(232, 254, 138, 0.10)` | Badges, tags, arrière-plans de mise en avant | Douceur |
| `--pu-text` | `#F2F5EE` | Titres et texte principal (Stone White) | ≥ 15:1 |
| `--pu-muted` | `#B9C4BC` | Descriptions, sous-titres, labels secondaires | ≥ 7:1 |
| `--pu-line` | `rgba(255, 255, 255, 0.08)` | Bordures séparatrices légères | Délimitation nette |

---

## 3. Composants d'Interface Signature
1. **Boutons Pilules (`.btn`)** :
   - `border-radius: 999px;`
   - Bouton primaire : Fond Citrus `#E8FE8A`, texte Dark Forest `#151C15`, typographie Hanken Grotesk 700, hover avec halo lumineux `box-shadow: 0 10px 24px rgba(232, 254, 138, 0.28)`.
   - Bouton WhatsApp : Fond `#25D366` avec texte blanc ou badge Citrus.
   - Bouton Outline : Bordure `rgba(255, 255, 255, 0.2)` et texte blanc cassé `#F2F5EE`.
2. **Cartes Bento & Modales** :
   - Fond Forest `#1F2D24`, bordure ultra fine `1px solid rgba(255, 255, 255, 0.08)`, arrondi 20px (`--radius-card`).
3. **Simulateur Solaire Simple** :
   - Calcul en temps réel selon le coût mensuel Senelec et les appareils prioritaires.
   - Affichage des KPIs chiffrés en Citrus `#E8FE8A`.
4. **Bouton WhatsApp Flottant Permanent** :
   - Fixé en bas à droite (`z-index: 1000`), forme pilule, halo Citrus, accessible dès le premier écran et sur mobile.

---

## 4. Règles d'Accessibilité & Conformité
- **Accessibilité** : Cibles tactiles $\ge 44 \times 44\text{ px}$, labels ARIA explicites, focus visible Citrus 3px.
- **Respect du mouvement** : `@media (prefers-reduced-motion: reduce)` respecté sans animations superflues.
- **Performance** : Images WebP/JPG compressées, Lazy-loading, zéro dépendance JavaScript externe lourde.
- **Protection des données** : Formulaire conforme à la réglementation sénégalaise (CDP - Loi 2008-12) avec champ anti-spam honeypot silencieux.
