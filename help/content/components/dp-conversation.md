---
name: dp-conversation
description: Chat conversation with multiple message bubbles
category: Composites
base: dp-conversation
---

## Usage

`+dp-conversation(messages)` renders a chat conversation from an array of message objects.

### Message Options

| Option | Type | Description |
|--------|------|-------------|
| `from` | string | Sender name (chat-header) |
| `text` | string | Message text (chat-bubble) |
| `position` | string | `'start'` or `'end'` |
| `color` | string | Bubble color |
| `footer` | string | Footer text (e.g. timestamp) |

### API (dp.js)

```js
const chat = dp('.dp-conversation')
chat.getMessages()
chat.addMessage({from: 'Alice', text: 'Hello!', position: 'start', color: 'primary'})
chat.getMessageCount()
chat.scrollToBottom()
chat.clear()
chat.onMessage(msg => console.log(msg))
```

## Code

```pug
+dp-conversation([
  {from: 'Alice', text: 'Hey! Have you tried DaisyPug?', position: 'start', color: 'primary'},
  {from: 'Bob', text: 'Yes! The mixins are great.', position: 'end'},
  {from: 'Alice', text: 'And it has a full JS API too!', position: 'start', color: 'primary'},
])
```

## Examples

<div class="dp-conversation">
  <div class="dp-chat chat chat-start"><div class="dp-chat-header chat-header">Alice</div><div class="dp-chat-bubble chat-bubble chat-bubble-primary">Hey! Have you tried DaisyPug?</div></div>
  <div class="dp-chat chat chat-end"><div class="dp-chat-header chat-header">Bob</div><div class="dp-chat-bubble chat-bubble">Yes! The mixins are great.</div></div>
  <div class="dp-chat chat chat-start"><div class="dp-chat-header chat-header">Alice</div><div class="dp-chat-bubble chat-bubble chat-bubble-primary">And it has a full JS API too!</div></div>
</div>
