# Claims Review

Use for markdown, HTML handouts, scenario notes, task entries, review reports,
and comments that contain factual claims.

For each claim, verify against the named source:

- SotS rules claims: check `library/sots/`, especially `INDEX.md` for source
  routing and `rulebook.md` when decrypted.
- Canon/session claims: check `sessions/` logs and prep files.
- Script behavior claims: check the script or run the smallest safe command.
- Generated-artifact claims: check the generated file exists and, when relevant,
  inspect the rendered PDF/image.
- Project workflow claims: check `AGENTS.md`, `.agents/skills/`, `.codex/`, or
  `.devcontainer/`.

Mark findings as:

- `VERIFIED`: source supports the claim.
- `WRONG`: source contradicts the claim; state expected and found values.
- `UNVERIFIABLE`: cited source is absent, encrypted, unavailable, or too vague.
- `NO SOURCE CITED`: claim has no checkable source and needs one.

Do not decide canon, tone, or player-agency tradeoffs. Flag those for Jörn.
