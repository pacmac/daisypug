---
name: toast
description: Corner-positioned element stack
category: Feedback
base: toast
---

## Usage

The `toast` mixin renders a `<div>` element with DaisyUI `toast` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+toast({})
  | Content
```

### YAML

```yaml
- toast:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="toast">Example</div>
</div>
