# Button

Action buttons with color, size, icon, and state variants.

## Overview

Buttons trigger actions — saving, deleting, navigating, toggling. The `+button` mixin uses semantic parameters (`color`, `size`, `style`, `shape`, `icon`) so page templates don't need to know DaisyUI class names.

| Type | Path |
|------|------|
| Mixin | `html/dui/mixins/actions.pug` |
| Plugin | `public/dui/js/plugins/button-plugin.js` |

## Mixins

### `+button(text, vars)`

Renders a `<button>` element with DaisyUI classes derived from semantic parameters.

| Arg | Type | Description |
|-----|------|-------------|
| `text` | String | Button label (can also be passed as `vars.text`) |
| `vars.color` | String | `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`, `neutral` |
| `vars.size` | String | `xs`, `sm`, `md`, `lg` |
| `vars.style` | String | `outline`, `ghost`, `link` |
| `vars.shape` | String | `circle`, `square`, `wide`, `block` |
| `vars.icon` | String | Lucide icon name (e.g. `save`, `trash-2`) — renders `span(data-lucide)` before text |
| `vars.iconCls` | String | EUI icon class — mapped to Lucide via `getIcon()` |
| `vars.id` | String | Button ID |
| `vars.disabled` | Boolean | Disabled state |
| `vars.class` | String | Escape hatch — extra CSS classes appended after semantic classes |
| `vars.*` | — | Any other HTML attributes pass through |

## Parameters

### `color` values

| Value | Effect |
|-------|--------|
| `primary` | Primary theme color |
| `secondary` | Secondary theme color |
| `accent` | Accent color |
| `info` | Info (blue) |
| `success` | Success (green) |
| `warning` | Warning (amber) |
| `error` | Error/danger (red) |
| `neutral` | Neutral dark |

### `style` values

| Value | Effect |
|-------|--------|
| `outline` | Outline/bordered style |
| `ghost` | Transparent background, visible on hover |
| `link` | Styled as a hyperlink |

### `size` values

| Value | Effect |
|-------|--------|
| `lg` | Large |
| `md` | Medium (default) |
| `sm` | Small |
| `xs` | Extra small |

### `shape` values

| Value | Effect |
|-------|--------|
| `wide` | Extra horizontal padding |
| `block` | Full width |
| `circle` | Circular (icon-only) |
| `square` | Square (icon-only) |

### Button groups

Wrap buttons in a `+join` container to merge them into a connected group:

```pug
+join
  +button('Left', {size:'sm', class:'join-item'})
  +button('Center', {size:'sm', class:'join-item'})
  +button('Right', {size:'sm', class:'join-item'})
```

## Examples

### Colors

```pug
+button('Primary', {color:'primary', size:'sm'})
+button('Secondary', {color:'secondary', size:'sm'})
+button('Accent', {color:'accent', size:'sm'})
+button('Info', {color:'info', size:'sm'})
+button('Success', {color:'success', size:'sm'})
+button('Warning', {color:'warning', size:'sm'})
+button('Error', {color:'error', size:'sm'})
+button('Neutral', {color:'neutral', size:'sm'})
```

### Styles

```pug
+button('Solid', {color:'primary', size:'sm'})
+button('Outline', {color:'primary', style:'outline', size:'sm'})
+button('Ghost', {style:'ghost', size:'sm'})
+button('Link', {style:'link', size:'sm'})
```

### Sizes

```pug
+button('Large', {color:'primary', size:'lg'})
+button('Medium', {color:'primary'})
+button('Small', {color:'primary', size:'sm'})
+button('Tiny', {color:'primary', size:'xs'})
```

### With Lucide icons

```pug
+button('Save', {icon:'save', color:'primary', size:'sm'})
+button('Delete', {icon:'trash-2', color:'error', style:'outline', size:'sm'})
+button('Cancel', {icon:'x', style:'ghost', size:'sm'})
```

### Icon-only buttons

```pug
+button({icon:'settings', style:'ghost', shape:'circle', size:'sm'})
+button({icon:'plus', color:'primary', shape:'square', size:'sm'})
```

### Button groups (join)

```pug
+join
  +button('Bold', {size:'sm', class:'join-item'})
  +button('Italic', {size:'sm', class:'join-item'})
  +button('Underline', {size:'sm', class:'join-item'})
```

### Disabled

```pug
+button('Disabled', {color:'primary', size:'sm', disabled:true})
```

## Output

```pug
.flex.flex-wrap.gap-2.p-4
  +button('Save', {icon:'save', color:'primary', size:'sm'})
  +button('Delete', {icon:'trash-2', size:'sm', class:'btn-outline btn-error'})
  +button('Cancel', {icon:'x', style:'ghost', size:'sm'})
  +button('View Details', {style:'link', size:'sm'})
  +button({icon:'settings', style:'ghost', shape:'circle', size:'sm'})
  +button('Disabled', {color:'primary', size:'sm', disabled:true})

.flex.flex-wrap.gap-2.p-4
  +button('Primary', {color:'primary', size:'sm'})
  +button('Secondary', {color:'secondary', size:'sm'})
  +button('Accent', {color:'accent', size:'sm'})
  +button('Info', {color:'info', size:'sm'})
  +button('Success', {color:'success', size:'sm'})
  +button('Warning', {color:'warning', size:'sm'})
  +button('Error', {color:'error', size:'sm'})
  +button('Neutral', {color:'neutral', size:'sm'})

.flex.flex-wrap.gap-2.p-4
  +button('Primary', {size:'sm', class:'btn-outline btn-primary'})
  +button('Secondary', {size:'sm', class:'btn-outline btn-secondary'})
  +button('Accent', {size:'sm', class:'btn-outline btn-accent'})
  +button('Info', {size:'sm', class:'btn-outline btn-info'})
  +button('Success', {size:'sm', class:'btn-outline btn-success'})
  +button('Warning', {size:'sm', class:'btn-outline btn-warning'})
  +button('Error', {size:'sm', class:'btn-outline btn-error'})
  +button('Neutral', {size:'sm', class:'btn-outline btn-neutral'})

.flex.flex-wrap.gap-2.p-4
  +button('Large', {color:'primary', size:'lg'})
  +button('Medium', {color:'primary'})
  +button('Small', {color:'primary', size:'sm'})
  +button('Tiny', {color:'primary', size:'xs'})

.flex.gap-0.p-4
  +join
    +button('Bold', {size:'sm', class:'join-item'})
    +button('Italic', {size:'sm', class:'join-item'})
    +button('Underline', {size:'sm', class:'join-item'})
```

```js
// Initialize Lucide icons in the rendered output
if (window.lucide) lucide.createIcons({ nodes: document.querySelectorAll('#output-rendered [data-lucide]') });
```

## JS API

### Button plugin (`$.fn.button`)

| Method | Description |
|--------|-------------|
| `options()` | Get current options object |
| `enable()` | Enable the button (toolbar buttons also check `$.dui.asdpx` permissions) |
| `disable()` | Disable and dim the button (`opacity-40`, `pointer-events-none`) |
| `select()` | Add `.active` class (pressed state) |
| `unselect()` | Remove `.active` class |

```js
$('#saveBtn').button('enable');
$('#saveBtn').button('disable');
$('#saveBtn').button('select');    // toggle active state
$('#saveBtn').button('unselect');

// onClick callback via options
$('#saveBtn').button({ onClick: function() {
  console.log('Save clicked');
}});

// Native DOM — works without plugin
$('#saveBtn').prop('disabled', true);
$('#saveBtn').on('click', handler);
```

### Toolbar buttons

Buttons with class `.tbut` are toolbar-managed. `enable()` checks `$.dui.asdpx` permissions — a button will only enable if its permission character is present.

### Legacy alias

`$.fn.linkbutton` is an alias for `$.fn.button` — EUI page scripts that call `.linkbutton('enable')` etc. continue to work unchanged.

## Notes

### Icons

DUI uses [Lucide Icons](https://lucide.dev). The `icon` parameter renders a `<span data-lucide="icon-name">` before the button text. Call `lucide.createIcons()` after dynamic content is loaded to render SVGs.

### `class` escape hatch

The `class` parameter appends raw CSS classes after any semantic classes. Use it for DaisyUI classes not covered by semantic params (e.g. `join-item`, `tbut`, custom styling):

```pug
+button('Submit', {color:'primary', size:'sm', class:'tbut'})
```

### EUI migration

EUI's `+linkbutton` is **not a DUI component** — it is an EUI alias that maps to `+button`. In pug templates, always use `+button`. In JS, `.linkbutton()` is a legacy alias for `.button()`.

EUI's `linkbutton` attributes (`plain`, `iconCls`, `toggle`, `group`, `iconAlign`) are parsed but most are no-ops. The `iconCls` attribute is mapped to a Lucide icon via `getIcon()`.

| EUI | DUI equivalent |
|-----|----------------|
| `+linkbutton('text', {...})` | `+button('text', {...})` |
| `.linkbutton('enable')` | `.button('enable')` (alias still works) |
| `plain:true` | `style:'ghost'` |
| `iconCls:'icon-save'` | `icon:'save'` |
| `toggle:true` | `.button('select')` / `.button('unselect')` |

### `.btn-group` — spaced inline button row

Wrap sibling buttons in `.btn-group` to space them horizontally with a centered layout:

```pug
.btn-group
  +button('Save', {color:'primary', iconCls:'icon-save'})
  +button('Cancel', {iconCls:'aicon-cancel'})
```

Renders as a flex row, centered, with `2em` gap between buttons and `2em` top margin. No mixin needed — use the class directly on any wrapper div.
