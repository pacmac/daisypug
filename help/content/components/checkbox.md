---
name: checkbox
description: Select/deselect a value
category: Data Input
base: checkbox
---

## Usage

The `checkbox` mixin renders a `<input>` element with DaisyUI `checkbox` classes.

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
+checkbox({color: 'neutral', size: 'md'})
  | Content
```

### YAML

```yaml
- checkbox:
    color: neutral
    size: md
    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <input class="checkbox checkbox-neutral">Example</input>
</div>
