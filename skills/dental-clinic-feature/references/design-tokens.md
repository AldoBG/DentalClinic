# DentalClinic Design Tokens & UI Contract

Reference for `skills/dental-clinic-feature/SKILL.md`. Source of truth synchronized with `design-system/dentalclinic/MASTER.md` and `frontend/src/styles.css`.

## Color Tokens

| CSS Variable | Hex | Usage |
|--------------|-----|-------|
| `--color-bg` | `#F8FAFC` | App background (Slate 50) |
| `--color-surface` | `#FFFFFF` | Card and table surface |
| `--color-surface-muted` | `#F1F5F9` | Table headers and secondary blocks |
| `--color-primary` | `#0891B2` | Clinical Cyan (primary actions, active links, progress bars) |
| `--color-primary-dark` | `#164E63` | Deep Cyan (brand header icon, hover states) |
| `--color-accent` | `#059669` | Health Emerald (WhatsApp CTA, confirmed badges) |
| `--color-warning` | `#D97706` | Amber (active treatment missing future appointment) |
| `--color-danger` | `#DC2626` | Clinical Red (no-show alerts and metrics) |
| `--color-text` | `#0F172A` | Primary text (Slate 900) |
| `--color-text-muted` | `#475569` | Secondary text and labels (Slate 600) |
| `--color-border` | `#E2E8F0` | Card and table borders (Slate 200) |

## Typography & Layout

- **Font Family**: `'Atkinson Hyperlegible', sans-serif` (loaded in `frontend/src/index.html`).
- **Container Width**: `max-w-[1600px] mx-auto px-6`.
- **Core Classes**: `.data-card`, `.btn-primary`, `.btn-whatsapp`, `.btn-secondary`, `.nav-link`, `.nav-link-active`, `.badge-pill`.
