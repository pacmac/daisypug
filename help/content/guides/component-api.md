---
name: component-api
title: Component API (dp.js)
description: Client-side JavaScript API for interacting with DaisyPug components
category: Guides
order: 6
---

## Usage

dp.js is a zero-dependency client-side API that gives programmatic access to every DaisyPug component. Components are discovered automatically via `dp-{name}` CSS class hooks.

### Enabling the API

**CLI:**
```bash
daisypug render page.pug --api
```

**Node.js:**
```javascript
renderPage(pugContent, { api: true })
```

The `dp.js` script is injected at the end of `<body>`. Without `--api`, no script is included.

### Factory Function

```js
// Find by ID
dp('#my-btn')             // returns wrapped component

// Find by class
dp('.dp-btn')             // first match

// Find all
dp.findAll('.dp-btn')     // array of wrapped components

// Wrap raw element
dp(document.querySelector('#el'))

// Ready callback (fires after auto-discovery)
dp.on('ready', () => {
  console.log('All components discovered');
});
```

### Chaining

All setters and event methods return `this`:

```js
dp('#email')
  .setPlaceholder('Enter email')
  .setRequired(true)
  .onChange(val => console.log(val))
  .onFocus(() => console.log('focused'))
```

### Auto-Discovery

On `DOMContentLoaded`, dp.js scans the page for all elements with `dp-*` classes, wraps each in the appropriate API class, and caches them. A `MutationObserver` catches dynamically added elements.

### Inheritance

```
DpComponent (base — all components)
├── DpInput (text input — THE reference class)
│   ├── DpSelect, DpTextarea
│   ├── DpCheckbox, DpToggle
│   ├── DpRadio, DpRange, DpFileInput
├── DpContainer (components with children)
│   ├── DpCard, DpAlert, DpHero, DpToast
│   ├── DpToggleable (open/close behavior)
│   │   ├── DpCollapse, DpModal, DpDropdown
│   │   ├── DpDrawer, DpSwap
│   └── DpTabs, DpTooltip
├── DpTable, DpList, DpMenu, DpSteps
│   DpCarousel, DpRating, DpTimeline
└── Composites
    DpFormField, DpFormCard, DpDataTable
    DpConversation, DpModalForm, DpPageLayout
```

## Code

### Base — DpComponent (all components)

Every component has:

```js
// Events
comp.onClick(fn)          // fn(event, component)
comp.onDblClick(fn)
comp.onMouseEnter(fn)
comp.onMouseLeave(fn)
comp.onFocus(fn)
comp.onBlur(fn)
comp.onKeyDown(fn)
comp.onKeyUp(fn)

// Visibility
comp.show() / comp.hide() / comp.toggle()
comp.isVisible()

// Enable/Disable
comp.enable() / comp.disable()
comp.isEnabled()

// CSS Classes
comp.addClass('cls') / comp.removeClass('cls')
comp.toggleClass('cls') / comp.hasClass('cls')

// Attributes
comp.getAttr('name') / comp.setAttr('name', 'val')
comp.getData('key') / comp.setData('key', 'val')

// DOM
comp.remove() / comp.clone()
comp.parent() / comp.find('.sel') / comp.findAll('.sel')

// Custom events
comp.emit('name', detail)
comp.on('name', fn) / comp.off('name', fn)

// Properties
comp.el     // raw DOM element
comp.id     // element ID
comp.type   // component type ('btn', 'card', etc)
```

### Form Inputs — DpInput

```js
const input = dp('#email')
input.getText() / input.setText('hi')
input.getValue() / input.setValue('hi')
input.clear()
input.focus() / input.blur() / input.select()
input.getPlaceholder() / input.setPlaceholder('...')
input.isRequired() / input.setRequired(true)
input.getName() / input.setName('email')
input.onChange(val => ...)
input.onInput(val => ...)
input.onEnter(val => ...)
input.onEscape(() => ...)
```

**DpSelect** adds: `getOptions()`, `setOptions([...])`, `addOption()`, `removeOption()`, `getSelectedIndex()`, `getSelectedText()`

**DpCheckbox/DpToggle** adds: `isChecked()`, `setChecked(bool)`, `toggle()`

**DpRadio** adds: `getGroup()`, `getGroupValue()`, `setGroupValue(val)`

**DpRange** adds: `getMin/Max/Step()`, `setMin/Max/Step()`, `getPercent()`, `onSlide(fn)`

### Containers — DpContainer

```js
const card = dp('#my-card')
card.getChildren()       // child dp- components
card.getContent()        // innerHTML
card.setContent(html)
card.append(child)
card.prepend(child)
card.clear()
```

**DpCard** adds: `.body`, `.title`, `.actions` sub-elements, `getTitle()`, `setTitle()`

**DpAlert** adds: `getMessage()`, `setMessage()`, `getColor()`, `setColor()`, `dismiss()`

### Toggleable — DpToggleable

```js
const modal = dp('#my-modal')
modal.open()
modal.close()
modal.toggle()
modal.isOpen()
modal.onOpen(fn)
modal.onClose(fn)
modal.onToggle(fn)
```

Applies to: Modal, Collapse, Dropdown, Drawer, Swap

### Tables — DpTable

```js
const table = dp('#my-table')
table.getData() / table.setData(rows)
table.addRow(data) / table.removeRow(idx)
table.getRow(idx) / table.updateRow(idx, data)
table.getCell(row, col) / table.setCell(row, col, val)
table.selectRow(idx) / table.deselectRow()
table.getSelectedRow() / table.getSelectedIndex()
table.sort(col, 'asc') / table.filter(fn) / table.search('query')
table.toCSV() / table.toJSON()
table.onRowClick(fn) / table.onCellClick(fn) / table.onSort(fn)
```

### Tabs — DpTabs

```js
const tabs = dp('#my-tabs')
tabs.getActive() / tabs.setActive(idx)
tabs.getTabCount() / tabs.getTabLabels()
tabs.onTabChange(({index, label}) => ...)
```

### Steps — DpSteps

```js
const steps = dp('#my-steps')
steps.getActive() / steps.setActive(n, 'primary')
steps.next() / steps.prev() / steps.reset()
```

## Examples

### Interactive Form

```js
dp.on('ready', () => {
  dp('#login-form').onSubmit(data => {
    fetch('/api/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(result => {
      if (result.ok) dp('#success-alert').show();
      else dp('#error-alert').setMessage(result.error).show();
    });
  });
});
```

### Dynamic Table

```js
dp.on('ready', () => {
  const table = dp('#users');

  fetch('/api/users')
    .then(r => r.json())
    .then(users => {
      table.setData(users.map(u => [u.name, u.email, u.role]));
    });

  table.onRowClick(({data, index}) => {
    dp('#detail-modal').open();
    dp('#detail-name').setText(data[0]);
    dp('#detail-email').setText(data[1]);
  });
});
```

### Theme Switcher

```js
dp.on('ready', () => {
  dp.findAll('.dp-theme-controller').forEach(tc => {
    tc.onThemeChange(theme => {
      console.log('Theme changed to:', theme);
      fetch('/api/preferences', {
        method: 'POST',
        body: JSON.stringify({theme})
      });
    });
  });
});
```
