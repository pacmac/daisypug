const postcss = require('postcss');
const tailwindcss = require('@tailwindcss/postcss');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PROJECT_ROOT = path.join(__dirname, '..');

// Input CSS template for Tailwind v4 + DaisyUI v5
const INPUT_CSS = `@import "tailwindcss";\n@plugin "daisyui";\n`;

/**
 * Compile Tailwind CSS + DaisyUI for the given HTML content.
 * Writes HTML to a temp dir, runs Tailwind PostCSS to scan it,
 * returns only the CSS classes actually used.
 *
 * @param {string} html - Rendered HTML to scan for class usage
 * @param {object} options
 * @param {boolean} options.minify - Minify output CSS (default: false)
 * @returns {Promise<string>} Compiled CSS string
 */
async function compileCss(html, options = {}) {
  // Create temp directory inside project (so @import "tailwindcss" resolves)
  const tmpDir = fs.mkdtempSync(path.join(PROJECT_ROOT, '.tmp-css-'));

  try {
    // Write HTML for Tailwind to scan
    fs.writeFileSync(path.join(tmpDir, 'index.html'), html, 'utf8');

    // Write input CSS
    const inputCssPath = path.join(tmpDir, 'input.css');
    fs.writeFileSync(inputCssPath, INPUT_CSS, 'utf8');

    // Run PostCSS with Tailwind plugin
    const processor = postcss([
      tailwindcss({
        base: tmpDir,
        optimize: options.minify ? { minify: true } : false,
      }),
    ]);

    const result = await processor.process(INPUT_CSS, { from: inputCssPath });
    return result.css;
  } finally {
    // Clean up temp directory
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

module.exports = { compileCss };
