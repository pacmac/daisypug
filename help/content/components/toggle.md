---
name: toggle
description: Switch-style checkbox
category: Data Input
base: toggle
---

## Usage

The `toggle` mixin renders a `<input>` element with DaisyUI `toggle` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `color` | string | neutral, primary, secondary, accent, info, success, warning, error | Component color |
| `size` | string | xs, sm, md, lg, xl | Component size |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+toggle({color: 'neutral', size: 'md'})
  | Content
```

### YAML

```yaml
- toggle:
    color: neutral
    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <input class="toggle toggle-neutral">Example</input>
</div>
