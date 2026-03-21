# DaisyPug YAML Schema

## Overview

YAML input provides a declarative way to describe a page using DaisyUI components. The engine converts YAML → Pug (using the mixin library) → HTML.

## Node Structure

Every node in the YAML tree is either a **component node** or a **raw HTML node**.

### Component Node

```yaml
component_name:
  opts:          # optional — maps to mixin opts object
    color: primary
    size: lg
  attrs:         # optional — maps to HTML attributes
    id: my-btn
    data-action: submit
  text: "Click"  # optional — simple text content
  children:      # optional — nested component/HTML nodes
    - ...
```

**Shorthand forms:**

```yaml
# Text-only (no opts, no children)
btn: "Click me"

# Opts only (no children)
btn:
  color: primary
  text: "Click me"

# When only opts keys are used (no text, children, attrs), treat all keys as opts
badge:
  color: info
  size: sm
  text: "New"
```

### Raw HTML Node

For arbitrary HTML elements not in the DaisyUI component list:

```yaml
h1:
  class: "text-5xl font-bold"
  text: "Welcome"

p:
  class: "py-6"
  text: "Get started today"

img:
  src: "/photo.jpg"
  alt: "A photo"

figure:
  children:
    - img:
        src: "/photo.jpg"
        alt: "Photo"
```

Raw HTML nodes are detected by checking if the tag name is NOT in the component registry. All keys except `children` and `text` become HTML attributes.

## Disambiguation Rules

Since both component opts and raw HTML attributes are plain keys, the engine needs rules:

1. If the node name matches a registered DaisyPug component → **component node**
   - Keys `opts`, `attrs`, `text`, `children` are structural
   - If none of those keys are present, check if all keys are valid opts for this component → treat as **shorthand opts**
   - Otherwise → ambiguous, require explicit `opts:` wrapper

2. If the node name does NOT match a component → **raw HTML node**
   - `text` and `children` are structural
   - All other keys become HTML attributes

## Full Page Example

```yaml
# A complete page layout
- navbar:
    opts:
      class: "bg-base-100 shadow-sm"
    children:
      - navbar-start:
          children:
            - btn:
                style: ghost
                class: "text-xl"
                text: "DaisyPug"
      - navbar-center:
          children:
            - btn:
                style: ghost
                text: "Home"
            - btn:
                style: ghost
                text: "About"
      - navbar-end:
          children:
            - btn:
                color: primary
                text: "Sign In"

- hero:
    opts:
      class: "min-h-screen bg-base-200"
    children:
      - hero-content:
          opts:
            class: "text-center"
          children:
            - h1:
                class: "text-5xl font-bold"
                text: "Hello there"
            - p:
                class: "py-6"
                text: "Provident cupiditate voluptatem et in."
            - btn:
                color: primary
                text: "Get Started"

- footer:
    opts:
      class: "footer-center bg-base-300 text-base-content p-4"
    children:
      - p: "Copyright 2026 - DaisyPug"
```

## Card Example (showing nesting)

```yaml
- card:
    opts:
      style: border
      class: "w-96"
    children:
      - figure:
          children:
            - img:
                src: "https://example.com/photo.jpg"
                alt: "Shoes"
      - card-body:
          children:
            - card-title:
                text: "Shoes!"
            - p: "If a dog chews shoes whose shoes does he choose?"
            - card-actions:
                opts:
                  class: "justify-end"
                children:
                  - btn:
                      color: primary
                      text: "Buy Now"
```

## Modal Example (showing state)

```yaml
- btn:
    text: "Open Modal"
    attrs:
      onclick: "my_modal.showModal()"

- modal:
    opts:
      id: my_modal
    children:
      - modal-box:
          children:
            - h3:
                class: "text-lg font-bold"
                text: "Hello!"
            - p:
                class: "py-4"
                text: "Press ESC or click outside to close"
            - modal-action:
                children:
                  - btn:
                      text: "Close"
                      attrs:
                        formmethod: dialog
```

## Accordion Example (showing radio groups)

```yaml
- accordion:
    name: "faq"
    children:
      - collapse:
          opts:
            arrow: true
            class: "bg-base-100 border border-base-300"
            open: true
          children:
            - collapse-title: "Question 1?"
            - collapse-content:
                children:
                  - p: "Answer 1 here."
      - collapse:
          opts:
            arrow: true
            class: "bg-base-100 border border-base-300"
          children:
            - collapse-title: "Question 2?"
            - collapse-content:
                children:
                  - p: "Answer 2 here."
```

## Stat Example

```yaml
- stats:
    opts:
      class: "shadow"
    children:
      - stat:
          children:
            - stat-title: "Total Page Views"
            - stat-value: "89,400"
            - stat-desc: "21% more than last month"
      - stat:
          children:
            - stat-title: "Tasks Done"
            - stat-value: "31K"
            - stat-desc:
                text: "Jan - Feb 2026"
```

## YAML → Pug Conversion Rules

The converter walks the YAML tree and emits Pug:

| YAML | Pug Output |
|------|-----------|
| Component node with opts | `+component(opts)` |
| Component node with children | Indented block under mixin call |
| Component node with text only | `+component({text: "..."})` |
| Component shorthand string | `+component({text: "..."})` |
| Raw HTML node | `tag(attrs)` |
| Raw HTML with text | `tag(attrs) text` |
| Raw HTML with children | `tag(attrs)` + indented children |

### Conversion example

YAML:
```yaml
- btn:
    color: primary
    size: lg
    text: "Click"
```

Generated Pug:
```pug
+btn({color: 'primary', size: 'lg', text: 'Click'})
```

YAML:
```yaml
- card:
    opts:
      style: border
    children:
      - card-body:
          children:
            - card-title:
                text: "Hello"
            - p: "World"
```

Generated Pug:
```pug
+card({style: 'border'})
  +card-body
    +card-title({text: 'Hello'})
    p World
```

## Layout Wrapper

The engine wraps all rendered content in a base layout:

```yaml
# Implicit — the engine adds this automatically
layout:
  title: "Page Title"        # optional, default: "DaisyPug"
  theme: "light"             # optional, DaisyUI theme
  lang: "en"                 # optional, default: "en"
  head:                      # optional, extra head elements
    - link:
        rel: stylesheet
        href: "/custom.css"
    - script:
        src: "/custom.js"
```

Users can provide layout config at the top level of their YAML or let defaults apply.

## Validation

The engine validates:

1. **Component names** — must be in the registry or a known HTML element
2. **Opts keys** — warns on unrecognized opts for a component
3. **Required structure** — e.g., `card-body` should be inside `card`
4. **Color/size/style values** — must be from the valid set

Validation is non-blocking (warnings, not errors) to allow flexibility.
