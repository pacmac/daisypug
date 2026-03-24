# EUI → DUI Migration Map — Quick Reference

Generated from `yaml/migrator/migration-map.yaml`. Single source of truth is the YAML — this table is for quick lookup.

| EUI | DUI |
|---|---|
| **patterns** | |
| `ajaxget()` | `$.dui.ajax()` (alias) |
| `clone()` | `window.clone` (alias) |
| `loadpage()` | shimmed (alias) |
| `isronly()` | shimmed (alias) |
| `getapp()` | shimmed (alias) |
| `.tbar.dgre_` | deprecated — datagrid-plugin |
| `.linkbutton('enable')` | `$.dui.button` (alias) |
| `.linkbutton('disable')` | `$.dui.button` (alias) |
| `butEn()` | deprecated — form-plugin |
| `#_dgform` | `#<dgId>_editor` |
| `textboxname=` | `name=` |
| `columns:[[]]` | `datagrid.<id>.json` |
| `.rowEditor()` | deprecated — datagrid-plugin |
| `.datagrid('editButs')` | deprecated — datagrid-plugin |
| `$.page.fn.opts =` | `$('#dg').datagrid($.page.fn.opts)` |
| `$.page.fn.loadData =` | `$.page.register({hooks:{afterLoad:fn}})` |
| `editor:{type:` | column editors in JSON config |
| `toolbar: [{` | `asdpx` + JSON config |
| `coloff: true` | **MISSING** |
| `dynDialog()` | `+modal` mixin + `$.dui.modal` |
| `.dialog('close')` | `$.dui.modal` (alias) |
| `.dialog('open')` | `$.dui.modal` (alias) |
| `.textbox('getValue')` | `$.dui.textbox` (alias) |
| `gurl()` | `ajaxget('/', {params})` |
| `eui.date` | inline `val.substring(0,10)` |
| `.menu('show')` | **MISSING** |
| `qbe as combobox` | keep `class:'qbe'` — NEVER combobox |
| `toolbar:'#tbar'` | JSON config `toolbar` array with `type:'field'` |
| `#tbar` inline layout | JSON config auto-renders inline |
| `toolbut()` | deprecated — `+button` mixin |
| **pug_patterns** | |
| `fit="true"` on tabs | strip |
| `data-options="fit:true"` on layout | strip |
| `background: #` inline style | strip |
| `style="opacity:"` | flag — keep if JS depends |
| `dwap.page.` in inline script | `$.page.fn.` |
| `dwap.page.` in onclick attr | `$.page.fn.` |
| `div#..title="` in tabs | `+tab-item('title')#id` |
| `region="` attribute | flag — `+vsplit`/`+hsplit` |
| `style="width:"` on panel | flag — extract split size |
| `.layout(data-options=` | strip |
| `block style` CSS | classify: cosmetic=strip, functional=keep, toolbar_override=strip |
| `class='...fit...'` | strip |
| **widgets** | |
| `easyui-tabs` | `+tabs` mixin (server) |
| `easyui-datagrid` | `+datagrid` mixin (JS init, JSON extract) |
| `easyui-filegrid` | `+filegrid` mixin (no JS plugin — **MISSING**) |
| `easyui-treegrid` | `+treegrid` mixin (no JS plugin — **MISSING**) |
| `easyui-propertygrid` | bare div (JS init, no mixin) |
| `easyui-layout` | bare div → `+vsplit`/`+hsplit` (skill) |
| `easyui-form` | `+form` mixin (server) |
| `easyui-menu` | bare div (JS init, no mixin) |
| `easyui-tree` | `+tree` mixin + `$.dui.tree` (server) |
| `easyui-qbe` | `class:'qbe'` in `+fitem` — NEVER combobox |
| `easyui-combobox` | `+combobox` mixin (server) |
| `easyui-datebox` | `+datebox` mixin (server) |
| `easyui-textbox` | `+input` mixin (server) |
| `easyui-numberbox` | `+input` mixin (server) |
| `easyui-numberspinner` | `+input` mixin (server) |
| `easyui-validatebox` | `+input` mixin (server) |
| **component_api** | |
| `$('#el').datagrid()` | `$.dui.datagrid` |
| `$('#el').combobox()` | `$.dui.combobox` |
| `$('#el').linkbutton()` | `$.dui.button` |
| `$('#el').window()` | `$.dui.window` / `$.dui.modal` |
| `$('#el').modal()` | `$.dui.modal` |
| `$('#el').tabs()` | `$.dui.tabs` |
| `$('#el').form()` | `$.dui.form` |
| `$('#el').tree()` | `$.dui.tree` |
| `$('#el').textbox()` | `$.dui.textbox` |
| `$('#el').numberbox()` | `$.dui.numberbox` |
| `$('#el').datebox()` | `$.dui.datebox` |
| `$('#el').menubutton()` | `$.dui.menubutton` |
| `$('#el').numberspinner()` | `$.dui.numberspinner` (spinner-plugin) |
| `$('#el').timespinner()` | `$.dui.timespinner` (timespinner-plugin) |
| `$('#el').treegrid()` | **MISSING** |
| `$('#el').filegrid()` | **MISSING** |
| `$('#el').menu('show')` | **MISSING** |
| `$('#el').tooltip({onShow})` | **MISSING** |
| `$('#el').progressbar()` | **MISSING** |
| **namespace** | |
| `dwap.page.<fn>` | `$.page.fn.<fn>` |
| `dwap.page.<prop>` | `$.dui.page.<prop>` |
| `dwap.bhave` | `$.dui.bhave` |
| `dwap.appid` | `$.page.state.pageId` |
| `dwap.menu.selected` | `$.dui.menu.selected` |
