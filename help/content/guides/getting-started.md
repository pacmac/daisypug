---
name: getting-started
title: Getting Started
description: Install DaisyPug and render your first page
category: Guides
order: 1
---

## Usage

### Installation

```bash
pnpm add daisypug
```

Or clone and install locally:

```bash
git clone <repo> daisypug
cd daisypug
pnpm install
```

### Quick Start

Create a file `page.pug`:

```pug
+hero({class: 'min-h-screen bg-base-200'})
  +hero-content({class: 'text-center'})
    h1.text-5xl.font-bold Hello DaisyPug
    p.py-6 Your first page
    +btn({color: 'primary', text: 'Get Started'})
```

Render it:

```bash
daisypug render page.pug --theme light -o page.html
```

Open `page.html` in your browser.

### Two Input Formats

**Pug** — full control, mixin syntax:

```pug
+btn({color: 'primary', text: 'Click me'})
```

**YAML** — declarative, easy to generate programmatically:

```yaml
- btn:
    color: primary
    text: Click me
```

Both produce identical HTML output.

### Node.js API

```javascript
const { renderPage, renderYaml } = require('daisypug');

// From Pug
const html = renderPage('+btn({text: "Hi", color: "primary"})', {
  title: 'My Page',
  theme: 'dark',
});

// From YAML
const html2 = renderYaml('- btn: {color: primary, text: Hi}', {
  title: 'My Page',
});

// Self-contained (compiled CSS, no CDN)
const html3 = await renderPage(pugContent, { css: 'local' });
```

## Code

### Project Structure

```
daisypug/
  bin/daisypug.js    # CLI entry point
  lib/engine.js      # Core render engine
  lib/css.js         # Tailwind/DaisyUI CSS compiler
  mixins/            # 57 Pug mixin files
  layouts/base.pug   # HTML page layout
  index.js           # Library export
```

### Key Functions

| Function | Description |
|----------|-------------|
| `renderPug(pug)` | Render Pug fragment to HTML (no layout) |
| `renderPage(pug, opts)` | Render Pug as full HTML page with layout |
| `renderYaml(yaml, opts)` | Render YAML as full HTML page |
| `yamlToPug(yaml)` | Convert YAML to Pug (no render) |
| `compileCss(html)` | Compile Tailwind+DaisyUI CSS for given HTML |

### Layout Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | 'DaisyPug' | Page `<title>` |
| `theme` | string | — | DaisyUI theme (`data-theme`) |
| `lang` | string | 'en' | HTML lang attribute |
| `css` | string | 'cdn' | CSS mode: `cdn` or `local` |
| `head` | string | — | Extra HTML for `<head>` |

## Examples

### Minimal Page

```pug
+btn({text: 'Hello World', color: 'primary'})
```

```bash
daisypug render minimal.pug -o minimal.html
```

### Full Page with Theme

```pug
+navbar({class: 'bg-base-100 shadow-sm'})
  +navbar-start
    +btn({style: 'ghost', text: 'My App', class: 'text-xl'})
  +navbar-end
    +btn({color: 'primary', text: 'Login'})

+hero({class: 'min-h-[60vh] bg-base-200'})
  +hero-content({class: 'text-center'})
    h1.text-4xl.font-bold Welcome
    +btn({color: 'primary', text: 'Get Started'})
```

```bash
daisypug render page.pug --theme dark --title "My App" -o page.html
```

### Production Build (self-contained)

```bash
daisypug render page.pug --css local --minify --theme light -o production.html
```

Output is a single HTML file with all CSS inlined — no CDN dependencies.
