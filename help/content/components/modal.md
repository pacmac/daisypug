---
name: modal
description: Dialog box triggered by button, uses HTML dialog API
category: Actions
base: modal
---

## Usage

The `modal` mixin renders a `<dialog>` element with DaisyUI modal classes. It auto-emits a backdrop for click-to-close. Uses the HTML dialog API (`showModal()`/`close()`).

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `id` | string | | Dialog ID (required for triggering) |
| `position` | string | top, middle, bottom, start, end | Modal position |
| `open` | boolean | | Force open state via class |
| `backdrop` | boolean | | Set to `false` to disable auto-backdrop |
| `class` | string | | Additional CSS classes |

### Sub-mixins

- `+modal-box(opts)` — Content wrapper inside the modal
- `+modal-action(opts)` — Container for action buttons (close, confirm, etc.)

### Triggering

Use a button with `onclick="modal_id.showModal()"` to open. Close via ESC key, backdrop click, or a button inside `<form method="dialog">`.

## Code

### Pug

```pug
//- Trigger button
+btn({text: 'Open Modal'})(onclick="my_modal.showModal()")

//- Modal
+modal({id: 'my_modal'})
  +modal-box
    h3.text-lg.font-bold Hello!
    p.py-4 Press ESC or click outside to close
    +modal-action
      form(method="dialog")
        +btn({text: 'Close'})

//- Modal without backdrop
+modal({id: 'no_backdrop', backdrop: false})
  +modal-box
    p Only closeable via button or ESC
    +modal-action
      form(method="dialog")
        +btn({text: 'OK', color: 'primary'})
```

### YAML

```yaml
- btn:
    text: Open Modal
    attrs:
      onclick: "my_modal.showModal()"

- modal:
    opts:
      id: my_modal
    children:
      - modal-box:
          children:
            - h3: {class: "text-lg font-bold", text: "Hello!"}
            - p: {class: py-4, text: "Press ESC or click outside to close"}
            - modal-action:
                children:
                  - btn: {text: Close}
```

## Examples

<div class="p-4">
  <button class="btn btn-primary" onclick="demo_modal.showModal()">Open Demo Modal</button>

  <dialog id="demo_modal" class="modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Modal Title</h3>
      <p class="py-4">This is a modal dialog. Click outside or press ESC to close.</p>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Close</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</div>
