---
name: dp-modalform
description: Modal dialog containing a form with fields and submit/cancel
category: Composites
base: dp-modalform
---

## Usage

`+dp-modalform(id, title, opts, fields, actions)` renders a modal with a form inside.

### Signature

```
+dp-modalform(id, title, {opts}, [fields], {actions})
```

- `id` — dialog ID for triggering
- `title` — modal heading
- `opts` — `{color}` for submit button
- `fields` — array of field objects (same as dp-formfield)
- `actions` — `{submit: 'Save', cancel: 'Cancel'}`

### API (dp.js)

```js
const modal = dp('#edit-modal')
modal.open()
modal.close()
modal.getData()           // form field values
modal.setData({name: 'Alice'})
modal.reset()
modal.onSubmit(data => fetch('/api/save', {method: 'POST', body: JSON.stringify(data)}))
```

## Code

```pug
+btn({text: 'Edit User'})(onclick="edit_modal.showModal()")

+dp-modalform('edit_modal', 'Edit User', {color: 'primary'}, [
  {label: 'Name', value: 'Alice'},
  {label: 'Email', type: 'email', value: 'alice@example.com'},
  {label: 'Role', as: 'select', options: ['Admin', 'User', 'Guest']},
], {submit: 'Save', cancel: 'Cancel'})
```

## Examples

<button class="dp-btn btn btn-primary" onclick="demo_edit.showModal()">Open Edit Modal</button>
<dialog id="demo_edit" class="dp-modal modal">
  <div class="dp-modal-box modal-box">
    <h3 class="text-lg font-bold">Edit User</h3>
    <fieldset class="dp-fieldset fieldset">
      <label class="fieldset-label">Name</label>
      <input class="dp-input input input-primary w-full" type="text" value="Alice">
      <label class="fieldset-label">Email</label>
      <input class="dp-input input input-primary w-full" type="email" value="alice@example.com">
    </fieldset>
    <div class="dp-modal-action modal-action">
      <form method="dialog"><div class="flex gap-2">
        <button class="dp-btn btn btn-ghost">Cancel</button>
        <button class="dp-btn btn btn-primary">Save</button>
      </div></form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop"><button>close</button></form>
</dialog>
