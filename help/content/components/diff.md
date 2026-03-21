---
name: diff
description: Side-by-side comparison
category: Data Display
base: diff
---

## Usage

The `diff` mixin renders a `<div>` element with DaisyUI `diff` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+diff-item-1(opts)`
- `+diff-item-2(opts)`
- `+diff-resizer(opts)`

## Code

### Pug

```pug
+diff({})
  +diff-item-1
  +diff-item-2
  +diff-resizer
```

### YAML

```yaml
- diff:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="diff">Example</div>
</div>
