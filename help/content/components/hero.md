---
name: hero
description: Large display box with title
category: Layout
base: hero
---

## Usage

The `hero` mixin renders a `<div>` element with DaisyUI `hero` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+hero-content(opts)`
- `+hero-overlay(opts)`

## Code

### Pug

```pug
+hero({})
  +hero-content
  +hero-overlay
```

### YAML

```yaml
- hero:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="hero">Example</div>
</div>
