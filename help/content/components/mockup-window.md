---
name: mockup-window
description: OS window mockup
category: Mockup
base: mockup-window
---

## Usage

The `mockup-window` mixin renders a `<div>` element with DaisyUI `mockup-window` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+mockup-window({})
  | Content
```

### YAML

```yaml
- mockup-window:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="mockup-window">Example</div>
</div>
