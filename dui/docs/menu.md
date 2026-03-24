# Menu & Navigation

Sidebar navigation menu and icon system.

## Overview

The sidebar menu renders a recursive tree of navigation items. Leaf items load pages via AJAX; branch items expand/collapse using native `<details>` elements. Icons are mapped from EUI semantic names to Lucide icon names.

| Type | Path |
|------|------|
| Mixin | `html/dui/mixins/nav.pug` |
| Icon map | `html/dui/layout/_iconmap.pug` |
| Plugin | `public/dui/js/plugins/nav-plugin.js` |
| CSS | `public/dui/css/sidebar.css` |

## Mixins

### `+menuItem(item, isTop)`

Recursive menu item renderer. Used by the sidebar layout to build the navigation tree.

### `+lucideIcon(name)`

Renders a `<span data-lucide="name">` placeholder. The Lucide Icons library replaces these with SVG on page load.

## Parameters

### `+menuItem` arguments

| Arg | Type | Description |
|-----|------|-------------|
| `item` | Object | Menu node (see properties below) |
| `isTop` | Boolean | Top-level flag (for styling) |

### Menu item properties

| Property | Type | Description |
|----------|------|-------------|
| `text` | String | Display label |
| `id` | String | Page ID (e.g. `'inv^sa_parts'`) — used to build URL |
| `icon` / `iconCls` | String | Semantic icon class (mapped via `getIcon()`) |
| `children` | Array/Object | Child menu items (renders `<details>` with nested `<ul>`) |
| `url` | String | Custom URL (used if no `id`) |

## Examples

### Menu item usage (in sidebar layout)

```pug
each item in menuData
  +menuItem(item, true)
```

### Lucide icon

```pug
+lucideIcon('settings')
//- Renders: <span data-lucide="settings" class="w-5 h-5 flex-shrink-0"></span>
```

## Output

### Leaf item

```pug
li
  a(data-appid='inv^sa_parts')
    span.w-5.h-5.flex-shrink-0(data-lucide='box')
    | Part Masters
```

### Branch item

```pug
li
  details
    summary
      span.w-5.h-5.flex-shrink-0(data-lucide='package')
      | Inventory
    ul.menu
      //- child items
```

```js
// Initialize Lucide icons in the rendered menu
if (window.lucide) lucide.createIcons({ nodes: document.querySelectorAll('#output-rendered [data-lucide]') });
```

## JS API

### Navigation flow

1. User clicks a menu item
2. `nav-plugin.js` intercepts the click, reads `data-appid`
3. Calls `loadpage(appid)` to load the page template via AJAX
4. Page content replaces the main panel, scripts execute

## Notes

### Icon mapping

`_iconmap.pug` provides `getIcon(semanticName)` which maps EUI icon class names (e.g. `icon-part`, `icon-repair`) to Lucide icon names (e.g. `box`, `wrench`).

### Menu data source

Menu JSON files live in `data/` (e.g. `data/invmenu.json`, `data/devmenu.json`). The sidebar layout reads these at render time.
