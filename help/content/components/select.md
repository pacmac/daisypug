---
name: select
description: Dropdown option picker
category: Data Input
base: select
---

## Usage

The `select` mixin renders a `<select>` element with DaisyUI `select` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `color` | string | neutral, primary, secondary, accent, info, success, warning, error | Component color |
| `size` | string | xs, sm, md, lg, xl | Component size |
| `style` | string | ghost | Style variant |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+select({color: 'neutral', size: 'md'})
  | Content
```

### YAML

```yaml
- select:
    color: neutral
    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <select class="select select-neutral">Example</select>
</div>
