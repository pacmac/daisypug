---
name: alert
description: Important event notifications
category: Feedback
base: alert
---

## Usage

The `alert` mixin renders a `<div>` element with DaisyUI `alert` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `color` | string | info, success, warning, error | Component color |
| `style` | string | outline, dash, soft | Style variant |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+alert({color: 'info'})
  | Content
```

### YAML

```yaml
- alert:
    color: info

    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="alert alert-info">Example</div>
</div>
