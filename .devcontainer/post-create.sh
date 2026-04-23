#!/usr/bin/env bash
# Local devcontainer post-create setup (Jörn's Ubuntu desktop).

set -euo pipefail

echo "Local devcontainer post-create..."

# Ensure user directories exist and are owned by the dev user.
# Use chown without -R: bind-mounted caches can be
# gigabytes and recursive chown would hang for minutes.
sudo mkdir -p \
  "${HOME}/.config" \
  "${HOME}/.local" \
  "${HOME}/.cache"
sudo chown "${USER}:${USER}" \
  "${HOME}/.config" \
  "${HOME}/.local" \
  "${HOME}/.cache"

# Fix ownership of Docker volume mounts (created as root by default)
sudo chown "${USER}:${USER}" "${HOME}/.vscode" 2>/dev/null || true

# Configure npm paths and install Codex CLI
if command -v npm >/dev/null 2>&1; then
  mkdir -p "${HOME}/.local/bin" "${HOME}/.cache/npm"
  npm config set prefix "${HOME}/.local"
  npm config set cache "${HOME}/.cache/npm"
  npm install -g @openai/codex
fi

# Codex: idempotently seed project trust so repo-level `.codex/config.toml`,
# `.codex/agents/`, and `.agents/skills/` are loaded.
mkdir -p "${HOME}/.codex"
CODEX_USER_CONFIG="${HOME}/.codex/config.toml"
touch "$CODEX_USER_CONFIG"
if ! grep -qF 'projects."/workspaces/dnd-claude-code"' "$CODEX_USER_CONFIG"; then
  printf '\n[projects."/workspaces/dnd-claude-code"]\ntrust_level = "trusted"\n' >> "$CODEX_USER_CONFIG"
fi

# Configure git credentials via GitHub CLI
if command -v gh >/dev/null 2>&1; then
  gh auth setup-git || true
fi

# Verify tools
echo "code-tunnel: $(code-tunnel --version 2>/dev/null || echo 'not found')"
echo "codex: $(codex --version 2>/dev/null || echo 'not found')"
echo "node: $(node -v 2>/dev/null || echo 'not found')"
echo "npm: $(npm -v 2>/dev/null || echo 'not found')"

# Run warmup cache in background
nohup .devcontainer/warmup-cache.sh >> "${HOME}/.cache/warmup.log" 2>&1 &

# Source .env into shell profile (secrets like FAL_KEY)
DOTENV_SOURCE='
# Load project .env if present
if [ -f /workspaces/dnd-claude-code/.env ]; then
  set -a; source /workspaces/dnd-claude-code/.env; set +a
fi'
if ! grep -q 'source /workspaces/dnd-claude-code/.env' "${HOME}/.bashrc" 2>/dev/null; then
  echo "$DOTENV_SOURCE" >> "${HOME}/.bashrc"
fi

# Decrypt SotS rulebook if SOTS_KEY is available in the environment or .env.
bash /workspaces/dnd-claude-code/scripts/decrypt-rulebook.sh || true

echo "Local post-create complete."
