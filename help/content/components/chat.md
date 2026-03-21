---
name: chat
description: Conversation bubbles with author details
category: Data Display
base: chat
---

## Usage

The `chat` mixin renders a `<div>` element with DaisyUI `chat` classes.

### Options

| Option | Type | Values | Description |
|--------|------|--------|-------------|
| `class` | string | | Additional CSS classes |
| `text` | string | | Text content |

### Sub-mixins

- `+chat-image(opts)`
- `+chat-header(opts)`
- `+chat-bubble(opts)`
- `+chat-footer(opts)`

## Code

### Pug

```pug
+chat({})
  +chat-image
  +chat-header
  +chat-bubble
  +chat-footer
```

### YAML

```yaml
- chat:


    text: Example
```

## Examples

<div class="flex flex-wrap gap-3 p-4 bg-base-200 rounded-box">
  <div class="chat">Example</div>
</div>
