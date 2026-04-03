# .devcontainer/CLAUDE.md

Local devcontainer for Jörn's Ubuntu desktop. PRIMARY ENVIRONMENT.
Claude Code on the web uses the session-start hook at `.claude/hooks/session-start.sh` instead.

## Files

```
.devcontainer/
  devcontainer.json          # Container config (mounts, env vars, memory limits)
  Dockerfile                 # Image build (Node.js, Python, CLI tools)
  post-create.sh             # Runtime setup (npm, gh auth, Claude Code)
  warmup-cache.sh            # Background cache warming (npm install per package)
  host-devcontainer-rebuild.sh  # Host-side: rebuild image + recreate container
  host-vscode-tunnel.sh      # Host-side: launch VS Code tunnel
```

Worktree management via Claude Code hooks (`.claude/hooks/worktree-{create,remove}.sh`).

## Dependencies

For system dependencies: `Dockerfile` and `post-create.sh`.
Each package manages its own npm dependencies via `package.json`.

## Python scripts

`uv` is installed in the image. Scripts in `scripts/` use inline dependency metadata (`# /// script` headers) so `uv run scripts/build-cards.py` auto-installs what's needed. For plain `python3`, the Dockerfile pre-installs the C libraries that weasyprint requires; Python packages must be available on the system or installed via `uv`.
