# Claude Code Best Practices Review

Review of Claude Code infrastructure practices comparing:
- **Anthropic official documentation** (code.claude.com/docs)
- **msc-viterbo** (JoernStoehler's thesis project, mature implementation)
- **dnd-claude-code** (this repository, current state)

Date: 2026-01-31

---

## Executive Summary

| Category | dnd-claude-code | msc-viterbo | Gap |
|----------|-----------------|-------------|-----|
| CLAUDE.md | Good structure, comprehensive | Progressive disclosure, tables | Minor |
| Skills | 4 defined, not loading in CCWeb | Not used (commands instead) | CCWeb bug |
| Agents | 2 defined, working | 6 commands, role-separated | Medium |
| Hooks | Empty | SessionStart with file index | **Major** |
| Settings | Empty permissions/env | Deny rules, git env vars | **Major** |
| Convention docs | Inline in CLAUDE.md | Separate docs/conventions/ | Medium |
| Context injection | None | file-index.py at startup | **Major** |

**Key finding:** The biggest gaps are infrastructure (hooks, settings, startup context), not content organization. dnd-claude-code has good content but limited automation.

---

## 1. CLAUDE.md Comparison

### Anthropic Recommendations

From official docs:
- Keep CLAUDE.md focused; use imports for details
- Include commands, code style, workflow rules
- Progressive disclosure: minimal always-loaded, detailed on-demand
- Update iteratively based on what agents get wrong

### msc-viterbo (143 lines)

Structure:
1. Context (project description, deadline, source of truth chain)
2. File Index (key locations table)
3. Quick Commands (copy-pasteable, organized by technology)
4. Agent Protocol (task workflow, escalation triggers)
5. Environment (brief, points to conventions)
6. Communication (how to interact with Jorn - unusual but valuable)

Key patterns:
- Source of truth chain: `thesis -> SPEC.md -> code -> tests -> comments`
- Explicit escalation triggers
- Copy-paste commands
- Points to `docs/conventions/` for details

### dnd-claude-code (current)

Structure:
1. Repository Layout (diagram, paths)
2. Campaign Structure
3. Core Conventions (precision, info states, hygiene)
4. Agent Capabilities/Limitations
5. Working with Subagents
6. Quick Reference (common tasks table)
7. File Naming
8. Environment

Strengths:
- "Information States" concept (nailed-down vs mutable) is excellent
- Clear agent capabilities/limitations section
- Good repository layout documentation

Gaps:
- No explicit escalation triggers
- No copy-paste commands section
- No "Communication" section for human-agent interaction style
- Longer than needed (could use more progressive disclosure)

### Assessment

| Aspect | dnd-claude-code | msc-viterbo |
|--------|-----------------|-------------|
| Length | ~180 lines | ~143 lines |
| Tables | 2 | 4 |
| Copy-paste commands | Few | Many |
| Escalation triggers | Implicit | Explicit list |
| Source of truth | Mentioned | Explicit chain |
| Progressive disclosure | Moderate | Strong |

**Rating:** Good foundation, needs refinement for agent efficiency.

---

## 2. Skills vs Commands

### Anthropic Recommendations

- Skills are the preferred approach (commands merging into skills)
- Skills have semantic matching for auto-loading
- Keep SKILL.md under 500 lines
- Use frontmatter for model selection, tool restrictions

### msc-viterbo

Uses `.claude/commands/` (legacy pattern):
- 6 agent prompts with `$ARGUMENTS` placeholder
- No YAML frontmatter
- Explicit note: "Skills auto-loading broken for multi-line prompts"

### dnd-claude-code

Uses `.claude/skills/` (modern pattern):
- 4 skills: session-handoff, dnd-5e-rules, create-agent, create-skill
- 2 agents: create-npc, lore-checker

**CCWeb bug confirmed:** Skills don't auto-load in Claude Code Web. Agents (which appear in Task tool description) DO work.

### Assessment

The skills vs commands distinction is less important than the CCWeb bug. In CCWeb:
- Skills: **Broken** (don't auto-load)
- Agents: **Working** (appear in Task tool)
- Commands: Untested but likely same as agents

**Recommendation:** For CCWeb, convert critical skills to agents or inject via SessionStart hook.

---

## 3. Hooks Configuration

### Anthropic Recommendations

Hooks available:
- `SessionStart` - runs on startup (source: startup/resume/compact/clear)
- `PostToolUse` - runs after specific tools
- `UserPromptSubmit` - runs before user messages sent
- `Stop` - runs when agent completes

Hook structure:
```json
{
  "hooks": {
    "SessionStart": [{
      "matcher": {},
      "hooks": [{"type": "command", "command": "script.sh"}]
    }]
  }
}
```

### msc-viterbo

```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "bash -lc \"$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh\""
      }]
    }]
  }
}
```

session-start.sh:
1. Checks source (only runs on "startup", not resume/compact/clear)
2. Prints compressed file index (all environments)
3. Installs gh CLI in CCWeb (`CLAUDE_CODE_REMOTE=true`)

### dnd-claude-code

```json
{
  "hooks": {},
  "permissions": {}
}
```

**Empty.** No startup hook, no context injection.

### Assessment

**This is the biggest gap.** msc-viterbo's startup hook:
- Gives agents immediate codebase awareness
- Handles CCWeb-specific setup (gh CLI install)
- Reduces orientation time

Without this, dnd-claude-code agents start "cold" every session.

---

## 4. Settings/Permissions

### Anthropic Recommendations

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)"],
    "deny": ["Read(.env)", "Read(**/secrets/**)"],
    "ask": ["Bash(git push *)"]
  },
  "env": {
    "VARIABLE": "value"
  }
}
```

Deny rules prevent accidental exposure of secrets.
Env vars configure tools for non-interactive operation.

### msc-viterbo

```json
{
  "permissions": {
    "deny": ["Read(.env)", "Read(.env.*)", "Read(**/secrets/**)"]
  },
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

Key features:
- Denies reading .env files and secrets directories
- Configures git to never prompt (fails instead of hanging)

### dnd-claude-code

```json
{
  "permissions": {},
  "hooks": {}
}
```

**Empty.** No deny rules, no env configuration.

### Assessment

**Medium-high gap.** Without deny rules:
- Agents could accidentally read/expose sensitive files
- Git operations might hang waiting for input

For a D&D campaign, relevant deny patterns:
- `Read(**/dm-secrets/**)` - DM-only plot twists
- `Read(**/player-backstory-reveals/**)` - spoilers

---

## 5. Context Injection (File Index)

### Anthropic Recommendations

From best practices:
- Context window fills fast; performance degrades as it fills
- Give Claude orientation at start of complex tasks
- Use compact representations

### msc-viterbo

`scripts/file-index.py`:
- Generates ~20-30 line compressed repo structure
- Uses brace expansion: `{mod,lib,util}.rs` instead of listing each
- Printed at session start via hook

`scripts/repo-map.py`:
- More detailed tree view with auto-collapse
- Configurable: must_show, skip_names, hide_names, budget_lines

### dnd-claude-code

**None.** Agents must explore the repo themselves each session.

### Assessment

**Major gap for agent productivity.** Without startup context:
- Each session starts with agent exploring
- Wastes tokens on repeated orientation
- Agent may miss relevant files

A D&D-specific file index could show:
- Recent session logs (date range, count)
- Active NPCs (list or count)
- Campaign structure at a glance

---

## 6. Agent Architecture

### Anthropic Recommendations

From docs:
- Use Task() for focused subtasks
- Provide complete context (subagents don't see history)
- Available types: Explore, Plan, Bash, general-purpose
- Can create custom agents in `.claude/agents/`

### msc-viterbo

5 distinct agent roles (human orchestrated):
1. **Project Manager** - creates issues, worktrees, prompts
2. **Planner** - investigates, produces SPEC.md
3. **Spec Reviewer** - quality gate for specs
4. **Developer** - implements frozen spec
5. **Reviewer** - verifies implementation

Key patterns:
- Human as hub (only Jorn spawns agents)
- Frozen specs (devs can't change their criteria)
- File-based communication (specs, PRs, not conversation)
- Explicit escalation triggers

"Focus budget" model: Agents have limited cognitive bandwidth; splitting work into stages prevents degradation.

### dnd-claude-code

2 agents:
1. **create-npc** - generates NPCs with personality, stats
2. **lore-checker** - verifies consistency

Both are working in CCWeb (appear in Task tool description).

### Assessment

**Medium gap.** dnd-claude-code has agents, but:
- Only 2 defined (could have more specialized roles)
- No explicit orchestration pattern
- No frozen-spec/quality-gate workflow

For D&D, potential additional agents:
- Session prep planner
- Encounter designer
- Recap writer
- Voice writer (dialogue in character)

---

## 7. Convention Documentation

### msc-viterbo

`docs/conventions/` directory with 10 focused documents:
- arxiv-papers.md (73 lines)
- environments.md (80 lines)
- github-issues.md (89 lines)
- python-experiments.md (116 lines)
- etc.

Each follows pattern:
1. Title + one-liner
2. Commands section
3. Tables for structured info
4. Philosophy/Why section
5. Templates where applicable

### dnd-claude-code

Conventions embedded in:
- Root CLAUDE.md
- Campaign-specific CLAUDE.md

No separate convention documents.

### Assessment

**Medium gap.** Inline conventions work but:
- Harder to maintain as they grow
- Can't load selectively
- Mix of meta (Claude Code setup) and domain (D&D content)

Potential convention docs for D&D:
- session-logs.md (format, what to include)
- npc-creation.md (template, motivation guidelines)
- encounter-design.md (balance, pacing)
- info-states.md (nailed-down vs mutable tracking)

---

## 8. CCWeb-Specific Issues

### Confirmed Issues

| Issue | Status | Workaround |
|-------|--------|------------|
| apt-get broken | Confirmed | Direct binary download |
| Skills don't load | Confirmed | Use agents instead, or SessionStart hook |
| gh CLI not installed | Confirmed | Install via tarball in SessionStart |
| DNS/proxy issues | Confirmed | Some downloads work, apt doesn't |

### msc-viterbo Documentation

From `docs/conventions/environments.md`:
```
CC Web Limitations:
- apt-get, https don't work (DNS blocked by proxy)
- Skills are broken (not auto-loaded)
- Playwright is broken (browsers not installed)
```

Environment detection:
```bash
if [[ -n "${CLAUDE_CODE_REMOTE:-}" ]]; then
  echo "CC Web"
fi
```

### dnd-claude-code

CCWeb limitations not documented.

### Assessment

**Should document CCWeb workarounds** for future agents:
- How to install tools (tarball method)
- What works vs doesn't work
- Environment detection pattern

---

## 9. Summary: Gap Analysis

### Critical Gaps (High impact, relatively easy to fix)

1. **No SessionStart hook** - agents start cold every session
2. **Empty permissions** - no protection against reading secrets
3. **No git env vars** - git might hang on prompts
4. **No file index** - repeated orientation overhead

### Medium Gaps (Worth addressing)

5. **Limited agents** - only 2 defined, could have more specialized roles
6. **Skills don't work in CCWeb** - need to convert or work around
7. **No convention docs** - conventions inline in CLAUDE.md
8. **No CCWeb documentation** - workarounds not recorded

### Minor Gaps (Nice to have)

9. **CLAUDE.md could be more compact** - more tables, fewer prose paragraphs
10. **No explicit escalation triggers** - agents may not know when to ask
11. **No postmortem workflow** - no systematic improvement process

---

## Appendix: Sources

### Anthropic Documentation
- https://code.claude.com/docs/en/best-practices
- https://code.claude.com/docs/en/plugins-reference
- https://code.claude.com/docs/en/settings
- https://code.claude.com/docs/en/hooks-guide
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/memory

### msc-viterbo Repository
- https://github.com/JoernStoehler/msc-viterbo
- Cloned and analyzed 2026-01-31
