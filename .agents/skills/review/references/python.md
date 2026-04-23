# Python Review

Check changed Python scripts for campaign-prep correctness.

- CLI help works without secrets or network.
- PEP 723 dependencies match imports when the script is intended for `uv run`.
- Required input paths are checked before processing.
- Errors for missing files, malformed JSON, invalid images, absent API keys, or
  external failures are clear and non-zero.
- Output paths, generated page counts, and generated file sizes are logged when
  useful.
- Image/PDF dimensions and page constants are named and auditable.
- Network or paid API calls are not performed during tests unless approved.
- `python3 -m py_compile` passes for the changed files.
