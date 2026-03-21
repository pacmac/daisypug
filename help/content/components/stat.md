---
name: stat
description: Numbers and data blocks
category: Data Display
base: stat
---

## Usage

The `stat` mixin renders a `<div>` element with DaisyUI `stat` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+stats(opts)`
- `+stat-title(opts)`
- `+stat-value(opts)`
- `+stat-desc(opts)`
- `+stat-figure(opts)`
- `+stat-actions(opts)`

## Code

### Pug

```pug
+stat({})
  +stats
  +stat-title
  +stat-value
  +stat-desc
  +stat-figure
  +stat-actions
```

### YAML

```yaml
- stat:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="stat">Example</div>
</div>
