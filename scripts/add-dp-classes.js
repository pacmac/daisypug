#!/usr/bin/env node
/**
 * Add dp-{name} class to every mixin's class array.
 * Transforms: const cls = ['btn', ...] → const cls = ['dp-btn', 'btn', ...]
 */

const fs = require('fs');
const path = require('path');

const MIXINS_DIR = path.join(__dirname, '..', 'mixins');
const files = fs.readdirSync(MIXINS_DIR).filter(f => f.endsWith('.pug') && f !== 'index.pug');

let updated = 0;
let changes = 0;

for (const file of files) {
  const filePath = path.join(MIXINS_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Pattern: const cls = ['component-name', ...]
  // Add 'dp-component-name' before the first class
  content = content.replace(
    /const cls = \['([a-z][-a-z0-9]*)'/g,
    (match, name) => {
      changes++;
      return `const cls = ['dp-${name}', '${name}'`;
    }
  );

  // Pattern for sub-mixins with inline class: class=['component-name',
  // (some mixins use this pattern directly)

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    updated++;
    console.log(`Updated: ${file}`);
  } else {
    console.log(`Skipped: ${file} (no cls pattern found)`);
  }
}

console.log(`\n${updated} files updated, ${changes} class arrays modified.`);
