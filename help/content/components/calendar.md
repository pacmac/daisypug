---
name: calendar
description: Calendar library styles
category: Data Input
base: calendar
---

## Usage

The `calendar` mixin renders a `<div>` element with DaisyUI `calendar` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+calendar({})
  | Content
```

### YAML

```yaml
- calendar:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="calendar">Example</div>
</div>
