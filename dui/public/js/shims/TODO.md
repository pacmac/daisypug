# Shim Elimination TODO

When this file is empty, move both shims to `.off/` and remove their `<script>` tags from `layout.pug`.

## easyui-shim.js

### Infrastructure (must be sync — move to dui-helpers.js before loadNext)
- [ ] `window.eui = window.eui || {}` (line 21)
- [ ] jQuery selector Proxy — strips `?ui=dui` from `#id` selectors (lines 41-82)
- [ ] localStorage debug clear (lines 88-94)
- [ ] Dev mode timer blocking (lines 101-182)
- [ ] `getUIFramework()` (lines 187-194)
- [ ] AJAX interceptor — appends `ui=eui` (lines 200-225)

### Sync stubs (move to dui-helpers.js — one-liner no-ops for timing safety)
- [ ] linkbutton (line 302-305)
- [ ] menubutton (line 309-311)
- [ ] window (line 441-443)
- [ ] dialog (line 444-446)
- [ ] datagrid (line 717-719)
- [ ] datebox, datetimebox, searchbox, filebox, passwordbox (lines 540-545 via textboxLikePlugin)
- [ ] combotree, combogrid, calendar, slider, validatebox, checkbox, radiobutton, switchbutton (lines 705-712)
- [ ] treegrid, propertygrid (lines 720-721)
- [ ] layout, accordion, splitbutton (lines 725-727)

### Navigation (move to new nav-plugin.js)
- [ ] westMenu setup — `$(document).ready` that wires `#westMenu` (lines 770-803)
- [ ] Menu click interceptor — delegates `.menu a` clicks to panel refresh (lines 804-857)

### Dead / redundant (just delete)
- `$.parser` stub (lines 26-34) — parser-plugin.js exists
- Panel shim (lines 229-297) — already commented out
- Tree shim impl (lines 316-436) — tree-plugin.js replaced it
- Form shim (line 449-451) — already disabled
- Tabs shim (line 453-454) — already disabled
- `textboxLikePlugin` for textbox/numberbox/timespinner (lines 537-539) — real plugins exist
- Combobox shim 160 lines (lines 547-703) — combobox-plugin.js exists
- Messager shim (lines 731-752) — messager-plugin.js exists
- Duplicate localStorage debug (lines 755-766) — merged with earlier one
- shimLog/shimWarn/shimError functions (lines 4-16) — not needed after migration

## disloader.js

### Dataloader (move to new dataloader-plugin.js)
- [ ] `.easyui-layout` auto-init (lines 9-11)
- [ ] Full dataloader system: duiAjaxGet, comboSqlid, loadComboOptions, getVisibleForm, getFormForField, isPrimaryFkey, fieldName, fieldValue, normalizeRecord, setFieldValue, applyRecord, loadByFkey, preloadFkeyCombos (lines 14-413)
- [ ] Event listeners: change.duiDataloader, dui:loadbyfkey, window.load, dui:contentloaded (lines 372-412)
