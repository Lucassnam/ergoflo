# Retired — AWS EC2 / Docker / Caddy deployment

**This is not how the site is deployed. Nothing in this folder runs.**
It is kept only so the EC2 setup can be reconstructed if it is ever needed again.

ErgoFlo now deploys to **Cloudflare Pages** as a static export. See `docs/DEPLOY.md`.

## Why it was retired — 2026-07-30

The stack here builds on the server (`deploy.sh` → `docker compose up -d --build`).
A Next build was measured at **789 MB peak in a single process across 11 parallel
workers**, which OOM'd every 1 GB host it was pointed at. The runtime also carried a
memory leak: the old `app/api/notify/route.ts` constructed a Supabase client per
request, leaking ~13 KB of live heap each time — 113 MB → 2.5 GB over 60k POSTs.

Cloudflare Pages removes both: the build happens on your machine or in CI, and there
is no long-lived server process to leak. Full evidence:
`docs/plans/2026-07-30-memory-audit-and-production-hardening.md`.

## If you ever bring this back, fix these first

1. **The rate limiter is bypassable behind Caddy.** `reverse_proxy` has no
   `trusted_proxies`, and Caddy *appends* to `X-Forwarded-For`, so the left-most
   entry is attacker-controlled. The current Pages Function uses `CF-Connecting-IP`
   instead, which cannot be spoofed. Any Caddy revival needs `trusted_proxies`.
2. **Never construct a Supabase client per request.** See
   `functions/api/notify.ts` for the approach that replaced it.
3. **The host needs ≥2 GB** for the build, or swap, or an off-host build.
4. `caddy_data` holds the certificates and the ACME account key. Never
   `docker compose down -v`.

## Contents

| File | Was |
|---|---|
| `Dockerfile` | 3-stage build → standalone Next runtime image |
| `docker-compose.yml` | `web` + `caddy` services, internal network |
| `Caddyfile` | domain, automatic TLS, reverse proxy |
| `deploy.sh` | SSH deploy driver (pull, rebuild, restart, verify) |
| `deploy.env.example` | local template — server address + SSH key |
| `.env.production.example` | server-side runtime secrets + `ACME_EMAIL` |
| `.dockerignore` | build-context excludes |
