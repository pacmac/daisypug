---
name: badge
description: Status indicators
category: Data Display
base: badge
---

## Usage

The `badge` mixin renders a `<span>` element with DaisyUI `badge` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `color` | string | neutral, primary, secondary, accent, info, success, warning, error | Component color |
| `size` | string | xs, sm, md, lg, xl | Component size |
| `style` | string | outline, dash, soft, ghost | Style variant |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+badge({color: 'neutral', size: 'md'})
  | Content
```

### YAML

```yaml
- badge:
    color: neutral
    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <span class="badge badge-neutral">Example</span>
</div>
