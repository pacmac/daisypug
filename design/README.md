# DaisyPug Design Registry

Cross-reference of DUI components and their DaisyPug equivalents.
Each YAML file in `components/` covers one component.

## Status values

- `done` — fully implemented and tested
- `partial` — some methods/features implemented
- `todo` — not yet started
- `skip` — intentionally not porting (EUI compat shim, deprecated, etc.)

## YAML format

```yaml
name: component-name
dui:
  plugin: plugin-file.js
  methods: [...]
  callbacks: [...]
  options: [...]
dp:
  class: DpClassName
  status: done|partial|todo
  done: [...]
  todo: [...]
notes: |
  Implementation notes, design decisions, differences from DUI.
```
