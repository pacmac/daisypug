---
name: validator
description: Validation state styling
category: Data Input
base: validator
---

## Usage

The `validator` mixin renders a `<div>` element with DaisyUI `validator` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+validator({})
  | Content
```

### YAML

```yaml
- validator:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="validator">Example</div>
</div>
