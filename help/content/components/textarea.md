---
name: textarea
description: Multi-line text input
category: Data Input
base: textarea
---

## Usage

The `textarea` mixin renders a `<textarea>` element with DaisyUI `textarea` classes.

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
+textarea({color: 'neutral', size: 'md'})
  | Content
```

### YAML

```yaml
- textarea:
    color: neutral
    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <textarea class="textarea textarea-neutral">Example</textarea>
</div>
