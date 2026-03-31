#!/usr/bin/env bash
# Generate all PDFs from HTML sources and merge into 4 printable bundles.
set -e
cd "$(dirname "$0")"

if [ ! -f sots-character-sheet-bw.pdf ]; then
  echo "Downloading official character sheet..."
  curl -sL -o sots-character-sheet-bw.pdf \
    "https://pelgranepress.com/srv/htdocs/wp-content/uploads/2022/12/Swords_of_the_Serpentine_character_sheet_BW.pdf"
fi

echo "Generating individual PDFs..."
for f in player-rules player-abilities player-sorcery player-pregens player-chargen \
         gm-rules gm-balance gm-npcs gm-clues gm-world; do
  weasyprint "$f.html" "$f.pdf" 2>/dev/null
  echo "  $f.pdf"
done

echo "Merging into bundles..."

# Player reference (not secret): rules + abilities + sorcery + pregens
pdfunite player-rules.pdf player-abilities.pdf player-sorcery.pdf player-pregens.pdf \
  player-reference.pdf
echo "  player-reference.pdf  (rules + abilities + sorcery + pregens)"

# Character sheet (not secret): official blank + creation guide
pdfunite sots-character-sheet-bw.pdf player-chargen.pdf \
  character-sheet.pdf
echo "  character-sheet.pdf   (official blank sheet + creation guide)"

# GM reference (not secret): rules + balance + NPC gen
pdfunite gm-rules.pdf gm-balance.pdf gm-npcs.pdf \
  gm-reference.pdf
echo "  gm-reference.pdf      (rules + balance + NPC gen)"

# GM adventure (SECRET): clue tracker + world/cast/nodes/stat blocks
pdfunite gm-clues.pdf gm-world.pdf \
  gm-adventure.pdf
echo "  gm-adventure.pdf      (clues + world + nodes + stat blocks — SECRET)"

echo "Cleaning intermediate PDFs..."
rm -f player-rules.pdf player-abilities.pdf player-sorcery.pdf player-pregens.pdf player-chargen.pdf \
     gm-rules.pdf gm-balance.pdf gm-npcs.pdf gm-clues.pdf gm-world.pdf

echo ""
echo "Print:"
echo "  character-sheet.pdf    — 10 copies (players can see)"
echo "  player-reference.pdf   — 5 copies  (players can see)"
echo "  gm-reference.pdf       — 1 copy    (players can see)"
echo "  gm-adventure.pdf       — 1 copy    (SECRET — keep face down)"
