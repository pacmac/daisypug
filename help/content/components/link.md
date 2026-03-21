---
name: link
description: Styled underline links
category: Navigation
base: link
---

## Usage

The `link` mixin renders a `<a>` element with DaisyUI `link` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `color` | string | neutral, primary, secondary, accent, info, success, warning, error | Component color |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+link({color: 'neutral'})
  | Content
```

### YAML

```yaml
- link:
    color: neutral

    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <a class="link link-neutral">Example</a>
</div>
