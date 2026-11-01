# Dental Clinic Follow-up MVP

A system to reduce patient no-shows and treatment abandonment for Dr. Laura.

## Specs
S1: Keep Google Calendar as the primary agenda.
S2: Automate WhatsApp reminders for upcoming appointments.
S3: Track appointment statuses: Confirmed, No response, Canceled, Reschedule, No-show, Completed.
S4: "Requires Attention" dashboard for the assistant to focus on exceptions.
S5: Track multi-session treatments (e.g., Endodontics) and their progress.
S6: Detect patients with an active treatment but no scheduled future appointment.
S7: Automate follow-up triggers for patients identified in S6.
S8: Basic metrics: No-show rate, confirmation rates, pending treatments.
S9: UX focused on speed: Assistant must know who needs attention in < 1 minute.
S10: OUT OF SCOPE: Billing, clinical records, odontogram, inventory, prescriptions.

## Tasks
T1: Project initialization (Angular frontend, ExpressJS backend) | S1-S10 | Route: Init | Commit: init
T2: Backend: Database schema design (Postgres + Prisma) | S3, S5, S6 | Route: Backend | Commit: db-schema
T3: Backend: Mock Calendar Service (Google Calendar simulation) | S1 | Route: Backend | Commit: mock-calendar
T4: Backend: Mock Notification Service (WhatsApp simulation) | S2, S7 | Route: Backend | Commit: mock-whatsapp
T5: Backend: API Endpoints for Appointments and Treatments | S3, S5 | Route: Backend | Commit: api-core
T6: Backend: "Requires Attention" Logic Engine | S4, S6, S7 | Route: Backend | Commit: attention-engine
T7: Frontend: Project setup & Basic Layout (Angular) | S9 | Route: Frontend | Commit: front-base
T8: Frontend: "Requires Attention" Dashboard | S4, S9 | Route: Frontend | Commit: front-dashboard
T9: Frontend: Treatment Tracking & Appointment Management | S3, S5 | Route: Frontend | Commit: front-mgmt
T10: Frontend: Basic Metrics View | S8 | Route: Frontend | Commit: front-metrics
T11: Integration & E2E Verification of "Golden Flow" | S1-S9 | Route: Integration | Commit: e2e-verify

## Log
L1: User request: Reduce no-shows (30%) and treatment abandonment. Needs automation for WhatsApp and a "Requires Attention" dashboard. NO billing/records. Stack: Angular + ExpressJS + Postgres.
