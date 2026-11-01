# Persistent database for Fly.io deployment

Objective: make the backend's SQLite database persist across deploys and restarts on Fly.io.
Branch: (to be created when implementation starts) — current work sits uncommitted on the working tree.
Delivery strategy: ask-on-risk (default). Test runner: none declared by the project (`npm test` is a placeholder) — verification is functional (docker build + runtime probe against a volume path), plus live deploy check on Fly.io.

## Specs

- S1 (confimed 2026-10-31): keep Prisma + SQLite as the engine, per user decision ("quiero mantenerlo simple"). Quoted request verbatim: "implementar una bd que tenga persistencia". Current stack is Prisma 5 + SQLite (`backend/prisma/schema.prisma`, SQLite provider), workload is a single-clinic demo on a single-writer machine. [Status: confirmed]
- S2: `backend/prisma/schema.prisma` datasource url must read `env("DATABASE_URL")` instead of the hardcoded `file:./dev.db`, so local dev keeps working via `backend/.env` (gitignored — add `.env` to `.gitignore` if not present) and production points to a file on the mounted Fly volume (e.g. `file:/data/prod.db`).
- S3: the container must create/update the schema on the volume file before the server starts (no `migrations/` directory exists yet): startup runs `prisma db push` against `DATABASE_URL` followed by the optional seed step, then `node dist/index.js`. One combined entrypoint (e.g. `docker-entrypoint.sh` or startup script) so a single `CMD` handles it.
- S4: `fly.toml` must declare a volume mount (source e.g. `dental_data`, destination `/data`) and configure HA to one machine (`fly launch --ha=false` or `fly scale count 1`), because a Fly volume can attach to exactly one Machine — two machines with one shared volume is not supported and produces split-brain.
- S5: data written on Fly.io must survive a redeploy and a machine restart; verified live by deploying once, writing data through the API, redeploying, and confirming the data is still there.
- S6: backups: volume snapshots are the minimum ($0.08/GB-month, first 10 GB free); Litestream continuous backup to Tigris/S3 is the recommended upgrade path when data loss tolerance matters. Installed during initial setup at minimum as a documented follow-up.

Fly.io support answer (evidence, from docs.fly.io/volumes/overview and docs.fly.io Prisma+SQLite pages, verified 2026-10-31): Fly.io provides persistence through Volumes for Machines — one-to-one machine↔volume, single server/region, no automatic replication across volumes; apps needing >1 active machine cannot use a single shared volume.

## Tasks

- T1 (S2): schema url -> env("DATABASE_URL") + backend/.env (DATABASE_URL=file:./dev.db, gitignored). Status: done. Commit: pending user request (nothing committed yet in repo). Route: inline.
- T2 (S3): Dockerfile CMD runs `npx prisma db push --skip-generate && node dist/index.js`; `prisma` CLI moved from devDependencies to dependencies (needed at runtime). Status: done. Route: inline.
- T3 (S4): backend/fly.toml — app dental-clinic-backend, region eze, volume dental_data -> /data, DATABASE_URL=file:/data/prod.db, 1 machine (shared-cpu-1x), auto_stop off. Status: done (not yet deployed — live steps documented in file comments). Route: inline.
- T4 (S5): persistence verified locally AND live on Fly.io: volume file /data/prod.db created by db push at boot; POST /api/patients returned an object; container destroyed & recreated keeping only the volume; data still returned by GET /api/patients. Live confirmation by user after deploy + next-redeploy observation on production (patient TEST-Persistencia-Fly survived; user 2026-11-01: "Si, front y back desplegados y verificados"). Status: done. Route: inline.
- T5 (S6): backup strategy (snapshots min / Litestream recommended). Status: pending — follow-up after first successful deploy.

## Log

- L3 (2026-11-01): user confirmed front (Vercel) and back (Fly.io) deployed and verified. S5 live: patient TEST-Persistencia-Fly persisted across deploys on the Fly volume. Feature closed; remaining pending item: S6 backups (optional follow-up for the demo). The test patient remains in prod DB (no DELETE route in API) — harmless for the demo, remove via `fly ssh console` + sqlite CLI if wanted.
- L1 (verbatim, 2026-10-31): "Ok añade una spec a odd para implementar una bd que tenga persistencia. Flyio provee ese soporte?"
- Context: this feature follows the in-progress Dockerfile task (backend/Dockerfile + .dockerignore created and verified locally; puppeteer moved to devDependencies; OpenSSL installed in both stages; image `dental-backend` boots and loads the Prisma engine; endpoint 500 without db file is expected).
- Answer delivered: yes — Fly.io Volumes, with the single-machine constraint above.
- L2 (verbatim, 2026-10-31): "Esto es un demo, quiero mantenerlo simple."
- S1 resolved: user confirmed SQLite + Prisma, simple path, single machine. [Status: confirmed]
- Free-tier answer delivered (verified 2026-10-31 against docs.fly.io/about/pricing + pricing page): no free tier for new organizations (legacy Hobby allowance is grandfathered-only); trial = 2 VM-hours or 7 days; metered all-on cost ≈ $2.19/mo (256MB machine) + $0.15/mo (1GB volume) + marginal egress ≈ $2.35/mo; Informal policy: invoices under $5 are waived.
