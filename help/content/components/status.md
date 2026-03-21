---
name: status
description: Small status icon (online/offline)
category: Data Display
base: status
---

## Usage

The `status` mixin renders a `<div>` element with DaisyUI `status` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `color` | string | neutral, primary, secondary, accent, info, success, warning, error | Component color |
| `size` | string | xs, sm, md, lg, xl | Component size |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+status({color: 'neutral', size: 'md'})
  | Content
```

### YAML

```yaml
- status:
    color: neutral
    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="status status-neutral">Example</div>
</div>
