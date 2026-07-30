# syntax=docker/dockerfile:1

# ============================================================
# ErgoFlo landing — production image.
#
# Three stages so the shipped image contains no source, no dev
# dependencies and no build toolchain: deps → builder → runner.
#
# WHY debian-slim AND NOT alpine: next/image is used on /about, in the
# Header, Footer, ComparisonSlider and ProductRender, so `sharp` runs at
# request time. sharp ships prebuilt binaries for glibc and musl, but the
# glibc path is the well-trodden one and this image is not large enough
# for the alpine saving to matter. Don't switch to alpine to save 40MB
# and then spend an evening on a libvips error.
#
# The runner copies THREE things out of the builder, and all three are
# required (see next.config.ts `output: "standalone"`):
#   1. .next/standalone — the traced server + its slice of node_modules
#   2. .next/static     — hashed JS/CSS. standalone does NOT include it.
#   3. public           — images/fonts. standalone does NOT include it.
# Drop 2 and the page renders unstyled with no JS; drop 3 and every
# image 404s. Neither failure is loud in the container log.
# ============================================================

# ---------- deps: install once, cached until the lockfile changes ----------
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# `npm ci` not `npm install` — the lockfile is the source of truth, and the
# `overrides` block in package.json (sharp, postcss) only holds if it is.
RUN npm ci

# ---------- builder ----------
FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# SUPABASE_URL / SUPABASE_SECRET_KEY are deliberately NOT passed here.
# lib/supabase.ts degrades to null instead of throwing when they're
# missing, and /api/notify is a POST route so nothing is prerendered
# against it. Secrets belong to the running container, not the image —
# anything present at build time is baked into a layer forever.
RUN npm run build

# ---------- runner ----------
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# server.js reads both. Without HOSTNAME it binds 127.0.0.1 inside the
# container, which the Caddy container cannot reach — the symptom is a
# 502 from a container that looks perfectly healthy.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# No curl/wget in a slim image, and adding one just to healthcheck is a
# needless package. Node 22 has global fetch.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
