---
name: text-rotate
description: Rotating text animation
category: Data Display
base: text-rotate
---

## Usage

The `text-rotate` mixin renders a `<span>` element with DaisyUI `text-rotate` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+text-rotate({})
  | Content
```

### YAML

```yaml
- text-rotate:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <span class="text-rotate">Example</span>
</div>
