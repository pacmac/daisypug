---
name: dropdown
description: Opens a menu or element on click
category: Actions
base: dropdown
---

## Usage

The `dropdown` mixin renders a `<div>` element with DaisyUI `dropdown` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+dropdown-content(opts)`

## Code

### Pug

```pug
+dropdown({})
  +dropdown-content
```

### YAML

```yaml
- dropdown:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="dropdown">Example</div>
</div>
