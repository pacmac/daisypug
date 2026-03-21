---
name: mockup-code
description: Code editor mockup
category: Mockup
base: mockup-code
---

## Usage

The `mockup-code` mixin renders a `<div>` element with DaisyUI `mockup-code` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+mockup-code({})
  | Content
```

### YAML

```yaml
- mockup-code:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="mockup-code">Example</div>
</div>
