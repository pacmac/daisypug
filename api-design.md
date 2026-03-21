# DaisyPug Component API Design

## Principles

1. **Discoverable** — components found via `dp-{name}` CSS classes, no manual registration
2. **Consistent** — same naming conventions across all components (get/set, on{Event})
3. **Chainable** — all event methods and setters return `this`
4. **Zero dependencies** — vanilla ES6, no jQuery, no framework
5. **Opt-in** — API script only included when requested (`--api` flag)
6. **Non-destructive** — API wraps existing DOM, doesn't replace or rebuild it

## Naming Conventions

| Pattern | Example | Used For |
|---------|---------|----------|
| `on{Event}(fn)` | `onClick(fn)`, `onChange(fn)` | Event binding |
| `off{Event}(fn)` | `offClick(fn)` | Event unbinding |
| `get{Prop}()` | `getText()`, `getValue()` | Read property |
| `set{Prop}(val)` | `setText('hi')`, `setValue(3)` | Write property |
| `is{State}()` | `isVisible()`, `isChecked()` | Boolean query |
| `{action}()` | `open()`, `close()`, `toggle()` | State change |

## Factory API

```js
// Find single component (returns first match)
dp('#my-btn')           // by ID
dp('.dp-btn')           // by class (first)
dp(domElement)          // wrap existing element

// Find multiple
dp.findAll('.dp-btn')   // returns DpComponent[]

// Create new (renders and appends)
dp.create('btn', { text: 'Hi', color: 'primary' })

// Global events
dp.on('ready', fn)      // all components discovered
dp.on('error', fn)      // catch API errors

// Registry
dp.registry             // Map of dp-class → component instances
dp.version              // API version string
```

## Inheritance Tree

```
DpComponent                         ← abstract base, all components
│
├── DpButton                        ← btn
├── DpBadge                         ← badge
├── DpLink                          ← link
├── DpKbd                           ← kbd
├── DpLoading                       ← loading
├── DpProgress                      ← progress
├── DpStatus                        ← status
├── DpDivider                       ← divider
│
├── DpInput                         ← input (THE reference class)
│   ├── DpSelect                    ← select
│   ├── DpTextarea                  ← textarea
│   ├── DpCheckbox                  ← checkbox
│   ├── DpToggle                    ← toggle (alias for checkbox behavior)
│   ├── DpRadio                     ← radio
│   ├── DpRange                     ← range
│   └── DpFileInput                 ← file-input
│
├── DpContainer                     ← abstract, components with children
│   ├── DpCard                      ← card
│   ├── DpAlert                     ← alert
│   ├── DpHero                      ← hero
│   ├── DpToast                     ← toast
│   ├── DpStack                     ← stack
│   ├── DpJoin                      ← join
│   ├── DpIndicator                 ← indicator
│   ├── DpDiff                      ← diff
│   ├── DpFieldset                  ← fieldset
│   │
│   ├── DpToggleable                ← abstract, open/close behavior
│   │   ├── DpCollapse              ← collapse
│   │   ├── DpModal                 ← modal
│   │   ├── DpDropdown              ← dropdown
│   │   ├── DpDrawer                ← drawer
│   │   └── DpSwap                  ← swap
│   │
│   └── DpTabs                      ← tabs (special: managed children)
│
├── DpData                          ← abstract, data-driven components
│   ├── DpTable                     ← table
│   ├── DpList                      ← list
│   ├── DpMenu                      ← menu
│   ├── DpSteps                     ← steps
│   ├── DpTimeline                  ← timeline
│   ├── DpBreadcrumbs               ← breadcrumbs
│   ├── DpCarousel                  ← carousel
│   └── DpRating                    ← rating
│
├── DpChat                          ← chat (message-driven)
├── DpCountdown                     ← countdown (value-driven)
├── DpRadialProgress                ← radial-progress (value-driven)
│
├── DpMockup                        ← mockup-browser, mockup-code, mockup-window, mockup-phone
│
├── DpThemeController               ← theme-controller
│
└── Composites (dp- prefix)
    ├── DpFormField                 ← dp-formfield
    ├── DpFormCard                  ← dp-formcard
    ├── DpNav                       ← dp-nav
    ├── DpDataTable                 ← dp-datatable (extends DpTable)
    ├── DpConversation              ← dp-conversation (extends DpChat)
    ├── DpModalForm                 ← dp-modalform (extends DpModal)
    ├── DpHeroCta                   ← dp-herocta
    └── DpPageLayout                ← dp-pagelayout
```

## Class-to-Component Mapping

The factory uses this lookup to determine which API class to instantiate:

| dp- class | API class | Branch |
|-----------|-----------|--------|
| `dp-btn` | DpButton | base |
| `dp-badge` | DpBadge | base |
| `dp-link` | DpLink | base |
| `dp-kbd` | DpKbd | base |
| `dp-loading` | DpLoading | base |
| `dp-progress` | DpProgress | base |
| `dp-status` | DpStatus | base |
| `dp-divider` | DpDivider | base |
| `dp-input` | DpInput | input |
| `dp-select` | DpSelect | input |
| `dp-textarea` | DpTextarea | input |
| `dp-checkbox` | DpCheckbox | input |
| `dp-toggle` | DpToggle | input |
| `dp-radio` | DpRadio | input |
| `dp-range` | DpRange | input |
| `dp-file-input` | DpFileInput | input |
| `dp-card` | DpCard | container |
| `dp-alert` | DpAlert | container |
| `dp-hero` | DpHero | container |
| `dp-toast` | DpToast | container |
| `dp-stack` | DpStack | container |
| `dp-join` | DpJoin | container |
| `dp-indicator` | DpIndicator | container |
| `dp-diff` | DpDiff | container |
| `dp-fieldset` | DpFieldset | container |
| `dp-collapse` | DpCollapse | toggleable |
| `dp-modal` | DpModal | toggleable |
| `dp-dropdown` | DpDropdown | toggleable |
| `dp-drawer` | DpDrawer | toggleable |
| `dp-swap` | DpSwap | toggleable |
| `dp-tabs` | DpTabs | container |
| `dp-table` | DpTable | data |
| `dp-list` | DpList | data |
| `dp-menu` | DpMenu | data |
| `dp-steps` | DpSteps | data |
| `dp-timeline` | DpTimeline | data |
| `dp-breadcrumbs` | DpBreadcrumbs | data |
| `dp-carousel` | DpCarousel | data |
| `dp-rating` | DpRating | data |
| `dp-chat` | DpChat | chat |
| `dp-countdown` | DpCountdown | value |
| `dp-radial-progress` | DpRadialProgress | value |
| `dp-mockup-browser` | DpMockup | mockup |
| `dp-mockup-code` | DpMockup | mockup |
| `dp-mockup-window` | DpMockup | mockup |
| `dp-mockup-phone` | DpMockup | mockup |
| `dp-theme-controller` | DpThemeController | theme |
| `dp-formfield` | DpFormField | composite |
| `dp-formcard` | DpFormCard | composite |
| `dp-nav` | DpNav (composite) | composite |
| `dp-datatable` | DpDataTable | composite |
| `dp-conversation` | DpConversation | composite |
| `dp-modalform` | DpModalForm | composite |
| `dp-herocta` | DpHeroCta | composite |
| `dp-pagelayout` | DpPageLayout | composite |

## Event System

All events follow the same pattern internally:

```js
// Binding
component.onClick(fn)       // adds listener, returns this
component.onClick(fn, opts) // opts: { once: true }

// Unbinding
component.offClick(fn)      // removes specific listener
component.offClick()        // removes all click listeners

// Internal implementation
class DpComponent {
  _listeners = new Map()

  _on(event, fn, opts) {
    this.el.addEventListener(event, fn, opts)
    if (!this._listeners.has(event)) this._listeners.set(event, [])
    this._listeners.get(event).push(fn)
    return this
  }

  _off(event, fn) {
    if (fn) {
      this.el.removeEventListener(event, fn)
    } else {
      // Remove all
      (this._listeners.get(event) || []).forEach(f =>
        this.el.removeEventListener(event, f)
      )
    }
    return this
  }
}
```

## Chaining Examples

```js
dp('#email')
  .setPlaceholder('Enter email')
  .setRequired(true)
  .onChange(val => console.log(val))
  .onFocus(() => console.log('focused'))

dp('#my-table')
  .setData([
    ['Alice', 30, 'Admin'],
    ['Bob', 25, 'User'],
  ])
  .onRowClick((row, idx) => {
    dp('#detail-modal').open()
    dp('#detail-name').setText(row[0])
  })

dp('#login-form')
  .onSubmit(data => {
    fetch('/api/login', { method: 'POST', body: JSON.stringify(data) })
  })

dp('#sidebar').toggle()
dp('#theme').setValue('dark')
```

## Auto-Discovery

On DOMContentLoaded:

1. Scan all elements with `class*="dp-"`
2. Extract the `dp-{name}` class
3. Look up the API class in the registry
4. Instantiate and store in `dp.registry`
5. Fire `dp.on('ready')` callbacks

MutationObserver watches for dynamically added elements with `dp-` classes and auto-wraps them.

## Sub-element Access

Components with sub-parts (card-body, navbar-start, etc.) expose them as properties:

```js
const card = dp('#my-card')
card.body        // DpComponent wrapping .dp-card-body
card.title       // DpComponent wrapping .dp-card-title
card.actions     // DpComponent wrapping .dp-card-actions

const nav = dp('#my-nav')
nav.start        // DpComponent wrapping .dp-navbar-start
nav.center       // DpComponent wrapping .dp-navbar-center
nav.end          // DpComponent wrapping .dp-navbar-end

const modal = dp('#my-modal')
modal.box        // DpComponent wrapping .dp-modal-box
modal.actions    // DpComponent wrapping .dp-modal-action
```

These are lazy-loaded (queried on first access, then cached).

---

## Step 2: DpComponent (Base Class) API

Every component inherits from this.

### Constructor

```js
new DpComponent(el)  // el is the DOM element
```

### Properties (getters)

| Property | Type | Description |
|----------|------|-------------|
| `el` | Element | Raw DOM element |
| `id` | string | Element ID |
| `type` | string | Component type (e.g. 'btn', 'card') |
| `classes` | DOMTokenList | Element classList |

### Universal Events

| Method | DOM Event | Signature |
|--------|-----------|-----------|
| `onClick(fn)` | click | `fn(event, component)` |
| `onDblClick(fn)` | dblclick | `fn(event, component)` |
| `onMouseEnter(fn)` | mouseenter | `fn(event, component)` |
| `onMouseLeave(fn)` | mouseleave | `fn(event, component)` |
| `onFocus(fn)` | focus | `fn(event, component)` |
| `onBlur(fn)` | blur | `fn(event, component)` |
| `onKeyDown(fn)` | keydown | `fn(event, component)` |
| `onKeyUp(fn)` | keyup | `fn(event, component)` |
| `onContextMenu(fn)` | contextmenu | `fn(event, component)` |

Each has a matching `off{Event}(fn)` to remove.

### Universal Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `show()` | this | Remove hidden/display:none |
| `hide()` | this | Add display:none |
| `toggle()` | this | Toggle visibility |
| `enable()` | this | Remove disabled |
| `disable()` | this | Set disabled |
| `isVisible()` | boolean | Check visibility |
| `isEnabled()` | boolean | Check not disabled |
| `addClass(cls)` | this | Add CSS class |
| `removeClass(cls)` | this | Remove CSS class |
| `toggleClass(cls)` | this | Toggle CSS class |
| `hasClass(cls)` | boolean | Check CSS class |
| `getAttr(name)` | string | Get attribute |
| `setAttr(name, val)` | this | Set attribute |
| `removeAttr(name)` | this | Remove attribute |
| `getData(key)` | string | Get data-* attribute |
| `setData(key, val)` | this | Set data-* attribute |
| `getStyle(prop)` | string | Get inline style |
| `setStyle(prop, val)` | this | Set inline style |
| `remove()` | void | Remove from DOM |
| `clone()` | DpComponent | Deep clone |
| `parent()` | DpComponent\|null | Parent dp- component |
| `find(sel)` | DpComponent\|null | Find child dp- component |
| `findAll(sel)` | DpComponent[] | Find all child dp- components |
| `emit(name, detail)` | this | Dispatch CustomEvent |
| `on(name, fn)` | this | Listen for CustomEvent |
| `off(name, fn)` | this | Remove CustomEvent listener |

---

## Step 3: DpInput API (Form Inputs)

### DpInput (extends DpComponent) — THE reference class

```js
dp('#email')  // → DpInput
```

#### Events

| Method | Fires When | Callback Signature |
|--------|------------|-------------------|
| `onChange(fn)` | value changes (on blur) | `fn(value, event, component)` |
| `onInput(fn)` | each keystroke | `fn(value, event, component)` |
| `onFocus(fn)` | receives focus | `fn(event, component)` |
| `onBlur(fn)` | loses focus | `fn(event, component)` |
| `onKeyPress(fn)` | key pressed | `fn(key, event, component)` |
| `onEnter(fn)` | Enter key pressed | `fn(value, event, component)` |
| `onEscape(fn)` | Escape key pressed | `fn(event, component)` |

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getText()` | string | Get display text / value |
| `setText(str)` | this | Set value |
| `getValue()` | string | Alias for getText |
| `setValue(str)` | this | Alias for setText |
| `clear()` | this | Set value to '' |
| `focus()` | this | Focus the input |
| `blur()` | this | Blur the input |
| `select()` | this | Select all text |
| `getPlaceholder()` | string | Get placeholder |
| `setPlaceholder(str)` | this | Set placeholder |
| `isRequired()` | boolean | Check required |
| `setRequired(bool)` | this | Set required |
| `isReadOnly()` | boolean | Check readOnly |
| `setReadOnly(bool)` | this | Set readOnly |
| `getType()` | string | Get input type |
| `setType(str)` | this | Set input type |
| `getName()` | string | Get name attribute |
| `setName(str)` | this | Set name attribute |

### DpSelect (extends DpInput)

| Method | Returns | Description |
|--------|---------|-------------|
| `getOptions()` | Array<{value, text, selected}> | All options |
| `setOptions(arr)` | this | Replace options. arr: string[] or {value,text}[] |
| `addOption(val, text)` | this | Append option |
| `removeOption(val)` | this | Remove by value |
| `getSelectedIndex()` | number | Selected index |
| `setSelectedIndex(n)` | this | Select by index |
| `getSelectedText()` | string | Selected option's display text |
| `getSelectedValue()` | string | Alias for getValue |

### DpTextarea (extends DpInput)

| Method | Returns | Description |
|--------|---------|-------------|
| `getRows()` | number | Get rows attribute |
| `setRows(n)` | this | Set rows |
| `getCols()` | number | Get cols |
| `setCols(n)` | this | Set cols |
| `getLength()` | number | Character count |
| `getLineCount()` | number | Line count |

### DpCheckbox / DpToggle (extends DpInput)

| Method | Returns | Description |
|--------|---------|-------------|
| `isChecked()` | boolean | Get checked state |
| `setChecked(bool)` | this | Set checked |
| `toggle()` | this | Toggle checked |
| `onChange(fn)` | this | `fn(checked, event, component)` |

`getValue()` returns `true`/`false` (not the value attribute).

### DpRadio (extends DpInput)

| Method | Returns | Description |
|--------|---------|-------------|
| `isSelected()` | boolean | This radio selected |
| `select()` | this | Select this radio |
| `getGroup()` | DpRadio[] | All radios with same name |
| `getGroupValue()` | string | Selected value in group |
| `setGroupValue(val)` | this | Select radio by value |
| `onChange(fn)` | this | `fn(value, event, component)` |

### DpRange (extends DpInput)

| Method | Returns | Description |
|--------|---------|-------------|
| `getValue()` | number | Current value (numeric) |
| `setValue(n)` | this | Set value |
| `getMin()` | number | Minimum |
| `setMin(n)` | this | Set minimum |
| `getMax()` | number | Maximum |
| `setMax(n)` | this | Set maximum |
| `getStep()` | number | Step value |
| `setStep(n)` | this | Set step |
| `getPercent()` | number | Value as % of range (0-100) |
| `onSlide(fn)` | this | `fn(value, percent, event)` — fires on input |

### DpFileInput (extends DpInput)

| Method | Returns | Description |
|--------|---------|-------------|
| `getFiles()` | FileList | Selected files |
| `getFileNames()` | string[] | File name list |
| `getFileCount()` | number | Number of files |
| `clear()` | this | Clear selection |
| `getAccept()` | string | Accept attribute |
| `setAccept(str)` | this | Set accept |
| `isMultiple()` | boolean | Multiple files allowed |
| `setMultiple(bool)` | this | Set multiple |
| `onChange(fn)` | this | `fn(files, event, component)` |

---

## Step 4: DpContainer and Display APIs

### DpContainer (extends DpComponent)

| Method | Returns | Description |
|--------|---------|-------------|
| `getChildren()` | DpComponent[] | Direct dp- children |
| `getContent()` | string | innerHTML |
| `setContent(html)` | this | Set innerHTML |
| `append(el\|html)` | this | Append child |
| `prepend(el\|html)` | this | Prepend child |
| `clear()` | this | Remove all children |
| `getChildCount()` | number | Number of children |

### DpCard (extends DpContainer)

| Access | Returns | Description |
|--------|---------|-------------|
| `.body` | DpComponent | The card-body element |
| `.title` | DpComponent | The card-title element |
| `.actions` | DpComponent | The card-actions element |
| `getTitle()` | string | Title text |
| `setTitle(str)` | this | Set title text |

### DpAlert (extends DpContainer)

| Method | Returns | Description |
|--------|---------|-------------|
| `getMessage()` | string | Alert message text |
| `setMessage(str)` | this | Set message |
| `getColor()` | string | Current color (info/success/etc) |
| `setColor(str)` | this | Change color |
| `dismiss()` | this | Remove with fade |
| `onDismiss(fn)` | this | Before dismiss callback |

### DpToggleable (extends DpContainer) — abstract

| Method | Returns | Description |
|--------|---------|-------------|
| `open()` | this | Open/show |
| `close()` | this | Close/hide |
| `toggle()` | this | Toggle state |
| `isOpen()` | boolean | Current state |
| `onOpen(fn)` | this | After open callback |
| `onClose(fn)` | this | After close callback |
| `onToggle(fn)` | this | `fn(isOpen, component)` |

### DpCollapse (extends DpToggleable)

Inherits open/close/toggle/isOpen. Sub-elements:

| Access | Returns |
|--------|---------|
| `.title` | DpComponent (collapse-title) |
| `.content` | DpComponent (collapse-content) |

### DpModal (extends DpToggleable)

Uses dialog API internally: `open()` calls `el.showModal()`, `close()` calls `el.close()`.

| Access | Returns |
|--------|---------|
| `.box` | DpComponent (modal-box) |
| `.actions` | DpComponent (modal-action) |

### DpDropdown (extends DpToggleable)

| Access | Returns |
|--------|---------|
| `.trigger` | DpComponent (summary element) |
| `.content` | DpComponent (dropdown-content) |

### DpDrawer (extends DpToggleable)

Uses checkbox toggle internally.

| Access | Returns |
|--------|---------|
| `.content` | DpComponent (drawer-content) |
| `.side` | DpComponent (drawer-side) |

### DpSwap (extends DpToggleable)

| Access | Returns |
|--------|---------|
| `.on` | DpComponent (swap-on) |
| `.off` | DpComponent (swap-off) |

### DpTabs (extends DpContainer)

| Method | Returns | Description |
|--------|---------|-------------|
| `getActive()` | number | Active tab index |
| `setActive(n)` | this | Switch to tab |
| `getActiveLabel()` | string | Active tab label |
| `getTabCount()` | number | Total tabs |
| `getTabLabels()` | string[] | All labels |
| `onTabChange(fn)` | this | `fn(index, label, component)` |
| `addTab(label, content)` | this | Append new tab |
| `removeTab(n)` | this | Remove tab at index |

### DpTooltip (extends DpContainer)

| Method | Returns | Description |
|--------|---------|-------------|
| `getTip()` | string | Tooltip text |
| `setTip(str)` | this | Set tooltip text |
| `show()` | this | Force show |
| `hide()` | this | Force hide |

### Simple containers

DpHero, DpToast, DpStack, DpJoin, DpIndicator, DpDiff, DpFieldset — inherit DpContainer with no additions (sub-element access covers their needs).

---

## Step 5: DpData (Data Component) APIs

### DpTable (extends DpComponent)

The richest API.

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getHeaders()` | string[] | Column headers |
| `setHeaders(arr)` | this | Set headers |
| `getColCount()` | number | Number of columns |
| `getRowCount()` | number | Number of rows |
| `getData()` | string[][] | All row data |
| `setData(rows)` | this | Replace all rows |
| `getRow(n)` | string[] | Row at index |
| `addRow(data, idx?)` | this | Insert row (append or at index) |
| `removeRow(n)` | this | Remove row |
| `updateRow(n, data)` | this | Replace row data |
| `getCell(row, col)` | string | Cell value |
| `setCell(row, col, val)` | this | Set cell value |
| `selectRow(n)` | this | Highlight row |
| `deselectRow()` | this | Remove highlight |
| `getSelectedRow()` | string[]\|null | Selected row data |
| `getSelectedIndex()` | number | Selected row index (-1 if none) |
| `sort(col, dir)` | this | Sort by column. dir: 'asc'\|'desc' |
| `filter(fn)` | this | Filter rows. fn(row, idx) → bool |
| `clearFilter()` | this | Show all rows |
| `search(query)` | this | Filter rows containing query |
| `clearSearch()` | this | Alias for clearFilter |
| `toCSV()` | string | Export as CSV |
| `toJSON()` | object[] | Export as array of objects |

#### Events

| Method | Callback Signature |
|--------|--------------------|
| `onRowClick(fn)` | `fn(rowData, rowIndex, event)` |
| `onRowDblClick(fn)` | `fn(rowData, rowIndex, event)` |
| `onRowSelect(fn)` | `fn(rowData, rowIndex)` |
| `onCellClick(fn)` | `fn(value, rowIdx, colIdx, event)` |
| `onSort(fn)` | `fn(colIdx, direction)` |
| `onDataChange(fn)` | `fn(data)` |

### DpList (extends DpComponent)

| Method | Returns | Description |
|--------|---------|-------------|
| `getItems()` | DpComponent[] | List row elements |
| `getItemCount()` | number | Row count |
| `addItem(html)` | this | Append item |
| `removeItem(n)` | this | Remove at index |
| `getItem(n)` | DpComponent | Item at index |
| `clear()` | this | Remove all items |
| `onItemClick(fn)` | this | `fn(item, index, event)` |

### DpMenu (extends DpComponent)

| Method | Returns | Description |
|--------|---------|-------------|
| `getItems()` | DpComponent[] | Menu items |
| `getActive()` | DpComponent\|null | Active item |
| `setActive(n)` | this | Set active by index |
| `getActiveIndex()` | number | Active index |
| `onSelect(fn)` | this | `fn(item, index, event)` |

### DpSteps (extends DpComponent)

| Method | Returns | Description |
|--------|---------|-------------|
| `getActive()` | number | Current step (last colored) |
| `setActive(n)` | this | Color steps up to n |
| `getStepCount()` | number | Total steps |
| `next()` | this | Advance one step |
| `prev()` | this | Go back one step |
| `reset()` | this | Reset to step 0 |
| `onStepChange(fn)` | this | `fn(stepIndex, component)` |

### DpTimeline (extends DpComponent)

| Method | Returns | Description |
|--------|---------|-------------|
| `getItems()` | DpComponent[] | Timeline items |
| `getItemCount()` | number | Item count |
| `addItem(opts)` | this | Append {start, middle, end} |
| `removeItem(n)` | this | Remove at index |

### DpBreadcrumbs (extends DpComponent)

| Method | Returns | Description |
|--------|---------|-------------|
| `getItems()` | Array<{text, href}> | Breadcrumb items |
| `setItems(arr)` | this | Replace breadcrumbs |
| `addItem(text, href)` | this | Append |
| `getCurrent()` | string | Last item text |

### DpCarousel (extends DpComponent)

| Method | Returns | Description |
|--------|---------|-------------|
| `getActive()` | number | Current slide index |
| `setActive(n)` | this | Go to slide |
| `next()` | this | Next slide |
| `prev()` | this | Previous slide |
| `getSlideCount()` | number | Total slides |
| `onSlideChange(fn)` | this | `fn(index, component)` |

### DpRating (extends DpComponent)

| Method | Returns | Description |
|--------|---------|-------------|
| `getValue()` | number | Current rating |
| `setValue(n)` | this | Set rating |
| `getMax()` | number | Max stars |
| `onChange(fn)` | this | `fn(value, component)` |

### DpChat (extends DpComponent)

| Method | Returns | Description |
|--------|---------|-------------|
| `getMessages()` | Array<{from, text, position}> | All messages |
| `addMessage(opts)` | this | Append {from, text, position, color} |
| `removeMessage(n)` | this | Remove at index |
| `getMessageCount()` | number | Total messages |
| `clear()` | this | Remove all |
| `scrollToBottom()` | this | Scroll to latest |
| `onMessage(fn)` | this | `fn(message, component)` |

### DpCountdown (extends DpComponent)

| Method | Returns | Description |
|--------|---------|-------------|
| `getValue()` | number | Current value |
| `setValue(n)` | this | Set --value |
| `start(from, interval?)` | this | Auto-decrement |
| `stop()` | this | Stop countdown |
| `onComplete(fn)` | this | Fires at 0 |
| `onTick(fn)` | this | `fn(value)` each tick |

### DpRadialProgress (extends DpComponent)

| Method | Returns | Description |
|--------|---------|-------------|
| `getValue()` | number | Current % |
| `setValue(n)` | this | Set --value (0-100) |
| `animate(to, duration?)` | this | Smooth transition |
| `onChange(fn)` | this | `fn(value, component)` |

---

## Step 6: Composite APIs

### DpFormField (dp-formfield)

| Method | Returns | Description |
|--------|---------|-------------|
| `getValue()` | any | Delegate to inner input |
| `setValue(val)` | this | Delegate to inner input |
| `getLabel()` | string | Label text |
| `setLabel(str)` | this | Set label text |
| `getInput()` | DpInput | The wrapped input component |
| `getInputType()` | string | 'input'\|'select'\|'textarea' etc |
| `isRequired()` | boolean | Check required |
| `setRequired(bool)` | this | Toggle required indicator |
| `validate()` | boolean | Run validation |
| `getError()` | string\|null | Current error message |
| `setError(msg)` | this | Show error |
| `clearError()` | this | Clear error |
| `onValidate(fn)` | this | `fn(isValid, value, component)` |
| `onChange(fn)` | this | Delegates to inner input |

### DpFormCard (dp-formcard)

| Method | Returns | Description |
|--------|---------|-------------|
| `getFields()` | DpFormField[] | All form fields |
| `getField(name)` | DpFormField | Field by input name |
| `getData()` | object | `{name: value}` for all fields |
| `setData(obj)` | this | Set field values from object |
| `reset()` | this | Clear all fields |
| `validate()` | boolean | Validate all fields |
| `getErrors()` | object | `{name: errorMsg}` for invalid fields |
| `onSubmit(fn)` | this | `fn(data, component)` — intercepts submit button |
| `onReset(fn)` | this | After reset callback |

### DpDataTable (dp-datatable, extends DpTable)

Adds pagination on top of DpTable:

| Method | Returns | Description |
|--------|---------|-------------|
| `getPage()` | number | Current page (1-based) |
| `setPage(n)` | this | Go to page |
| `getPageCount()` | number | Total pages |
| `getPageSize()` | number | Rows per page |
| `setPageSize(n)` | this | Change page size |
| `nextPage()` | this | Next page |
| `prevPage()` | this | Previous page |
| `firstPage()` | this | Go to page 1 |
| `lastPage()` | this | Go to last page |
| `onPageChange(fn)` | this | `fn(page, component)` |

### DpConversation (dp-conversation)

| Method | Returns | Description |
|--------|---------|-------------|
| `getMessages()` | Array<{from, text, position, color}> | All messages |
| `addMessage(opts)` | this | Append message + render |
| `clear()` | this | Remove all |
| `getMessageCount()` | number | Count |
| `scrollToBottom()` | this | Scroll to latest |
| `onMessage(fn)` | this | After addMessage callback |

### DpNav (dp-nav composite)

| Method | Returns | Description |
|--------|---------|-------------|
| `getBrand()` | string | Brand text |
| `setBrand(str)` | this | Update brand |
| `getItems()` | string[] | Nav item labels |
| `getActive()` | string\|null | Active item |
| `setActive(str)` | this | Highlight item |
| `onNavigate(fn)` | this | `fn(item, index, event)` |

### DpModalForm (dp-modalform)

Combines DpModal + DpFormCard:

| Method | Returns | Description |
|--------|---------|-------------|
| `open()` | this | Show modal |
| `close()` | this | Hide modal |
| `getData()` | object | Form data |
| `setData(obj)` | this | Populate fields |
| `reset()` | this | Clear fields |
| `validate()` | boolean | Validate |
| `onSubmit(fn)` | this | `fn(data, component)` |
| `onOpen(fn)` | this | After open |
| `onClose(fn)` | this | After close |

### DpHeroCta (dp-herocta)

| Method | Returns | Description |
|--------|---------|-------------|
| `getTitle()` | string | Title text |
| `setTitle(str)` | this | Set title |
| `getSubtitle()` | string | Subtitle text |
| `setSubtitle(str)` | this | Set subtitle |
| `onPrimaryClick(fn)` | this | Primary button click |
| `onSecondaryClick(fn)` | this | Secondary button click |

### DpPageLayout (dp-pagelayout)

| Method | Returns | Description |
|--------|---------|-------------|
| `isSidebarOpen()` | boolean | Drawer state |
| `toggleSidebar()` | this | Toggle drawer |
| `openSidebar()` | this | Open drawer |
| `closeSidebar()` | this | Close drawer |
| `getNav()` | DpNav | Navbar component |
| `getContent()` | DpComponent | Content area |
| `getSidebar()` | DpMenu | Sidebar menu |

### DpThemeController

| Method | Returns | Description |
|--------|---------|-------------|
| `getTheme()` | string | Current theme value |
| `setTheme(str)` | this | Change theme |
| `getThemes()` | string[] | Available themes (from group) |
| `onThemeChange(fn)` | this | `fn(theme, component)` |
