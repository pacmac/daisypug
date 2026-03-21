---
name: navbar
description: Top navigation bar with start, center, and end sections
category: Navigation
base: navbar
---

## Usage

The `navbar` mixin renders a top navigation bar with three sections. Use sub-mixins for each section.

### Options

| Option | Type | Description |
|--------|------|-------------|
| `class` | string | Additional CSS classes (e.g. `bg-base-100 shadow-sm`) |

### Sub-mixins

- `+navbar-start(opts)` — Left section (50% width)
- `+navbar-center(opts)` — Center section
- `+navbar-end(opts)` — Right section (50% width)

Nest any components inside each section — buttons, menus, dropdowns, etc.

## Code

### Pug

```pug
+navbar({class: 'bg-base-100 shadow-sm'})
  +navbar-start
    +btn({style: 'ghost', text: 'MyApp', class: 'text-xl'})
  +navbar-center
    +menu({direction: 'horizontal'})
      +menu-item
        a Home
      +menu-item
        a About
  +navbar-end
    +btn({color: 'primary', text: 'Login'})
```

### YAML

```yaml
- navbar:
    opts:
      class: bg-base-100 shadow-sm
    children:
      - navbar-start:
          children:
            - btn: {style: ghost, text: MyApp, class: text-xl}
      - navbar-center:
          children:
            - btn: {style: ghost, text: Home}
            - btn: {style: ghost, text: About}
      - navbar-end:
          children:
            - btn: {color: primary, text: Login}
```

## Examples

<div class="flex flex-col gap-4 p-4">
  <div class="navbar bg-base-200 rounded-box">
    <div class="navbar-start">
      <button class="btn btn-ghost text-xl">DaisyPug</button>
    </div>
    <div class="navbar-center">
      <button class="btn btn-ghost btn-sm">Home</button>
      <button class="btn btn-ghost btn-sm">About</button>
      <button class="btn btn-ghost btn-sm">Contact</button>
    </div>
    <div class="navbar-end">
      <button class="btn btn-primary btn-sm">Sign In</button>
    </div>
  </div>

  <div class="navbar bg-primary text-primary-content rounded-box">
    <div class="navbar-start">
      <button class="btn btn-ghost text-xl">Branded</button>
    </div>
    <div class="navbar-end">
      <button class="btn btn-ghost">Settings</button>
    </div>
  </div>
</div>
