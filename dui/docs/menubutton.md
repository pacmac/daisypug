# MenuButton

Dropdown button with a chevron indicator and popup menu.

## Overview

MenuButtons are trigger buttons that open a dropdown menu of actions. The dropdown is CSS-driven (`:focus-within`) — no JavaScript needed for open/close. Used for report menus, theme pickers, and grouped actions.

| Type | Path |
|------|------|
| Mixin | `html/dui/mixins/actions.pug` |
| Plugin | `public/dui/js/plugins/menubutton-plugin.js` |

## Mixins

### `+menubutton(opts)`

Renders a `.dropdown` wrapper containing a trigger `<button>` and a `<ul>` dropdown menu. Block content goes into the menu list.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | String | `''` | Button label text |
| `icon` | String | — | Lucide icon name (e.g. `printer`, `sun`, `download`) |
| `menu-id` | String | — | ID for the `<ul>` dropdown element |
| `position` | String | `'bottom'` | Dropdown direction: `bottom`, `end`, `top`, `left`, `right` |
| `menu-class` | String | — | Extra CSS on the `<ul>` (e.g. `max-h-80 overflow-y-auto`) |

All other attributes pass through to the `<button>` element.

## Parameters

### Dropdown positions

| Position | Class | Description |
|----------|-------|-------------|
| `bottom` | `.dropdown-bottom` | Opens below the button (default) |
| `end` | `.dropdown-end` | Aligns to the right edge |
| `top` | `.dropdown-top` | Opens above the button |
| `left` | `.dropdown-left` | Opens to the left |
| `right` | `.dropdown-right` | Opens to the right |

### Button styling

The trigger button renders as `.btn.btn-ghost.btn-sm` by default. Add extra classes via attributes:

```pug
+menubutton.btn-primary(title="Actions" ...)
```

### Menu items

Menu items are standard DaisyUI menu list items. Use `<li>` with `<a>`, `<button>`, or plain text:

```pug
+menubutton(title="Actions" menu-id="act-menu")
  li: a(href="#") Option A
  li: a(href="#") Option B
  li.disabled: a Unavailable
  li
    hr
  li: a(href="#") Separated Item
```

## Examples

### Basic dropdown

```pug
+menubutton(title="Reports" icon="printer" menu-id="rpt-menu")
  li: a(href="#") Sales Report
  li: a(href="#") Inventory Report
  li: a(href="#") Export to CSV
```

### With icon, no text (compact)

```pug
+menubutton(icon="more-vertical" menu-id="more-menu")
  li: a(href="#") Edit
  li: a(href="#") Duplicate
  li: a(href="#") Delete
```

### Position variants

```pug
+menubutton(title="Bottom" icon="chevron-down" menu-id="m1" position="bottom")
  li: a(href="#") Item A
  li: a(href="#") Item B

+menubutton(title="Top" icon="chevron-up" menu-id="m2" position="top")
  li: a(href="#") Item A
  li: a(href="#") Item B

+menubutton(title="End" icon="chevron-right" menu-id="m3" position="end")
  li: a(href="#") Item A
  li: a(href="#") Item B
```

### Toolbar usage

```pug
+menubutton#but_print.tbut(title="Reports" icon="printer" menu-id="dui-printmen")
  li: a(href="#" onclick="printReport('sales')") Sales Report
  li: a(href="#" onclick="printReport('inv')") Inventory Report
```

### Scrollable menu

```pug
+menubutton(title="Theme" icon="sun" menu-id="theme-menu" menu-class="max-h-80 overflow-y-auto")
  li: a Light
  li: a Dark
  li: a Corporate
  li: a Retro
```

## Output

```pug
.flex.flex-wrap.gap-4.p-4.items-start
  +menubutton(title="Reports" icon="printer" menu-id="rpt-menu")
    li: a Sales Report
    li: a Inventory Report
    li: a Export to CSV

  +menubutton(title="Export" icon="download" menu-id="exp-menu")
    li: a PDF
    li: a Excel
    li: a CSV

  +menubutton(icon="more-vertical" menu-id="more-menu")
    li: a Edit
    li: a Duplicate
    li: a.text-error Delete
```

```js
// Initialize Lucide icons in the rendered output
if (window.lucide) lucide.createIcons({ nodes: document.querySelectorAll('#output-rendered [data-lucide]') });
```

## JS API

### Menubutton plugin (`$.fn.menubutton`)

The plugin is minimal — the dropdown is CSS-driven via `:focus-within`, so no JS is needed for open/close.

| Method | Description |
|--------|-------------|
| `options()` | Get options (currently empty) |
| `enable()` | Remove `opacity-40` and `pointer-events-none` |
| `disable()` | Add `opacity-40` and `pointer-events-none` |
| `destroy()` | No-op (EUI compat) |

```js
$('#but_print').menubutton('enable');
$('#but_print').menubutton('disable');
```

### Menu item click handling

Menu items use standard DOM events — no plugin needed:

```js
$('#print-menu a').on('click', function(e) {
  e.preventDefault();
  var action = $(this).text();
  console.log('Selected:', action);
});
```

### Closing the menu programmatically

The dropdown closes when focus leaves. To close it via JS:

```js
document.activeElement.blur();
```

## Notes

### DaisyUI dropdown mechanics

The dropdown is pure CSS — it opens when the button receives focus (`:focus-within` on the `.dropdown` wrapper) and closes when focus leaves. No event listeners are needed.

### Toolbar integration

MenuButtons in the toolbar (`.tbut` class) follow the same `$.dui.asdpx` permission model as regular toolbar buttons.

### EUI migration

EUI attributes (`plain`, `hasDownArrow`, `menu`, `iconCls`) are silently stripped during migration. The DUI mixin uses `title`, `icon`, `menu-id`, and `position` instead.
