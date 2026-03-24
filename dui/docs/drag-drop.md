# Drag & Drop

HTML5 drag-and-drop for list reordering, plus mouse-drag titlebar movement for modals.

## Overview

Two separate drag systems serve different purposes:

| System | Plugin | Purpose | Mechanism |
|--------|--------|---------|-----------|
| **Draggable / Droppable** | `drag-plugin.js` | Move items between lists, reorder rows | HTML5 Drag API (`dragstart`/`dragover`/`drop`) |
| **Modal drag** | `modal-plugin.js` | Reposition modal dialogs by titlebar | Mouse events (`mousedown`/`mousemove`/`mouseup`) |

| Type | Path |
|------|------|
| Drag plugin | `public/dui/js/plugins/drag-plugin.js` |
| Modal plugin | `public/dui/js/plugins/modal-plugin.js` |
| CSS (cursors) | `public/dui/css/components.css` |

## Draggable / Droppable (HTML5 Drag API)

EUI-compatible `$.fn.draggable` and `$.fn.droppable` backed by native HTML5 drag events. Used by pages like Job Planner (`vwltsa^sa_jobplan`) for drag-and-drop reordering.

### `$.fn.draggable`

Makes elements draggable. Sets `draggable="true"`, adds `.draggable` CSS class.

```js
// Basic usage
$('.my-items').draggable();

// With options
$('.my-items').draggable({
  handle: '.drag-handle',
  onStartDrag: function(e) { console.log('Started dragging', this.id); },
  onEndDrag: function(e) { console.log('Dropped'); }
});
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `handle` | string/element | `null` | CSS selector or element for the drag handle (default: entire element) |
| `disabled` | boolean | `false` | Disable dragging |
| `onBeforeDrag` | function | `null` | Called on dragstart. Return `false` to cancel |
| `onStartDrag` | function | `null` | Called after drag begins. `this` = dragged element |
| `onDrag` | function | `null` | Called during drag (EUI compat — accepted but not fired by HTML5) |
| `onEndDrag` | function | `null` | Called on dragend. `this` = dragged element |
| `onStopDrag` | function | `null` | Alias for `onEndDrag` (EUI compat) |

EUI options accepted but ignored: `proxy`, `revert`, `cursor`, `deltaX`, `deltaY`, `axis`, `edge`, `delay`.

#### Methods

| Method | Description |
|--------|-------------|
| `$('#el').draggable('options')` | Get current options object |
| `$('#el').draggable('enable')` | Enable dragging |
| `$('#el').draggable('disable')` | Disable dragging |
| `$('#el').draggable('proxy')` | Returns the element itself (no proxy — EUI compat stub) |

### `$.fn.droppable`

Makes elements accept drops. Adds `.droppable` CSS class.

```js
// Accept drops from any draggable
$('.drop-zone').droppable({
  onDrop: function(e, source) {
    console.log('Dropped', source.id, 'onto', this.id);
  }
});

// Accept only specific draggables
$('.drop-zone').droppable({
  accept: '.task-item',
  onDragEnter: function(e, source) { $(this).addClass('drop-hover'); },
  onDragLeave: function(e, source) { $(this).removeClass('drop-hover'); },
  onDrop: function(e, source) {
    $(this).removeClass('drop-hover');
    // Move source into this container
    $(this).append(source);
  }
});
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `accept` | string | `null` | CSS selector — only accept drops from matching elements. `null` = accept all |
| `disabled` | boolean | `false` | Disable drop acceptance |
| `onDragEnter` | function | `null` | Draggable enters this zone. `this` = drop target, args: `(e, source)` |
| `onDragOver` | function | `null` | Draggable moves over this zone. `this` = drop target, args: `(e, source)` |
| `onDragLeave` | function | `null` | Draggable leaves this zone. `this` = drop target, args: `(e, source)` |
| `onDrop` | function | `null` | Item dropped. `this` = drop target, args: `(e, source)` |

#### Methods

| Method | Description |
|--------|-------------|
| `$('#el').droppable('options')` | Get current options object |
| `$('#el').droppable('enable')` | Enable drop acceptance |
| `$('#el').droppable('disable')` | Disable drop acceptance |

### CSS

Drag cursors are defined in `components.css`:

```css
.draggable { cursor: grab; }
.draggable:active, .draggable.dragging { cursor: grabbing; }
```

The `.dragging` class is added during `dragstart` and removed on `dragend`.

### Global state

`$.fn.draggable.isDragging` — boolean, `true` while any drag is in progress. Useful for disabling hover effects during drag operations.

### Event flow

```
User mousedown + move on .draggable
  → dragstart  : sets effectAllowed='move', adds .dragging class
  → dragenter  : fires onDragEnter on droppable (if accepted)
  → dragover   : fires onDragOver, sets dropEffect='move' (repeated)
  → dragleave  : fires onDragLeave when cursor exits droppable
  → drop       : fires onDrop with source element reference
  → dragend    : removes .dragging class, clears global state
```

## Modal Drag (Titlebar Move)

Modals with a titlebar (`[data-modal-titlebar]`) are draggable by default. Dragging the titlebar repositions the `.modal-box` via CSS `translate`.

### How it works

1. Any `<dialog>` with a `[data-modal-titlebar]` element gets drag-to-move automatically
2. The native `HTMLDialogElement.showModal()` is patched to auto-init drag on first open
3. The `.modal-box` is translated (not the `<dialog>` itself) — this keeps the backdrop stationary
4. Drag offset persists across open/close cycles via jQuery data (`dragX`/`dragY`)

### Enabling / disabling

Titlebar drag is **on by default** for all modals with titlebars. To disable:

```pug
//- Pug: titlebar modal with drag enabled (default)
+modal#editwin(title="Edit" titlebar)

//- JS: disable drag via options
$('#editwin').modal({ draggable: false });
```

The `draggable` option in `$.fn.modal.defaults` is `true`. Set to `false` to disable.

### Technical details

- Uses mouse events (not HTML5 Drag API) — no ghost image, no drag data transfer
- Translates `.modal-box` only, not the `<dialog>` element (avoids moving the backdrop)
- The titlebar cursor is set to `move` via inline style
- Clicks on buttons inside the titlebar (e.g. close button) are excluded from drag
- Event namespacing uses the dialog's `id` to avoid conflicts between multiple modals

### Activation paths

| How modal is opened | Drag initialized? |
|---------------------|-------------------|
| `$('#id').modal('open')` | Yes — via plugin init |
| `$('#id').dialog('open')` | Yes — alias for `.modal('open')` |
| `document.getElementById('id').showModal()` | Yes — native method patched |
| `dynDialog({titlebar: true, ...})` | Yes — calls `.modal()` init |

## Examples

### Drag-and-drop list reordering

```js
// Make list items draggable
$('#task-list .task-item').draggable({
  onStartDrag: function() {
    $(this).css('opacity', 0.5);
  },
  onEndDrag: function() {
    $(this).css('opacity', 1);
  }
});

// Make the list a drop target
$('#task-list').droppable({
  accept: '.task-item',
  onDrop: function(e, source) {
    // Reorder logic — move source before/after nearest sibling
    $(this).append(source);
  }
});
```

### Draggable modal (Pug)

```pug
+modal#editwin(title="Edit Record" titlebar iconCls="square-pen" bordered max-w="lg")
  +fitem('Name', {class:'textbox', name:'NAME'})
  +modal-footer
    +button('Save', {color:'primary', size:'sm'})
```

The titlebar is draggable automatically — no additional JS needed.

## Notes

### Differences from EUI

| Feature | EUI | DUI |
|---------|-----|-----|
| Drag mechanism | Custom mouse events with proxy elements | HTML5 Drag API (native browser support) |
| Drag proxy/ghost | Custom cloned element | Browser-native ghost image |
| Cursor during drag | Set via JS (`cursor` option) | Set via CSS (`.draggable` / `.dragging` classes) |
| Modal drag | Window panel header drag | Titlebar `mousedown` → CSS `translate` on `.modal-box` |
| `axis` constraint | Supported (x/y lock) | Not supported (dropped) |
| `revert` animation | Supported | Not supported (dropped) |

### Tree drag-and-drop

Tree widget drag-and-drop (`enableDnd`/`disableDnd`) is planned but not yet implemented. When implemented, it will use the same `drag-plugin.js` primitives.
