---
name: drawer
description: Sidebar grid layout
category: Layout
base: drawer
---

## Usage

The `drawer` mixin renders a `<div>` element with DaisyUI `drawer` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+drawer-toggle(opts)`
- `+drawer-content(opts)`
- `+drawer-side(opts)`
- `+drawer-overlay(opts)`

## Code

### Pug

```pug
+drawer({})
  +drawer-toggle
  +drawer-content
  +drawer-side
  +drawer-overlay
```

### YAML

```yaml
- drawer:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="drawer">Example</div>
</div>
