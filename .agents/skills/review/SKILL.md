---
name: review
description: Repo review workflow for changed files, campaign drafts, SotS rules references, scripts, generated visual/PDF artifacts, claims, and pre-merge checks. Use when asked to review work, when preparing work for Jörn, or when a subagent receives a review assignment.
---

# Review

## Core Workflow

1. Read the assignment and identify the changed or named files.
2. Identify the review surface: committed branch diff, single commit,
   uncommitted diff, or exact named files.
3. Read `AGENTS.md`.
4. Load matching convention skills by their descriptions.
5. Load only the review reference files below that match the assignment.
6. Read target files in full before reporting findings.
7. Verify each finding against the cited file, command output, rules source, or
   generated artifact before including it.

Do not edit files during a review unless the assignment explicitly asks for
fixes.

## References

- Python scripts and generated artifacts: `references/python.md`
- Factual claims, SotS rules claims, canon claims, and source citations:
  `references/claims.md`
- Figure/card/PDF production chain and rendered assets:
  `references/figures.md`

## Refactor Checklist

When reviewing a script simplification or helper extraction, explicitly scan
for:

- behavior drift: changed ordering, dimensions, scaling, file names, API
  parameters, output paths, or serialization shapes
- stale duplicate surfaces: old constants, helper copies, comments, or README
  commands left behind
- boundary widening: a local cleanup that now hides real differences between
  session-local workflows
- compatibility risks: CLI flags, generated file names, tracked artifacts,
  print dimensions, or required secrets changed unintentionally

## Output Format

Findings come first, ordered by severity.

For each finding:
- Severity: `FIX` for a clear violation or bug, `FLAG` for judgment required.
- Location: file and line number when available.
- Evidence: what the file, source, generated artifact, or command shows.
- Action: the concrete change or decision needed.

Then include:
- Review surface: the command or exact file list reviewed.
- Open questions or assumptions.
- Test or build gaps.
- Brief change summary only if it helps interpret the findings.

If no issues are found, say that clearly and list remaining verification gaps.
