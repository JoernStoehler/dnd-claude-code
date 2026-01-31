# CLAUDE.md - Agent Onboarding

This repository supports collaborative preparation of fantasy TTRPG campaigns. Claude Code agents act as co-GMs who help outside of game sessions with planning, writing, and organization.

## Repository Layout

```
CLAUDE.md           # You are here - agent onboarding
README.md           # Brief overview for human visitors

campaigns/<name>/   # Individual campaigns (each has its own CLAUDE.md)
packages/<name>/    # Larger tools/applications (e.g., card-generator)
resources/          # Curated GM resources and references
scripts/            # Reusable scripts (sh, js, py)
docs/               # Conventions and notes

.claude/
  settings.json     # Hooks and configuration
  hooks/            # SessionStart and other hooks
  skills/<slug>/    # Progressive disclosure knowledge
  agents/<name>.md  # Specialized agent prompts
```

### Campaign Structure

Each campaign directory contains:
- `CLAUDE.md` - **Read this first** for campaign tone, philosophy, and guidelines
- `PROGRESS.md` - Current status and next steps
- `lore/` - World-building, factions, locations, history
- `characters/` - NPCs, player characters
- `sessions/` - Session logs, prep notes, hooks
- `encounters/` - Combat, puzzles, social challenges
- `assets/` - Images, maps, handouts

## Core Conventions

### Precision and Explicitness

- Use precise, clear language everywhere
- Write out implications explicitly - don't require agents to deduce
- "Present interesting information in a boring manner" - state facts plainly
- Example: Don't hint that a character is selfish; write "Motivation: selfish egoist"

### Information States

Track what information is "nailed down" (revealed to players) vs "mutable" (can still change):
- Session logs are the source of truth for what players know
- Unrevealed lore can be revised freely
- Once spoken at the table, it's canon

### Repository Hygiene

- Delete false or misleading content immediately
- New sessions start with zero project knowledge - onboarding must be accurate
- Keep documentation current; outdated docs cause mistakes
- Prefer editing existing files over creating new ones

### Source of Truth Chain

When content conflicts, trust in this order:
1. **Session logs** - What actually happened at the table (immutable)
2. **Character sheets** - Player characters, stated NPC details
3. **Lore documents** - World-building, factions, history
4. **Unrevealed plans** - Can be changed freely until revealed

If session log says X and lore doc says Y, session log wins.

### Escalation Triggers

Stop and ask the human when:
- **Canon conflict**: New content contradicts session logs
- **Player agency**: Decision affects PC backstory or choices
- **Tone uncertainty**: Unsure if content fits campaign tone
- **Mechanical questions**: D&D rules edge cases (verify against source)
- **Scope creep**: Task expanding beyond original request
- **Blocked**: Can't proceed without information not in repo

A brief interruption beats a dead end.

## Agent Capabilities and Limitations

### What Agents Do Well

- **Text**: Read/extract fast, imitate styles, give characters distinct voices
- **Search**: Index, summarize, grep across files for knowledge gathering
- **Reasoning**: Short-horizon planning, applying rules, checking consistency
- **Coding**: Automate bulk operations, write scripts, build tools
- **Knowledge**: Familiar with D&D, Pathfinder, VtM (with caveats below)

### What Agents Do Poorly

- **Images**: Cannot create directly, weak at judging quality/consistency
- **First drafts**: Often need revision, may fill gaps overconfidently
- **Long arcs**: May miss creative solutions, complex plans need human review
- **Rules precision**: Training mixes systems; verify mechanical details against source

## File Naming

- Dates: `YYYY-MM-DD` format
- Slugs: `lowercase-with-dashes`
- Be descriptive: `the-crimson-merchant.md` not `npc-042.md`

## Getting Started

1. Check relevant `campaigns/<name>/CLAUDE.md` for campaign context and tone
2. Review `campaigns/<name>/PROGRESS.md` for current status
3. Review recent session logs to understand what's "nailed down"
4. Ask clarifying questions before making changes to established canon
