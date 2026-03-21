---
name: yaml-schema
title: YAML Schema
description: How to describe pages declaratively in YAML
category: Guides
order: 3
---

## Usage

YAML provides a declarative way to describe DaisyPug pages. The engine converts YAML → Pug → HTML.

### Node Types

Every node is either a **component** (matched against the DaisyPug registry) or a **raw HTML element**.

### Component Node

```yaml
# Shorthand — string becomes text
- btn: "Click me"

# Shorthand — flat keys become opts
- btn:
    color: primary
    size: lg
    text: Click me

# Explicit — structural keys
- btn:
    opts:
      color: primary
    attrs:
      id: my-btn
      type: submit
    text: Click me

# With children
- card:
    opts:
      style: border
    children:
      - card-body:
          children:
            - card-title: {text: Hello}
            - p: World
```

### Raw HTML Node

Any tag not in the component registry is treated as raw HTML:

```yaml
- h1:
    class: text-5xl font-bold
    text: Welcome

- div:
    class: flex gap-4
    children:
      - p: Hello
      - p: World

- img:
    src: /photo.jpg
    alt: A photo
```

### Structural Keys

| Key | Purpose |
|-----|---------|
| `opts` | Mixin options (color, size, style, class, etc.) |
| `attrs` | HTML attributes (id, type, href, data-*, etc.) |
| `text` | Simple text content |
| `children` | Nested child nodes |

When none of `opts`, `attrs`, or `children` are present, all keys are treated as shorthand opts.

### Mixing Opts with Structural Keys

You can put opts alongside `attrs` or `children` without wrapping in `opts:`:

```yaml
- input:
    color: primary
    size: lg
    attrs:
      placeholder: Enter email
      type: email
```

## Code

### Full Page Example

```yaml
- navbar:
    opts:
      class: bg-base-100 shadow-sm
    children:
      - navbar-start:
          children:
            - btn: {style: ghost, text: MyApp, class: text-xl}
      - navbar-end:
          children:
            - btn: {color: primary, text: Login}

- hero:
    opts:
      class: min-h-screen bg-base-200
    children:
      - hero-content:
          opts: {class: text-center}
          children:
            - h1: {class: text-5xl font-bold, text: Hello}
            - p: {class: py-6, text: Welcome to DaisyPug}
            - btn: {color: primary, size: lg, text: Get Started}

- footer:
    opts:
      center: true
      class: p-4 bg-base-300
    children:
      - p: Copyright 2026
```

### YAML → Pug Conversion

Use the `convert` command to see the generated Pug:

```bash
daisypug convert page.yaml
```

Output:

```pug
+navbar({class: 'bg-base-100 shadow-sm'})
  +navbar-start
    +btn({style: 'ghost', text: 'MyApp', class: 'text-xl'})
  +navbar-end
    +btn({color: 'primary', text: 'Login'})
```

## Examples

### Cards Grid

```yaml
- div:
    class: grid grid-cols-1 md:grid-cols-3 gap-6 p-4
    children:
      - card:
          opts: {class: bg-base-200}
          children:
            - card-body:
                children:
                  - card-title: {text: Feature 1}
                  - p: Description here
      - card:
          opts: {class: bg-base-200}
          children:
            - card-body:
                children:
                  - card-title: {text: Feature 2}
                  - p: Description here
```

### Form

```yaml
- fieldset:
    children:
      - fieldset-legend: {text: Sign Up}
      - fieldset-label: {text: Email}
      - input:
          color: primary
          class: w-full
          attrs: {placeholder: you@example.com, type: email}
      - fieldset-label: {text: Password}
      - input:
          color: primary
          class: w-full
          attrs: {placeholder: "********", type: password}
      - div:
          class: mt-4
          children:
            - btn: {color: primary, text: Sign Up, block: true}
```
