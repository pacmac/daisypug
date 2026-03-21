---
name: dp-formcard
description: Card wrapping a complete form with fields and submit button
category: Composites
base: dp-formcard
---

## Usage

`+dp-formcard(title, opts, fields, actions)` renders a card containing a fieldset with auto-generated form fields.

### Signature

```
+dp-formcard(title, {opts}, [fields], {actions})
```

- `title` — fieldset legend text
- `opts` — card options (`color`, `style`, `class`)
- `fields` — array of field objects (same as dp-formfield inputOpts, plus `label`)
- `actions` — `{submit: 'Button Text'}`

### API (dp.js)

```js
const form = dp('#my-form')
form.getData()        // {name: value} for all fields
form.setData({...})   // populate fields
form.reset()          // clear all
form.onSubmit(data => console.log(data))
```

## Code

```pug
+dp-formcard('Contact Us', {color: 'primary', class: 'w-96'}, [
  {label: 'Name', required: true},
  {label: 'Email', type: 'email', placeholder: 'you@example.com'},
  {label: 'Subject', as: 'select', options: ['General', 'Bug Report', 'Feature']},
  {label: 'Message', as: 'textarea', rows: 3},
], {submit: 'Send'})
```

## Examples

<div class="dp-formcard dp-card card w-96">
  <div class="dp-card-body card-body">
    <fieldset class="dp-fieldset fieldset">
      <legend class="dp-fieldset-legend fieldset-legend">Contact Us</legend>
      <label class="dp-formfield-label fieldset-label">Name<span class="text-error">*</span></label>
      <input class="dp-input input input-primary w-full" type="text">
      <label class="dp-formfield-label fieldset-label">Email</label>
      <input class="dp-input input input-primary w-full" type="email" placeholder="you@example.com">
      <label class="dp-formfield-label fieldset-label">Subject</label>
      <select class="dp-select select select-primary w-full"><option>General</option><option>Bug Report</option><option>Feature</option></select>
      <label class="dp-formfield-label fieldset-label">Message</label>
      <textarea class="dp-textarea textarea textarea-primary w-full" rows="3"></textarea>
      <div class="mt-4"><button class="dp-btn btn btn-primary btn-block">Send</button></div>
    </fieldset>
  </div>
</div>
