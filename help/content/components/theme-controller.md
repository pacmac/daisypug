---
name: theme-controller
description: Controls page theme via checkbox/radio
category: Actions
base: theme-controller
---

## Usage

The `theme-controller` mixin renders a `<input>` element with DaisyUI `theme-controller` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

## Code

### Pug

```pug
+theme-controller({})
  | Content
```

### YAML

```yaml
- theme-controller:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <input class="theme-controller">Example</input>
</div>
