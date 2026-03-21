# DaisyPug Mixin Signature Convention

## Naming

- Mixin names match DaisyUI base class names: `+btn`, `+card`, `+modal`
- Sub-component mixins use the full DaisyUI class name: `+card-body`, `+card-title`, `+navbar-start`
- No prefix — DaisyUI names are already namespaced enough

## Universal Mixin Signature

All mixins follow the same pattern:

```pug
+component(opts)
  block
```

Where `opts` is an optional object with well-known keys:

| Key | Type | Description |
|-----|------|-------------|
| `color` | string | One of: neutral, primary, secondary, accent, info, success, warning, error |
| `size` | string | One of: xs, sm, md, lg, xl |
| `style` | string | One of: outline, dash, soft, ghost, link |
| `class` | string | Additional CSS classes (Tailwind utilities, etc.) |
| `text` | string | Text content (alternative to block for simple cases) |

Component-specific keys are added per component (documented in each mixin file).

### Attribute passthrough

All mixins support Pug's `&attributes(attributes)` for arbitrary HTML attributes:

```pug
+btn({color: 'primary'})(id="my-btn" data-action="submit")
  | Click me
```

Renders:
```html
<button class="btn btn-primary" id="my-btn" data-action="submit">Click me</button>
```

## Tier 1: Flat Components

Single element. Opts map directly to modifier classes. Content via `text` key or block.

### Signature
```pug
mixin btn(opts)
  - opts = opts || {}
  - const cls = ['btn', opts.color && `btn-${opts.color}`, opts.size && `btn-${opts.size}`, opts.style && `btn-${opts.style}`, opts.shape && `btn-${opts.shape}`, opts.wide && 'btn-wide', opts.block && 'btn-block', opts.active && 'btn-active', opts.disabled && 'btn-disabled', opts.class].filter(Boolean).join(' ')
  button(class=cls)&attributes(attributes)
    if opts.text
      | #{opts.text}
    block
```

### Usage
```pug
//- Simple
+btn({text: 'Click', color: 'primary'})

//- With block content (icons + text)
+btn({color: 'secondary', size: 'lg'})
  svg ...
  | Download

//- With HTML attributes
+btn({color: 'error', style: 'outline'})(type="submit" form="my-form")
  | Delete
```

### Other Tier 1 examples
```pug
+badge({text: 'New', color: 'info', size: 'sm'})
+input({color: 'primary', size: 'lg'})(type="email" placeholder="you@example.com")
+toggle({color: 'success'})(checked)
+loading({variant: 'spinner', size: 'lg'})
+progress({color: 'primary'})(value="70" max="100")
+divider({text: 'OR'})
```

## Tier 2: Container Components

Parent element rendered by mixin, children via block using sub-mixins.

### Signature
```pug
mixin card(opts)
  - opts = opts || {}
  - const cls = ['card', opts.size && `card-${opts.size}`, opts.style && `card-${opts.style}`, opts.side && 'card-side', opts.imageFull && 'image-full', opts.class].filter(Boolean).join(' ')
  div(class=cls)&attributes(attributes)
    block

mixin card-body(opts)
  - opts = opts || {}
  - const cls = ['card-body', opts.class].filter(Boolean).join(' ')
  div(class=cls)&attributes(attributes)
    block

mixin card-title(opts)
  - opts = opts || {}
  - const cls = ['card-title', opts.class].filter(Boolean).join(' ')
  h2(class=cls)&attributes(attributes)
    if opts.text
      | #{opts.text}
    block

mixin card-actions(opts)
  - opts = opts || {}
  - const cls = ['card-actions', opts.class].filter(Boolean).join(' ')
  div(class=cls)&attributes(attributes)
    block
```

### Usage
```pug
+card({style: 'border', class: 'w-96'})
  figure
    img(src="/photo.jpg" alt="Photo")
  +card-body
    +card-title({text: 'Shoes'})
    p If a dog chews shoes whose shoes does he choose?
    +card-actions({class: 'justify-end'})
      +btn({color: 'primary', text: 'Buy Now'})
```

### Other Tier 2 examples
```pug
//- Hero
+hero({class: 'min-h-screen bg-base-200'})
  +hero-content({class: 'text-center'})
    h1.text-5xl.font-bold Welcome
    p.py-6 Get started today
    +btn({color: 'primary', text: 'Get Started'})

//- Alert
+alert({color: 'warning', style: 'soft'})
  span Warning: check your input

//- Stat
+stats({class: 'shadow'})
  +stat
    +stat-title({text: 'Total Views'})
    +stat-value({text: '89,400'})
    +stat-desc({text: '21% more than last month'})

//- Collapse
+collapse({arrow: true, class: 'bg-base-100 border'})
  +collapse-title FAQ Question
  +collapse-content
    p The answer goes here

//- Toast
+toast({position: 'end bottom'})
  +alert({color: 'info', text: 'Message sent'})
```

## Tier 3: Nested Components

Shell mixin + sub-mixins. State mechanism emitted automatically.

### Signature (Navbar)
```pug
mixin navbar(opts)
  - opts = opts || {}
  - const cls = ['navbar', opts.class].filter(Boolean).join(' ')
  div(class=cls)&attributes(attributes)
    block

mixin navbar-start(opts)
  - opts = opts || {}
  div(class=['navbar-start', opts.class].filter(Boolean).join(' '))&attributes(attributes)
    block

mixin navbar-center(opts)
  - opts = opts || {}
  div(class=['navbar-center', opts.class].filter(Boolean).join(' '))&attributes(attributes)
    block

mixin navbar-end(opts)
  - opts = opts || {}
  div(class=['navbar-end', opts.class].filter(Boolean).join(' '))&attributes(attributes)
    block
```

### Usage
```pug
+navbar({class: 'bg-base-100 shadow-sm'})
  +navbar-start
    +btn({style: 'ghost', text: 'daisyUI', class: 'text-xl'})
  +navbar-center
    +btn({style: 'ghost', text: 'Home'})
    +btn({style: 'ghost', text: 'About'})
  +navbar-end
    +btn({color: 'primary', text: 'Sign In'})
```

### Modal
```pug
mixin modal(opts)
  - opts = opts || {}
  - const id = opts.id || 'modal_' + Math.random().toString(36).slice(2,8)
  - const cls = ['modal', opts.position && `modal-${opts.position}`, opts.open && 'modal-open', opts.class].filter(Boolean).join(' ')
  dialog(id=id class=cls)&attributes(attributes)
    block
    //- Auto-emit backdrop for click-to-close
    if opts.backdrop !== false
      form(method="dialog" class="modal-backdrop")
        button close

mixin modal-box(opts)
  - opts = opts || {}
  div(class=['modal-box', opts.class].filter(Boolean).join(' '))&attributes(attributes)
    block

mixin modal-action(opts)
  - opts = opts || {}
  div(class=['modal-action', opts.class].filter(Boolean).join(' '))&attributes(attributes)
    block
```

### Usage
```pug
+btn({text: 'Open'})(onclick="my_modal.showModal()")

+modal({id: 'my_modal'})
  +modal-box
    h3.text-lg.font-bold Hello!
    p Press ESC or click outside to close
    +modal-action
      form(method="dialog")
        +btn({text: 'Close'})
```

### Drawer
```pug
mixin drawer(opts)
  - opts = opts || {}
  - const id = opts.id || 'drawer_' + Math.random().toString(36).slice(2,8)
  - const cls = ['drawer', opts.end && 'drawer-end', opts.class].filter(Boolean).join(' ')
  div(class=cls)&attributes(attributes)
    input(id=id type="checkbox" class="drawer-toggle")
    block

mixin drawer-content(opts)
  - opts = opts || {}
  div(class=['drawer-content', opts.class].filter(Boolean).join(' '))&attributes(attributes)
    block

mixin drawer-side(opts)
  - opts = opts || {}
  - const drawerId = opts.for
  div(class=['drawer-side', opts.class].filter(Boolean).join(' '))&attributes(attributes)
    if drawerId
      label(for=drawerId aria-label="close sidebar" class="drawer-overlay")
    block
```

### Tabs
```pug
mixin tabs(opts)
  - opts = opts || {}
  - const cls = ['tabs', opts.style && `tabs-${opts.style}`, opts.size && `tabs-${opts.size}`, opts.placement && `tabs-${opts.placement}`, opts.class].filter(Boolean).join(' ')
  div(class=cls role="tablist")&attributes(attributes)
    block

mixin tab(opts)
  - opts = opts || {}
  - const cls = ['tab', opts.active && 'tab-active', opts.disabled && 'tab-disabled', opts.class].filter(Boolean).join(' ')
  input(type="radio" name=opts.name class=cls role="tab" aria-label=opts.label checked=opts.active)&attributes(attributes)

mixin tab-content(opts)
  - opts = opts || {}
  div(class=['tab-content', opts.class].filter(Boolean).join(' ') role="tabpanel")&attributes(attributes)
    block
```

## Class Building Pattern

All mixins use the same internal pattern for constructing the class string:

```javascript
const cls = [
  'base-class',                              // always present
  opts.color && `base-${opts.color}`,        // conditional modifier
  opts.size && `base-${opts.size}`,
  opts.style && `base-${opts.style}`,
  opts.booleanMod && 'base-modifier',        // boolean modifier
  opts.class                                 // user's extra classes
].filter(Boolean).join(' ')
```

This pattern is consistent across all tiers — it's just the element structure that changes.

## Content Passing

Two ways to pass content to a mixin:

1. **`opts.text`** — for simple text content (no HTML/children)
2. **Pug `block`** — for rich content (other mixins, HTML, mixed content)

If both are provided, block takes precedence (it renders after opts.text).

## Summary Table

| Tier | Mixin gets | Children via | State via |
|------|-----------|-------------|-----------|
| Flat | opts → classes | opts.text or block (simple) | N/A |
| Container | opts → classes | block with sub-mixins | N/A |
| Nested | opts → classes + state markup | block with sub-mixins | auto-emitted (checkbox, dialog, etc.) |
