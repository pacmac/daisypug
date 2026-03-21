---
name: input
description: Text input field
category: Data Input
base: input
---

## Usage

The `input` mixin renders a `<input>` element with DaisyUI `input` classes.

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
+input({color: 'neutral', size: 'md'})
  | Content
```

### YAML

```yaml
- input:
    color: neutral
    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <input class="input input-neutral">Example</input>
</div>
