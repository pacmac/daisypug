---
name: loading
description: Loading animation indicator
category: Feedback
base: loading
---

## Usage

The `loading` mixin renders a `<span>` element with DaisyUI `loading` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `size` | string | xs, sm, md, lg, xl | Component size |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+loading({size: 'md'})
  | Content
```

### YAML

```yaml
- loading:

    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <span class="loading">Example</span>
</div>
