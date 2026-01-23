# Project Status

## Current Status

**Phase:** Initial Setup
**Last Updated:** 2026-01-23

Repository structure established. No campaigns created yet.

## Backlog

### High Priority

- [ ] Create first campaign directory with full structure
- [ ] Write initial campaign concept/pitch
- [ ] Establish session logging template
- [ ] Create character sheet template for NPCs

### Medium Priority

- [ ] Design encounter template/checklist
- [ ] Set up image generation workflow documentation
- [ ] Create agent prompts for common tasks (`.claude/agents/`)
- [ ] Build location/faction template

### Low Priority / Future

- [ ] Scripts for bulk operations (e.g., index generation)
- [ ] Integration with external tools (calendars, VTT exports)
- [ ] Style guide for consistent prose voice

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

## Notes

### Design Decisions

**Why session logs are canonical:** Once information is revealed to players, it cannot be changed without breaking trust. Session logs track what's "nailed down" so agents don't accidentally contradict established facts.

**Why explicit over implicit:** Agents start each session with no project knowledge beyond what's in files. Implicit information gets lost. If a character trait matters, state it directly.

**Why aggressive deletion:** Outdated documentation causes agent mistakes. Better to have less documentation that's accurate than more documentation that misleads.

### Open Questions

- What campaign system(s) to use? (D&D 5e, Pathfinder 2e, other?)
- How detailed should session logs be?
- What image generation tools/APIs to integrate?
