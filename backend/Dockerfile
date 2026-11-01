# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:22-slim AS build
WORKDIR /app

# Puppeteer is dev-only tooling; skip the ~350MB Chromium download in the image.
ENV PUPPETEER_SKIP_DOWNLOAD=true

# OpenSSL required so Prisma generates the correct query engine binary target
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma.config.ts ./
COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- Runtime stage ----------
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

# OpenSSL required by the Prisma query engine at runtime
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Generated Prisma client lives under node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

# Schema kept for future `prisma migrate deploy` (no migrations yet)
COPY prisma ./prisma

COPY --from=build /app/dist ./dist

USER node
EXPOSE 3000
# Create/update SQLite schema on the mounted volume, then start the server.
# DATABASE_URL (e.g. file:/data/prod.db) selects the database file.
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
