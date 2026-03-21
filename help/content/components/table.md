---
name: table
description: Data in table format
category: Data Display
base: table
---

## Usage

The `table` mixin renders a `<table>` element with DaisyUI `table` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `size` | string | xs, sm, md, lg, xl | Component size |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+table({size: 'md'})
  | Content
```

### YAML

```yaml
- table:

    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <table class="table">Example</table>
</div>
