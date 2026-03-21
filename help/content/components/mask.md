---
name: mask
description: Shape-crop element content
category: Layout
base: mask
---

## Usage

The `mask` mixin renders a `<div>` element with DaisyUI `mask` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+mask({})
  | Content
```

### YAML

```yaml
- mask:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="mask">Example</div>
</div>
