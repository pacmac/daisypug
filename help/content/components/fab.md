---
name: fab
description: Floating action button with speed dial
category: Actions
base: fab
---

## Usage

The `fab` mixin renders a `<div>` element with DaisyUI `fab` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+fab-content(opts)`

## Code

### Pug

```pug
+fab({})
  +fab-content
```

### YAML

```yaml
- fab:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="fab">Example</div>
</div>
