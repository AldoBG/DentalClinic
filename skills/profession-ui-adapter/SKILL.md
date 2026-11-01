---
name: profession-ui-adapter
description: "Trigger: perfil profesional, profesionista, adaptar UI por profesión, ui-ux-pro-max persona. Tailor UI/UX to a professional profile."
license: Apache-2.0
metadata:
  author: "aldopd95"
  version: "1.0"
---

## Activation Contract

Activate when the user provides a professional profile (specialty, workflow pain points, team roles, operational tempo, or patient/client dynamics) and requests UI/UX generation or refinement using `ui-ux-pro-max`.

## Hard Rules

- Load `../../.agents/skills/ui-ux-pro-max/SKILL.md` with the `read` tool first so its Priority 1-10 rules and Query Contract are active in context.
- Extract the profession's primary bottleneck, operator role (solo practitioner vs. assistant-driven), and time-to-action constraint before running any design query.
- Always invoke `.agents/skills/ui-ux-pro-max/scripts/search.py` with `--design-system` and calibrated dials (`--variance`, `--motion`, `--density`) mapped from `references/profession-mapping.md`.
- Persist the generated design system to `design-system/<project-slug>/MASTER.md` and synchronize `design/system.md`.
- Enforce anti-scope discipline: exclude ERP, billing, or administrative modules that do not solve the professional's stated core problem.
- NEVER use emojis as UI icons; use inline SVG icons (`stroke-width="2"`) with explicit accessible labels.
- Verify every UI update with a production build and a headless browser audit when available.

## Decision Gates

| Professional Context | Dial & Layout Strategy |
|----------------------|------------------------|
| High-throughput clinical/assistant desk (e.g., dental, medical) | `--density 8 --variance 3 --motion 2`; 12-column exception dashboard + status badges |
| Creative, architectural, or luxury studio | `--density 3 --variance 7 --motion 6`; editorial typography + generous negative space |
| Legal, financial, or analytical practice | `--density 7 --variance 2 --motion 2`; high-contrast tabular views + keyboard navigation |
| Field or mobile-first service professional | `--density 5 --variance 4 --motion 3`; 44x44px touch targets + one-tap external communication |

## Execution Steps

1. Read `../../.agents/skills/ui-ux-pro-max/SKILL.md` and `references/profession-mapping.md` to load both the UI/UX Pro Max engine rules and the profession-to-dial matrix.
2. Parse the professional profile to identify industry keywords, operator role, and dial values (`--variance`, `--motion`, `--density`).
3. Run `python3 ".agents/skills/ui-ux-pro-max/scripts/search.py" "<profession> <industry> <keywords>" --design-system --variance <V> --motion <M> --density <D> --persist -p "<Project>" --output-dir "."`.
4. Run a secondary stack query (`--stack <detected-stack>`) and UX query (`--domain ux`) for the profession's critical interaction (e.g., appointment triage, one-click follow-up).
5. Translate the resulting tokens (colors, font pairing, spacing, card/button specs) into deterministic CSS variables and component classes in the project's global stylesheet.
6. Refactor the views so the primary operational exception is resolvable in under 60 seconds, then run the project build and visual audit script.

## Output Contract

Return:
- Extracted professional profile parameters and chosen `ui-ux-pro-max` dials.
- Files created or modified (including `MASTER.md` and global styles).
- Build verification and computed-style/screenshot audit results.

## References

- `references/profession-mapping.md` — mapping matrix from professional traits to `ui-ux-pro-max` queries, dials, and layout archetypes.
- `../../.agents/skills/ui-ux-pro-max/SKILL.md` — underlying UI/UX Pro Max search engine contract.
