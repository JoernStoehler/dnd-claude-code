#!/usr/bin/env node
/**
 * Generate art style samples - same subject, different artistic styles
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE_SUBJECT = "gnome inventor with brass goggles, wild white hair, soot-stained cheeks, cheerful expression";
const FRAMING = "head and shoulders portrait, centered composition, facing slightly left";

const STYLES = [
  {
    id: 'classic-dnd',
    name: 'Classic D&D Illustration',
    style: 'in the style of Larry Elmore and Jeff Easley, 1980s fantasy illustration, detailed realistic painting, warm colors'
  },
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    style: 'oil painting, visible brushstrokes, rich colors, classical portrait technique, museum quality'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    style: 'watercolor painting, soft edges, flowing colors, delicate washes, fantasy book illustration'
  },
  {
    id: 'ink-wash',
    name: 'Ink and Wash',
    style: 'ink drawing with watercolor wash, pen and ink linework, subtle color, storybook illustration'
  },
  {
    id: 'digital-painterly',
    name: 'Digital Painterly',
    style: 'digital painting, painterly style, soft lighting, fantasy concept art, artstation quality'
  },
  {
    id: 'storybook',
    name: 'Storybook Illustration',
    style: 'childrens book illustration, whimsical, warm and inviting, soft lighting, Brian Froud inspired'
  },
  {
    id: 'graphic-novel',
    name: 'Graphic Novel',
    style: 'graphic novel art, bold lines, flat colors, comic book style, dynamic illustration'
  },
  {
    id: 'renaissance',
    name: 'Renaissance Portrait',
    style: 'renaissance portrait painting, chiaroscuro lighting, dark background, classical composition, old master style'
  }
];

async function main() {
  const outDir = process.argv[2] || '.';
  const apiKey = process.env.FAL_KEY;

  if (!apiKey) {
    console.error('FAL_KEY not set');
    process.exit(1);
  }

  console.log(`Generating ${STYLES.length} style samples...\n`);

  const results = [];

  for (const style of STYLES) {
    const prompt = `${FRAMING}, ${BASE_SUBJECT}, ${style.style}`;
    const outPath = path.join(outDir, `style-${style.id}.png`);

    console.log(`[${style.id}] ${style.name}`);
    console.log(`  Prompt: ${prompt.slice(0, 80)}...`);

    try {
      const payload = JSON.stringify({
        prompt: prompt,
        image_size: 'square',  // Square for zero-crop on card
        num_images: 1
      });

      const curlCmd = `curl -s -X POST "https://fal.run/fal-ai/flux/dev" \
        -H "Authorization: Key ${apiKey}" \
        -H "Content-Type: application/json" \
        -d '${payload.replace(/'/g, "'\\''")}'`;

      const resultStr = execSync(curlCmd, { encoding: 'utf-8', timeout: 120000 });
      const result = JSON.parse(resultStr);

      if (!result.images?.[0]?.url) {
        console.error(`  Error: No image URL`);
        continue;
      }

      execSync(`curl -s -o "${outPath}" "${result.images[0].url}"`, { timeout: 60000 });
      console.log(`  Saved: ${outPath}\n`);

      results.push({ ...style, prompt, path: `style-${style.id}.png` });

      // Small delay to be nice to the API
      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.error(`  Error: ${error.message}\n`);
    }
  }

  // Generate markdown comparison
  let md = `# Art Style Comparison

Same subject (${BASE_SUBJECT}), different artistic styles.

## Quick Reference

| Style | Character |
|-------|-----------|
${results.map(r => `| ${r.name} | ![](${r.path}) |`).join('\n')}

---

`;

  for (const r of results) {
    md += `## ${r.name}

![${r.id}](${r.path})

**Prompt:** ${r.prompt}

---

`;
  }

  md += `## Feedback

Preferred style(s):

Notes:
`;

  fs.writeFileSync(path.join(outDir, 'STYLE-COMPARISON.md'), md);
  console.log(`\nWrote STYLE-COMPARISON.md with ${results.length} samples`);
}

main().catch(console.error);
