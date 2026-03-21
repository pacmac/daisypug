#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const CATALOG = path.join(__dirname, '..', 'components.yaml');
const OUTPUT_DIR = path.join(__dirname, 'content', 'components');

const catalog = yaml.load(fs.readFileSync(CATALOG, 'utf8'));

let created = 0;
let skipped = 0;

for (const [category, components] of Object.entries(catalog)) {
  const categoryName = category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  for (const [key, comp] of Object.entries(components)) {
    const name = comp.base || key;
    const filePath = path.join(OUTPUT_DIR, `${name}.md`);

    // Don't overwrite existing docs
    if (fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    const colors = comp.colors || [];
    const sizes = comp.sizes || [];
    const styles = comp.styles || [];
    const parts = comp.parts || [];
    const modifiers = comp.modifiers || [];
    const element = comp.element || 'div';

    // Build opts table
    let optsTable = '| Option | Type | Values | Description |\n|--------|------|--------|-------------|\n';
    if (colors.length) optsTable += `| \`color\` | string | ${colors.join(', ')} | Component color |\n`;
    if (sizes.length) optsTable += `| \`size\` | string | ${sizes.join(', ')} | Component size |\n`;
    if (styles.length) optsTable += `| \`style\` | string | ${styles.join(', ')} | Style variant |\n`;
    optsTable += '| `class` | string | | Additional CSS classes |\n';
    optsTable += '| `text` | string | | Text content |\n';

    // Sub-mixins
    let subMixins = '';
    if (parts.length) {
      subMixins = '\n### Sub-mixins\n\n';
      parts.forEach(p => { subMixins += `- \`+${p}(opts)\`\n`; });
    }

    // Build example classes
    const exampleClass = [name, colors[0] ? `${name}-${colors[0]}` : ''].filter(Boolean).join(' ');

    const content = `---
name: ${name}
description: ${comp.desc}
category: ${categoryName}
base: ${comp.base}
---

## Usage

The \`${name}\` mixin renders a \`<${element}>\` element with DaisyUI \`${name}\` classes.

### Options

${optsTable}${subMixins}
## Code

### Pug

\`\`\`pug
+${name}({${colors.length ? `color: '${colors[0]}'` : ''}${colors.length && sizes.length ? ', ' : ''}${sizes.length ? `size: 'md'` : ''}})
${parts.length ? parts.map(p => `  +${p}`).join('\n') : '  | Content'}
\`\`\`

### YAML

\`\`\`yaml
- ${name}:
${colors.length ? `    color: ${colors[0]}` : ''}
${sizes.length ? `    size: md` : ''}
    text: Example
\`\`\`

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <${element} class="${exampleClass}">Example</${element}>
</div>
`;

    fs.writeFileSync(filePath, content, 'utf8');
    created++;
  }
}

console.log(`Generated ${created} stub files, skipped ${skipped} existing.`);
console.log(`Total: ${created + skipped} components in ${OUTPUT_DIR}`);
