---
name: list
description: Vertical layout for information rows
category: Data Display
base: list
---

## Usage

The `list` mixin renders a `<ul>` element with DaisyUI `list` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `size` | string | xs, sm, md, lg, xl | Component size |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+list-row(opts)`

## Code

### Pug

```pug
+list({size: 'md'})
  +list-row
```

### YAML

```yaml
- list:

    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <ul class="list">Example</ul>
</div>
