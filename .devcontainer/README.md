# Devcontainer

Local devcontainer for `dnd-claude-code` on Jörn's Ubuntu desktop. This is the
primary runtime for Codex CLI sessions.

## Architecture

The container provides:

- Codex CLI
- GitHub CLI
- Python 3 and `uv`
- Node.js/npm
- image and PDF tools used by session handout scripts
- VS Code tunnel CLI

Runtime state that must survive rebuilds lives outside the git checkout:

| Host path | Container path | Purpose |
|-----------|----------------|---------|
| `/srv/devhome/.codex` | `~/.codex` | Codex config, sessions, credentials |
| `/srv/devhome/.config/gh` | `~/.config/gh` | GitHub CLI auth |
| `/srv/devhome/.cache/npm` | `~/.cache/npm` | npm cache |
| `/srv/devhome/.bash_history_dir` | `~/.bash_history_dir` | shell history |
| Docker volume `dnd-claude-code-vscode` | `~/.vscode` | VS Code tunnel auth |

## Host Commands

```bash
# Rebuild image and recreate the container
bash .devcontainer/host-devcontainer-rebuild.sh

# Start VS Code tunnel into the container
bash .devcontainer/host-vscode-tunnel.sh
```

## Codex Trust

`post-create.sh` appends this machine-local trust entry if missing:

```toml
[projects."/workspaces/dnd-claude-code"]
trust_level = "trusted"
```

That lets Codex load repo-tracked `.codex/config.toml`, `.codex/agents/`, and
`.agents/skills/`.

## Rulebook Decryption

The plaintext SotS rulebook is gitignored. Rebuilds and fresh shells can decrypt
it when `SOTS_KEY` is available:

```bash
bash scripts/decrypt-rulebook.sh
```
