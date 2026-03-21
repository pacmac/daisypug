---
name: cli-usage
title: CLI Usage
description: Complete reference for the daisypug command-line tool
category: Guides
order: 2
---

## Usage

### Installation

The CLI is available after installing:

```bash
pnpm add daisypug
```

Or run directly:

```bash
node bin/daisypug.js --help
```

### Commands

#### `render` — Render Pug or YAML to HTML

```bash
daisypug render [file] [options]
```

| Option | Short | Description |
|--------|-------|-------------|
| `--format <fmt>` | `-f` | Input format: `pug` or `yaml` (auto-detected from extension) |
| `--theme <theme>` | `-t` | DaisyUI theme (e.g. `light`, `dark`, `cupcake`) |
| `--title <title>` | | Page title (default: `DaisyPug`) |
| `--lang <lang>` | | HTML lang attribute (default: `en`) |
| `--css <mode>` | | CSS mode: `cdn` (default) or `local` (compiled) |
| `--minify` | | Minify compiled CSS (only with `--css local`) |
| `--fragment` | | Render without HTML layout wrapper |
| `--output <file>` | `-o` | Write output to file instead of stdout |

#### `convert` — Convert YAML to Pug

```bash
daisypug convert [file] [options]
```

| Option | Short | Description |
|--------|-------|-------------|
| `--output <file>` | `-o` | Write output to file instead of stdout |

### Format Detection

The CLI auto-detects format from file extension:
- `.pug` → Pug
- `.yaml`, `.yml` → YAML

When reading from stdin, use `--format` to specify.

## Code

### Render Examples

```bash
# Basic render
daisypug render page.pug

# With theme and title
daisypug render page.yaml --theme dark --title "My Page"

# Output to file
daisypug render page.pug -o output.html

# Fragment (no <html> wrapper)
daisypug render page.pug --fragment

# Production build (self-contained CSS)
daisypug render page.pug --css local --minify -o production.html

# Pipe from stdin
echo '+btn({text: "Hi", color: "primary"})' | daisypug render -f pug --fragment

# YAML from stdin
echo '- btn: {color: primary, text: Hello}' | daisypug render -f yaml
```

### Convert Examples

```bash
# Convert YAML to Pug
daisypug convert page.yaml

# Save converted Pug
daisypug convert page.yaml -o page.pug

# Pipe YAML
cat page.yaml | daisypug convert
```

### CSS Modes

| Mode | Flag | Output | Use Case |
|------|------|--------|----------|
| CDN | `--css cdn` | 13KB HTML, loads CSS from CDN | Development, fast iteration |
| Local | `--css local` | ~96KB self-contained HTML | Production, offline, sharing |

CDN mode (default) is fast but requires internet. Local mode compiles Tailwind + DaisyUI and inlines the CSS — the output works anywhere with no external dependencies.

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error (file not found, bad format, parse error) |

## Examples

### Shell Scripting

```bash
# Render multiple pages
for f in pages/*.pug; do
  daisypug render "$f" --css local -o "dist/$(basename ${f%.pug}.html)"
done

# Watch and re-render (with entr)
ls pages/*.pug | entr -r daisypug render pages/index.pug -o dist/index.html
```

### Combined with Other Tools

```bash
# Pipe to a browser
daisypug render page.pug | xdg-open /dev/stdin

# Minify HTML further
daisypug render page.pug --css local | html-minifier -o production.html

# Generate and serve
daisypug render page.pug -o /var/www/html/index.html
```
