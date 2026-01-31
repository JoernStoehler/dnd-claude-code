# Actionable Suggestions for Claude Code Best Practices

Prioritized suggestions for improving dnd-claude-code infrastructure to make Claude Code sessions more productive.

Date: 2026-01-31

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| **P0** | Critical - do first, highest impact/effort ratio |
| **P1** | High - significant improvement, reasonable effort |
| **P2** | Medium - worthwhile but can wait |
| **P3** | Low - nice to have, or uncertain value |

---

## P0: Critical Infrastructure

### 1. Add SessionStart Hook for Context Injection

**Problem:** Every session starts cold; agents waste time orienting.

**Solution:** Create `.claude/hooks/session-start.sh` that prints campaign context at startup.

**Implementation:**

```bash
#!/bin/bash
# .claude/hooks/session-start.sh
set -e

# Read hook input to check source
hook_input=$(cat)
source=$(echo "$hook_input" | jq -r '.source // "startup"')

# Only run on fresh startup, not resume/compact/clear
[ "$source" != "startup" ] && exit 0

echo "=== D&D Campaign Quick Reference ==="
echo ""

# Show active campaign
if [ -d "campaigns/fun-heroes" ]; then
    echo "Active: fun-heroes (D&D 5e one-shots)"
    echo ""
fi

# Recent sessions
echo "Recent Sessions:"
ls -t campaigns/*/sessions/*.md 2>/dev/null | grep -v template | head -3 | while read f; do
    echo "  - $(basename "$f" .md)"
done
echo ""

# Key NPCs
echo "Core NPCs:"
ls campaigns/*/characters/npcs/*.md 2>/dev/null | grep -v template | head -5 | while read f; do
    echo "  - $(basename "$f" .md)"
done
echo ""

# PROGRESS.md status if exists
if [ -f "campaigns/fun-heroes/PROGRESS.md" ]; then
    echo "Progress: See campaigns/fun-heroes/PROGRESS.md"
fi

echo ""
echo "=== End Quick Reference ==="

# CCWeb-specific: Install gh CLI if needed
if [ "$CLAUDE_CODE_REMOTE" = "true" ] && ! command -v gh &>/dev/null; then
    echo ""
    echo "[Installing gh CLI for CCWeb...]"
    curl -sL https://github.com/cli/cli/releases/download/v2.63.2/gh_2.63.2_linux_amd64.tar.gz -o /tmp/gh.tar.gz 2>/dev/null
    tar -xzf /tmp/gh.tar.gz -C /tmp 2>/dev/null
    sudo cp /tmp/gh_2.63.2_linux_amd64/bin/gh /usr/local/bin/ 2>/dev/null
    echo "[gh CLI installed]"
fi
```

Update `.claude/settings.json`:
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -lc \"$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh\""
          }
        ]
      }
    ]
  }
}
```

**Effort:** 30 min
**Impact:** High - every session benefits

---

### 2. Add Permission Deny Rules

**Problem:** Agents could accidentally read/expose sensitive files.

**Solution:** Add deny rules to settings.json.

**Implementation:**

```json
{
  "permissions": {
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Read(**/secrets/**)",
      "Read(**/.env)",
      "Read(**/*.pem)",
      "Read(**/*.key)"
    ]
  }
}
```

For D&D-specific secrets (if you add them later):
```json
{
  "permissions": {
    "deny": [
      "Read(**/dm-secrets/**)",
      "Read(**/player-reveals/**)"
    ]
  }
}
```

**Effort:** 5 min
**Impact:** Medium - prevents accidents, good hygiene

---

### 3. Add Git Environment Variables

**Problem:** Git operations might hang waiting for prompts in headless environments.

**Solution:** Configure git for non-interactive operation.

**Implementation:**

```json
{
  "env": {
    "GIT_TERMINAL_PROMPT": "0",
    "GIT_PAGER": "cat",
    "GIT_EDITOR": "true"
  }
}
```

Full recommended set (from msc-viterbo):
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

**Effort:** 5 min
**Impact:** Medium - prevents hangs, more reliable automation

---

## P1: High Priority Improvements

### 4. Convert Critical Skills to Agents (CCWeb Workaround)

**Problem:** Skills don't auto-load in CCWeb.

**Solution:** For skills that must work in CCWeb, create agent versions.

**Current skills:**
- `session-handoff` - Important, should be an agent
- `dnd-5e-rules` - Reference, less critical
- `create-agent` - Meta, rarely needed
- `create-skill` - Meta, rarely needed

**Implementation for session-handoff:**

Create `.claude/agents/session-handoff.md`:
```markdown
---
description: "Run at end of session to ensure proper handoff. Use when session is ending, work is paused, or switching contexts."
allowed_tools: ["Read", "Write", "Edit", "Grep", "Glob"]
model: sonnet
---

# Session Handoff Agent

Run this at the end of a work session to ensure clean handoff.

## Checklist

1. **Decisions to files**: Any decisions made during conversation should be in files, not just chat
2. **PROGRESS.md updated**: Current status, what was done, what's next
3. **Handoff notes**: Write clear notes for the next agent in PROGRESS.md
4. **Git commit**: If changes were made, commit with descriptive message
5. **Open questions**: Document any unresolved questions

## Process

1. Check what files were modified this session
2. Verify PROGRESS.md reflects current state
3. Add "Handoff Notes" section if not present
4. Create commit if uncommitted changes exist
```

**Effort:** 20 min per skill converted
**Impact:** High for CCWeb users

---

### 5. Add More Specialized Agents

**Problem:** Only 2 agents defined; could have more task-specific agents.

**Suggested additions:**

| Agent | Purpose | Priority |
|-------|---------|----------|
| `session-prep` | Prepare materials for upcoming session | P1 |
| `encounter-designer` | Design balanced combat encounters | P2 |
| `recap-writer` | Write player-facing session recap | P2 |
| `voice-writer` | Write dialogue in character voice | P3 |

**Implementation for session-prep:**

Create `.claude/agents/session-prep.md`:
```markdown
---
description: "Prepare materials for an upcoming D&D session. Use when planning a session, need encounter prep, or want to review what's needed."
allowed_tools: ["Read", "Write", "Edit", "Grep", "Glob"]
model: opus
---

# Session Prep Agent

Prepare materials for an upcoming session.

## Inputs Needed
- Session goal or theme (what should happen?)
- Which NPCs might appear
- Any specific encounters needed

## Workflow

1. Read last 2-3 session logs to understand current state
2. Check PROGRESS.md for planned plot points
3. Identify what content exists vs needs creation:
   - NPCs: Do they have sheets? Voice notes?
   - Locations: Described? Maps?
   - Encounters: Balanced? Prepared?
4. Create/update needed content
5. Write prep checklist to sessions/YYYY-MM-DD-prep.md

## Output
- List of ready materials
- List of gaps (with recommendations)
- Prep notes file
```

**Effort:** 30 min per agent
**Impact:** Medium-high - streamlines common workflows

---

### 6. Create File Index Script

**Problem:** No compact repo overview; agents explore from scratch.

**Solution:** Create `scripts/file-index.py` adapted for D&D content.

**Implementation:**

```python
#!/usr/bin/env python3
"""Generate compact file index for agent context."""

from pathlib import Path
import sys

def format_sessions(campaign_path: Path) -> list[str]:
    """Format session list compactly."""
    sessions = sorted(campaign_path.glob("sessions/*.md"))
    sessions = [s for s in sessions if "template" not in s.name]
    if not sessions:
        return []

    first = sessions[0].stem
    last = sessions[-1].stem
    return [f"  sessions: {first} ... {last} ({len(sessions)} total)"]

def format_npcs(campaign_path: Path) -> list[str]:
    """Format NPC list compactly."""
    npcs = list(campaign_path.glob("characters/npcs/*.md"))
    npcs = [n for n in npcs if "template" not in n.name]
    if not npcs:
        return []

    names = [n.stem for n in npcs[:5]]
    suffix = f" +{len(npcs)-5} more" if len(npcs) > 5 else ""
    return [f"  npcs: {', '.join(names)}{suffix}"]

def format_hooks(campaign_path: Path) -> list[str]:
    """Format hook/adventure list."""
    hooks = list(campaign_path.glob("sessions/hook-*.md"))
    if not hooks:
        return []

    names = [h.stem.replace("hook-", "") for h in hooks[:4]]
    suffix = f" +{len(hooks)-4} more" if len(hooks) > 4 else ""
    return [f"  hooks: {', '.join(names)}{suffix}"]

def main():
    root = Path(__file__).parent.parent
    print("[File Index]")
    print("")

    # Campaigns
    for campaign in sorted(root.glob("campaigns/*")):
        if not campaign.is_dir() or campaign.name == "example":
            continue

        print(f"Campaign: {campaign.name}")
        for line in format_sessions(campaign):
            print(line)
        for line in format_npcs(campaign):
            print(line)
        for line in format_hooks(campaign):
            print(line)
        print("")

    # Skills and agents
    skills = list(root.glob(".claude/skills/*/SKILL.md"))
    agents = list(root.glob(".claude/agents/*.md"))
    agents = [a for a in agents if a.name != "README.md"]

    if skills or agents:
        print("Claude Config:")
        if skills:
            names = [s.parent.name for s in skills]
            print(f"  skills: {', '.join(names)}")
        if agents:
            names = [a.stem for a in agents]
            print(f"  agents: {', '.join(names)}")
        print("")

    # Packages
    packages = list(root.glob("packages/*/package.json")) + list(root.glob("packages/*/CLAUDE.md"))
    if packages:
        pkg_names = set(p.parent.name for p in packages)
        print(f"Packages: {', '.join(sorted(pkg_names))}")
        print("")

if __name__ == "__main__":
    main()
```

**Effort:** 45 min
**Impact:** Medium - reduces orientation overhead

---

## P2: Medium Priority

### 7. Add CCWeb Documentation

**Problem:** CCWeb limitations not documented; future agents will hit same issues.

**Solution:** Create `docs/conventions/ccweb.md` documenting workarounds.

**Implementation:**

```markdown
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
| apt-get | Broken (DNS proxy) | Direct binary download |
| Skills | Broken (don't load) | Use agents instead |
| gh CLI | Not installed | Install via tarball in SessionStart |
| Playwright | Broken | None (no browser tests) |

## Installing Tools

gh CLI (in SessionStart hook):
```bash
curl -sL https://github.com/cli/cli/releases/download/v2.63.2/gh_2.63.2_linux_amd64.tar.gz -o /tmp/gh.tar.gz
tar -xzf /tmp/gh.tar.gz -C /tmp
sudo cp /tmp/gh_2.63.2_linux_amd64/bin/gh /usr/local/bin/
```

## What Works

- Git operations (with env vars configured)
- Node.js / npm
- Python 3
- Direct HTTP downloads (curl)
- Task() subagents
- Custom agents (appear in Task tool)
```

**Effort:** 20 min
**Impact:** Medium - helps future agents and humans

---

### 8. Create Convention Docs Directory

**Problem:** Conventions embedded in CLAUDE.md; harder to maintain.

**Solution:** Extract domain-specific conventions to separate files.

**Suggested structure:**
```
docs/conventions/
├── session-logs.md      # Format, what to include, examples
├── npc-creation.md      # Template, motivation guidelines
├── info-states.md       # Nailed-down vs mutable tracking
└── ccweb.md             # CCWeb limitations (above)
```

**Effort:** 1-2 hours total
**Impact:** Medium - cleaner organization, easier updates

---

### 9. Add Explicit Escalation Triggers to CLAUDE.md

**Problem:** Agents may not know when to stop and ask.

**Solution:** Add explicit escalation section.

**Implementation (add to CLAUDE.md):**

```markdown
## Escalation Triggers

Stop and ask the human when:
- **Canon conflict**: New content contradicts session logs
- **Player agency**: Decision affects PC backstory or choices
- **Tone uncertainty**: Unsure if content fits "chaotic comedy with heart"
- **Mechanical questions**: D&D rules edge cases (verify against source)
- **Scope creep**: Task expanding beyond original request
- **Blocked**: Can't proceed without information not in repo

A brief interruption beats a dead end.
```

**Effort:** 10 min
**Impact:** Medium - prevents wasted effort on wrong paths

---

## P3: Lower Priority / Uncertain Value

### 10. Postmortem Workflow

**Problem:** No systematic process for improving prompts based on what worked.

**Solution:** Create `.claude/agents/postmortem.md` for session reflection.

**Uncertainty:** Unclear if the overhead is worth it for a hobby project. msc-viterbo uses this because thesis work is high-stakes.

**If implemented:**
```markdown
---
description: "Reflect on a session to improve future workflows. Use at end of session or when something went wrong."
---

# Postmortem Agent

Reflect on the session to improve future work.

## Questions

1. **Friction**: What slowed you down?
2. **Unclear instructions**: What was confusing in CLAUDE.md or skills?
3. **Missing context**: What information wasn't provided?
4. **What worked well?**
5. **Suggested changes?**

Be concrete. "The prompt was unclear" is not useful.
"The NPC template didn't have a field for combat tactics" is useful.
```

**Effort:** 15 min
**Impact:** Uncertain - depends on whether findings are acted on

---

### 11. Source of Truth Chain

**Problem:** Implicit understanding of what's authoritative.

**Solution:** Add explicit chain to CLAUDE.md.

**Implementation:**

```markdown
## Source of Truth Chain

When content conflicts, trust in this order:
1. **Session logs** - What actually happened at the table (immutable)
2. **Character sheets** - Player characters, stated NPC details
3. **Lore documents** - World-building, factions, history
4. **Unrevealed plans** - Can be changed freely until revealed

If session log says X and lore doc says Y, session log wins.
```

**Effort:** 5 min
**Impact:** Low-medium - prevents some confusion

---

### 12. Add Copy-Paste Commands Section

**Problem:** CLAUDE.md has few ready-to-use commands.

**Solution:** Add commands section similar to msc-viterbo.

**Implementation:**

```markdown
## Quick Commands

**Find NPC:**
```bash
grep -r "npc-name" campaigns/fun-heroes/characters/
```

**Recent sessions:**
```bash
ls -t campaigns/fun-heroes/sessions/*.md | head -5
```

**Check lore consistency:**
```bash
# Use lore-checker agent via Task()
```

**Card generation:**
```bash
cd packages/card-generator && npm run generate -- ../campaigns/fun-heroes/cards/npc/example/
```
```

**Effort:** 15 min
**Impact:** Low - convenience improvement

---

## Implementation Order

Recommended sequence for maximum impact:

### Phase 1: Infrastructure (do now)
1. Update `.claude/settings.json` with permissions and env vars (5 min)
2. Create `.claude/hooks/session-start.sh` (30 min)
3. Test in new session

### Phase 2: CCWeb Fixes (this week)
4. Convert session-handoff skill to agent (20 min)
5. Create `docs/conventions/ccweb.md` (20 min)

### Phase 3: Agent Expansion (as needed)
6. Add session-prep agent when you need it
7. Add file-index.py if orientation overhead becomes annoying

### Phase 4: Organization (when CLAUDE.md gets unwieldy)
8. Extract conventions to separate docs
9. Add escalation triggers
10. Add source of truth chain

---

## Complete settings.json Example

Combining all P0 and P1 suggestions:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -lc \"$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh\""
          }
        ]
      }
    ]
  },
  "permissions": {
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Read(**/secrets/**)",
      "Read(**/.env)",
      "Read(**/*.pem)",
      "Read(**/*.key)"
    ]
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

---

## Questions for You

1. **Phase 1 now?** Should I implement the settings.json and session-start.sh changes in this session?

2. **Session-handoff priority?** Is this skill important enough to convert to an agent immediately?

3. **File index?** Worth the complexity, or is the simple session-start.sh output enough?

4. **Convention docs?** Do you want a docs/conventions/ structure, or keep things in CLAUDE.md?
