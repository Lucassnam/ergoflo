#!/usr/bin/env bash
# ============================================================
# ErgoFlo landing — deploy / update the EC2 box.
#
#   ./deploy.sh              pull, rebuild, restart, verify HTTPS
#   ./deploy.sh bootstrap    one-time: install Docker + clone the repo
#   ./deploy.sh status       what's running
#   ./deploy.sh logs [svc]   follow logs (web | caddy; default: both)
#   ./deploy.sh restart      restart containers WITHOUT rebuilding
#   ./deploy.sh ssh          drop into a shell on the server
#   ./deploy.sh certs        show the issued certificate + expiry
#
# Reads connection settings from ./deploy.env — copy deploy.env.example
# and fill it in. That file is gitignored; it names your server.
#
# The build runs ON THE SERVER (git pull → docker compose build), so a
# deploy uploads nothing but an SSH command. Whatever is committed and
# pushed is what ships — uncommitted local edits are NOT deployed.
# ============================================================
set -Eeuo pipefail

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly ENV_FILE="${SCRIPT_DIR}/deploy.env"

# --- output ----------------------------------------------------------
if [[ -t 1 ]]; then
	readonly C_RESET=$'\033[0m' C_DIM=$'\033[2m' C_RED=$'\033[31m'
	readonly C_GREEN=$'\033[32m' C_YELLOW=$'\033[33m' C_BOLD=$'\033[1m'
else
	readonly C_RESET='' C_DIM='' C_RED='' C_GREEN='' C_YELLOW='' C_BOLD=''
fi

step() { printf '\n%s==>%s %s%s%s\n' "$C_GREEN" "$C_RESET" "$C_BOLD" "$*" "$C_RESET"; }
info() { printf '%s    %s%s\n' "$C_DIM" "$*" "$C_RESET"; }
warn() { printf '%s !! %s%s\n' "$C_YELLOW" "$*" "$C_RESET" >&2; }
die() {
	printf '\n%serror:%s %s\n' "$C_RED" "$C_RESET" "$*" >&2
	exit 1
}

trap 'die "failed on line $LINENO — nothing further was run."' ERR

# --- config ----------------------------------------------------------
load_config() {
	[[ -f "$ENV_FILE" ]] || die "no deploy.env found.
  Copy the template and fill it in:
      cp deploy.env.example deploy.env"

	# shellcheck disable=SC1090
	set -a && source "$ENV_FILE" && set +a

	local missing=()
	for var in DEPLOY_HOST DEPLOY_USER DEPLOY_PATH DEPLOY_BRANCH DEPLOY_DOMAIN; do
		[[ -n "${!var:-}" ]] || missing+=("$var")
	done
	((${#missing[@]} == 0)) || die "deploy.env is missing: ${missing[*]}"

	SSH_OPTS=(-o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new)
	if [[ -n "${DEPLOY_KEY:-}" ]]; then
		# Expand a leading ~ ourselves; it is not expanded inside a variable.
		local key="${DEPLOY_KEY/#\~/$HOME}"
		[[ -f "$key" ]] || die "DEPLOY_KEY does not exist: $key"
		SSH_OPTS+=(-i "$key")
	fi
	[[ -n "${DEPLOY_PORT:-}" ]] && SSH_OPTS+=(-p "$DEPLOY_PORT")

	readonly TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"
}

# Run a script (stdin) on the server with the deploy vars in scope.
remote() {
	ssh "${SSH_OPTS[@]}" "$TARGET" \
		"DEPLOY_PATH=$(printf %q "$DEPLOY_PATH") \
		 DEPLOY_BRANCH=$(printf %q "$DEPLOY_BRANCH") \
		 DEPLOY_DOMAIN=$(printf %q "$DEPLOY_DOMAIN") \
		 bash -s"
}

# Interactive (TTY) remote command — for logs and shells.
remote_tty() {
	ssh -t "${SSH_OPTS[@]}" "$TARGET" "$1"
}

# --- commands --------------------------------------------------------

cmd_deploy() {
	step "Deploying to ${TARGET}:${DEPLOY_PATH} (branch ${DEPLOY_BRANCH})"

	# Catch the most common own-goal before touching the server: pushing
	# is what deploys, so unpushed commits mean you ship the old code and
	# spend ten minutes wondering why the change isn't live.
	if git -C "$SCRIPT_DIR" rev-parse --git-dir >/dev/null 2>&1; then
		local ahead
		ahead=$(git -C "$SCRIPT_DIR" rev-list --count \
			"origin/${DEPLOY_BRANCH}..${DEPLOY_BRANCH}" 2>/dev/null || echo 0)
		((ahead == 0)) || warn "${ahead} local commit(s) on ${DEPLOY_BRANCH} are not pushed. The server pulls from origin — push first or they won't ship."
		if [[ -n "$(git -C "$SCRIPT_DIR" status --porcelain)" ]]; then
			warn "you have uncommitted changes. They will NOT be deployed."
		fi
	fi

	remote <<-'REMOTE'
		set -Eeuo pipefail

		cd "$DEPLOY_PATH" 2>/dev/null || {
		  echo "error: $DEPLOY_PATH not found on the server. Run './deploy.sh bootstrap' first." >&2
		  exit 1
		}

		# Without this the app boots with no Supabase client and every
		# waitlist signup fails, and Caddy has no ACME contact address.
		# Better to refuse the deploy than to serve a broken form.
		[ -f .env.production ] || {
		  echo "error: .env.production missing in $DEPLOY_PATH." >&2
		  echo "       Create it from .env.production.example — it holds SUPABASE_URL," >&2
		  echo "       SUPABASE_SECRET_KEY and ACME_EMAIL, and is never committed." >&2
		  exit 1
		}

		echo "--> fetching origin/$DEPLOY_BRANCH"
		git fetch --prune origin
		# Hard reset, not merge: this checkout is a deploy artifact, not a
		# workspace. Anything edited on the server is discarded here.
		git checkout -q "$DEPLOY_BRANCH"
		git reset --hard -q "origin/$DEPLOY_BRANCH"
		echo "    now at $(git log -1 --format='%h %s')"

		echo "--> building and restarting"
		docker compose up -d --build --remove-orphans

		echo "--> pruning images older than a week"
		docker image prune -f --filter "until=168h" >/dev/null

		docker compose ps
	REMOTE

	verify_https
}

# The deploy is not finished until the public URL actually answers over
# TLS. `docker compose ps` showing "running" proves nothing about DNS,
# the security group, or certificate issuance.
verify_https() {
	step "Verifying https://${DEPLOY_DOMAIN}"

	local code=""
	for attempt in 1 2 3 4 5 6 7 8 9 10; do
		code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 \
			"https://${DEPLOY_DOMAIN}" 2>/dev/null || echo "000")
		[[ "$code" == "200" ]] && break
		info "attempt ${attempt}/10 → ${code}; retrying in 6s"
		sleep 6
	done

	if [[ "$code" == "200" ]]; then
		printf '\n%s✓ live:%s https://%s\n' "$C_GREEN" "$C_RESET" "$DEPLOY_DOMAIN"
	else
		warn "https://${DEPLOY_DOMAIN} returned '${code}' after 10 attempts."
		cat >&2 <<-EOF

		  Where to look, in order:
		    000 / timeout  DNS not pointing at the box, or the EC2 security
		                   group is not allowing 443 (and 80) from 0.0.0.0/0.
		    502            Caddy is up, the app is not — ./deploy.sh logs web
		    TLS error      certificate not issued yet — ./deploy.sh logs caddy
		                   and grep for 'obtain'. First issuance is usually
		                   under a minute once DNS resolves.
		EOF
		exit 1
	fi
}

cmd_bootstrap() {
	step "One-time server setup on ${TARGET}"
	cat <<-EOF
	  This installs Docker Engine + the compose plugin from Docker's
	  official apt repository and clones the repo into ${DEPLOY_PATH}.
	  It changes system packages on that machine.
	EOF
	read -r -p "Continue? [y/N] " reply
	[[ "$reply" =~ ^[Yy]$ ]] || die "aborted."

	local repo
	repo=$(git -C "$SCRIPT_DIR" remote get-url origin)

	ssh "${SSH_OPTS[@]}" "$TARGET" \
		"DEPLOY_PATH=$(printf %q "$DEPLOY_PATH") \
		 DEPLOY_BRANCH=$(printf %q "$DEPLOY_BRANCH") \
		 REPO_URL=$(printf %q "$repo") bash -s" <<-'REMOTE'
		set -Eeuo pipefail

		# $USER is not reliably exported to a non-login ssh session.
		ME="$(id -un)"

		if ! command -v docker >/dev/null 2>&1; then
		  # Ubuntu/Debian AMIs use apt; Amazon Linux 2023 uses dnf and ships
		  # its own docker package. Handle both — which AMI is in use is not
		  # something this script gets to assume.
		  if command -v apt-get >/dev/null 2>&1; then
		    echo "--> installing Docker Engine (apt / Docker official repo)"
		    sudo apt-get update -qq
		    sudo apt-get install -y -qq ca-certificates curl git
		    sudo install -m 0755 -d /etc/apt/keyrings
		    DISTRO="$(. /etc/os-release && echo "$ID")"
		    sudo curl -fsSL "https://download.docker.com/linux/${DISTRO}/gpg" \
		      -o /etc/apt/keyrings/docker.asc
		    sudo chmod a+r /etc/apt/keyrings/docker.asc
		    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/${DISTRO} $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" \
		      | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
		    sudo apt-get update -qq
		    sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io \
		      docker-buildx-plugin docker-compose-plugin
		  elif command -v dnf >/dev/null 2>&1; then
		    echo "--> installing Docker (dnf / Amazon Linux)"
		    sudo dnf install -y -q docker git
		    sudo systemctl enable --now docker
		    # AL2023's docker package has no compose plugin; fetch the
		    # standalone binary into the CLI plugin directory so that
		    # `docker compose` (not `docker-compose`) works the same way.
		    ARCH="$(uname -m)"
		    sudo mkdir -p /usr/libexec/docker/cli-plugins
		    sudo curl -fsSL \
		      "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-${ARCH}" \
		      -o /usr/libexec/docker/cli-plugins/docker-compose
		    sudo chmod +x /usr/libexec/docker/cli-plugins/docker-compose
		  else
		    echo "error: no apt-get or dnf on this host — install Docker manually." >&2
		    exit 1
		  fi
		  # So docker works without sudo. Requires a new login to take effect.
		  sudo usermod -aG docker "$ME"
		else
		  echo "--> Docker already installed: $(docker --version)"
		fi

		sudo systemctl enable --now docker 2>/dev/null || true

		if [ ! -d "$DEPLOY_PATH/.git" ]; then
		  echo "--> cloning into $DEPLOY_PATH"
		  sudo mkdir -p "$DEPLOY_PATH"
		  sudo chown "$ME:$ME" "$DEPLOY_PATH"
		  # If the repo is private this prompts for credentials and will
		  # hang a non-interactive ssh. See docs/DEPLOY.md — use a deploy
		  # key or a PAT in the remote URL.
		  git clone --branch "$DEPLOY_BRANCH" "$REPO_URL" "$DEPLOY_PATH"
		else
		  echo "--> repo already present at $DEPLOY_PATH"
		fi

		echo
		echo "Bootstrap done. Two things left, both by hand:"
		echo "  1. Create $DEPLOY_PATH/.env.production with SUPABASE_URL,"
		echo "     SUPABASE_SECRET_KEY and ACME_EMAIL."
		echo "     Template: $DEPLOY_PATH/.env.production.example"
		echo "  2. Log out and back in so the docker group applies."
	REMOTE

	step "Then run: ./deploy.sh"
}

cmd_status() {
	remote <<-'REMOTE'
		set -Eeuo pipefail
		cd "$DEPLOY_PATH"
		docker compose ps
		echo
		echo "commit: $(git log -1 --format='%h %s (%cr)')"
		echo "disk:   $(df -h / | awk 'NR==2 {print $4" free of "$2}')"
	REMOTE
}

cmd_logs() {
	local svc="${1:-}"
	remote_tty "cd $(printf %q "$DEPLOY_PATH") && docker compose logs -f --tail=100 ${svc}"
}

cmd_restart() {
	step "Restarting containers (no rebuild)"
	remote <<-'REMOTE'
		set -Eeuo pipefail
		cd "$DEPLOY_PATH"
		docker compose restart
		docker compose ps
	REMOTE
	verify_https
}

cmd_certs() {
	step "Certificate for ${DEPLOY_DOMAIN}"
	# Read it off the live endpoint rather than out of the volume — this
	# is what a browser actually gets.
	echo | openssl s_client -servername "$DEPLOY_DOMAIN" \
		-connect "${DEPLOY_DOMAIN}:443" 2>/dev/null |
		openssl x509 -noout -issuer -subject -dates ||
		die "could not read a certificate from ${DEPLOY_DOMAIN}:443"
}

cmd_ssh() {
	remote_tty "cd $(printf %q "$DEPLOY_PATH") && exec \$SHELL -l"
}

# --- entrypoint ------------------------------------------------------
main() {
	local cmd="${1:-deploy}"
	shift || true

	case "$cmd" in
		deploy | bootstrap | status | logs | restart | certs | ssh) ;;
		-h | --help | help)
			sed -n '2,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
			exit 0
			;;
		*) die "unknown command '${cmd}'. Try: ./deploy.sh --help" ;;
	esac

	load_config
	"cmd_${cmd}" "$@"
}

main "$@"
