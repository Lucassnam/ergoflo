# Deploying ErgoFlo — EC2 + Caddy + Docker

**Domain:** `ergoflo.tech` · **Host:** AWS EC2 · **TLS:** automatic, Let's Encrypt via Caddy

The site runs as two containers behind Caddy. Caddy owns ports 80 and 443,
terminates TLS, and proxies to the Next.js container on an internal network.
The app port is never published to the host.

```
internet ──▶ :443 ┌──────────────┐        ┌──────────────┐
             :80  │    caddy     │──────▶ │     web      │
                  │ auto Let's   │  :3000 │ next.js      │
                  │ Encrypt TLS  │        │ standalone   │
                  └──────────────┘        └──────────────┘
                    caddy_data              .env.production
                    (certs — persist!)      (supabase keys)
```

**Builds happen on the server.** `./deploy.sh` SSHes in, pulls the branch from
GitHub, and rebuilds. Nothing is uploaded from your Mac. Whatever is **pushed**
is what ships — uncommitted or unpushed local work is not deployed (the script
warns you about both).

---

## Files

| File | Lives | Committed | Purpose |
|---|---|---|---|
| `Dockerfile` | repo | yes | 3-stage build → minimal runtime image |
| `docker-compose.yml` | repo | yes | the two services, volumes, network |
| `Caddyfile` | repo | yes | domain, TLS, reverse proxy |
| `deploy.sh` | repo | yes | everything you run |
| `deploy.env` | your Mac | **no** | server address + SSH key |
| `.env.production` | the server | **no** | Supabase keys + ACME email |

---

## First-time setup

### 1. DNS

Two A records at your registrar, both pointing at the instance's public IP:

| Type | Name | Value |
|---|---|---|
| A | `@` (ergoflo.tech) | `<elastic-ip>` |
| A | `www` | `<elastic-ip>` |

**Use an Elastic IP.** A default EC2 public IP changes when the instance stops
and starts, and your DNS silently goes stale — the site is down and nothing in
the logs says why.

If you decide not to run `www`, delete the `www.ergoflo.tech` block from the
`Caddyfile`. Leaving it in with no A record makes Caddy retry a certificate
order it can never complete, forever.

Verify before going further — Let's Encrypt resolves the name itself, so it has
to be publicly correct, not just correct on your laptop:

```bash
dig +short ergoflo.tech
dig +short www.ergoflo.tech
```

### 2. EC2 security group

| Port | Protocol | Source | Why |
|---|---|---|---|
| 22 | TCP | **your IP only** | SSH. Do not open to 0.0.0.0/0. |
| 80 | TCP | 0.0.0.0/0 | ACME HTTP-01 challenge + the →HTTPS redirect |
| 443 | TCP | 0.0.0.0/0 | the site |
| 443 | UDP | 0.0.0.0/0 | HTTP/3 (optional; drop if you don't want it) |

**Port 80 is not optional.** Certificates are issued *and renewed* over it.
Close it and the site works for ~60 days, then silently starts serving an
expired certificate.

Instance size: a Next build needs roughly 2 GB RAM. `t3.small` is the realistic
floor; `t3.micro` (1 GB) will OOM mid-build. If you're stuck on `t3.micro`, add
swap before the first deploy:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 3. Local config

```bash
cp deploy.env.example deploy.env
$EDITOR deploy.env          # host, user, key path, path, branch, domain
chmod 400 ~/.ssh/ergoflo-ec2.pem
```

`DEPLOY_USER` is `ubuntu` on Ubuntu AMIs, `ec2-user` on Amazon Linux.

### 4. Bootstrap the server

```bash
./deploy.sh bootstrap
```

Installs Docker Engine + the compose plugin (handles both apt and dnf AMIs) and
clones the repo to `DEPLOY_PATH`. It asks for confirmation first — it changes
system packages.

**If the GitHub repo is private,** the clone will hang waiting for credentials
on a non-interactive SSH session. Set up access first — generate a key on the
server, add the public half as a GitHub deploy key, and clone over SSH:

```bash
ssh -i ~/.ssh/ergoflo-ec2.pem ubuntu@<host>
ssh-keygen -t ed25519 -C ergoflo-deploy -f ~/.ssh/id_ed25519 -N ''
cat ~/.ssh/id_ed25519.pub    # → GitHub repo → Settings → Deploy keys (read-only)
```

then use the `git@github.com:...` URL rather than `https://`.

### 5. Runtime secrets

`deploy.sh` **refuses to deploy** until this exists. That's deliberate: without
it the site looks perfectly fine and drops every waitlist signup on the floor.

```bash
./deploy.sh ssh
cp .env.production.example .env.production
nano .env.production        # SUPABASE_URL, SUPABASE_SECRET_KEY, ACME_EMAIL
chmod 600 .env.production
exit
```

`git reset --hard` during a deploy does not touch untracked files, so this
survives every subsequent deploy. Back it up somewhere — it is the one piece of
state not in the repo.

### 6. Log out and back in

The bootstrap adds your user to the `docker` group, which only applies to a new
session. Skip this and the first deploy fails on a permission-denied socket.

### 7. Deploy

```bash
./deploy.sh
```

First run pulls base images and builds from scratch — a few minutes. Certificate
issuance normally completes within a minute of the container starting, and the
script polls `https://ergoflo.tech` for up to a minute before reporting.

---

## Day-to-day

```bash
git push origin main        # this is the part that matters
./deploy.sh                 # pull, rebuild, restart, verify HTTPS

./deploy.sh status          # what's running, current commit, disk free
./deploy.sh logs web        # app logs
./deploy.sh logs caddy      # TLS / proxy logs
./deploy.sh restart         # bounce containers without rebuilding
./deploy.sh certs           # issuer + expiry of the live certificate
./deploy.sh ssh             # shell in the deploy directory
```

Rollback is a git operation — point the branch at a known-good commit, push,
redeploy:

```bash
git revert <bad-sha> && git push && ./deploy.sh
```

---

## Certificates: what not to do

Caddy stores issued certificates **and the ACME account key** in the
`caddy_data` Docker volume. It is the only stateful thing in the stack.

- **Never run `docker compose down -v`** on this server. `-v` deletes named
  volumes. Every certificate is re-requested from scratch.
- Let's Encrypt rate-limits **5 duplicate certificates per registered domain per
  week**. Blow through it and `ergoflo.tech` cannot get a certificate until the
  window rolls — there is no appeal and no override.
- Testing issuance changes? Uncomment the `acme_ca` staging line in the
  `Caddyfile` first. Staging certs are untrusted by browsers (expect a warning)
  but are not rate-limited. Comment it out and `./deploy.sh restart` when done.

Check what a browser actually gets:

```bash
./deploy.sh certs
```

---

## Troubleshooting

| Symptom | Cause | Check |
|---|---|---|
| `curl` times out, `000` | DNS wrong, or 443 not open in the security group | `dig +short ergoflo.tech`, then the SG rules |
| Browser TLS warning | cert not issued yet, or staging CA still enabled | `./deploy.sh logs caddy`, grep `obtain` |
| `502 Bad Gateway` | Caddy is up, app isn't | `./deploy.sh logs web` |
| 502 with a container that looks healthy | app bound to 127.0.0.1 inside the container | `HOSTNAME=0.0.0.0` must be set (it is, in the Dockerfile) |
| Page renders unstyled, no JS | `.next/static` missing from the image | the Dockerfile's second `COPY --from=builder` |
| Every image 404s | `public/` missing from the image | the Dockerfile's third `COPY --from=builder` |
| Waitlist form returns an error | Supabase env missing or wrong | `./deploy.sh logs web`; check `.env.production` |
| Build killed partway through | out of RAM | add swap (step 2) or resize the instance |
| `permission denied ... docker.sock` | docker group not applied | log out and back in |

---

## Things that must stay in sync

Three files name the domain. If they drift, share cards and canonical URLs
point at something that isn't served:

- `lib/site.ts` → `SITE_URL`
- `Caddyfile` → the site block
- `deploy.env` → `DEPLOY_DOMAIN`

## Still outstanding

- **`hello@ergoflo.tech` does not exist yet.** Owning the domain does not give
  you a mailbox — MX records and a mail host are separate. That address is
  published on `/privacy` and `/terms` as the route for data deletion and
  disputes, and a legal page naming an address that bounces is worse than one
  naming none. Set up mail before launch.
- **HSTS `preload` is asserted** in `next.config.ts`. That header is harmless
  until you actually submit the domain to the browser preload list — but
  submission is close to irreversible (removal takes months and ships with the
  browser). Don't submit until you're certain every `ergoflo.tech` subdomain
  will be HTTPS-only, forever.
