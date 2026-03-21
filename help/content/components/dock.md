---
name: dock
description: Bottom navigation bar
category: Navigation
base: dock
---

## Usage

The `dock` mixin renders a `<div>` element with DaisyUI `dock` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `size` | string | xs, sm, md, lg, xl | Component size |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+dock-label(opts)`

## Code

### Pug

```pug
+dock({size: 'md'})
  +dock-label
```

### YAML

```yaml
- dock:

    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="dock">Example</div>
</div>
