---
name: hover-3d
description: 3D tilt effect on hover
category: Data Display
base: hover-3d
---

## Usage

The `hover-3d` mixin renders a `<div>` element with DaisyUI `hover-3d` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+hover-3d({})
  | Content
```

### YAML

```yaml
- hover-3d:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="hover-3d">Example</div>
</div>
