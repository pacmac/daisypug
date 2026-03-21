---
name: ajax-api
title: Ajax API (dp.get/post)
description: Built-in HTTP methods for API communication — fetch wrappers with JSON handling
category: Guides
order: 8
---

## Usage

dp.js includes thin wrappers around `fetch()` with automatic JSON parsing, error handling, and configurable base URL.

### Configuration

```js
// Set base URL for all requests
dp.baseUrl('/api')           // dp.get('/users') → GET /api/users
dp.baseUrl('https://api.example.com')

// Set default headers (merged with per-request headers)
dp.headers({
  'Authorization': 'Bearer ' + token,
  'X-Custom': 'value',
})
```

### Standalone Methods

All return `Promise<{ok, status, data, response}>`:

```js
dp.get('/users')
dp.post('/users', { name: 'Alice', email: 'alice@ex.com' })
dp.put('/users/1', { name: 'Alice Updated' })
dp.patch('/users/1', { name: 'Alice Patched' })
dp.delete('/users/1')
```

### Response Object

```js
const result = await dp.get('/users');
result.ok         // boolean — response.ok
result.status     // number — HTTP status code
result.statusText // string — status text
result.data       // parsed — JSON object or text string
result.response   // raw Response object
```

### Shortcut: fetchJson

Returns `data` directly instead of the wrapper:

```js
const users = await dp.fetchJson('/users')
// users is the parsed JSON array/object
```

### Error Handling

Non-ok responses throw by default:

```js
try {
  await dp.post('/login', { email, password });
} catch(e) {
  console.log(e.message);         // "POST /login → 401 Unauthorized"
  console.log(e.response.data);   // error body from server
  console.log(e.response.status); // 401
}

// Suppress throw:
const result = await dp.get('/maybe-404', { noThrow: true });
if (!result.ok) console.log('Not found');
```

### Component Methods

```js
// Load HTML into any component
dp('#widget').load('/api/widget-html')

// Submit child form data
dp('#my-form').submit('/api/save')
// → auto-gathers values from child .dp-input, .dp-select, etc.

// Table: load JSON array into rows
dp('#users-table').loadData('/api/users')
// → objects auto-mapped to headers + rows

// Table: server-side pagination
dp('#users-table').loadData('/api/users', {
  pagination: true,
  pageSize: 20,
  parse: (data) => ({ rows: data.rows, total: data.total }),
})

// FormCard: submit form data
dp('#contact').submitTo('/api/contact')
```

## Code

### CRUD Operations

```js
dp.baseUrl('/api');

// List
const users = await dp.fetchJson('/users');
dp('#user-table').setData(users.map(u => [u.name, u.email, u.role]));

// Create
await dp.post('/users', { name: 'Alice', email: 'alice@ex.com' });

// Read
const user = await dp.fetchJson('/users/1');

// Update
await dp.put('/users/1', { name: 'Alice Updated' });

// Delete
await dp.delete('/users/1');
```

### Loading Table from API

```js
dp.on('ready', () => {
  const table = dp('#users');

  // Load data (auto-detects headers from object keys)
  table.loadData('/api/users');

  // Row click → edit
  table.onRowClick(({ data, index }) => {
    dp('#edit-name').setText(data[0]);
    dp('#edit-email').setText(data[1]);
    dp('#edit-modal').open();
  });
});
```

### Form Submit with Feedback

```js
dp.on('ready', () => {
  dp('#contact-form').submitTo('/api/contact')
    .then(result => {
      dp('#success-alert').setMessage('Sent!').show();
      dp.form('#contact-form').clear();
    })
    .catch(err => {
      dp('#error-alert').setMessage(err.response.data.error).show();
    });
});
```

### Authentication Flow

```js
dp.on('ready', () => {
  // Check for stored token
  const token = localStorage.getItem('token');
  if (token) dp.headers({ 'Authorization': 'Bearer ' + token });

  dp.form('#login').onSubmit(async (data, valid) => {
    if (!valid) return;
    try {
      const result = await dp.post('/auth/login', data);
      localStorage.setItem('token', result.data.token);
      dp.headers({ 'Authorization': 'Bearer ' + result.data.token });
      window.location = '/dashboard';
    } catch(e) {
      dp('#login-error').setMessage('Invalid credentials').show();
    }
  });
});
```

## Examples

### Polling

```js
// Poll for updates every 5 seconds
setInterval(async () => {
  const data = await dp.fetchJson('/api/notifications');
  dp('#notif-badge').setText(data.count);
  if (data.count > 0) dp('#notif-badge').show();
}, 5000);
```

### File Upload

```js
dp('#upload-btn').onClick(async () => {
  const files = dp('#file-input').getFiles();
  const formData = new FormData();
  formData.append('file', files[0]);

  const result = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  // Note: file upload uses raw fetch (not dp.post) to avoid JSON content-type
});
```
