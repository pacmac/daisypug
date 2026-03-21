---
name: radial-progress
description: Circular progress indicator
category: Feedback
base: radial-progress
---

## Usage

The `radial-progress` mixin renders a `<div>` element with DaisyUI `radial-progress` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+radial-progress({})
  | Content
```

### YAML

```yaml
- radial-progress:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="radial-progress">Example</div>
</div>
