---
name: dp-fitem
description: Auto-detecting form field with label, pre/post icon slots
category: Forms
base: dp-fitem
---

## Usage

`+dp-fitem(label, input, fitemOpts)` renders a label + input pair, auto-detecting the input type from the `class` attribute. Supports pre/post icon slots using DaisyUI join groups.

### Auto-detect mapping

| Class | Renders as |
|-------|-----------|
| `textbox` (default) | `<input type="text">` |
| `combobox` | `div.dp-combobox` (custom dropdown) |
| `numberbox` | `<input type="number">` |
| `numberspinner` | `<input type="number">` with step |
| `datebox` | `<input type="date">` |
| `datetimebox` | `<input type="datetime-local">` |
| `timespinner` | `<input type="time">` |
| `multiline` / `textarea` | `<textarea>` |
| `checkbox` | `<input type="checkbox">` (inline with label) |
| `toggle` | `<input type="checkbox" class="toggle">` |
| `radio` | `<input type="radio">` |
| `searchbox` | `<input type="search">` |
| `passwordbox` | `<input type="password">` |
| `filebox` | `<input type="file">` |

### Input Options

| Option | Type | Description |
|--------|------|-------------|
| `class` | string | Widget type (first word) + extra classes |
| `name` | string | Form field name |
| `id` | string | HTML id — use `'~'` to auto-generate from name |
| `color` | string | DaisyUI color (default: primary) |
| `size` | string | DaisyUI size |
| `value` | string | Default value |
| `placeholder` | string | Placeholder text |
| `required` | boolean | Shows red * on label |
| `readonly` | boolean | Read-only input |
| `precision` | number | Decimal places for numberbox/numberspinner |
| `min` / `max` | number | Range for number inputs |
| `rows` | number | Textarea rows (default: 3) |
| `options` | array | Select options (string[] or {value,text}[]) |
| `pre` | string/object | Pre-slot: icon name string or {text} |
| `post` | string/object | Post-slot: icon name, or {action, icon, id, text} for button |

### Pre/Post Slots

```pug
//- Icon pre-slot
+dp-fitem('Search', {class: 'searchbox', name: 'Q', pre: 'search'})

//- Icon post-slot (clickable)
+dp-fitem('Email', {class: 'textbox', name: 'EMAIL', post: 'x'})

//- Both
+dp-fitem('Code', {class: 'textbox', name: 'CODE', pre: 'hash', post: 'search'})

//- Post as action button
+dp-fitem('Part', {class: 'textbox', name: 'PART', post: {action: true, icon: 'search', id: 'btn_lookup'}})
```

### Font Size / Density

All DaisyPug components use `rem`-based sizing from DaisyUI — set the root font-size to control page density from one place (SSOT). Use the `--font-size` render option or set `font-size` on `<html>`:

```pug
//- Via CLI
//- daisypug render page.pug --font-size 0.9em

//- Or in HTML directly
//- html(style="font-size: 0.9em")
```

| Root font-size | Density | Label | Input height |
|----------------|---------|-------|-------------|
| `1em` (default) | Standard | 16px | 40px |
| `0.9em` | Compact | 14.4px | 36px |
| `0.85em` | Dense | 13.6px | 34px |

### Inline Layout (label + input side by side)

Add `.inline` to the form for horizontal label/input alignment. Labels get a fixed width, inputs fill the rest.

```pug
//- Basic inline — labels default to 8rem
+dp-form({class: 'inline'})(id="myform")
  +dp-fitem('Part ID', {class: 'textbox', name: 'PART_ID', id: '~'})
  +dp-fitem('Status', {class: 'combobox', name: 'STATUS', id: '~'})

//- Custom label width via labelWidth prop
+dp-form({class: 'inline', labelWidth: '12rem'})(id="myform")
  +dp-fitem('Full Description', {class: 'textbox', name: 'DESC', id: '~'})

//- Responsive: stacked on mobile, inline on desktop (640px+)
+dp-form({class: 'inline-responsive'})(id="myform")
  +dp-fitem('Name', {class: 'textbox', name: 'NAME', id: '~'})

//- Two-column grid + inline labels
+dp-form({class: 'two inline', labelWidth: '6rem'})(id="myform")
  +dp-fitem('Part ID', {class: 'textbox', name: 'PART_ID', id: '~'})
  +dp-fitem('Status', {class: 'combobox', name: 'STATUS', id: '~'})
```

Notes:
- Multiline/textarea fields keep label on top (aligned to start)
- Checkbox/radio/toggle fields stay inline with their label
- Pre/post slots work in inline mode
- `.inline` and `.two`/`.three`/`.four` compose together

### Multi-column Forms

```pug
+dp-form({id: 'myform'}).two    //- 2 columns
+dp-form({id: 'myform'}).three  //- 3 columns
+dp-form({id: 'myform'}).four   //- 4 columns
```

### Field Groups

```pug
+dp-group('Section Title')       //- vertical group heading
  +dp-fitem(...)
+dp-hgroup('Side by Side')       //- horizontal group
  +dp-fitem(...)
  +dp-fitem(...)
```

### API (dp.js)

```js
const field = dp('.dp-fitem')     // or dp('#PART_ID').parent()

// Input delegation
field.getValue() / field.setValue('abc')
field.clear() / field.focus()
field.enable() / field.disable()
field.readOnly(true)

// Label
field.getLabel() / field.setLabel('New Label')

// Pre/Post slots
field.onPreClick((value, event, field) => console.log('pre clicked'))
field.onPostClick((value, event, field) => console.log('post clicked'))
field.setPreIcon('search')        // swap Lucide icon
field.setPostIcon('check')
field.showPre() / field.hidePre()
field.showPost() / field.hidePost()

// Events (delegated to inner input)
field.onChange(fn) / field.onInput(fn)
field.onEnter(fn) / field.onEscape(fn)

// Metadata
field.getName()                   // input name attribute
field.isRequired()                // has required indicator
field.getWidgetType()             // 'select', 'number', 'text', etc.
```

## Code

```pug
+dp-form({id: 'demo'}).three
  .divider.text-xs.font-bold.opacity-50.mt-0(style="grid-column:1/-1") DETAILS
  +dp-fitem('Part ID', {class: 'combobox', name: 'PART_ID', id: '~', pre: 'package', options: ['A8000', 'B3200']})
  +dp-fitem('Description', {class: 'textbox', name: 'DESC', id: '~', placeholder: 'Enter description'})
  +dp-fitem('Status', {class: 'combobox', name: 'STATUS', id: '~', options: [{value: 'A', text: 'Active'}]})
  .divider.text-xs.font-bold.opacity-50(style="grid-column:1/-1") QUANTITIES
  +dp-fitem('Quantity', {class: 'numberspinner', name: 'QTY', id: '~', min: 0, precision: 0})
  +dp-fitem('Price', {class: 'numberbox', name: 'PRICE', id: '~', precision: 2, pre: 'dollar-sign'})
  +dp-fitem('Date', {class: 'datebox', name: 'TX_DATE', id: '~', pre: 'calendar'})
```

## Examples

<div class="bg-base-100 rounded-lg p-4" style="max-width:400px">
  <div class="dp-fitem mb-2">
    <label class="dp-fitem-label fieldset-label">Search</label>
    <div class="dp-fitem-slots join w-full">
      <span class="dp-fitem-pre join-item flex items-center px-2 bg-base-200 border border-base-300"><i data-lucide="search" style="width:16px;height:16px"></i></span>
      <input class="dp-input input input-primary w-full join-item" type="search" placeholder="Type to search...">
      <span class="dp-fitem-post join-item flex items-center px-2 bg-base-200 border border-base-300 cursor-pointer"><i data-lucide="x" style="width:16px;height:16px"></i></span>
    </div>
  </div>
  <div class="dp-fitem mb-2">
    <label class="dp-fitem-label fieldset-label">Email</label>
    <div class="dp-fitem-slots join w-full">
      <span class="dp-fitem-pre join-item flex items-center px-2 bg-base-200 border border-base-300"><i data-lucide="mail" style="width:16px;height:16px"></i></span>
      <input class="dp-input input input-primary w-full join-item" type="text" placeholder="you@example.com">
    </div>
  </div>
  <div class="dp-fitem mb-2">
    <label class="dp-fitem-label fieldset-label">Amount</label>
    <div class="dp-fitem-slots join w-full">
      <span class="dp-fitem-pre join-item flex items-center px-2 bg-base-200 border border-base-300"><i data-lucide="dollar-sign" style="width:16px;height:16px"></i></span>
      <input class="dp-input input input-primary w-full join-item" type="number" step="0.01">
    </div>
  </div>
</div>
