---
name: dp-vsplit
description: CSS grid vertical split — side-by-side panels
category: Layout
base: dp-vsplit
---

## Usage

`+dp-vsplit(size)` creates a CSS grid with two side-by-side panels. The first panel gets the specified width, the second fills remaining space. Nest splits for complex layouts.

### Mixins

| Mixin | Args | Description |
|-------|------|-------------|
| `+dp-vsplit(size)` | size: CSS width (e.g. '400px', '30%', '1fr') | Vertical (left\|right) split |
| `+dp-hsplit(size)` | size: CSS height (e.g. '200px', '50%') | Horizontal (top\|bottom) split |
| `+dp-panel(name, opts)` | name: west/east/north/south/center | Named panel region |

### Panel Options

| Option | Type | Description |
|--------|------|-------------|
| `title` | string | Panel header bar text |
| `iconCls` | string | Lucide icon name in header |
| `scroll` | boolean | Enable overflow scrolling (default: true) |
| `id` | string | HTML id |

### API (dp.js)

```js
const split = dp('.dp-vsplit')
split.getPanels()                    // array of DpPanel
split.getPanel('west')               // panel by name

const panel = dp('.dp-panel-west')
panel.header                         // header element
panel.body                           // body element
panel.getTitle() / panel.setTitle()
panel.open() / panel.close()
panel.clear() / panel.clear('header')
panel.refresh(url)                   // load content via AJAX
```

### Styling Rules

- First panel gets a divider border (right for vsplit, bottom for hsplit)
- Add `.no-border` to suppress: `+dp-vsplit('400px').no-border`
- Panel body has zero padding — child decides its own spacing
- Panels fill their container height (h-full, min-h-0)

## Code

```pug
//- Basic sidebar
+dp-vsplit('250px')
  +dp-panel('west', {title: 'Sidebar'})
    +menu({size: 'sm'})
      +menu-item({active: true})
        a Dashboard
  +dp-panel('center', {title: 'Content'})
    div.p-4
      p Main content

//- Nested 3-column (email client)
+dp-vsplit('180px')
  +dp-panel('west', {title: 'Folders'})
  +dp-vsplit('300px')
    +dp-panel('west', {title: 'Messages'})
    +dp-panel('center', {title: 'Preview'})

//- IDE layout
+dp-vsplit('220px')
  +dp-panel('west', {title: 'Explorer'})
  +dp-hsplit('65%')
    +dp-panel('north', {title: 'Editor'})
    +dp-panel('south', {title: 'Terminal'})

//- Dashboard: topbar + sidebar + content
+dp-hsplit('48px')
  +dp-panel('north')
    //- navbar/toolbar
  +dp-vsplit('220px')
    +dp-panel('west')
      //- sidebar
    +dp-panel('center')
      //- main content
```

## Examples

<div class="dp-vsplit grid h-full" style="grid-template-columns:200px 1fr; height:200px; border:1px solid oklch(var(--bc)/.2); border-radius:0.5rem; overflow:hidden">
  <div class="dp-panel dp-panel-west flex flex-col bg-base-100 min-h-0 min-w-0">
    <div class="dp-panel-header bg-base-200 border-b border-base-300 px-3 py-2 flex items-center gap-2 flex-shrink-0"><span class="font-semibold text-sm">West</span></div>
    <div class="dp-panel-body flex-1 overflow-auto min-h-0"><p class="p-3 text-sm">Sidebar content</p></div>
  </div>
  <div class="dp-panel dp-panel-center flex flex-col bg-base-100 min-h-0 min-w-0">
    <div class="dp-panel-header bg-base-200 border-b border-base-300 px-3 py-2 flex items-center gap-2 flex-shrink-0"><span class="font-semibold text-sm">Center</span></div>
    <div class="dp-panel-body flex-1 overflow-auto min-h-0"><p class="p-3 text-sm">Main content</p></div>
  </div>
</div>
