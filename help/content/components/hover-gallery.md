---
name: hover-gallery
description: Image container revealed on interaction
category: Data Display
base: hover-gallery
---

## Usage

The `hover-gallery` mixin renders a `<div>` element with DaisyUI `hover-gallery` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+hover-gallery({})
  | Content
```

### YAML

```yaml
- hover-gallery:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="hover-gallery">Example</div>
</div>
