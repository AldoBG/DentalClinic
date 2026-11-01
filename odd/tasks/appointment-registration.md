# Appointment registration flow

Objective: let the assistant register a new appointment for a patient (required data, validated, born PENDING) and measure attendance rate.
Branch: feature/appointment-registration (branched from main, base = commit at session start 2026-11-01).
Delivery strategy: ask-on-risk (default). Test runner: backend has NO test runner (`npm test` echoes an error) -> backend rules verified via live curl integration checks against a scratch SQLite; frontend verified with `ng build` + existing spec runner if it runs headless.

## Specs

- S0 (problem, user verbatim): "hoy solo se marca el estatus pero no se puede generar una cita en el flujo". The appointments page has no creation form; `AppointmentController.create` accepts any body without validation and hardcodes `status: 'CONFIRMED'`.
- S1 (acceptance, user verbatim): "la cita no pueda agendar con fecha anterior al dia en que se da de alta" -> backend rejects with 400 when `appointment.date` < start of the calendar day of `patient.createdAt`. The UI blocks it too.
- S2 (acceptance, user verbatim): "que sea requerido el dato del paciente, fecha/hora y tratamiento" -> `POST /api/appointments` requires `patientId`, `date` and `treatmentTypeId`; missing -> 400 with a clear message. `treatmentTypeId` resolves (get-or-create) the patient's ACTIVE `PatientTreatment` link so treatments/sessions tracking keeps working; if the caller passes an explicit `patientTreatmentId` (existing attention flow), it is used instead.
- S3 (acceptance, user verbatim): "que nazca con estatus pendiente" -> newly created appointments are `PENDING` (replaces the hardcoded `'CONFIRMED'`).
- S4 (metric, user verbatim): "La metrica de exito sera Porcentaje de citas que nacieron con estatus pendiente y pasaron exitosamente a estatus asistió (o completado) frente a las que terminaron en no se presentó (ausentismo)." -> `GET /api/metrics/attendance` returns `completed` (status COMPLETED), `noShow` (status NO_SHOW) and `rate = completed / (completed + noShow) * 100` (0 when no final statuses yet). Assumption flagged to user: COMPLETED maps to "asistió (o completado)", NO_SHOW maps to "no se presentó"; existing statuses are reused, no new status enum values.
- S5 (UI): the appointments page gets a registration form (patient + date/time + treatment selectors, inline validation and feedback) and displays the S4 metric band. Status label for PENDING changes from "Sin Respuesta" to "Pendiente" (NO_RESPONSE keeps "Sin Respuesta") — logged as a deliberate labeling correction.

## Tasks

- T1 (S1, S2, S3): backend `AppointmentController.create` validation + get-or-create PatientTreatment + born PENDING. Status: pending. Route: inline. Commit: pending.
- T2 (S4): backend `GET /api/metrics/attendance`. Status: pending. Route: inline. Commit: pending.
- T3 (S5, S0): frontend api.service methods + appointments page form + metric band + PENDING label. Status: pending. Route: inline. Commit: pending.
- T4: verification: curl checks (missing fields -> 400; date before patient registration -> 400; valid -> PENDING + PatientTreatment link; metric math) + `ng build` + bundle URL unchanged. Status: pending.

## Log

- L1 (verbatim, 2026-11-01): "Ahoa vamos a crear una nueva feature para poder registrar cita a un paciente, hoy solo se marca el estatus pero no se puede generar una cita en el flujo. El criterio de aceptacion debe ser que la cita no pueda agendar con fecha anterior al dia en que se da de alta, que sea requerido el dato del paciente, fecha/hora y tratamiento y que nazca con estatus pendiente. La metrica de exito sera Porcentaje de citas que nacieron con estatus pendiente y pasaron exitosamente a estatus asistió (o completado) frente a las que terminaron en no se presentó (ausentismo)."
- L2 (2026-11-01, accepted design correction from code exploration): `GET /api/treatments` returns PatientTreatment rows (not the TreatmentType catalog) and no endpoint creates PatientTreatment rows, so a patient with zero treatments could never book. S2 refined: controller accepts `patientTreatmentId` (existing flow) OR `treatmentTypeId` (get-or-create ACTIVE PatientTreatment); new `GET /api/treatment-types` catalog endpoint for the UI selector. S4 refined: the metric is computed client-side (same pattern as existing MetricsComponent) from `GET /api/appointments` — no NEW `/api/metrics` endpoint; T2 dropped.
