# CLAUDE.md - Agent Onboarding

This repository supports collaborative preparation of fantasy TTRPG campaigns. Claude Code agents act as co-GMs who help outside of game sessions with planning, writing, and organization.

## Repository Layout

```
CLAUDE.md           # You are here - agent onboarding
README.md           # Brief overview for human visitors
PROJECT.md          # Backlog, completed work, project status

scripts/            # Reusable scripts (sh, js, py)
packages/<name>/    # Larger tools/applications with dependencies
campaigns/<name>/   # Individual campaigns (see below)

.claude/
  settings.json     # Hooks and configuration
  skills/<slug>/    # Progressive disclosure knowledge (SKILL.md + references/)
  agents/<name>.md  # Reusable agent prompts for Task() subagents
```

### Campaign Structure

Each campaign directory contains:
- `CLAUDE.md` - Campaign-specific agent onboarding
- `lore/` - World-building, factions, locations, history
- `characters/` - NPCs, player characters, character sheets
- `sessions/` - Session logs, prep notes, handouts
- `encounters/` - Combat encounters, puzzles, social challenges
- `assets/` - Images, maps, reference materials

## Core Conventions

### Precision and Explicitness

- Use precise, clear language everywhere
- Write out implications explicitly - don't require agents to deduce
- "Present interesting information in a boring manner" - state facts plainly
- Example: Don't hint that a character is selfish; write "Motivation: selfish egoist" in their notes

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

**Text Processing**
- Read and extract information very quickly
- Imitate styles, give characters distinct voices
- Search, index, and summarize for knowledge gathering
- Write and iterate on content (expect multiple passes for quality)

**Reasoning**
- Short-horizon planning: combat tactics, character reactions, scene improvisation
- Following established patterns and procedures
- Applying rules and checking consistency

**Coding**
- Automate bulk operations (e.g., HTML-to-markdown conversion)
- Write scripts for repetitive tasks
- Build tools for campaign management

**Knowledge**
- Familiar with D&D, Pathfinder, VtM, and other TTRPG systems (with caveats below)
- Can refresh knowledge by reading rulebook excerpts
- Good at general fantasy/genre knowledge

### What Agents Do Poorly

**Images**
- Cannot create images directly (can prompt other AI tools)
- Weak at judging image quality, style consistency, character likeness

**Text Quality**
- First drafts often need revision
- May fill gaps overconfidently - review for coherence
- Better at short pieces than long narrative arcs

**Long-Horizon Planning**
- Heuristics work for predictable actors
- May miss creative solutions that a thinking human would find
- Complex multi-step plans need human review

**Rules Details**
- Training mixes up similar systems and homebrew
- Exact modifiers and edge cases may be wrong
- Always verify mechanical details against source material

## Working with Subagents

Use `Task()` to spawn subagents for focused work. Available patterns:

**Built-in types:**
- `Explore` - Codebase navigation and search
- `Plan` - Architecture and implementation planning
- `Bash` - Command execution
- `general-purpose` - Multi-step research tasks

**Custom agents:** See `.claude/agents/` for campaign-specific agent prompts (e.g., character creation, encounter design, image generation instructions).

When spawning agents:
- Provide complete context; they don't see conversation history
- Be explicit about whether to research only or make changes
- Use for parallelizable work to save time

## Quick Reference

### Common Tasks

| Task | Approach |
|------|----------|
| Add session log | Create `campaigns/<name>/sessions/YYYY-MM-DD.md` |
| New NPC | Add to `campaigns/<name>/characters/npcs/` |
| Create NPC/location card | See `packages/card-generator/CLAUDE.md` |
| Design encounter | Use encounter agent template or create in `encounters/` |
| Find information | Use `Explore` subagent or grep the codebase |
| Bulk edits | Write a script in `scripts/` |

### File Naming

- Dates: `YYYY-MM-DD` format
- Slugs: `lowercase-with-dashes`
- Be descriptive: `the-crimson-merchant.md` not `npc-042.md`

## Environment

This repo is designed for Claude Code Web and similar environments. Most tools are available by default. If a script needs dependencies, document installation in the script's header or a local README.

## Getting Started

1. Read `PROJECT.md` for current status and priorities
2. Check relevant `campaigns/<name>/CLAUDE.md` for campaign context
3. Review recent session logs to understand what's "nailed down"
4. Ask clarifying questions before making changes to established canon
