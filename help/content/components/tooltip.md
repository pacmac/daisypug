---
name: tooltip
description: Hover message display
category: Feedback
base: tooltip
---

## Usage

The `tooltip` mixin renders a `<div>` element with DaisyUI `tooltip` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `color` | string | tooltip-neutral, tooltip-primary, tooltip-secondary, tooltip-accent, tooltip-info, tooltip-success, tooltip-warning, tooltip-error | Component color |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+tooltip({color: 'tooltip-neutral'})
  | Content
```

### YAML

```yaml
- tooltip:
    color: tooltip-neutral

    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="tooltip tooltip-tooltip-neutral">Example</div>
</div>
