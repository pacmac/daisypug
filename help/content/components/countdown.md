---
name: countdown
description: Animated number transitions (0-999)
category: Data Display
base: countdown
---

## Usage

The `countdown` mixin renders a `<span>` element with DaisyUI `countdown` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+countdown({})
  | Content
```

### YAML

```yaml
- countdown:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <span class="countdown">Example</span>
</div>
