---
name: skeleton
description: Loading placeholder
category: Feedback
base: skeleton
---

## Usage

The `skeleton` mixin renders a `<div>` element with DaisyUI `skeleton` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+skeleton({})
  | Content
```

### YAML

```yaml
- skeleton:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="skeleton">Example</div>
</div>
