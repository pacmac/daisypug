---
name: label
description: Input field name/title
category: Data Input
base: label
---

## Usage

The `label` mixin renders a `<label>` element with DaisyUI `label` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+label({})
  | Content
```

### YAML

```yaml
- label:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <label class="label">Example</label>
</div>
