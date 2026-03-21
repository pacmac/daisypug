---
name: rating
description: Star/icon rating input
category: Data Input
base: rating
---

## Usage

The `rating` mixin renders a `<div>` element with DaisyUI `rating` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `size` | string | xs, sm, md, lg, xl | Component size |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+rating-hidden(opts)`

## Code

### Pug

```pug
+rating({size: 'md'})
  +rating-hidden
```

### YAML

```yaml
- rating:

    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="rating">Example</div>
</div>
