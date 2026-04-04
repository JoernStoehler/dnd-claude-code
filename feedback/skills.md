# Feedback: Skills & Workflows

Raw observations from sessions about skill/workflow behavior. A future `/update-workflow` session will review and act on these with Jörn.

## Format

Each entry: date, what happened, what should have happened, error pattern.

### 2026-04-04 — Sync skill: rewrote files from memory instead of copying

What happened: During `/sync-claude`, agent read upstream files, then used `Write` to recreate them from memory instead of `cp`. This wasted tokens reproducing ~2000 lines of existing text, and introduced subtle drift (dropped lines, reworded phrases, removed useful content). Required multiple correction rounds. Agent then oscillated between "adapt for campaign" and "copy verbatim" based on conflicting interpretations of Jörn's feedback, producing 3 commits to fix what should have been 1.

What should have happened: `cp` the files, then `Edit` for targeted path fixes. One commit.

**Pattern:** Tool misuse — using a generative tool (Write) where a mechanical tool (cp) is correct. The agent treated "I have the content in context" as sufficient reason to regenerate, when the content already existed on disk. Related to overconfidence in memory reproduction.

### 2026-04-04 — Sync skill: thrashed between adapting and copying

What happened: Jörn said "just copy" (meaning don't overthink the sync). Agent first adapted files (removed thesis references, rewrote paths). Then Jörn asked "did you rewrite?" — agent over-corrected to verbatim `cp`, which put msc-math paths back into files. Then Jörn said "we are not doing a math thesis" — agent had to fix paths again. Three rounds of commits for what should have been clear from the start: copy structure, fix paths.

What should have happened: Copy files, fix the 3 path references (`-workspaces-msc-math` → `-workspaces-dnd-claude-code`), done. The ambiguity between "copy" (don't rewrite prose) and "adapt" (fix project references) should have been resolved by asking one clarifying question upfront.

**Pattern:** Overcorrection loop. Agent misinterprets correction as "do the opposite" instead of "do the nuanced middle." Each Jörn message triggered a full swing rather than a targeted adjustment. Same root cause as feedback_stop_thrashing — but here the thrashing is between interpretations of instructions rather than between technical approaches.
