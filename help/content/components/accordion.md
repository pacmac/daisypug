---
name: accordion
description: Show/hide content, one item open at a time
category: Data Display
base: accordion
---

## Usage

The `accordion` mixin renders a `<div>` element with DaisyUI `accordion` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+accordion-title(opts)`
- `+accordion-content(opts)`

## Code

### Pug

```pug
+accordion({})
  +accordion-title
  +accordion-content
```

### YAML

```yaml
- accordion:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="accordion">Example</div>
</div>
