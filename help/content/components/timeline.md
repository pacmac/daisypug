---
name: timeline
description: Chronological event list
category: Data Display
base: timeline
---

## Usage

The `timeline` mixin renders a `<ul>` element with DaisyUI `timeline` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+timeline-start(opts)`
- `+timeline-middle(opts)`
- `+timeline-end(opts)`

## Code

### Pug

```pug
+timeline({})
  +timeline-start
  +timeline-middle
  +timeline-end
```

### YAML

```yaml
- timeline:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <ul class="timeline">Example</ul>
</div>
