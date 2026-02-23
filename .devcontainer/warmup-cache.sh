#!/usr/bin/env bash
set -euo pipefail

# Background cache warming.
# Runs npm install in each packages/ directory to populate node_modules.
#
# Designed to run in background (nohup ... &) during container startup.
# Progress logged to ~/.cache/warmup.log.

if [[ ${1:-} == "--help" || ${1:-} == "-h" ]]; then
  cat <<'EOF'
Usage: .devcontainer/warmup-cache.sh

Background cache warming.
Runs npm install in each packages/ dir that has a package.json.

Designed to run in background (nohup ... &) during container startup.
Progress logged to ~/.cache/warmup.log.
EOF
  exit 0
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

log() {
  echo "[warmup-cache][$(date -Iseconds)] $*"
}

log "Starting cache warmup..."

for pkg_dir in packages/*/; do
  if [[ -f "${pkg_dir}package.json" ]]; then
    log "Installing deps for ${pkg_dir}..."
    if (cd "$pkg_dir" && npm install --prefer-offline); then
      log "${pkg_dir} done."
    else
      log "WARNING: npm install failed in ${pkg_dir} (non-fatal)."
    fi
  fi
done

log "Cache warmup complete."
