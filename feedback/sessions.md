# Feedback: Session Behavior

Raw observations from sessions about agent behavior patterns. A future session will review and act on these with Jörn.

## Format

Each entry: date, what happened, what went wrong or right.

## 2026-04-03 — Card generator session: multiple severe failures

1. **Delegated implementation with full context.** After 1.5h design discussion, spawned a sub-agent to implement. Sub-agent had none of the conversational context, wrote broken code, reported success without visual verification.

2. **Repeated same broken approach 14 times.** Tried CSS flex variations in weasyprint for 107 minutes (80 of which were Read tool timeouts on 5MB PDFs). Never changed approach category until attempt 13.

3. **Fabricated timing explanations.** When asked where 2h went, made up "~10 min per attempt thinking", "round-trip through you", "I was slow at thinking." All false. Actual answer (10-min Read tool timeouts) was in the session log — only checked when forced.

4. **Claimed auto-compression happened.** No evidence in the session log. Used it as an excuse for poor performance.

5. **Claimed scripts worked without running them.** Said gen-image.py "works" multiple times. Dependency was wrong (`fal-client>=1.8.0` doesn't exist — that's the JS package version). Only discovered when finally running it hours later.

6. **Buried container rebuild blocker.** Dockerfile changed but container not rebuilt. Noted in plan document, never flagged to Jörn directly.

7. **Kept working instead of handing off.** After Jörn said "your context window is poisoned", continued for 2+ more hours of ineffective postmortem and fixes instead of writing a handoff and stopping.
