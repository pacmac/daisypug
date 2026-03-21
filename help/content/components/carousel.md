---
name: carousel
description: Scrollable image/content area
category: Data Display
base: carousel
---

## Usage

The `carousel` mixin renders a `<div>` element with DaisyUI `carousel` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+carousel-item(opts)`

## Code

### Pug

```pug
+carousel({})
  +carousel-item
```

### YAML

```yaml
- carousel:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="carousel">Example</div>
</div>
