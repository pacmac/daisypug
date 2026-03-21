---
name: css-compilation
title: CSS Compilation
description: Compile Tailwind + DaisyUI CSS locally for self-contained output
category: Guides
order: 5
---

## Usage

DaisyPug supports two CSS modes:

### CDN Mode (default)

```bash
daisypug render page.pug
```

Output HTML references Tailwind and DaisyUI via CDN:
- Fast rendering (~instant)
- Small HTML output (~13KB for showcase)
- Requires internet to view
- Loads all CSS (not tree-shaken)

### Local Mode (compiled)

```bash
daisypug render page.pug --css local
```

Output HTML has all CSS inlined in a `<style>` tag:
- Compilation takes ~200-500ms
- Larger HTML (~96KB for showcase)
- Works offline, no external dependencies
- Tree-shaken — only CSS for used classes

### When to Use Which

| Scenario | Mode |
|----------|------|
| Development / iteration | `cdn` |
| Production deployment | `local` |
| Sharing HTML files | `local` |
| Offline viewing | `local` |
| CI/CD builds | `local --minify` |

### Minification

Add `--minify` to compress the compiled CSS:

```bash
daisypug render page.pug --css local --minify -o production.html
```

## Code

### API Usage

```javascript
const { renderPage, renderYaml, compileCss } = require('daisypug');

// Render with compiled CSS
const html = await renderPage(pugContent, { css: 'local' });

// Render with minified CSS
const html = await renderPage(pugContent, { css: 'local', minify: true });

// Compile CSS separately
const cssString = await compileCss('<button class="btn btn-primary">Hi</button>');
```

### How It Works

1. Engine renders HTML normally (with CDN references)
2. `compileCss()` writes HTML to a temp directory
3. Tailwind v4 PostCSS scans the HTML for used classes
4. DaisyUI v5 plugin adds component and theme styles
5. Compiled CSS is injected into a `<style>` tag
6. CDN references are removed
7. Temp directory is cleaned up

### Input CSS (Tailwind v4 syntax)

The compilation uses this input internally:

```css
@import "tailwindcss";
@plugin "daisyui";
```

This replaces the old Tailwind v3 `@tailwind` directives and the `tailwind.config.js` plugin array.

### Dependencies

CSS compilation requires these packages (included with DaisyPug):

- `tailwindcss` v4.2+
- `@tailwindcss/postcss` v4.2+
- `postcss` v8.5+
- `daisyui` v5.5+

## Examples

### Size Comparison

| Page | CDN Mode | Local Mode | Local + Minify |
|------|----------|------------|----------------|
| Single button | 532 bytes | ~18KB | ~15KB |
| Showcase (all components) | 13KB | ~96KB | ~80KB |

The local mode output is larger but completely self-contained. The CDN version is smaller but requires 3 external HTTP requests to load CSS.

### Build Script

```bash
#!/bin/bash
# Build all pages for production
for f in pages/*.pug; do
  name=$(basename "${f%.pug}")
  echo "Building $name..."
  daisypug render "$f" --css local --minify --theme light -o "dist/${name}.html"
done
echo "Done! All pages in dist/"
```
