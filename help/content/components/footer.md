---
name: footer
description: Page footer with links
category: Layout
base: footer
---

## Usage

The `footer` mixin renders a `<footer>` element with DaisyUI `footer` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+footer-title(opts)`

## Code

### Pug

```pug
+footer({})
  +footer-title
```

### YAML

```yaml
- footer:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <footer class="footer">Example</footer>
</div>
