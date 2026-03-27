# SotS Rulebook Transcription

`rulebook.md.enc` is an encrypted transcription of *Swords of the Serpentine* (Kevin Kulp & Emily Dresner, Pelgrane Press) from a legally purchased PDF copy.

This is a personal-use transcription for AI agent reference. **Do not distribute, decrypt for others, or commit the plaintext.**

## How it works

- `rulebook.md.enc` — committed, encrypted with AES-256-CBC
- `rulebook.md` — gitignored, decrypted automatically on session start if `SOTS_KEY` is set in `.env`
- `rulebook-index.md` — committed, plaintext index pointing into the decrypted file (no copyrighted content)

## Manual decryption

```bash
SOTS_KEY=<key> scripts/decrypt-rulebook.sh
```

## Re-encrypting after edits

```bash
source .env
openssl enc -aes-256-cbc -salt -pbkdf2 -in resources/sots/rulebook.md -out resources/sots/rulebook.md.enc -pass "pass:$SOTS_KEY"
```
