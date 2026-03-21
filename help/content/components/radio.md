---
name: radio
description: Select one option from a set
category: Data Input
base: radio
---

## Usage

The `radio` mixin renders a `<input>` element with DaisyUI `radio` classes.

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
+radio({color: 'neutral', size: 'md'})
  | Content
```

### YAML

```yaml
- radio:
    color: neutral
    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <input class="radio radio-neutral">Example</input>
</div>
