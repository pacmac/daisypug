# DUI Framework Overview

DUI (DaisyUI Interface) is the next-generation UI framework for Pure Manufacturing 4.0, replacing the legacy EUI (EasyUI Interface). Server-side Pug mixins generate DaisyUI/Tailwind CSS markup; client-side jQuery plugins handle dynamic behavior.

## Overview

### Architecture

```
Page Template (.pug)          Mixin Library              Plugin Bundle (JS)
  +vsplit('400px')        -->  html/dui/mixins/         -->  public/dui/js/plugins/
    +panel('west')              layout.pug                    panel-plugin.js
      +form#head                form.pug                      form-plugin.js
        +fitem(...)             input.pug                     combobox-plugin.js
    +panel('center')            datagrid.pug                  datagrid-plugin.js
      +datagrid#dg
```

**Server side**: Pug mixins render semantic HTML with DaisyUI classes. No EasyUI JavaScript framework is loaded.

**Client side**: Lightweight jQuery plugins initialize widgets, handle data loading, and manage page lifecycle.

### File Locations

| Purpose | Path |
|---------|------|
| Mixin library | `html/dui/mixins/` |
| Mixin entry point | `html/dui/mixins/mixins.pug` |
| Page templates | `html/dui/mod/<module>/<page>.pug` |
| JSON configs | `html/dui/mod/<module>/json/` |
| Page JS | `html/dui/mod/<module>/js/<page>.js` |
| Plugins | `public/dui/js/plugins/` |
| CSS modules | `public/dui/css/` |
| CSS entry point | `public/dui/css/input.css` |
| CSS output | `public/dui/css/main.css` |
| Config | `config.yaml` (project root) |

## Mixins

### Mixin Files

| File | Contents |
|------|----------|
| `helpers.pug` | `getOpts()`, `surfaceDepth()`, `nextIconColor()`, global `_state` |
| `layout.pug` | `+vsplit`, `+hsplit`, `+panel`, `+divider`, `+drawer`, `+hero`, `+stack` |
| `form.pug` | `+form`, `+fieldset`, `+fitem`, `+label`, `+hint`, `+validator` |
| `input.pug` | `+input`, `+combobox`, `+textbox`, `+numberbox`, `+numberspinner`, `+spinner`, `+timespinner`, `+datebox`, `+filebox`, `+searchbox`, `+passwordbox`, `+spec`, `+udf`, `+qbe` |
| `datagrid.pug` | `+datagrid` (JSON-config driven table) |
| `nav.pug` | `+tabs`, `+tab-item`, `+menuItem`, `+lucideIcon` |
| `feedback.pug` | `+modal`, `+modal-footer`, `+dialog`, `+window` |
| `actions.pug` | `+button`, `+menubutton`, `+linkbutton` |
| `toolbar.pug` | `+toolbar` and all toolbar sections |
| `group.pug` | `+card`, `+join`, `+list`, `+indicator` |
| `tree.pug` | `+tree`, `+tree-node`, `+tree-render` |
| `visual.pug` | `+mockup_browser`, `+mockup_code`, `+mockup_phone`, `+mockup_window` |
| `print.pug` | `+print-modals` (report system dialogs) |
| `dev.pug` | `+script`, `+dwap` (legacy compat no-ops) |
| `utils.pug` | `+content`, `+section`, `+testOutput` (test pages only) |

### Plugin Files

| Plugin | Purpose |
|--------|---------|
| `page-plugin.js` | Page lifecycle (`$.page.ready`, `$.page.register`, `$.page.hook`) |
| `form-plugin.js` | Form CRUD, dirty tracking, mode management |
| `datagrid-plugin.js` | Table rendering, row selection, filtering |
| `combobox-plugin.js` | Select dropdown with remote data, filtering, navigation |
| `panel-plugin.js` | Layout panel resizing and state |
| `tabs-plugin.js` | Tab switching, lazy loading |
| `toolbar-plugin.js` | Button enable/disable (`butEn`), action wiring |
| `modal-plugin.js` | Modal open/close API (`$('#id').modal('open')`) — `.dialog()` and `.window()` are aliases |
| `print-plugin.js` | Report menu building, PDF viewer |
| `spinner-plugin.js` | Numeric spinner increment/decrement |
| `numberbox-plugin.js` | Number input formatting |
| `textbox-plugin.js` | Text input initialization |
| `datebox-plugin.js` | Date input formatting |
| `timespinner-plugin.js` | Time input formatting |
| `validatebox-plugin.js` | Field validation |
| `nav-plugin.js` | Sidebar menu navigation |
| `button-plugin.js` | Button enable/disable API (`.linkbutton()` alias) |
| `menubutton-plugin.js` | Dropdown button menus |
| `tree-plugin.js` | Tree widget |
| `ajax-plugin.js` | AJAX request helpers (`ajaxget`, `ajaxpost`) |
| `dataloader-plugin.js` | Form/grid data loading |
| `remember-plugin.js` | Persistent component state via `localStorage` |
| `dynadd-plugin.js` | Dynamic field rendering (`dynadd()`, `dynDialog()`) |
| `drag-plugin.js` | HTML5 drag-and-drop (`$.fn.draggable`, `$.fn.droppable`) |
| `qbe-plugin.js` | Query By Example search widget |
| `dui-namespace.js` | `$.dui` namespace (bhave, pdata, udata, ronly) |

### CSS Modules

| File | Purpose |
|------|---------|
| `input.css` | Tailwind entry point with `@import` chain |
| `main.css` | Compiled output (loaded by browser) |
| `surface.css` | Surface depth elevation classes |
| `forms.css` | Form item layout (`.fitem`, label widths) |
| `layout.css` | Panel and layout grid styles |
| `sidebar.css` | Navigation sidebar styles |
| `components.css` | Misc component overrides |
| `base.css` | Base resets and defaults |
| `safelist.css` | Tailwind safelist classes |

## Parameters

### Surface Depth Configuration (`config.yaml`)

| Setting | Values | Description |
|---------|--------|-------------|
| `mode` | `flat`, `progressive` | `flat` disables elevation; `progressive` enables it |
| `step` | Number (%) | Color mix increment per level |
| `levels` | Number | Total number of elevation levels |
| `nav` | Number | Surface level for the sidebar/navigation |
| `start` | Number | Surface level for the first panel |
| `direction` | `increment`, `decrement` | Whether deeper panels get lighter or darker |
| `wrap` | `bounce`, `cycle` | Bounce reverses direction, cycle wraps to start |

```yaml
surface:
  mode: progressive
  step: 4
  levels: 8
  nav: 0
  start: 2
  direction: increment
  wrap: bounce
```

## Examples

### Page Template Structure

```pug
extends ../content
block style
  style.
    /* page-specific CSS */
block content
  +vsplit('400px')
    +panel('west')
      +form#head(class='single load', _sqlid='mod^table')
        +fitem('Field', {class:'combobox fkey', name:'FIELD_ID', id:'~'})
    +panel('center')
      +datagrid#dg
block script
  script: include js/page.js
```

## Notes

### Deprecated: `+layout()` and `+split()`

`+layout()` and `+split()` are deprecated. Use `+vsplit()` and `+hsplit()` instead. The old mixins still work for backward compatibility but should not be used in new code. See [Split & Panel](split-panel.md).

### Icon Auto-Colouring

DUI provides a shared colour palette for automatically colouring icons. Each call returns the next colour in sequence, cycling through all 7 DaisyUI semantic colours.

**Palette:** `text-primary` → `text-secondary` → `text-accent` → `text-info` → `text-success` → `text-warning` → `text-error` → (repeats)

**Pug (server-side):**
- `nextIconColor()` — returns the next colour class (defined in `helpers.pug`)
- `+icon('search', {autocolor: true})` — auto-colours the icon

**JS (client-side):**
- `$.dui.iconColors` — the palette array
- `$.dui.iconColor(i)` — get colour class by index (cycling)
- `$.dui.icon('search', {autocolor: true})` — auto-colours the icon element

Tab icons use this automatically — each `+tab-item` with an `iconCls` gets the next colour. Other mixins can opt in by calling `nextIconColor()` or passing `{autocolor: true}` to `+icon`.

### Guidelines

- Use `+vsplit` / `+hsplit` for all page layouts
- Maximum 2 panels per split — nest for more complex arrangements
- Pages must never override panel backgrounds — the surface system owns panel styling
- Datagrid columns are defined in JSON config files, not in templates
- `id:'~'` means "use the `name` attribute as the id"
- `class:'single load'` means single-record form that auto-loads on navigation
