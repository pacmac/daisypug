---
name: swap
description: Toggle visibility of two elements
category: Actions
base: swap
---

## Usage

The `swap` mixin renders a `<label>` element with DaisyUI `swap` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+swap-on(opts)`
- `+swap-off(opts)`
- `+swap-indeterminate(opts)`

## Code

### Pug

```pug
+swap({})
  +swap-on
  +swap-off
  +swap-indeterminate
```

### YAML

```yaml
- swap:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <label class="swap">Example</label>
</div>
