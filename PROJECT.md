# Project Status

## Current Status

**Phase:** Initial Setup
**Last Updated:** 2026-01-24

Repository structure and meta-tooling established. Card generator prototype complete.

## Backlog

### High Priority

- [ ] Create first campaign directory with full structure
- [ ] Write initial campaign concept/pitch
- [ ] Establish template files (session log, NPC, location, encounter)

### Medium Priority

- [ ] Build `session-prep` skill (workflow for preparing sessions)
- [ ] Build `post-session` skill (workflow for after-session tasks)
- [ ] Download SRD markdown files to `references/` for agent access
- [x] Test AI image generation workflow → using Flux via fal.ai
- [x] Create NPC card template for physical handouts → `packages/card-generator/`

### Low Priority / Future

- [ ] Scripts for bulk operations (e.g., index generation)
- [ ] Integration with external tools (calendars, VTT exports)
- [ ] Style guide for consistent prose voice (if needed)

## Completed Work

### 2026-01-23: Repository Setup

- Created directory structure (`scripts/`, `packages/`, `campaigns/`, `.claude/`)
- Wrote `CLAUDE.md` with comprehensive agent onboarding
- Wrote `README.md` for human visitors
- Established core conventions:
  - Precision and explicitness in documentation
  - Information state tracking (nailed-down vs mutable)
  - Repository hygiene practices
- Documented agent capabilities and limitations
- Created `PROJECT.md` (this file) for tracking

### 2026-01-23: Skills and Agents Foundation

- Created meta-skills:
  - `/create-skill` - how to create new skills (with official docs links)
  - `/create-agent` - how to create new agents (with official docs links)
- Created starter agents:
  - `lore-checker` - verify consistency across campaign materials
  - `create-npc` - generate NPCs with personality, motivation, stats
- Documented when to use skills vs template files vs agents
- Refined approach: templates for standard formats, skills for workflows, agents for context-heavy tasks

### 2026-01-24: Card Generator Package

- Created `packages/card-generator/` for player-facing cards (NPCs, locations, items)
- Scripts: `generate-portrait.js` (Flux via fal.ai), `render-card-sharp.js` (no browser deps)
- 5 layout styles: dark, parchment, minimal, compact, framed
- Cards are player-facing only (appearance, demeanor, context - no secrets)
- Flux standard sizes for portraits (portrait_4_3 = 768x1024 recommended)
- Example cards in `campaigns/example/cards/`
- Added env var setup to root README.md

### 2026-01-23: D&D Resources and GM Reference Materials

- Created `resources/` directory with curated external resources:
  - `tools-and-generators.md` - Index of online tools (VTTs, map makers, NPC generators, etc.)
  - `gm-checklists.md` - Session Zero, session prep, post-session, and campaign health checklists
  - `game-enhancement-ideas.md` - Brainstormed ideas for props, AI art, audio, battlemaps
  - `ambience-and-audio.md` - Curated audio sources and implementation guidance
- Created D&D 5e rules skill (`.claude/skills/dnd-5e-rules/`):
  - Documents SRD sources (5.1 and 5.2) with links to markdown repositories
  - Guidance on when to look up rules vs trust training data
  - Philosophy for "right enough" rules in content creation
- Researched and documented:
  - Paper miniatures (Printable Heroes, MonsterForge)
  - NPC/item cards and handout tools
  - Virtual tabletop comparison (Roll20 vs Foundry vs Owlbear Rodeo)
  - AI image generation approaches for portraits
  - Safety tools (X-Card, Lines & Veils)

## Notes

### Design Decisions

**Why session logs are canonical:** Once information is revealed to players, it cannot be changed without breaking trust. Session logs track what's "nailed down" so agents don't accidentally contradict established facts.

**Why explicit over implicit:** Agents start each session with no project knowledge beyond what's in files. Implicit information gets lost. If a character trait matters, state it directly.

**Why aggressive deletion:** Outdated documentation causes agent mistakes. Better to have less documentation that's accurate than more documentation that misleads.

**Skills vs Templates vs Agents:**
- **Skills**: Procedural knowledge, workflows that evolve, progressive disclosure needed
- **Templates**: Standard formats in known locations, agents find by filename
- **Agents**: Tasks requiring multi-file context gathering and judgment calls

### Open Questions

- What campaign system(s) to use? (D&D 5e, Pathfinder 2e, other?)
- How detailed should session logs be?
- Physical vs digital play setup? (Affects which enhancements to pursue)
- Should we download SRD locally or just link to online sources?

### Resolved Questions

- **AI image generation:** Flux via fal.ai (good quality, API access, standard sizes)
