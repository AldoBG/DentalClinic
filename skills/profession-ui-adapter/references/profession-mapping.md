# Profession Profile to UI/UX Pro Max Mapping Matrix

Reference for `skills/profession-ui-adapter/SKILL.md`. Use this matrix to translate a professional's characteristics into exact `ui-ux-pro-max` parameters and layout decisions.

## 1. Trait Extraction Checklist

When analyzing a practitioner's description, extract:
1. **Specialty & Environment**: e.g., small dental clinic, solo therapist, boutique law firm.
2. **Primary Operator**: Who uses the screen most? (e.g., busy front-desk assistant vs. the specialist during consultation).
3. **Core Friction**: What loses money or time? (e.g., 30% no-shows, abandoned multi-session treatments, unbilled hours).
4. **External Channels**: WhatsApp, Google Calendar, email, phone.

## 2. Dial Calibration Table

| Archetype | Query Keywords | `--density` | `--variance` | `--motion` | Typography & Contrast Priority |
|-----------|----------------|-------------|--------------|------------|--------------------------------|
| **Clinical / Healthcare Assistant** | `healthcare clinic dashboard accessible` | `8` (Dense) | `3` (Structured) | `2` (Subtle) | `Atkinson Hyperlegible` or clean sans; WCAG AAA contrast; semantic status pills |
| **Wellness / Therapy / Spa** | `wellness therapy calm organic` | `4` (Spacious) | `5` (Balanced) | `4` (Smooth) | Warm neutral surfaces; calm teal/sage accents; low visual noise |
| **Legal / Accounting / Advisory** | `legal finance executive trust` | `7` (Compact) | `2` (Strict grid) | `2` (Minimal) | High-contrast navy/slate; tabular numerals; dense document/case queues |
| **Creative / Architecture / Design** | `architecture studio portfolio editorial` | `3` (Editorial) | `8` (Asymmetric) | `6` (Choreographed) | Expressive display serif + geometric sans; large media surfaces |

## 3. Operational UX Translation Rules

- **Assistant-Driven Workflow (< 1 Minute Rule)**:
  - Place a 4-KPI filter strip at the top of the primary workspace.
  - Default to an "Exceptions / Requires Attention" queue rather than a raw calendar or full directory.
  - Pre-fill external communication links (e.g., `https://wa.me/{phone}?text={encodedContext}`) so the operator never types repetitive reminders.
- **Multi-Session / Recurring Continuity**:
  - Display a dedicated progress bar (`currentSession / totalSessions`) and flag any active plan lacking a future scheduled event.
