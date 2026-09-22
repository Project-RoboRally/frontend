#!/usr/bin/env bash
# Deploy this working tree to se2-h over SSH.
# The server is firewalled from GitHub; this never git pull/clone on the host
# and never copies GitHub tokens or SSH keys for github.com.
#
# Usage (from laptop, in the frontend repo):
#   ./scripts/deploy-se2-h.sh
#
# Optional env (SSH host, not an http URL):
#   DEPLOY_HOST=se2-h.compute.dtu.dk ./scripts/deploy-se2-h.sh
#   DEPLOY_USER=sXXXXXX ./scripts/deploy-se2-h.sh   # skips the username prompt

set -euo pipefail

ssh_host() {
  # ssh wants se2-h.compute.dtu.dk, not http://se2-h.compute.dtu.dk/
  local host="${1:-}"
  host="${host#http://}"
  host="${host#https://}"
  host="${host%%/*}"
  host="${host%%:*}"
  printf '%s' "$host"
}

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [[ -z "${DEPLOY_USER:-}" ]]; then
  read -rp "SSH username on se2-h: " DEPLOY_USER
fi
if [[ -z "${DEPLOY_USER}" ]]; then
  echo "Username is required." >&2
  exit 1
fi
DEPLOY_HOST="$(ssh_host "${DEPLOY_HOST:-se2-h.compute.dtu.dk}")"
REMOTE="${DEPLOY_USER}@${DEPLOY_HOST}"
STAGING="roborally-frontend-upload"
DEST="/opt/roborally-frontend"
API_URL="${NEXT_PUBLIC_API_URL:-http://se2-h.compute.dtu.dk:8080}"
NODE_BIN="/usr/local/bin/node"
NPM_BIN="/usr/local/bin/npm"

cd "$ROOT"

if [[ ! -f package.json ]]; then
  echo "Run this from the frontend repo (package.json not found)." >&2
  exit 1
fi

echo "Uploading ${ROOT} -> ${REMOTE}:~/${STAGING}"
rsync -az --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude 'out/' \
  --exclude 'coverage/' \
  --exclude '.env' \
  --exclude '.env.*' \
  --exclude '.DS_Store' \
  --exclude 'roborally-frontend-deploy.tgz' \
  --exclude '.devenv/' \
  --exclude '.direnv/' \
  ./ "${REMOTE}:~/${STAGING}/"

echo "Installing, building, and restarting on ${DEPLOY_HOST}"
# -t so sudo can ask for your se2-h password. Nothing GitHub-related is sent.
ssh -t "$REMOTE" "set -euo pipefail
  ${NODE_BIN} -v
  sudo mkdir -p '${DEST}'
  sudo rsync -a --delete \
    --exclude node_modules \
    --exclude .next \
    \"\$HOME/${STAGING}/\" '${DEST}/'
  sudo chown -R roborally-frontend:roborally-frontend '${DEST}'
  sudo -u roborally-frontend env \
    PATH=/usr/local/bin:/usr/bin \
    HOME='${DEST}' \
    bash -lc '
      set -euo pipefail
      cd ${DEST}
      ${NPM_BIN} ci --legacy-peer-deps
      export NODE_ENV=production
      export NEXT_PUBLIC_API_URL=${API_URL}
      ${NPM_BIN} run build
    '
  sudo systemctl restart roborally-frontend.service
  sudo systemctl --no-pager --full status roborally-frontend.service
"

echo "Deployed. Frontend: http://${DEPLOY_HOST}:3000"
echo "Logs: ssh ${REMOTE} 'sudo journalctl -u roborally-frontend.service -n 50 --no-pager'"
