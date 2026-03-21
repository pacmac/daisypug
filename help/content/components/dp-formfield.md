---
name: dp-formfield
description: Label + input pair composite — supports all input types
category: Composites
base: dp-formfield
---

## Usage

`+dp-formfield(label, inputOpts, labelOpts)` renders a label + input pair. The first argument is the label text, the second controls the input, the third (optional) styles the label.

### Signature

```
+dp-formfield(label, {inputOpts}, {labelOpts})
```

### Input Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `as` | string | `'input'` | Input type: `input`, `select`, `textarea`, `file-input`, `toggle`, `checkbox`, `radio` |
| `type` | string | `'text'` | HTML input type (for `as: 'input'`) |
| `color` | string | | DaisyUI color |
| `size` | string | | DaisyUI size |
| `placeholder` | string | | Placeholder text |
| `name` | string | | Form field name |
| `value` | string | | Default value |
| `options` | array | | Options for select (string[] or {value,text}[]) |
| `rows` | number | | Textarea rows |
| `required` | boolean | | Show red * indicator |
| `checked` | boolean | | For checkbox/toggle/radio |
| `help` | string | | Help text below input |
| `accept` | string | | File input accept types |

### API (dp.js)

```js
const field = dp('#my-field')
field.getValue()           // delegates to inner input
field.setValue('hello')     // delegates to inner input
field.getLabel()           // label text
field.setLabel('New Label')
field.getInput()           // the wrapped DpInput component
field.onChange(fn)          // delegates to inner input
```

## Code

### Pug

```pug
//- Text input
+dp-formfield('Email', {type: 'email', color: 'primary', placeholder: 'you@example.com'})

//- Select
+dp-formfield('Country', {as: 'select', color: 'primary', placeholder: 'Choose...', options: ['US', 'UK', 'CA']})

//- Textarea
+dp-formfield('Message', {as: 'textarea', color: 'primary', placeholder: 'Write here...', rows: 3})

//- File upload
+dp-formfield('Avatar', {as: 'file-input', color: 'primary'})

//- Toggle
+dp-formfield('Notifications', {as: 'toggle', color: 'primary', checked: true})

//- Checkbox with required
+dp-formfield('Terms', {as: 'checkbox', color: 'primary', required: true})

//- Full form
+fieldset
  +fieldset-legend({text: 'Sign Up'})
  +dp-formfield('Name', {color: 'primary', required: true})
  +dp-formfield('Email', {type: 'email', color: 'primary'})
  +dp-formfield('Role', {as: 'select', color: 'primary', options: ['Admin', 'User', 'Guest']})
  +btn({color: 'primary', text: 'Submit', block: true, class: 'mt-4'})
```

### YAML

```yaml
- fieldset:
    children:
      - fieldset-legend: {text: Sign Up}
      - dp-formfield:
          - Name
          - {color: primary, required: true}
      - dp-formfield:
          - Email
          - {type: email, color: primary}
      - btn: {color: primary, text: Submit, block: true}
```

## Examples

<fieldset class="dp-fieldset fieldset">
  <legend class="dp-fieldset-legend fieldset-legend">Sign Up</legend>
  <label class="dp-formfield-label fieldset-label">Name<span class="text-error">*</span></label>
  <input class="dp-input input input-primary w-full" type="text">
  <label class="dp-formfield-label fieldset-label">Email</label>
  <input class="dp-input input input-primary w-full" type="email" placeholder="you@example.com">
  <label class="dp-formfield-label fieldset-label">Role</label>
  <select class="dp-select select select-primary w-full">
    <option disabled selected>Choose role</option>
    <option>Admin</option>
    <option>User</option>
    <option>Guest</option>
  </select>
  <label class="dp-formfield-label fieldset-label">Bio</label>
  <textarea class="dp-textarea textarea textarea-primary w-full" rows="3" placeholder="Tell us about yourself"></textarea>
  <div class="mt-4"><button class="dp-btn btn btn-primary btn-block">Submit</button></div>
</fieldset>
