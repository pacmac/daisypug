---
name: kbd
description: Keyboard shortcut display
category: Data Display
base: kbd
---

## Usage

The `kbd` mixin renders a `<kbd>` element with DaisyUI `kbd` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `size` | string | xs, sm, md, lg, xl | Component size |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+kbd({size: 'md'})
  | Content
```

### YAML

```yaml
- kbd:

    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <kbd class="kbd">Example</kbd>
</div>
