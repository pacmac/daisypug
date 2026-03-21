---
name: avatar
description: Thumbnail representation of user/entity
category: Data Display
base: avatar
---

## Usage

The `avatar` mixin renders a `<div>` element with DaisyUI `avatar` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+avatar-group(opts)`

## Code

### Pug

```pug
+avatar({})
  +avatar-group
```

### YAML

```yaml
- avatar:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="avatar">Example</div>
</div>
