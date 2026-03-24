# Split & Panel

CSS grid-based page layout system for splitting containers into 2 panels.

## Overview

DUI uses `+vsplit()` and `+hsplit()` to partition pages into panels. Each split creates a CSS grid with exactly 2 children. For more complex layouts, nest splits.

| Type | Path |
|------|------|
| Mixin | `html/dui/mixins/layout.pug` |
| Plugin | `public/dui/js/plugins/panel-plugin.js` |
| CSS | `public/dui/css/layout.css` |

## Mixins

### `+vsplit(size)`

Vertical split — side-by-side panels (left | right).

| Arg | Type | Default | Description |
|-----|------|---------|-------------|
| `size` | String | `'1fr'` | Width of the first (left) panel. e.g. `'400px'`, `'30%'`, `'1fr'` |

The second panel always gets `1fr` (fills remaining space).

| Class | Effect |
|-------|--------|
| `no-border` | Suppresses the divider border between panels |

### `+hsplit(size)`

Horizontal split — stacked panels (top | bottom).

| Arg | Type | Default | Description |
|-----|------|---------|-------------|
| `size` | String | `'1fr'` | Height of the first (top) panel. e.g. `'200px'`, `'30%'`, `'1fr'` |

The second panel always gets `1fr` (fills remaining space).

| Class | Effect |
|-------|--------|
| `no-border` | Suppresses the divider border between panels |

### `+panel(name, opts)`

A named region within a split. Renders a flex-col div with surface elevation and optional header.

| Arg | Type | Default | Description |
|-----|------|---------|-------------|
| `name` | String | `'center'` | Region name: `north`, `south`, `west`, `east`, `center` |
| `opts.title` | String | — | Renders a panel header bar |
| `opts.iconCls` | String | — | Icon class in the header |
| `opts.scroll` | Boolean | `true` | Enable overflow scrolling |
| `opts.id` | String | — | HTML id attribute |

## Parameters

### Panel styling (controlled by mixin — not configurable by pages)

| Property | Value | Description |
|----------|-------|-------------|
| Background | `bg-base-100` | All panels use base background |
| Border (vsplit) | `border-r border-base-300` | First panel only (suppressed by `.no-border`) |
| Border (hsplit) | `border-b border-base-300` | First panel only (suppressed by `.no-border`) |
| Header bg | `bg-base-200` | Panel header background |
| Header border | `border-b border-base-300` | Below header |

### 2-Panel Limit

Each split enforces a maximum of 2 child panels. A third panel throws a render-time error.

## Examples

### Basic vertical split (sidebar + content)

```pug
+vsplit('400px')
  +panel('west')
    +form#head(class='single load', _sqlid='inv^partall')
      +fitem('Part ID', {class:'combobox fkey navi', name:'PART_ID', id:'~'})
  +panel('center')
    +datagrid#partdg
```

### Nested splits (3-area layout)

```pug
+vsplit('400px')
  +panel('west')
    //- sidebar form
  +hsplit('200px')
    +panel('north')
      //- top content
    +panel('center')
      //- main content
```

### Borderless split

```pug
+vsplit('400px').no-border
  +panel('west')
    //- no divider border between panels
  +panel('center')
    //- seamless join
```

**Note:** In Pug, positional arguments must come before class modifiers: `+vsplit('400px').no-border`, not `+vsplit.no-border('400px')`.

### Complex 4-area layout

```pug
+vsplit('30%')
  +panel('west')
    //- left sidebar
  +hsplit('50%')
    +panel('north')
      +tabs#mytabs
        +tab-item('Tab A')
        +tab-item('Tab B')
    +vsplit
      +panel('west', { title: 'Bottom-Left' })
      +panel('east', { title: 'Bottom-Right' })
```

## Output

### vsplit with two panels

```pug
+vsplit('400px')
  +panel('west')
    p West panel content
  +panel('center')
    p Center panel content
```

```js
// Split panels are pure CSS grid — no JS initialization needed
```

## JS API

### Panel plugin (`$.fn.panel`)

```js
$('#myPanel').panel('body');           // get panel body element
$('#myPanel').panel('header');         // get panel header element
$('#myPanel').panel('setTitle', 'New');// change header title
$('#myPanel').panel('open');           // show panel
$('#myPanel').panel('close');          // hide panel
$('#myPanel').panel('refresh', url);   // reload content via AJAX
$('#myPanel').panel('resize', {width: 500, height: 300});
$('#myPanel').panel('clear');          // empty panel body
$('#myPanel').panel('clear', 'footer');// empty panel footer
$('#myPanel').panel('destroy');        // remove from DOM
```

### Methods

| Method | Args | Description |
|--------|------|-------------|
| `body` | — | Returns the `.panel-body` child element |
| `header` | — | Returns the panel header element |
| `footer` | — | Returns the panel footer element |
| `setTitle` | title | Update the panel header text |
| `open` | — | Show a hidden panel |
| `close` | — | Hide the panel |
| `refresh` | url/params | Reload panel content via href |
| `resize` | `{width, height}` | Resize the panel |
| `clear` | which | Empty body (default) or `'footer'` |
| `destroy` | — | Remove panel and clean up |
| `doLayout` | — | Trigger layout resize |

## Notes

### Deprecated: `+layout()` and `+split()`

`+layout()` and `+split()` still work but are deprecated. Use `+vsplit()` and `+hsplit()` in all new code. The old mixins use a 3x3 named-area grid which is unnecessarily complex for 2-panel splits.

### Border behaviour

Only the first panel in a split gets a divider border:
- vsplit: panel #1 gets `border-r`
- hsplit: panel #1 gets `border-b`
- Panel #2 gets no border

Add `.no-border` to the split to suppress the divider entirely: `+vsplit.no-border('400px')`. This is useful when panels have their own visual separation (e.g. tabs, background color) and the border line is unwanted.

### Surface depth

Each `+panel` increments the global surface depth counter. Inside tabs, surface depth is frozen.
