---
name: progress
description: Task progress bar
category: Feedback
base: progress
---

## Usage

The `progress` mixin renders a `<progress>` element with DaisyUI `progress` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `color` | string | neutral, primary, secondary, accent, info, success, warning, error | Component color |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+progress({color: 'neutral'})
  | Content
```

### YAML

```yaml
- progress:
    color: neutral

    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <progress class="progress progress-neutral">Example</progress>
</div>
