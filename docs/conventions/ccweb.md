# Claude Code Web (CCWeb) Limitations

This project is primarily used in CCWeb. Known limitations and workarounds.

## Environment Detection

```bash
if [[ -n "${CLAUDE_CODE_REMOTE:-}" ]]; then
    echo "Running in CCWeb"
fi
```

## Known Issues

| Issue | Status | Workaround |
|-------|--------|------------|
| apt-get | Broken (DNS proxy) | Direct binary download via curl |
| Skills auto-loading | Broken | SessionStart hook prints descriptions |
| gh CLI | Not pre-installed | Installed via tarball in SessionStart |
| Playwright | Broken (no browsers) | None - avoid browser tests |
| Some npm installs | Intermittent | Retry or use pre-built binaries |

## SessionStart Hook

The `.claude/hooks/session-start.sh` script handles CCWeb-specific setup:

1. Prints campaign quick reference (recent sessions, NPCs)
2. Lists available skills with descriptions (workaround for broken auto-loading)
3. Lists available agents
4. Installs gh CLI if missing (CCWeb only)

## Installing Tools

### gh CLI

Handled automatically by SessionStart hook. Manual install:

```bash
curl -sL https://github.com/cli/cli/releases/download/v2.63.2/gh_2.63.2_linux_amd64.tar.gz -o /tmp/gh.tar.gz
tar -xzf /tmp/gh.tar.gz -C /tmp
sudo cp /tmp/gh_2.63.2_linux_amd64/bin/gh /usr/local/bin/
```

### Other Tools

For tools that need installation, prefer:
1. Direct binary download (curl + tar)
2. npm global install (sometimes works)
3. Pre-built in container (not available in CCWeb)

## What Works

- Git operations (with env vars configured in settings.json)
- Node.js / npm (mostly)
- Python 3
- Direct HTTP downloads (curl to most hosts)
- Task() subagents
- Custom agents (appear in Task tool description)
- Grep, Glob, Read, Write, Edit tools

## Skills vs Agents in CCWeb

| Type | Works in CCWeb? | Solution |
|------|-----------------|----------|
| Skills (auto-load) | No | SessionStart prints descriptions |
| Agents (Task tool) | Yes | Use normally |

For skills that should run as agents (e.g., session-handoff), consider converting to `.claude/agents/` format.

## Settings Configuration

The `.claude/settings.json` includes CCWeb-friendly configuration:

```json
{
  "env": {
    "GIT_TERMINAL_PROMPT": "0",
    "GIT_SSH_COMMAND": "ssh -oBatchMode=yes",
    "GIT_ASKPASS": "/bin/true",
    "GCM_INTERACTIVE": "Never",
    "GIT_PAGER": "cat",
    "GIT_EDITOR": "true"
  }
}
```

These prevent git from hanging on prompts in the headless environment.
