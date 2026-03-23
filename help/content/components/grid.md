---
name: grid
description: CSS grid layout with configurable columns and gap
category: Layout
base: dp-grid
---

## Usage

`+grid(opts)` renders a CSS grid container. Children become grid cells.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cols` | number | `1` | Number of columns (1-12) |
| `gap` | number | `2` | Gap between cells (Tailwind scale: 0-8) |
| `class` | string | — | Additional classes |

## Code

### 3 columns

```pug
+grid({cols: 3})
  +btn({text: '1'})
  +btn({text: '2'})
  +btn({text: '3'})
```

### 2 columns, larger gap

```pug
+grid({cols: 2, gap: 4})
  +card
    +card-body
      p Card A
  +card
    +card-body
      p Card B
```

### 6 columns, no gap

```pug
+grid({cols: 6, gap: 0})
  each n in [1,2,3,4,5,6]
    +btn({text: String(n)})
```

## Examples

<div class="dp-grid grid grid-cols-3 gap-2">
  <button class="dp-btn btn">1</button>
  <button class="dp-btn btn">2</button>
  <button class="dp-btn btn">3</button>
</div>
