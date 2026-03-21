---
name: join
description: Button group for page navigation
category: Navigation
base: join
---

## Usage

The `join` mixin renders a `<div>` element with DaisyUI `join` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+join({})
  | Content
```

### YAML

```yaml
- join:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="join">Example</div>
</div>
