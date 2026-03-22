---
name: form-api
title: Form API (dp.form)
description: Form abstraction with typed getters/setters, API loading, validation, and auto-save
category: Guides
order: 7
---

## Usage

`dp.form()` creates a form abstraction over any container with form inputs. Provides typed get/set, bulk data operations, API loading/saving, validation, dirty checking, and auto-save.

### Creating a Form

```js
// From any container with inputs
const form = dp.form('#my-fieldset')
const form = dp.form('#my-card')
const form = dp.form('.dp-formcard')

// From a DpComponent
const form = dp.form(dp('#my-fieldset'))
```

### Typed Getters — `form.get.{type}(name)`

```js
form.get.text('email')          // string — text input value
form.get.select('country')      // string — selected option value
form.get.textarea('message')    // string — textarea content
form.get.checkbox('agree')      // boolean — checked state
form.get.toggle('darkMode')     // boolean — alias for checkbox
form.get.radio('plan')          // string — selected radio value
form.get.range('volume')        // number — range value
form.get.file('avatar')         // FileList — selected files
form.get.value('anything')      // auto-detect type
```

### Typed Setters — `form.set.{type}(name, value)`

All setters return the form for chaining:

```js
form.set.text('email', 'alice@example.com')
    .set.select('country', 'UK')
    .set.checkbox('agree', true)
    .set.radio('plan', 'pro')
    .set.range('volume', 75)
```

### Bulk Operations

```js
form.getData()                  // {email: '...', country: '...', agree: true}
form.setData({email: '...', country: 'UK', agree: true})
form.clear()                    // empty all fields
form.reset()                    // restore to snapshot
```

### Field Access

```js
form.field('email')             // DpInput component
form.fields()                   // all input components as array
form.fieldNames()               // ['email', 'country', 'agree', ...]
```

### Enable / Disable / ReadOnly

```js
form.disable()                  // disable all fields
form.enable()                   // enable all fields
form.readOnly(true)             // make all fields read-only
form.readOnly(false)            // make editable again
```

### Field Visibility

```js
form.showField('advanced')      // show field + its label
form.hideField('advanced')      // hide field + its label
form.focus('email')             // focus a specific field
```

### Dynamic Fields

```js
form.addField('notes', '<textarea class="dp-textarea textarea w-full" name="notes">')
form.removeField('notes')       // removes field + label
```

### Serialization

```js
form.toFormData()               // FormData object (for file uploads)
form.toQueryString()            // 'email=a%40b.com&country=UK'
form.fromQueryString('email=a@b&name=Alice')  // populate from URL params
form.serialize()                // JSON string
form.deserialize('{"email":"a@b"}')  // populate from JSON string
```

### Watch / Computed

```js
// Watch a single field
form.watch('email', (value, field, form) => {
  console.log('Email changed to:', value);
});

// Computed values — auto-update derived fields
form.computed('fullName', data => `${data.firstName} ${data.lastName}`);
// Updates element with id="fullName" or data-computed="fullName"
```

### API Integration

```js
// Load form data from API
await form.load('/api/user/1')
// → GET /api/user/1 → auto-populates fields + takes snapshot

// Save form data to API
await form.save('/api/user/1')            // POST
await form.save('/api/user/1', 'PUT')     // PUT

// Auto-save on change (debounced)
form.autoSave('/api/user/1', 2000)
// → any field change triggers PUT after 2s debounce
```

### Validation

```js
const { valid, errors } = form.validate()
// valid: boolean
// errors: {fieldName: 'error message'}

// Built-in validators:
// - required (empty check)
// - email format (@ check)
// - minLength / maxLength (from attributes)
// - pattern (regex from pattern attribute)

// Custom rules
form.rules({
  email: (val) => val.endsWith('@company.com') || 'Must be a company email',
  password: (val) => val.length >= 8 || 'Minimum 8 characters',
  confirmPassword: (val, data) => val === data.password || 'Passwords must match',
  age: (val) => parseInt(val) >= 18 || 'Must be 18+',
});

// Show inline errors on fields (adds error classes + messages)
form.errors()                   // auto-validate and show
form.errors({email: 'Taken'})   // show specific errors
form.clearErrors()              // remove all error indicators
```

### Dirty Checking

```js
form.snapshot()                 // store current values as "original"
// ... user makes changes ...
form.isDirty()                  // true if changed since snapshot
form.reset()                    // restore to snapshot values
```

### Events

```js
form.onSubmit((data, valid, errors, form) => {
  if (!valid) {
    console.log('Errors:', errors);
    return;
  }
  form.save('/api/submit');
})

form.onChange((data, changedField, form) => {
  console.log('Form changed:', data);
})
```

### Form-Parts (Multi-Tab Forms)

A single logical form can span multiple tabs. Use the same `id` on each `+dp-form` — the mixin detects duplicates and renders them as `data-form-part` instead of a second `id`.

```pug
//- Main form (gets the id)
+dp-form#head
  +dp-fitem('Part ID', {class: 'combobox', name: 'PART_ID', id: '~'})

//- Tab forms (same id → become form-parts)
+tabs({style: 'lift'})
  +tab({name: 'tabs', label: 'Details', active: true})
  +tab-content
    +dp-form#head
      +dp-fitem('Width', {class: 'numberbox', name: 'WIDTH', id: '~'})
  +tab({name: 'tabs', label: 'Notes'})
  +tab-content
    +dp-form#head
      +dp-fitem('Notes', {class: 'multiline', name: 'NOTES', id: '~'})
```

Renders as:
```html
<form id="head" class="dp-form">...</form>
<form data-form-part="head" class="dp-form">...</form>
<form data-form-part="head" class="dp-form">...</form>
```

`dp.form('#head')` automatically collects inputs from all parts:

```js
const form = dp.form('#head');
form.getData();    // {PART_ID, WIDTH, NOTES} — all tabs
form.isDirty();    // true if ANY field in ANY tab changed
form.fields();     // all inputs across all tabs
```

### Form State Machine (CRUD)

Bind a form to a toolbar for automatic CRUD state management:

```js
dp.form('#head').bind('#toolbar', {
  url: '/api/parts',       // API endpoint for save/delete
  idField: 'PART_ID'       // primary key field for PUT/DELETE URLs
});
```

#### Modes

| Mode | Fields | Toolbar Buttons |
|------|--------|-----------------|
| `view` | Read-only | Add, Edit enabled. Save, Cancel, Delete disabled |
| `add` | Editable, cleared | Save, Cancel enabled. Add, Edit, Delete disabled |
| `edit` | Editable, loaded | Save, Cancel, Delete enabled. Add, Edit disabled |

#### Auto-wiring

The `bind()` method connects toolbar buttons to form actions:

| Button | Action |
|--------|--------|
| Add | `form.mode('add')` — clears fields, makes editable |
| Save | Validates → POST (add) or PUT (edit) → back to view |
| Cancel | Confirms if dirty → restores snapshot → back to view |
| Edit | `form.mode('edit')` — makes editable, snapshots for cancel |
| Delete | Confirms → DELETE → clears → back to view |

#### Manual mode control

```js
form.mode()              // get current mode: 'view', 'add', 'edit'
form.mode('edit')        // set mode manually

form.onModeChange((mode, prev, form) => {
  console.log(`${prev} → ${mode}`);
});
```

#### Callbacks

```js
form.onSave((data, form) => {
  // After successful save
  dp('#my-table').loadData('/api/parts');
});

form.onCancel((form) => {
  // After cancel
});

form.onDelete((form) => {
  // After delete
  dp('#my-table').loadData('/api/parts');
});
```

#### Navigation guard

```js
form.guardNavigation();  // warns before leaving page with unsaved changes
```

## Code

### Login Form

```pug
+fieldset()(id="login-form")
  +fieldset-legend({text: 'Login'})
  +dp-formfield('Email', {type: 'email', color: 'primary', name: 'email', required: true})
  +dp-formfield('Password', {type: 'password', color: 'primary', name: 'password', required: true})
  +dp-formfield('Remember me', {as: 'checkbox', name: 'remember'})
  +btn({color: 'primary', text: 'Sign In', block: true, class: 'mt-4'})(type="submit")
```

```js
dp.on('ready', () => {
  const form = dp.form('#login-form');

  form.onSubmit(async (data, valid, errors) => {
    if (!valid) {
      Object.entries(errors).forEach(([field, msg]) => {
        console.log(field + ': ' + msg);
      });
      return;
    }

    try {
      const result = await form.save('/api/login');
      if (result.data.token) {
        localStorage.setItem('token', result.data.token);
        window.location = '/dashboard';
      }
    } catch(e) {
      dp('#login-error').setMessage(e.response.data.error).show();
    }
  });
});
```

### Edit User Modal

```js
dp.on('ready', () => {
  const form = dp.form('#edit-modal');

  // Load when modal opens
  dp('#edit-modal').onOpen(async () => {
    await form.load('/api/user/current');
  });

  form.onSubmit(async (data, valid, errors) => {
    if (!valid) return;
    await form.save('/api/user/current', 'PUT');
    dp('#edit-modal').close();
    dp('#success-toast').show();
  });
});
```

### Auto-saving Settings

```js
dp.on('ready', () => {
  const form = dp.form('#settings');
  form.load('/api/settings').then(() => {
    form.autoSave('/api/settings', 1000);
  });
});
```

### Registration with Validation

```js
dp.on('ready', () => {
  const form = dp.form('#register');

  form.onChange((data) => {
    // Live validation feedback
    const { valid, errors } = form.validate();
    dp('#submit-btn').setAttr('disabled', !valid);
  });

  form.onSubmit(async (data, valid, errors) => {
    if (!valid) return;
    const result = await dp.post('/api/register', data);
    window.location = '/welcome';
  });
});
```

## Examples

### Complete Form Workflow

```js
dp.on('ready', () => {
  const form = dp.form('#user-form');

  // Typed getters
  const email = form.get.text('email');
  const role = form.get.select('role');
  const notify = form.get.checkbox('notifications');
  const theme = form.get.radio('theme');
  const volume = form.get.range('volume');

  // Typed setters (chained)
  form.set.text('email', 'alice@example.com')
      .set.select('role', 'Admin')
      .set.checkbox('notifications', true)
      .set.radio('theme', 'dark')
      .set.range('volume', 80);

  // Bulk
  const allData = form.getData();
  form.setData({ email: 'bob@example.com', role: 'User' });

  // Snapshot + dirty check
  form.snapshot();
  form.set.text('email', 'changed@example.com');
  console.log(form.isDirty());  // true
  form.reset();                 // back to snapshot
  console.log(form.isDirty());  // false

  // Save to API
  form.save('/api/user', 'PUT');
});
```
