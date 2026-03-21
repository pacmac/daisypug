---
name: mockup-browser
description: Browser window mockup
category: Mockup
base: mockup-browser
---

## Usage

The `mockup-browser` mixin renders a `<div>` element with DaisyUI `mockup-browser` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+mockup-browser-toolbar(opts)`

## Code

### Pug

```pug
+mockup-browser({})
  +mockup-browser-toolbar
```

### YAML

```yaml
- mockup-browser:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="mockup-browser">Example</div>
</div>
