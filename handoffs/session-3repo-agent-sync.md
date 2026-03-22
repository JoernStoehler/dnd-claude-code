# Handoff: Cross-Project Agent Workflow Sync

**Date:** 2026-03-21
**Context:** Compared agent workflows across msc-math, dnd-claude-code, xrisk-pause-game. Planned improvements and started executing.

## Planning artifacts (in /tmp, not committed)

- `/tmp/compare-msc-math-vs-dnd-claude-code.md` — detailed comparison of msc-math vs dnd with recommendations (heavily iterated with Jörn)
- `/tmp/comparison-msc-math-vs-pause-game.md` — earlier comparison of msc-math vs pause-game (pre-existing, from a prior session)
- `/tmp/3repo-present-state.md` — present state across all 3 repos
- `/tmp/3repo-target-state.md` — target state with 14 items and priority-ordered sync plan

**These /tmp files will be lost.** The target state file is the most important — it contains the full plan. Copy it somewhere persistent if the next session needs it.

## Decisions made

### Sync strategy
- Copy files between repos. Sync rarely. No shared repo — not worth the indirection for 3 projects.

### Meta-knowledge taxonomy (agreed with Jörn)
Agent knowledge decomposes into artifact types:
- **Convention skills** — development-time guidance ("how to write X correctly")
- **Review subagents** — final-gate checkers, load conventions + checklists. Conventions map 1:1 to review agents.
- **Workflow skills** — execution protocols cutting across multiple conventions
- **Progressively disclosed knowledge** — reference material loaded on demand
- **General subagents** — specialized workers for scoped tasks

Each artifact type should have a "how to create" meta-skill. msc-math's meta-documentation currently covers all in one file; may split later.

### Postmortem must be a skill, not an agent
Agents can't access parent session conversation history. Postmortem needs session context. Therefore: skill.

### Session-handoff needs subagent review step
The main agent has the same blind spots as the handoff it wrote. A fresh subagent reading only the written artifacts simulates what the next session will experience.

### General agent behavior norms (identified, not yet written)
Three behaviors all projects need:
1. Anti-sycophancy — push back on bad ideas (msc-math has one line; dnd and pause-game have nothing)
2. Defer without forgetting — TODO comment / todo() tool / TASKS.md entry depending on weight
3. Generalize from issues — must be part of resolution workflow, not deferred

### TASKS.md > PROGRESS.md for dnd
File-based task management proven better than Linear, gh issues, or human-tracks-everything. dnd should migrate from PROGRESS.md to TASKS.md format with escalation markers (🔴🟡🟢) and maturity map.

### Feedback from Jörn on agent behavior (IMPORTANT)
- Do NOT assume Jörn reads everything you write. Messages overlap, requests get interrupted.
- When Jörn asks a question, answer it FIRST — before tool calls, before continuing work.
- If you asked a question and it goes unanswered: repeat it or resolve it yourself from prior instructions.
- Do not fabricate self-explanations ("I have a habit of..."). If you don't know why you did something, say so.
- Do not ask for confirmation on items already approved.
- Recommendations must include pro/con/alternatives — don't force the reader to rederive reasoning.

## Work completed this session

1. Created `handoffs/` directories in dnd and pause-game
2. Converted dnd postmortem from agent to skill (`.claude/agents/postmortem.md` deleted → `.claude/skills/meta-post-mortem/SKILL.md` created)
3. Extended pause-game post-mortem skill (was 15 lines / 5 items → full skill with shared core + process checks + generalize step)
4. Committed checkpoint in msc-math (8032218) and pause-game (89d9d88) before starting work
5. Created feedback memory about not assuming Jörn reads everything

## Work remaining (priority order from target state)

1. **Hook lineage** — add sync note to meta-documentation skill (not individual headers)
2. **General agent behavior norms** — write CLAUDE.md section, needs drafting + Jörn review
3. **Meta-knowledge skills** — copy msc-math's meta-documentation, collaboration, feedback-processing to dnd and pause-game. Decision: get msc-math into good state first, then copy.
4. **Session-handoff skill** — add subagent review step to dnd's existing skill, create for pause-game and msc-math
5. **TASKS.md for dnd** — migrate from PROGRESS.md
6. **Convention skills + review agents** — per-project, design needed
7. **Various project-specific items** — see /tmp/3repo-target-state.md items 10-14

## Key files to read for next session

- This handoff file
- `/tmp/3repo-target-state.md` (if it still exists — contains full plan with 14 items)
- `/tmp/3repo-present-state.md` (if it still exists — documents current state)
- `/tmp/compare-msc-math-vs-dnd-claude-code.md` (if it still exists — detailed comparison with iterated recommendations)

## Warnings

- Jörn was frustrated by repeated unnecessary confirmation questions and buried answers this session. Next agent: answer questions first, execute approved tasks without asking, don't fabricate self-explanations.
- The /tmp files are the main planning artifacts but won't survive a reboot. Consider copying the target state file into a repo.
