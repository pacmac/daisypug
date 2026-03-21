---
name: divider
description: Content separator
category: Layout
base: divider
---

## Usage

The `divider` mixin renders a `<div>` element with DaisyUI `divider` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `color` | string | neutral, primary, secondary, accent, info, success, warning, error | Component color |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+divider({color: 'neutral'})
  | Content
```

### YAML

```yaml
- divider:
    color: neutral

    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="divider divider-neutral">Example</div>
</div>
