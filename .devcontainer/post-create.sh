#!/usr/bin/env bash
# Local devcontainer post-create setup (Jörn's Ubuntu desktop).

set -euo pipefail

echo "Local devcontainer post-create..."

# Ensure user directories exist and are owned by the dev user.
# Use chown without -R: bind-mounted caches (.cache/npm, .claude) can be
# gigabytes and recursive chown would hang for minutes.
sudo mkdir -p \
  "${HOME}/.config" \
  "${HOME}/.local" \
  "${HOME}/.cache"
sudo chown "${USER}:${USER}" \
  "${HOME}/.config" \
  "${HOME}/.local" \
  "${HOME}/.cache"

# Configure npm paths
if command -v npm >/dev/null 2>&1; then
  mkdir -p "${HOME}/.local/bin" "${HOME}/.cache/npm"
  npm config set prefix "${HOME}/.local"
  npm config set cache "${HOME}/.cache/npm"
fi

# Configure git credentials via GitHub CLI
if command -v gh >/dev/null 2>&1; then
  gh auth setup-git || true
fi

# Install Claude Code CLI
curl -fsSL https://claude.ai/install.sh | bash

# Verify tools
echo "code-tunnel: $(code-tunnel --version 2>/dev/null || echo 'not found')"
echo "node: $(node -v 2>/dev/null || echo 'not found')"
echo "npm: $(npm -v 2>/dev/null || echo 'not found')"

# Run warmup cache in background
nohup .devcontainer/warmup-cache.sh >> "${HOME}/.cache/warmup.log" 2>&1 &

echo "Local post-create complete."
