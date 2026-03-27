#!/usr/bin/env bash
# Decrypt the SotS rulebook if encrypted version exists and plaintext doesn't.
# Requires SOTS_KEY environment variable.
# Usage: scripts/decrypt-rulebook.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENC_FILE="$REPO_ROOT/resources/sots/rulebook.md.enc"
PLAIN_FILE="$REPO_ROOT/resources/sots/rulebook.md"
DOTENV="$REPO_ROOT/.env"

# Source .env if SOTS_KEY not already in environment
if [ -z "${SOTS_KEY:-}" ] && [ -f "$DOTENV" ]; then
    set -a; source "$DOTENV"; set +a
fi

if [ ! -f "$ENC_FILE" ]; then
    echo "No encrypted rulebook found at $ENC_FILE"
    exit 0
fi

if [ -f "$PLAIN_FILE" ]; then
    # Already decrypted
    exit 0
fi

if [ -z "${SOTS_KEY:-}" ]; then
    echo "SOTS_KEY not set — skipping rulebook decryption"
    exit 0
fi

openssl enc -aes-256-cbc -d -salt -pbkdf2 \
    -in "$ENC_FILE" \
    -out "$PLAIN_FILE" \
    -pass "pass:$SOTS_KEY"

echo "Decrypted rulebook to $PLAIN_FILE ($(wc -l < "$PLAIN_FILE") lines)"
