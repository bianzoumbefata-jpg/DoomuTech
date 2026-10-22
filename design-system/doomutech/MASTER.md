# DoomuTech — Design System MASTER (UI/UX Pro Max)

Source : compétence `ui-ux-pro-max` (nextlevelbuilder). Générateur Python indisponible sur la machine →
synthèse manuelle à partir des bases `products.csv`, `colors.csv`, `ui-reasoning.csv`, `typography.csv`, `landing.csv`.

## Profils retenus
| Base | Ligne | Apport |
|---|---|---|
| products / ui-reasoning | #55 Home Services (HVAC, electrician, maintenance) | Conversion-Optimized + Trust, Flat Design + Accessible & Ethical, contact visible, certifications |
| products / colors | #90 Sustainable Energy / Climate Tech | Vert énergie + accent solaire, anti-pattern « greenwashing / fausses données » |
| typography | #2 Modern Professional | Poppins (titres) + Open Sans (texte) — « professional services » |
| landing | #2 Hero + Testimonials + CTA | Preuve sociale avant le CTA final |

## Couleurs (tokens)
| Rôle | Clair | Sombre | Contraste |
|---|---|---|---|
| Ink / Bleu nuit | `#0B1528` | `#F1F5F9` | ≥ 15:1 |
| Texte courant | `#334155` | `#CBD5E1` | ≥ 9:1 |
| Texte atténué | `#475569` | `#94A3B8` | ≥ 7:1 |
| Primaire (CTA) | `#1D4ED8` (hover `#1E40AF`) | `#2563EB` | blanc 6.7:1 |
| Vert solaire (WhatsApp / succès) | `#047857` (hover `#065F46`) | `#047857` | blanc 5.5:1 |
| Accent solaire (décor uniquement) | `#F59E0B` | `#FBBF24` | jamais en texte sur blanc |
| Fond / Carte / Bordure | `#F8FAFC` / `#FFFFFF` / `#E2E8F0` | `#0B1220` / `#111A2E` / `#1E293B` | — |

## Règles appliquées
1. Accessibilité : contraste ≥ 4.5:1, focus visible 3px, labels ARIA sur boutons-icônes.
2. Interaction : cibles tactiles ≥ 44×44 px, transitions 150–250 ms.
3. Icônes : SVG uniquement (aucun emoji comme icône).
4. Typo : base 16 px, interligne 1.6, aucun texte < 12 px.
5. Mouvement : `prefers-reduced-motion` respecté.
6. Confiance : bandeau de garanties honnêtes, contact WhatsApp permanent, pas de chiffres ni d'avis inventés.

## Anti-patterns à éviter
Contact caché · emojis en icônes · dégradés violets/roses « IA » · chiffres non vérifiables · animations sans réduction de mouvement.
