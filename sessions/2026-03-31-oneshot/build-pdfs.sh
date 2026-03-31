#!/usr/bin/env bash
# Generate all PDFs from HTML sources and merge into 4 printable bundles.
set -e
cd "$(dirname "$0")"

echo "Generating individual PDFs..."
for f in player-rules player-abilities player-sorcery player-pregens player-chargen \
         gm-rules gm-balance gm-npcs gm-clues gm-world; do
  weasyprint "$f.html" "$f.pdf" 2>/dev/null
  echo "  $f.pdf"
done

echo "Merging into bundles..."

pdfunite player-rules.pdf player-abilities.pdf player-sorcery.pdf player-pregens.pdf \
  player-reference.pdf
echo "  player-reference.pdf  (rules + abilities + sorcery + pregens)"

pdfunite sots-character-sheet-bw.pdf player-chargen.pdf \
  character-sheet.pdf
echo "  character-sheet.pdf   (official blank sheet + creation guide)"

pdfunite gm-rules.pdf gm-balance.pdf gm-npcs.pdf \
  gm-reference.pdf
echo "  gm-reference.pdf      (rules + balance + NPC gen)"

pdfunite gm-clues.pdf gm-world.pdf \
  gm-adventure.pdf
echo "  gm-adventure.pdf      (clue tracker + world cheatsheet)"

echo ""
echo "Print:"
echo "  character-sheet.pdf    — 10 copies"
echo "  player-reference.pdf   — 5 copies"
echo "  gm-reference.pdf       — 1 copy"
echo "  gm-adventure.pdf       — 1 copy (write on during play)"
