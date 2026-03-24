# Tabs

Tabbed content using DaisyUI radio-button pattern.

## Overview

Tabs organize content into switchable panels. Each tab is an `<input type="radio">` followed by a `.tab-content` div. Supports horizontal and vertical tab positions.

| Type | Path |
|------|------|
| Mixin | `html/dui/mixins/nav.pug` (`+tabs`, `+tab-item`, `+vtab`, `+vtab-item`) |
| Plugin (horizontal) | `public/dui/js/plugins/tabs-plugin.js` |
| Plugin (vertical) | `public/dui/js/plugins/vtab-plugin.js` |
| CSS (vertical) | `public/dui/css/components.css` (`.vtab-*` rules) |

## Mixins

### `+tabs(opts)`

Creates a tab container.

| Arg | Type | Default | Description |
|-----|------|---------|-------------|
| `opts.tabPosition` | String | `'top'` | Tab position: `top`, `left`, `right` |
| `opts.headerWidth` | Number | `150` | Vertical tab header width (px) |
| `opts.name` | String | auto | Radio group name |
| `opts.default` | String | `null` | Title of the tab to activate on render. If null, the first tab is active. |

### `+tab-item(title, opts)`

Individual tab within a `+tabs` container.

| Arg | Type | Default | Description |
|-----|------|---------|-------------|
| `title` | String | — | Tab label text |
| `opts.active` | Boolean | `false` | Force active state |
| `opts.checked` | Boolean | `false` | Alias for `active` |
| `opts.iconCls` | String | — | Icon class |

The first tab is auto-activated if no tab has `active: true`.

## Parameters

### Tab container attributes

| Attribute | Description |
|-----------|-------------|
| `id` | HTML id for the tab container |
| `fit="true"` | Fill parent container |
| `default` | Title of the tab to activate on render. If omitted, the first tab is active. |
| `data-options` | Parsed options string |

### Tab positions

| Position | Description |
|----------|-------------|
| `top` | Horizontal tabs above content (default) |
| `left` | Vertical tabs on the left |
| `right` | Vertical tabs on the right |

Vertical tabs (`left`) use `+vsplit()` internally — a west panel for tab labels and a center panel for content. The `vtab-plugin.js` handles DOM restructuring and click-based tab switching.

## Examples

### Basic horizontal tabs

```pug
+tabs#mytabs
  +tab-item('General')
    p General content
  +tab-item('Details')
    p Details content
```

### Vertical tabs (via +tabs bridge)

When `tabPosition` is `'left'`, `+tabs` internally delegates to `+vtab` which uses `+vsplit()` for layout. The API is identical — pages don't need to change.

```pug
+tabs#config(data-options="tabPosition:'left',headerWidth:180")
  +tab-item('Settings', {iconCls: 'icon-admin'})
    form
      +fitem('Company', {name: 'CO', class: 'textbox'})
  +tab-item('Advanced', {iconCls: 'icon-settings'})
    form
      +fitem('Debug', {name: 'DBG', class: 'combobox'})
```

### Vertical tabs (direct +vtab call)

`+vtab` can also be called directly — same result, different syntax:

```pug
+vtab({headerWidth: 180})#config
  +vtab-item('Settings', {iconCls: 'icon-admin'})
    form
      +fitem('Company', {name: 'CO', class: 'textbox'})
  +vtab-item('Advanced', {iconCls: 'icon-settings'})
    form
      +fitem('Debug', {name: 'DBG', class: 'combobox'})
```

### Default active tab

```pug
+tabs(default='Details')
  +tab-item('General')
    p General content
  +tab-item('Details')
    p Details content — this tab is active on render
```

### Tabs inside a split panel

```pug
+vsplit('400px')
  +panel('west')
    +form#head
      +fitem('Name', {class:'textbox', name:'NAME'})
  +panel('center')
    +tabs#detail-tabs(data-options="fit:true")
      +tab-item('Description', {selected:'true'})
        p Description content
      +tab-item('History')
        p History content
```

## Output

```pug
+tabs#mytabs(default='Details')
  +tab-item('General')
    p General content here
  +tab-item('Details')
    p Details content — this tab is active by default
  +tab-item('History')
    p History content
```

```js
// Select tab by index or title
$('#mytabs').tabs('select', 0);          // General
$('#mytabs').tabs('select', 'Details');   // Details

// Get selected panel, disable a tab
var panel = $('#mytabs').tabs('getSelected');
$('#mytabs').tabs('disableTab', 'Details');
```

## JS API

### Tabs plugin (`$.fn.tabs`)

```js
// Select tab by index (0-based) or by title (aria-label)
$('#mytabs').tabs('select', 0);
$('#mytabs').tabs('select', 'Details');

// Get selected tab panel (jQuery object wrapping .tab-content)
var panel = $('#mytabs').tabs('getSelected');

// Get all tab panels
var panels = $('#mytabs').tabs('tabs');  // array of jQuery objects

// Get specific tab by index or title
var tab = $('#mytabs').tabs('getTab', 1);
var tab = $('#mytabs').tabs('getTab', 'Details');

// Get index of a tab panel
var idx = $('#mytabs').tabs('getTabIndex', panel);

// Enable/disable individual tabs
$('#mytabs').tabs('disableTab', 2);
$('#mytabs').tabs('enableTab', 2);

// Disable all except one (by index)
$('#mytabs').tabs('disableAll', 0);  // only first tab enabled
$('#mytabs').tabs('enableAll');

// Check if a tab exists
$('#mytabs').tabs('exists', 'Details');  // true/false

// onSelect callback
$('#mytabs').tabs({ onSelect: function(title, index) {
  console.log('Selected:', title, 'at index', index);
}});
```

### Methods

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `options` | — | Object | Get current options object |
| `select` | index \| title | jq | Select tab by zero-based index or aria-label title |
| `getSelected` | — | jQuery \| null | Get the active tab's `.tab-content` panel |
| `tabs` | — | Array | Get all `.tab-content` panels as jQuery objects |
| `getTab` | index \| title | jQuery \| null | Get a specific tab panel by index or title |
| `getTabIndex` | panel | Number | Get zero-based index of a tab panel (-1 if not found) |
| `exists` | index \| title | Boolean | Check if a tab exists |
| `enableTab` | index \| title | jq | Enable a disabled tab |
| `disableTab` | index \| title | jq | Disable a tab (sets `disabled` attr, adds `tab-disabled` class) |
| `enableAll` | — | jq | Enable all tabs |
| `disableAll` | exceptIndex | jq | Disable all tabs except the one at `exceptIndex` |
| `resize` | — | jq | No-op (EUI compat) |
| `add` | — | jq | No-op (EUI compat) |
| `close` | — | jq | No-op (EUI compat) |

### Tab resolution

The `which` argument (used by `select`, `getTab`, `enableTab`, `disableTab`, `exists`) accepts:
- **Number** — zero-based tab index
- **String** — matches the `aria-label` attribute on the radio input (same as the `title` passed to `+tab-item`)

### onSelect callback

Set via options when initializing, or fires automatically when a tab radio input changes:

```js
$('#mytabs').tabs({
  onSelect: function(title, index) { /* ... */ }
});
```

The callback receives the tab's `aria-label` and its zero-based index. It fires on both programmatic `.tabs('select', ...)` and user clicks.

## Vertical Tabs (vtab)

Vertical tabs use `+vsplit()` for layout with a west panel (tab labels) and center panel (content). Tab switching is JS-driven via `vtab-plugin.js`.

| Type | Path |
|------|------|
| Mixin | `html/dui/mixins/nav.pug` (`+vtab`, `+vtab-item`) |
| Plugin | `public/dui/js/plugins/vtab-plugin.js` |
| CSS | `public/dui/css/components.css` (`.vtab-*` rules) |

### `+vtab(opts)`

Creates a vertical tab container using `+vsplit()`.

| Arg | Type | Default | Description |
|-----|------|---------|-------------|
| `opts.headerWidth` | Number | `150` | Width of the tab nav column (px) |
| `opts.default` | String | `null` | Title of the tab to activate on render |

### `+vtab-item(title, opts)`

Individual vertical tab. Same options as `+tab-item`.

| Arg | Type | Default | Description |
|-----|------|---------|-------------|
| `title` | String | — | Tab label text |
| `opts.active` | Boolean | `false` | Force active state |
| `opts.iconCls` | String | — | Icon class (auto-coloured via `nextIconColor()`) |

### How it works

1. **Server render:** `+vtab` outputs a `+vsplit` grid. `+vtab-item` renders `.vtab-label` + `.vtab-panel` as siblings inside the center panel.
2. **Client init:** `vtab-plugin.js` moves `.vtab-label` elements from the center panel to `.vtab-nav` in the west panel, then wires click handlers.
3. **Tab switching:** Clicking a label adds/removes `.active` class on labels and panels. Pure JS — no radio inputs needed.

### Bridge: `+tabs(tabPosition:'left')` → `+vtab`

When `+tabs` detects `tabPosition: 'left'`, it sets `_state._inVtab = true` and delegates to `+vtab`. Each `+tab-item` checks this flag and delegates to `+vtab-item`. Existing pages work unchanged.

### CSS classes

| Class | Purpose |
|-------|---------|
| `.vtab` | Added to the vsplit container |
| `.vtab-nav` | Tab label container (west panel) |
| `.vtab-label` | Individual tab label (clickable) |
| `.vtab-label.active` | Currently selected tab label |
| `.vtab-icon` | Wrapper span for the tab icon |
| `.vtab-panel` | Tab content panel |
| `.vtab-panel.active` | Currently visible content panel |

### Active tab indicator

The active tab has a 2px primary-coloured bar on its left edge, rendered via `::before` pseudo-element at 90% height, vertically centred.

## Notes

### `.remember` — persistent tab selection

Add the `.remember` class to a `+tabs` container to persist the selected tab across page loads via `localStorage`.

```pug
+tabs#detail-tabs.remember(data-options="fit:true")
  +tab-item('General')
    p General content
  +tab-item('Details')
    p Details content
```

The element **must have an `id`** — this is used as the storage key. User tab clicks are saved automatically. Programmatic `tabs('select', ...)` calls do **not** overwrite the remembered value — the saved tab is re-applied instead.

Requires the `remember-plugin.js` plugin. Storage key format: `rem:<pageId>:<elementId>`. Values expire after 30 days.

### Icon auto-colouring

Tab icons are automatically assigned a cycling DaisyUI colour from the framework palette:

`text-primary` → `text-secondary` → `text-accent` → `text-info` → `text-success` → `text-warning` → `text-error` → (repeats)

Each `+tab-item` with an `iconCls` gets the next colour in sequence. No configuration needed — it's automatic.

This uses the shared `nextIconColor()` Pug helper (defined in `helpers.pug`). The same palette is available in JS as `$.dui.iconColors` and `$.dui.iconColor(index)`.

The `+icon` mixin also supports explicit auto-colouring via `{autocolor: true}`:

```pug
//- Auto-colour: each icon gets the next colour in the palette
+icon('search', {autocolor: true})
+icon('settings', {autocolor: true})
+icon('save', {autocolor: true})
```

### Surface depth freeze

Tab content freezes surface depth. Panels inside tabs do not increment the global depth counter. This prevents deeply nested tab panels from getting progressively darker.

### Fit mode

When `fit:true`, tabs expand to fill their parent container height. This is commonly used when tabs are the main content of a panel.
