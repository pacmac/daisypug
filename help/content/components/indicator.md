---
name: indicator
description: Corner element placement
category: Layout
base: indicator
---

## Usage

The `indicator` mixin renders a `<div>` element with DaisyUI `indicator` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+indicator-item(opts)`

## Code

### Pug

```pug
+indicator({})
  +indicator-item
```

### YAML

```yaml
- indicator:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="indicator">Example</div>
</div>
