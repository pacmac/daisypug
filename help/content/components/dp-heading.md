---
name: dp-heading
description: Page/section heading with optional Lucide icon
category: Display
base: dp-heading
---

## Usage

`+dp-heading(text, opts)` renders an `<h1>`–`<h6>` element with consistent styling and optional Lucide icon.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `level` | number | 2 | Heading level (1–6) |
| `icon` | string | — | Lucide icon name |
| `size` | string | auto | Tailwind text size override |
| `class` | string | — | Additional classes |

### Default Sizes

| Level | Size |
|-------|------|
| h1 | text-2xl |
| h2 | text-lg |
| h3 | text-base |
| h4 | text-sm |
| h5–h6 | text-xs |

## Code

```pug
//- Page title
+dp-heading('Parts Master', {level: 1, icon: 'package'})

//- Section heading
+dp-heading('Details', {level: 2})

//- Sub-section with icon
+dp-heading('Dimensions', {level: 3, icon: 'ruler'})

//- Custom size
+dp-heading('Note', {level: 4, size: 'text-base'})

//- With id for anchoring
+dp-heading('Settings', {level: 2, icon: 'settings'})(id="settings-section")
```

## Examples

<h1 class="dp-heading font-semibold text-2xl"><i data-lucide="package" style="width:20px;height:20px" class="inline-block mr-1.5 align-text-bottom"></i>Parts Master</h1>
<h2 class="dp-heading font-semibold text-lg">Details</h2>
<h3 class="dp-heading font-semibold text-base"><i data-lucide="ruler" style="width:16px;height:16px" class="inline-block mr-1.5 align-text-bottom"></i>Dimensions</h3>
