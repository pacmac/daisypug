---
name: steps
description: Process step indicators
category: Navigation
base: steps
---

## Usage

The `steps` mixin renders a `<ul>` element with DaisyUI `steps` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `color` | string | step-neutral, step-primary, step-secondary, step-accent, step-info, step-success, step-warning, step-error | Component color |
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+step(opts)`

## Code

### Pug

```pug
+steps({color: 'step-neutral'})
  +step
```

### YAML

```yaml
- steps:
    color: step-neutral

    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <ul class="steps steps-step-neutral">Example</ul>
</div>
