#!/bin/bash
set -euo pipefail

# SessionStart hook — environment setup.
# Works in both local devcontainer and CC Web environments.

# Install GitHub CLI if not already present (needed on CC Web; pre-installed in devcontainer)
if ! command -v gh &>/dev/null; then
  GH_VERSION="2.86.0"
  curl -fsSL "https://github.com/cli/cli/releases/download/v${GH_VERSION}/gh_${GH_VERSION}_linux_amd64.tar.gz" -o /tmp/gh.tar.gz
  tar -xzf /tmp/gh.tar.gz -C /tmp
  cp "/tmp/gh_${GH_VERSION}_linux_amd64/bin/gh" /usr/local/bin/gh
  rm -rf /tmp/gh.tar.gz "/tmp/gh_${GH_VERSION}_linux_amd64"
fi

# CC Web only: export GH_REPO so gh CLI works despite the git proxy.
# The proxy remote is http://local_proxy@127.0.0.1:PORT/git/OWNER/REPO
# gh can't detect the repo from this, but GH_REPO env var overrides that.
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  REPO=$(git -C "$CLAUDE_PROJECT_DIR" remote get-url origin 2>/dev/null | sed -n 's|.*/git/\(.*\)$|\1|p')
  if [ -n "$REPO" ]; then
    echo "export GH_REPO=$REPO" >> "$CLAUDE_ENV_FILE"
  fi
fi
