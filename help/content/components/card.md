---
name: card
description: Content grouping container with body, title, and actions
category: Data Display
base: card
---

## Usage

The `card` mixin renders a container `<div>` with DaisyUI card classes. Use sub-mixins `+card-body`, `+card-title`, and `+card-actions` for structured content.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `size` | string | xs, sm, md, lg, xl | Card size |
| `style` | string | border, dash | Card border style |
| `side` | boolean | | Image on the side |
| `imageFull` | boolean | | Image as background overlay |
| `class` | string | | Additional CSS classes |

### Sub-mixins

- `+card-body(opts)` — Content wrapper
- `+card-title(opts)` — Title element (`<h2>`)
- `+card-actions(opts)` — Actions container

## Code

### Pug

```pug
//- Basic card
+card({style: 'border', class: 'w-96'})
  +card-body
    +card-title({text: 'Card Title'})
    p Some content goes here
    +card-actions({class: 'justify-end'})
      +btn({color: 'primary', text: 'Action'})

//- Card with image
+card({class: 'w-96 shadow-xl'})
  figure
    img(src="/photo.jpg" alt="Photo")
  +card-body
    +card-title({text: 'Shoes!'})
    p If a dog chews shoes whose shoes does he choose?
    +card-actions({class: 'justify-end'})
      +btn({color: 'primary', text: 'Buy Now'})

//- Side layout
+card({side: true, class: 'bg-base-100 shadow-xl'})
  figure
    img(src="/photo.jpg" alt="Photo")
  +card-body
    +card-title({text: 'Side Image'})
    p Content next to the image
```

### YAML

```yaml
- card:
    opts:
      style: border
      class: w-96
    children:
      - card-body:
          children:
            - card-title: {text: Card Title}
            - p: Some content goes here
            - card-actions:
                opts: {class: justify-end}
                children:
                  - btn: {color: primary, text: Action}
```

## Examples

<div class="flex flex-wrap gap-6 p-4">
  <div class="card card-border w-72">
    <div class="card-body">
      <h2 class="card-title">Basic Card</h2>
      <p>Simple card with border style.</p>
      <div class="card-actions justify-end">
        <button class="btn btn-primary btn-sm">Action</button>
      </div>
    </div>
  </div>
  <div class="card card-dash w-72">
    <div class="card-body">
      <h2 class="card-title">Dash Style</h2>
      <p>Card with dashed border.</p>
      <div class="card-actions justify-end">
        <button class="btn btn-secondary btn-sm">Action</button>
      </div>
    </div>
  </div>
  <div class="card bg-primary text-primary-content w-72">
    <div class="card-body">
      <h2 class="card-title">Colored Card</h2>
      <p>Using semantic background colors.</p>
      <div class="card-actions justify-end">
        <button class="btn">Action</button>
      </div>
    </div>
  </div>
</div>
