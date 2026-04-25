---
name: codex-session-log
description: Read local Codex session JSONL logs without misinterpreting tool events, image generation metadata, compacted context, base64 payloads, or line-number references. Use when asked to inspect Codex's own logs, quote session log file:line evidence, recover image_generation_call ids or revised_prompt values, debug Codex CLI/session behavior, or document local observed Codex mechanics.
---

# Codex Session Log

Use local Codex JSONL session logs as evidence for what happened in a session. Keep product-behavior claims narrow: session logs show local observed behavior, not a complete API contract.

## Locate The Log

- Current-session logs live under `${CODEX_HOME:-$HOME/.codex}/sessions/YYYY/MM/DD/rollout-*.jsonl`.
- Generated images live under `${CODEX_HOME:-$HOME/.codex}/generated_images/<session-id>/`.
- The `<session-id>` in a generated image path usually matches part of the rollout filename. Use that to connect an image file back to the session log.
- Prefer exact file:line references after verifying with the JSONL file in the current session.

## Read Safely

Do not print raw image-generation lines directly. They may contain multi-megabyte base64 `result` fields.

Use a parser that preserves line numbers and suppresses `result`:

```bash
python3 - <<'PY'
import json
from pathlib import Path

p = Path("/path/to/rollout.jsonl")
for line_no, line in enumerate(p.open(), 1):
    obj = json.loads(line)
    payload = obj.get("payload") or {}
    if payload.get("type") in {"image_generation_end", "image_generation_call"}:
        result = payload.get("result")
        print({
            "line": line_no,
            "top_type": obj.get("type"),
            "payload_type": payload.get("type"),
            "id": payload.get("id") or payload.get("call_id"),
            "status": payload.get("status"),
            "has_revised_prompt": payload.get("revised_prompt") is not None,
            "revised_prompt": payload.get("revised_prompt"),
            "result_length": len(result) if isinstance(result, str) else None,
            "saved_path": payload.get("saved_path"),
        })
PY
```

For quick text searches, use `rg` with a specific id or phrase. Avoid broad `rg revised_prompt` across all logs unless the output is capped.

## Image Generation Events

Observed local Codex behavior on 2026-04-25:

- `image_generation_end` and `image_generation_call` entries can both contain `id` or `call_id`, `status`, `revised_prompt`, and base64 `result`.
- `status` may read `"generating"` even when `result` and `saved_path` are present and the PNG exists. Treat `result`/`saved_path`/file existence as stronger evidence that the image was produced.
- For the tested built-in image call `ig_08a386783c3320180169ec847406088191a3ec4b54360831bc`, `revised_prompt` was byte-for-byte identical to the submitted prompt recorded in the sidecar. Do not assume `revised_prompt` is an improved or model-expanded prompt unless you compare it to the submitted prompt for that call.
- PNG metadata may include C2PA/JUMBF provenance such as OpenAI generator data. Do not expect embedded submitted prompt, revised prompt, usage, or request id in the PNG.

## Evidence Rules

- Quote the JSONL path and line number when reporting a log finding.
- If comparing a `revised_prompt`, state what it was compared against: raw tool-call arguments, a sidecar `submitted_prompt`, or another explicit source.
- If the raw tool-call arguments are not visible in the JSONL, say so. A matching sidecar is useful evidence, but it is not the same as seeing the tool invocation arguments.
- Do not paste base64 `result` fields into sidecars, reports, commits, or chat unless Jörn explicitly asks for raw payload recovery.
- After context compaction, older log lines may still exist even when they are no longer in model context. Prefer the JSONL file over memory.
