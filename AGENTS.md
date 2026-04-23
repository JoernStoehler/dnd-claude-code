# AGENTS.md

## Project Goal

Campaign bible and prep repository for a sword & sorcery TTRPG campaign using
**Swords of the Serpentine** with the base rules.

Agents act as co-GMs outside game sessions: planning, writing, organization,
rules lookup, card/handout generation, and workflow maintenance.

## Campaign Premise

- **Setting:** Eversink as published. The campaign is urban-focused; excursions
  outside the city happen only when both travel and destination matter.
- **Genre:** Sword & sorcery. Most intrigue starts from human Eversink motives;
  supernatural and wider-world layers move and are moved by that human layer.
- **Tone:** Institutions compete for bottlenecked resources: money, military
  power, blackmail, reputation, and religious influence. Many people survive in
  the cracks between elite structures.
- **Play style:** Players combine clues, cleanup, and plans. Everything is
  connected. No plan survives contact with reality, but no plan is worse.
- **System:** Swords of the Serpentine, base rules only. Do not assume high
  fantasy variant rules are in use.

## Current Layout

- `TASKS.md`: campaign task tracker and default sequencing surface.
- `sessions/`: session prep, logs, generated handouts, PDFs, and local scripts.
- `library/sots/`: SotS rules references and design articles.
- `scripts/`: reusable repo scripts, including card and image generation.
- `handoffs/`: task handoffs for future sessions.
- `feedback/`: raw observations about agent workflow failures.
- `.agents/skills/`: Codex skills for repeatable project workflows.
- `.codex/agents/`: Codex subagent role definitions.
- `.codex/config.toml`: shared Codex CLI project config.
- `.devcontainer/`: local devcontainer setup.

## Current Instruction Sources

Required project instructions live in this root file or in discoverable skills.
Do not add nested `AGENTS.md` files as required instruction maps; root-launched
Codex sessions will not reliably load them.

## Core Rule

Never write a factual claim without verifying it against evidence in the same
session. "The script does X" requires running it or reading the exact code path.
"The file contains Y" requires reading the file. When verification is impossible,
mark the claim as `TODO` and say what evidence is missing.

SotS rules are a high-error surface. Do not produce SotS mechanics, ability
descriptions, or rules-facing player material from memory. Verify against
`library/sots/` and link to the source file. Prefer direct references over
paraphrase because paraphrases drift.

## Campaign Conventions

- Track **nailed down** versus **mutable** information. Anything spoken at the
  table is canon. Unrevealed GM prep can still change.
- Conflict order: session logs, then character sheets, then lore documents,
  then unrevealed GM prep.
- Stop and ask Jörn for canon conflicts, content that constrains player
  choices, tone uncertainty, SotS rules edge cases, scope creep, blocked work
  without evidence, or an implementation approach that has failed twice.
- Write plainly. State implications directly. Do not make future readers infer
  important facts from hints.
- File names use `YYYY-MM-DD` dates and lowercase dash-separated slugs.

## Git And Worktrees

- Use local `main` as the base, not `origin/main`.
- Work in the assigned cwd. Treat the tool default cwd as untrusted until it
  matches the task.
- Use a worktree when the task asks for isolated edits or parallel sessions may
  edit overlapping tracked files.
- Suggested Codex worktree path:
  `git worktree add -b <branch> .codex/worktrees/<branch> main`
- Destructive operations such as force-push, branch deletion on `main`,
  `git reset --hard`, checkout-based reverts, and irreversible file deletion
  require explicit approval.

## Planning And Verification

- Define the check before acting: what result proves this task is done?
- For multi-step work, keep a plan with objective, dependencies, owner, and
  verification command or review check.
- Use subagent review when Jörn asks for delegation or the active session
  instructions allow it; otherwise run the same review checklist locally.
- Before asking Jörn to review a draft, handout, scenario, rule reference, or
  code change, first run the checks agents can run: buildability, source links,
  figure/PDF generation, rules citations, stale paths, missing inputs, and scope
  drift.
- Update `TASKS.md` when work changes campaign state, sequencing, blockers, or
  future resume points. Do not rewrite unrelated task history.

## Environment

Supported environment:
- Local devcontainer at `/workspaces/dnd-claude-code`, with Python, Node/npm,
  Codex CLI, GitHub CLI, image/PDF tooling, and VS Code tunnel support.

Useful commands:

```bash
uv run scripts/build-cards.py --help
uv run scripts/gen-image.py --help
bash sessions/2026-04-21-oneshot/build-pdfs.sh
bash scripts/decrypt-rulebook.sh
python3 -m py_compile scripts/*.py sessions/2026-04-21-oneshot/*.py
```

The plaintext `library/sots/rulebook.md` is gitignored; run the decrypt command
when full-rulebook lookup needs it and the plaintext is absent.

## TASKS.md

- Keep current and next work under `## Current`.
- Use the existing marker vocabulary unless Jörn asks for a new tracker format:
  `:red_circle:` Jörn decides, `:yellow_circle:` agent does and Jörn reviews,
  `:green_circle:` agent autonomous.
- Move genuinely finished items to `## Done` with a date and one-line summary.
- Link to handoffs, session files, scripts, or generated artifacts instead of
  duplicating long context.
- Preserve blockers and resume points concretely enough that a fresh session can
  continue without chat history.

## Text For Agents

Optimize files, comments, and prompts that agents read for these properties, in
order:

1. **Correct, corrigible:** Verify claims against code, files, or rules sources.
2. **Observable, measurable:** State checks the reader can run.
3. **Unambiguous:** Each sentence should have one reading.
4. **Complete:** Include assumptions, preconditions, and reasons for non-obvious
   decisions.
5. **Actionable:** The reader should know what to do next.
6. **Simple and concrete:** Prefer familiar patterns and literal terms.

Vague-word ban: do not use "appropriate", "properly", "ensure", "good",
"consider", "reasonable", "necessary", "efficient", or "robust" without saying
what observable condition the word means.
