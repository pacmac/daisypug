---
name: mockup-phone
description: iPhone mockup
category: Mockup
base: mockup-phone
---

## Usage

The `mockup-phone` mixin renders a `<div>` element with DaisyUI `mockup-phone` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+mockup-phone({})
  | Content
```

### YAML

```yaml
- mockup-phone:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="mockup-phone">Example</div>
</div>
