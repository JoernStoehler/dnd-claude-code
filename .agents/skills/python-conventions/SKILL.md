---
name: python-conventions
description: Python conventions for campaign scripts, session-local generators, PEP 723 metadata, image/PDF tooling, and small validation utilities. Use before editing or reviewing Python files in `scripts/` or `sessions/`.
---

# Python Conventions

Python scripts in this repo are small command-line tools for campaign prep.
They should be directly runnable, easy to inspect, and explicit about inputs
and outputs.

## Script Shape

- Prefer one self-contained script per task.
- Use PEP 723 inline dependency metadata for scripts intended to run with `uv`.
- Keep paths relative to the script or repo root. Do not hardcode host-specific
  absolute paths.
- Validate required input files before doing expensive work or API calls.
- Print short progress lines that name generated files.
- Fail with a clear stderr message and non-zero exit for missing inputs,
  invalid images, absent API keys, or malformed JSON.

## Generated Artifacts

- Keep generated session artifacts next to the session that produced them.
- Do not overwrite source inputs unless the script name and help text make that
  behavior explicit.
- For generated PNGs/PDFs, keep dimensions, page size, margins, and layout
  constants named near the top of the file.
- For API-generated images, preserve useful response metadata when the output
  format supports it.

## External Calls

- Do not spend API credits in tests or reviews unless Jörn explicitly approved
  generation for the task.
- Provide a `--help` path that exercises argparse without requiring secrets or
  network.
- For scripts needing secrets such as `FAL_KEY`, check the environment before
  importing or calling the external client.

## Review Checklist

- CLI arguments match the docstring and examples.
- Missing files and bad images fail before partial output is written.
- Output paths are named in logs.
- Layout constants make the printed page dimensions auditable.
- Generated files are either tracked intentionally or ignored intentionally.
- `python3 -m py_compile <files>` passes.
