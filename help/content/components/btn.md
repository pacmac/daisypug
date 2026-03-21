---
name: btn
description: Buttons for actions or choices
category: Actions
base: btn
---

## Usage

The `btn` mixin renders a `<button>` element with DaisyUI button classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `color` | string | neutral, primary, secondary, accent, info, success, warning, error | Button color |
| `size` | string | xs, sm, md, lg, xl | Button size |
| `style` | string | outline, dash, soft, ghost, link | Button style variant |
| `shape` | string | square, circle | Button shape |
| `wide` | boolean | | Increased horizontal padding |
| `block` | boolean | | Full width |
| `active` | boolean | | Active state |
| `disabled` | boolean | | Disabled state |
| `text` | string | | Button text content |
| `class` | string | | Additional CSS classes |

All standard HTML attributes are passed through via `&attributes`.

## Code

### Pug

```pug
//- Basic button
+btn({text: 'Click me', color: 'primary'})

//- With size and style
+btn({text: 'Outline', color: 'info', style: 'outline', size: 'lg'})

//- With HTML attributes
+btn({text: 'Submit', color: 'success'})(type="submit" form="my-form")

//- With block content (icons + text)
+btn({color: 'secondary'})
  svg.w-4.h-4(xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor")
    path(stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4")
  | Download

//- Shape variants
+btn({color: 'error', shape: 'circle', text: 'X'})
+btn({color: 'primary', shape: 'square', text: '+'})

//- Full width
+btn({color: 'primary', text: 'Full Width', block: true})
```

### YAML

```yaml
# Basic button
- btn: {color: primary, text: Click me}

# With size and style
- btn:
    color: info
    style: outline
    size: lg
    text: Outline

# With HTML attributes
- btn:
    color: success
    text: Submit
    attrs:
      type: submit
      form: my-form

# Full width
- btn: {color: primary, text: Full Width, block: true}
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <button class="btn btn-primary">Primary</button>
  <button class="btn btn-secondary">Secondary</button>
  <button class="btn btn-accent">Accent</button>
  <button class="btn btn-info btn-outline">Info Outline</button>
  <button class="btn btn-success btn-soft">Success Soft</button>
  <button class="btn btn-warning btn-dash">Warning Dash</button>
  <button class="btn btn-ghost">Ghost</button>
  <button class="btn btn-link">Link</button>
</div>

### Sizes

<div class="flex flex-wrap items-center gap-3 p-4 bg-base-200 rounded-box">
  <button class="btn btn-primary btn-xs">XS</button>
  <button class="btn btn-primary btn-sm">SM</button>
  <button class="btn btn-primary btn-md">MD</button>
  <button class="btn btn-primary btn-lg">LG</button>
  <button class="btn btn-primary btn-xl">XL</button>
</div>

### Shapes

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <button class="btn btn-primary btn-square">+</button>
  <button class="btn btn-secondary btn-circle">X</button>
  <button class="btn btn-primary btn-wide">Wide</button>
  <button class="btn btn-accent btn-block">Block (full width)</button>
</div>
