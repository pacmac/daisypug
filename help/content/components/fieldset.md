---
name: fieldset
description: Group related form elements
category: Data Input
base: fieldset
---

## Usage

The `fieldset` mixin renders a `<fieldset>` element with DaisyUI `fieldset` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+fieldset-legend(opts)`
- `+fieldset-label(opts)`

## Code

### Pug

```pug
+fieldset({})
  +fieldset-legend
  +fieldset-label
```

### YAML

```yaml
- fieldset:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <fieldset class="fieldset">Example</fieldset>
</div>
