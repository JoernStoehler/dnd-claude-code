# Project Status

## Current Status

**Phase:** Initial Setup
**Last Updated:** 2026-01-23

Repository structure and meta-tooling established. No campaigns created yet.

## Backlog

### High Priority

- [ ] Create first campaign directory with full structure
- [ ] Write initial campaign concept/pitch
- [ ] Establish template files (session log, NPC, location, encounter)

### Medium Priority

- [ ] Build `session-prep` skill (workflow for preparing sessions)
- [ ] Build `post-session` skill (workflow for after-session tasks)
- [ ] Build `rules-lookup` agent (verify game mechanics from reference material)
- [ ] Set up image generation workflow documentation

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
- What image generation tools/APIs to integrate?
