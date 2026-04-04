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

### 2026-04-04 — Saved sync-specific lessons to global memory

What happened: After the sync incidents above, agent saved two memory entries (`feedback_use_cp_not_write.md`, `feedback_no_overcorrection.md`) with lessons about using `cp` and not overcorrecting. These are specific to `/sync-claude` runs. Every agent in every session would pay the attention cost for something only sync sessions need. Jörn flagged this as net-negative.

What should have happened: The feedback/ entry is the right place — it's where `/update-workflow` and `/sync-claude` will find it. Memory should only contain things that genuinely help most sessions.

**Pattern:** Memory pollution. Agent defaults to "save it in memory" as the response to learning a lesson, without evaluating whether the lesson's benefit across all sessions outweighs the attention cost. The `/incident` skill's step 3 ("check for memory entry") may encourage this — it asks "should this be in memory?" without a counter-question like "does every session benefit?"

### 2026-04-04 — /incident asked unnecessary clarifying question

What happened: Jörn invoked `/incident` with empty arguments right after saying "it is literally net-negative" about the memory misuse. The incident was obvious from context — the immediately preceding conversation. Agent asked "What's the incident — the memory misuse?" instead of just recording it.

What should have happened: Record the incident directly. The conversation context made the referent unambiguous. The skill says "don't guess — the cost of recording the wrong incident is higher than one question" but this wasn't a guess — it was the only plausible reading.

**Pattern:** Over-literal skill compliance. The skill's "ask if unsure" instruction overrode obvious conversational context. Agent treated "arguments are empty" as "I don't know what the incident is" when the conversation made it clear.

### 2026-04-04 — Flooded chat with sequential diff commands

What happened: Jörn asked for the diff of synced files vs upstream. Agent ran 5 separate `diff` Bash calls across 3 messages (one file per call, then batches), flooding the chat. Each call produced output Jörn had to scroll through.

What should have happened: One Bash call with a loop over all files, or a short script, producing a single consolidated output.

**Pattern:** Piecemeal tool calls. Agent broke a single operation into many small calls instead of composing one efficient command. Costs Jörn attention for each call's output block. Same class as the Write-from-memory issue — using the most obvious tool invocation instead of the most efficient one.

### 2026-04-04 — Decided hook naming convention but didn't apply it

What happened: Early in the session, Jörn chose PascalCase for hook naming. Agent created the two new hooks with correct names but never renamed the three existing hooks (`session-start.sh`, `worktree-create.sh`, `worktree-remove.sh`). Only fixed when Jörn noticed the inconsistency much later.

What should have happened: When a naming convention is decided, apply it to all files in scope immediately — not just new ones.

**Pattern:** Incomplete application of a decision. Agent applied the decision to the work in front of it (new files) but didn't check whether existing files needed updating to match. Same class as the Core Conventions issue — carrying forward old state without evaluating it against current decisions.
