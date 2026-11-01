---
name: dental-clinic-feature
description: "Trigger: nueva feature, dental feature, Dra. Laura, inasistencias, seguimiento, UI dental. Build features for the DentalClinic MVP."
license: Apache-2.0
metadata:
  author: "aldopd95"
  version: "1.0"
---

## Activation Contract

Activate when creating, modifying, or reviewing any feature, endpoint, or UI view in the DentalClinic repository for Dr. Laura's practice.

## Hard Rules

- Enforce strict anti-scope: NEVER build billing, clinical records, odontograms, inventory, prescriptions, diagnostics, or ERP/CRM modules.
- Every feature must directly reduce appointment no-shows or prevent multi-session treatment abandonment.
- Use the defined stack only: Angular 22 standalone components + ExpressJS + Prisma.
- Apply the UI/UX Pro Max palette and typography from `references/design-tokens.md`: `Atkinson Hyperlegible`, Cyan (`#0891B2`), Deep Cyan (`#164E63`), Emerald (`#059669`), Amber (`#D97706`), Red (`#DC2626`), Slate (`#F8FAFC`).
- NEVER use emojis in UI templates; use inline SVG icons (`stroke-width="2"`) with visible labels.
- Inject `ChangeDetectorRef` and call `this.cdr.detectChanges()` inside every `subscribe({ next, error })` callback in Angular components.
- Keep external integrations behind service interfaces (`ICalendarService`, `INotificationService`) with working mocks when credentials are absent.

## Decision Gates

| Request Type | Action |
|--------------|--------|
| Feature outside attendance or treatment continuity | Reject and state the anti-scope rule |
| New Angular view or status mutation | Use standalone component + `ChangeDetectorRef` + `role="status"` toast feedback |
| WhatsApp patient outreach action | Generate pre-filled `https://wa.me/{phone}?text={encodedMessage}` deep link |
| Styling a card, button, or badge | Use deterministic classes (`.data-card`, `.btn-primary`, `.btn-whatsapp`, `.btn-secondary`, `.badge-pill`) from `frontend/src/styles.css` |

## Execution Steps

1. Verify the requested feature serves no-show reduction or multi-session treatment follow-up; update `odd/tasks/dental-followup-mvp.md` if adding a new spec.
2. Read `references/design-tokens.md` before editing any HTML or CSS.
3. Implement backend logic in `backend/src/` (Prisma + Express controller) and verify with `cd backend && npm run build`.
4. Implement frontend UI in `frontend/src/app/` using a 12-column `max-w-[1600px]` layout, SVG icons, and explicit `this.cdr.detectChanges()`.
5. Run `cd frontend && npm run build` and `cd backend && npx tsx scripts/audit_ui.ts` to verify zero build errors and zero stuck loading spinners.

## Output Contract

Return:
- Files created or modified.
- Confirmation of anti-scope compliance and 60-second assistant rule alignment.
- Frontend and backend build status plus Puppeteer UI audit result.

## References

- `references/design-tokens.md` — canonical color tokens, typography, and component CSS contracts.
- `../../design-system/dentalclinic/MASTER.md` — UI/UX Pro Max master design system for DentalClinic.
- `../../odd/tasks/dental-followup-mvp.md` — ODD specifications and task log.
