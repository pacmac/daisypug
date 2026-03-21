---
name: range
description: Slider for value selection
category: Data Input
base: range
---

## Usage

The `range` mixin renders a `<input>` element with DaisyUI `range` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `color` | string | neutral, primary, secondary, accent, info, success, warning, error | Component color |
| `size` | string | xs, sm, md, lg, xl | Component size |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+range({color: 'neutral', size: 'md'})
  | Content
```

### YAML

```yaml
- range:
    color: neutral
    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <input class="range range-neutral">Example</input>
</div>
