#!/usr/bin/env bash
# Generate all PDFs from HTML sources and merge into 4 printable bundles.
# Run from the oneshot directory.
set -e
cd "$(dirname "$0")"

echo "Generating individual PDFs..."
for f in player-rules-reference ability-lookup sorcery-cheat-sheet pregen-examples \
         character-creation \
         gm-reference gm-table-tools gm-npc-generator gm-clue-tracker gm-world-cheatsheet; do
  weasyprint "$f.html" "$f.pdf" 2>/dev/null
  echo "  $f.pdf"
done

echo "Merging into bundles..."

# Player reference: rules + abilities + sorcery + pregens (print 5x)
pdfunite player-rules-reference.pdf ability-lookup.pdf sorcery-cheat-sheet.pdf pregen-examples.pdf \
  player-reference.pdf
echo "  player-reference.pdf ($(python3 -c "from weasyprint import HTML; print(sum(len(HTML(f'{f}.html').render().pages) for f in ['player-rules-reference','ability-lookup','sorcery-cheat-sheet','pregen-examples']))")p)"

# Character sheet: official BW sheet + creation guide (print 10x)
pdfunite sots-character-sheet-bw.pdf character-creation.pdf \
  character-sheet.pdf
echo "  character-sheet.pdf"

# GM reference: rules + balance + NPC gen (GM only)
pdfunite gm-reference.pdf gm-table-tools.pdf gm-npc-generator.pdf \
  gm-reference-complete.pdf
echo "  gm-reference-complete.pdf"

# GM adventure: clue tracker + world cheatsheet (GM only, write on during play)
pdfunite gm-clue-tracker.pdf gm-world-cheatsheet.pdf \
  gm-adventure.pdf
echo "  gm-adventure.pdf"

echo "Done. Print list:"
echo "  character-sheet.pdf     — 10 copies (page 1 = blank sheet, page 2 = creation guide)"
echo "  player-reference.pdf    — 5 copies (pages 1-4, sorcery page only needed by 1 player)"
echo "  gm-reference-complete.pdf — 1 copy"
echo "  gm-adventure.pdf        — 1 copy (write on this during play)"
