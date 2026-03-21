---
name: menu
description: Vertical or horizontal link list
category: Navigation
base: menu
---

## Usage

The `menu` mixin renders a `<ul>` element with DaisyUI `menu` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `size` | string | xs, sm, md, lg, xl | Component size |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+menu-title(opts)`
- `+menu-dropdown(opts)`
- `+menu-dropdown-toggle(opts)`
- `+menu-dropdown-show(opts)`

## Code

### Pug

```pug
+menu({size: 'md'})
  +menu-title
  +menu-dropdown
  +menu-dropdown-toggle
  +menu-dropdown-show
```

### YAML

```yaml
- menu:

    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <ul class="menu">Example</ul>
</div>
