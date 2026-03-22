---
name: dp-icon
description: Lucide icon component — usable standalone or inside any component
category: Display
base: dp-icon
---

## Usage

`+dp-icon(name, opts)` renders a Lucide icon element. Icons are resolved by the Lucide CDN script on DOMContentLoaded.

### Options

| Option | Type | Description |
|--------|------|-------------|
| `size` | string | xs (14px), sm (16px), md (20px), lg (24px), xl (32px) |
| `color` | string | DaisyUI color (adds `text-{color}` class) |
| `class` | string | Extra CSS classes |

### Icon Names

Uses [Lucide](https://lucide.dev/icons/) icon names: `search`, `plus`, `trash-2`, `save`, `settings`, `mail`, `calendar`, `dollar-sign`, `package`, `layers`, etc.

## Code

```pug
//- Standalone
+dp-icon('search')
+dp-icon('search', {size: 'lg', color: 'primary'})

//- In buttons
+btn({color: 'primary'})
  +dp-icon('plus', {size: 'sm'})
  |  Add New

//- In toolbar title
+dp-toolbar({title: 'Parts', icon: 'box'})

//- In fitem pre/post slots
+dp-fitem('Email', {class: 'textbox', name: 'EMAIL', pre: 'mail', post: 'x'})

//- In menu items
+menu-item
  a
    +dp-icon('home', {size: 'sm', class: 'mr-2'})
    | Home
```

## Examples

<div class="flex gap-4 items-center p-4">
  <i data-lucide="search" style="width:14px;height:14px"></i>
  <i data-lucide="search" style="width:16px;height:16px"></i>
  <i data-lucide="search" style="width:20px;height:20px"></i>
  <i data-lucide="search" style="width:24px;height:24px"></i>
  <i data-lucide="search" style="width:32px;height:32px"></i>
</div>
<div class="flex gap-3 p-4">
  <i data-lucide="home" class="text-primary" style="width:20px;height:20px"></i>
  <i data-lucide="settings" class="text-secondary" style="width:20px;height:20px"></i>
  <i data-lucide="mail" class="text-accent" style="width:20px;height:20px"></i>
  <i data-lucide="calendar" class="text-info" style="width:20px;height:20px"></i>
  <i data-lucide="check-circle" class="text-success" style="width:20px;height:20px"></i>
  <i data-lucide="alert-triangle" class="text-warning" style="width:20px;height:20px"></i>
  <i data-lucide="trash-2" class="text-error" style="width:20px;height:20px"></i>
</div>
