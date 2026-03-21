---
name: file-input
description: File upload input
category: Data Input
base: file-input
---

## Usage

The `file-input` mixin renders a `<input>` element with DaisyUI `file-input` classes.

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
+file-input({color: 'neutral', size: 'md'})
  | Content
```

### YAML

```yaml
- file-input:
    color: neutral
    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <input class="file-input file-input-neutral">Example</input>
</div>
