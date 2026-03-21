---
name: breadcrumbs
description: Navigation path trail
category: Navigation
base: breadcrumbs
---

## Usage

The `breadcrumbs` mixin renders a `<div>` element with DaisyUI `breadcrumbs` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+breadcrumbs({})
  | Content
```

### YAML

```yaml
- breadcrumbs:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="breadcrumbs">Example</div>
</div>
