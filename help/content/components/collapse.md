---
name: collapse
description: Show/hide content panel
category: Data Display
base: collapse
---

## Usage

The `collapse` mixin renders a `<div>` element with DaisyUI `collapse` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+collapse-title(opts)`
- `+collapse-content(opts)`

## Code

### Pug

```pug
+collapse({})
  +collapse-title
  +collapse-content
```

### YAML

```yaml
- collapse:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="collapse">Example</div>
</div>
