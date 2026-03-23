---
name: dp-viewport
description: Centered, full-height app container with configurable max-width
category: Layout
base: dp-viewport
---

## Usage

`+dp-viewport(opts)` wraps app content in a centered container that stretches to full viewport height with top/bottom padding. Prevents the UI from stretching too wide on desktop while remaining full-width on mobile.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | string | `'860px'` | Max width (px, rem, or any CSS unit) |
| `padding` | string | `'1em'` | Top and bottom padding |

### What it renders

- `max-width` constrains width on desktop
- `width: 100%` fills mobile screens
- `margin: 0 auto` centers horizontally
- `min-height: 100vh` stretches to full viewport height
- `padding: 1em 0` adds breathing room top and bottom

## Code

### Default (860px, 1em padding)

```pug
+dp-viewport
  h1 My App
  p Content goes here
```

### Custom width

```pug
+dp-viewport({width: '1024px'})
  h1 Wider Layout
```

### Custom padding

```pug
+dp-viewport({padding: '2em'})
  h1 More Breathing Room
```

### With other layout components

```pug
+dp-viewport
  +dp-nav({brand: 'MyApp'})
  +dp-vsplit('300px')
    +dp-panel('west', {title: 'Sidebar'})
      p Navigation
    +dp-panel('center')
      p Main content
```

## Examples

<div class="dp-viewport" style="max-width:860px;margin:0 auto;width:100%;min-height:200px;padding:1em 0;box-sizing:border-box;border:1px dashed oklch(var(--bc) / 0.2)">
  <p style="text-align:center;opacity:0.5">860px centered container with 1em top/bottom padding</p>
</div>
