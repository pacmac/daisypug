/**
 * Pure4 Datagrid Helper - EasyUI-compatible datagrid plugin
 */
(function($) {
  'use strict';

  // Proxy that absorbs any property access / method call without throwing.
  // Allows code like `opts.tbar.dgre_del.hide()` to silently no-op.
  var _noop = function() { return _sink; };
  var _sink = new Proxy(_noop, {
    get: function() { return _sink; },
    apply: function() { return _sink; }
  });

  // Resolve dotted string like "eui.date" to a function on window
  function resolveFormatter(str) {
    if (!str || str === 'false') return null;
    if (typeof str === 'function') return str;
    var parts = str.split('.');
    var obj = window;
    for (var i = 0; i < parts.length; i++) {
      obj = obj[parts[i]];
      if (obj == null) return null;
    }
    return typeof obj === 'function' ? obj : null;
  }

  // Apply styler result to a <td> element.
  // Styler returns: string (cssText), {class, style}, or falsy (no-op).
  function applyStyler(td, stylerFn, val, row, idx) {
    if (!stylerFn) return;
    var css = stylerFn(val, row, idx);
    if (!css) return;
    if (typeof css === 'string') {
      td.style.cssText += ';' + css;
    } else {
      if (css['class']) td.className += ' ' + css['class'];
      if (css.style) td.style.cssText += ';' + css.style;
    }
  }

  // Resolve styler for a field: check state._stylers, then data-styler attr
  function resolveStyler(td, state, field) {
    if (state._stylers && state._stylers[field]) return state._stylers[field];
    var str = td.getAttribute('data-styler');
    return resolveFormatter(str);
  }

  /** Rebuild thead + tbody template from options.columns */
  function renderColumns(el, cols) {
    if (!cols || !cols.length) return;
    // Handle nested [[cols]] or flat [cols]
    var columns = (Array.isArray(cols[0])) ? cols[0] : cols;
    var $el = $(el);
    var $table = $el.find('table');
    if (!$table.length) return;

    var state = $.data(el, 'datagrid');

    // Get column templates rendered by the datagrid mixin
    var thTmpl = $el.children('template[data-dg-th]')[0];
    var tdTmpl = $el.children('template[data-dg-td]')[0];
    var trTmpl = $el.children('template[data-dg-tr]')[0];
    if (!thTmpl || !tdTmpl || !trTmpl) return;

    // Store formatter/styler function refs keyed by field name
    var fmtMap = {};
    var styMap = {};

    // Rownumbers: check options or data attribute
    var hasRownums = (state && state.options && state.options.rownumbers) || $table.is('[data-rownumbers]');

    // Rebuild thead — clone tr and th templates
    var $thead = $table.find('thead');
    $thead.empty();
    var headRow = trTmpl.content.firstElementChild.cloneNode(true);
    if (hasRownums) {
      var rnTh = thTmpl.content.firstElementChild.cloneNode(true);
      rnTh.textContent = '#';
      rnTh.style.width = '2rem';
      rnTh.classList.add('bg-base-200');
      headRow.appendChild(rnTh);
    }
    for (var i = 0; i < columns.length; i++) {
      var col = columns[i];
      if (col.hidden || col.checkbox) continue;
      var th = thTmpl.content.firstElementChild.cloneNode(true);
      th.setAttribute('data-field', col.field);
      th.innerHTML = col.title || '';
      if (col.align === 'right') th.classList.add('text-right');
      if (col.coloff) th.classList.add('coloff');
      if (col.width) th.style.width = col.width + 'px';
      headRow.appendChild(th);
      if (typeof col.formatter === 'function') {
        fmtMap[col.field] = col.formatter;
      }
    }
    headRow.appendChild(thTmpl.content.firstElementChild.cloneNode(true));
    $thead.append(headRow);

    // Rebuild tbody template — clone tr and td templates
    var $tbody = $table.find('tbody');
    $tbody.empty();
    var tmpl = document.createElement('template');
    var bodyRow = trTmpl.content.firstElementChild.cloneNode(true);
    if (hasRownums) {
      var rnTd = tdTmpl.content.firstElementChild.cloneNode(true);
      rnTd.classList.add('text-center', 'opacity-50', 'bg-base-200');
      bodyRow.appendChild(rnTd);
    }
    for (var j = 0; j < columns.length; j++) {
      var c = columns[j];
      if (c.checkbox) continue;
      var td = tdTmpl.content.firstElementChild.cloneNode(true);
      td.setAttribute('data-field', c.field);
      if (c.formatter) {
        if (typeof c.formatter === 'string') {
          td.setAttribute('data-formatter', c.formatter);
        }
      }
      if (c.styler) {
        if (typeof c.styler === 'string') {
          td.setAttribute('data-styler', c.styler);
        } else if (typeof c.styler === 'function') {
          styMap[c.field] = c.styler;
        }
      }
      if (c.align === 'right') td.classList.add('text-right');
      if (c.hidden || c.coloff) td.classList.add('coloff');
      if (c.hidden) td.style.display = 'none';
      var cellDiv = document.createElement('div');
      cellDiv.className = 'datagrid-cell';
      td.appendChild(cellDiv);
      bodyRow.appendChild(td);
    }
    var fillerTd = tdTmpl.content.firstElementChild.cloneNode(true); fillerTd.setAttribute('data-filler', ''); bodyRow.appendChild(fillerTd);
    tmpl.content.appendChild(bodyRow);
    $tbody.append(tmpl);

    if (state) {
      state._formatters = $.extend({}, state._formatters, fmtMap);
      state._stylers = $.extend({}, state._stylers, styMap);
    }
  }

  /** Fetch data from server and render */
  function requestData(el) {
    var state = $.data(el, 'datagrid');
    if (!state) return;
    var opts = state.options;
    if (!opts.url) return;

    var qp = $.extend({}, opts.queryParams);

    // Let page JS modify query params (return false to cancel)
    if (typeof opts.onBeforeLoad === 'function') {
      if (opts.onBeforeLoad.call(el, qp) === false) return;
    }

    ajaxget('', qp, function(data) {
      // Apply loadFilter if set (EUI compat — lets page transform raw response)
      if (typeof opts.loadFilter === 'function') {
        data = opts.loadFilter.call(el, data);
      }
      if (Array.isArray(data)) {
        data = { total: data.length, rows: data };
      }
      $.fn.datagrid.methods.loadData($(el), data);
    }, {
      url: opts.url,
      method: opts.method || 'post',
      dataType: 'json',
      error: function() {
        $.fn.datagrid.methods.loadData($(el), { total: 0, rows: [] });
      }
    });
  }

  /** Apply DaisyUI styling classes from options to the table element */
  function applyTableClasses(el, opts) {
    var $table = $(el).find('table').first();
    if (!$table.length) return;
    if (opts.striped) $table.addClass('table-zebra');
    if (opts.fitColumns) $table.addClass('dg-fit-columns');
  }

  /** Auto-fit column widths to content (called after data load).
   *  Measures the widest cell in each column and sets the <th> width.
   *  Columns with fixed:true in the column def keep their JSON width. */
  // Inject datagrid styles once
  (function() {
    var style = document.createElement('style');
    style.textContent =
      '.table tr.dg-selected td, .table tr.dg-selected:nth-child(odd) td, .table tr.dg-selected:nth-child(even) td { background-color: color-mix(in srgb, var(--color-primary) 20%, var(--color-base-100)) !important; }' +
      ' .table tr.dg-selected:hover td { background-color: color-mix(in srgb, var(--color-primary) 28%, var(--color-base-100)) !important; }' +
      ' .dg-fit-columns th:not(:last-child), .dg-fit-columns td:not(:last-child) { width: 1%; white-space: nowrap; }' +
      ' .dg-fit-columns th:last-child, .dg-fit-columns td:last-child { width: 100%; white-space: nowrap; }' +
      ' .coloff { display: none !important; }';
    document.head.appendChild(style);
  })();

  // ---- Toolbar button enable/disable helpers ----
  var DIS_CLS = 'opacity-40 pointer-events-none';

  function tbarEnable(btn) {
    if (btn) { $(btn).removeClass(DIS_CLS); btn.disabled = false; }
  }
  function tbarDisable(btn) {
    if (btn) { $(btn).addClass(DIS_CLS); btn.disabled = true; }
  }

  /** Detect and wire toolbar + editor modal from DOM (by convention IDs) */
  function initToolbar(el, state) {
    var id = el.id;
    if (!id) return;

    state._toolbar = document.getElementById(id + '_toolbar');
    state._editor  = document.getElementById(id + '_editor');

    if (!state._toolbar) return;

    // Cache button references (may be null if not in asdpx)
    state._btnAdd  = document.getElementById(id + '_add');
    state._btnEdit = document.getElementById(id + '_edit');
    state._btnDel  = document.getElementById(id + '_del');

    // Add is always enabled when it exists
    tbarEnable(state._btnAdd);

    // Wire toolbar button clicks
    $(state._btnAdd).off('click.dgtbar').on('click.dgtbar', function() {
      if (state._editor) {
        populateEditor(state._editor, null);  // empty = new row
        // Apply addData defaults (resolve #id references and $autonum)
        var addData = state.options.addData;
        state._addDataExtra = {};
        if (addData) {
          var inputs = state._editor.querySelectorAll('input, select, textarea');
          var inputMap = {};
          for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].name) inputMap[inputs[i].name] = inputs[i];
          }
          for (var key in addData) {
            var val = addData[key];
            if (typeof val === 'function') {
              val = val({ _mode: 'append' });
            } else if (typeof val === 'string' && val.charAt(0) === '#') {
              val = $(val).val() || '';
            } else if (typeof val === 'string' && val.indexOf('$autonum:') === 0) {
              var step = parseInt(val.split(':')[1]) || 10;
              var rows = $(el).datagrid('getRows');
              var maxNo = 0;
              rows.forEach(function(r) { if (+r[key] > maxNo) maxNo = +r[key]; });
              val = maxNo + step;
            }
            if (inputMap[key]) {
              inputMap[key].value = val;
            } else {
              // No form input for this key — store for merging into save payload
              state._addDataExtra[key] = val;
            }
          }
        }
        state._editMode = 'add';
        state._editor.showModal();
      }
    });

    $(state._btnEdit).off('click.dgtbar').on('click.dgtbar', function() {
      if (state._editor && state.selectedRow) {
        populateEditor(state._editor, state.selectedRow);
        state._editMode = 'edit';
        state._editor.showModal();
      }
    });

    $(state._btnDel).off('click.dgtbar').on('click.dgtbar', function() {
      if (!state.selectedRow) return;
      var $el = $(el);
      var opts = state.options;

      // If page provides custom onDeleteRow, use that instead
      if (typeof opts.onDeleteRow === 'function') {
        opts.onDeleteRow.call(el, state.selectedIndex, state.selectedRow);
        return;
      }

      // Built-in delete: confirm → POST → remove
      var sqlid = opts.queryParams && opts.queryParams._sqlid;
      if (!sqlid) {
        if (typeof opts.onEndEdit === 'function') {
          $.messager.confirm('Delete', 'Delete this row?', function(ok) {
            if (!ok) return;
            var baseRow = {};
            if (state.selectedRow) {
              for (var k in state.selectedRow) {
                if (k.charAt(0) !== '_') baseRow[k] = state.selectedRow[k];
              }
            }
            baseRow._func = 'del';
            opts.onEndEdit.call(el, state.selectedIndex, baseRow, {});
          });
        }
        return;
      }

      $.messager.confirm('Delete', 'Delete this row?', function(ok) {
        if (!ok) return;
        var payload = $.extend({}, state.selectedRow, {
          _sqlid: sqlid,
          _func: 'del'
        });
        // Inject parent key from enclosing form
        injectParentKey(el, payload);

        ajaxget('', payload, function(res) {
            if (res && res.error) return;
            $el.datagrid('deleteRow', state.selectedIndex);
            $.messager.show({ msg: 'Deleted', cls: 'success', timeout: 2000 });
          }, {
            method: 'post',
            dataType: 'json',
            error: function() {
              $.messager.show({ msg: 'Delete failed', cls: 'error' });
            }
          });
      });
    });

    // Wire editor modal Save button
    if (state._editor) {
      var $saveBtn = $(state._editor).find('[data-action="save"]');
      $saveBtn.off('click.dgsave').on('click.dgsave', function(e) {
        e.preventDefault();
        saveEditorRow(el, state);
      });
    }
  }

  /** Inject parent form's fkey value into payload */
  function injectParentKey(el, payload) {
    var $form = $(el).closest('form');
    if (!$form.length) return;
    var $fkey = $form.find('.fkey').first();
    if (!$fkey.length) return;
    var fkeyName = $fkey.attr('name');
    var fkeyVal = $fkey.val();
    if (fkeyName && fkeyVal) {
      payload[fkeyName] = fkeyVal;
    }
  }

  /** Save editor modal: collect fields → POST → update DOM */
  function saveEditorRow(el, state) {
    var opts = state.options;
    // Explicit write sqlid takes priority. queryParams._sqlid is the read sqlid — only
    // use it for auto-save when NO onEndEdit is defined (page handles its own save).
    var saveSqlId = opts.saveSqlId || (typeof opts.onEndEdit !== 'function' && opts.queryParams && opts.queryParams._sqlid);

    var data = collectEditorData(state._editor);
    var idx = state.selectedIndex != null ? state.selectedIndex : -1;

    if (!saveSqlId) {
      // onEndEdit defined or no sqlid: page handles row save
      if (typeof opts.onEndEdit === 'function') {
        var baseRow = {};
        if (state.selectedRow) {
          // Strip underscore-prefixed computed/derived fields — they are read-only
          // server fields that cause "No Such Field" errors when sent back for update
          for (var k in state.selectedRow) {
            if (k.charAt(0) !== '_') baseRow[k] = state.selectedRow[k];
          }
        }
        // Merge: clean base row + addData extras (e.g. LINE_NO from $autonum) + editor form data
        var row = $.extend({}, baseRow, state._addDataExtra || {}, data);
        // Inject _func so the page's ajaxget call uses the correct HTTP method (add→POST, upd→PUT)
        row._func = state._editMode === 'add' ? 'add' : 'upd';
        // Validate before committing — if onValidateRow returns a string, show error and keep editor open
        if (typeof opts.onValidateRow === 'function') {
          var errmsg = opts.onValidateRow.call(el, idx, row, data);
          if (errmsg) {
            $.messager.show({ msg: errmsg, cls: 'error', timeout: 4000 });
            return;
          }
        }
        // Update local datagrid row data (mirrors EUI: datagrid updates internally before onEndEdit fires)
        if (state._editMode === 'add') {
          $(el).datagrid('appendRow', row);
          idx = $(el).datagrid('getRows').length - 1;
        } else if (idx >= 0) {
          $(el).datagrid('updateRow', { index: idx, row: row });
        }
        state._editor.close();
        opts.onEndEdit.call(el, idx, row, data);
      }
      return;
    }

    data._sqlid = saveSqlId;
    data._func = state._editMode === 'add' ? 'add' : 'upd';

    // Inject parent key from enclosing form
    injectParentKey(el, data);

    var $el = $(el);

    ajaxget('', data, function(res) {
        if (res && res.error) return;

        // Merge server response into row data (server may add/modify fields)
        var row = $.extend({}, data, res);
        // Clean internal fields
        delete row._sqlid;
        delete row._func;

        if (state._editMode === 'add') {
          $el.datagrid('appendRow', row);
        } else {
          $el.datagrid('updateRow', { index: state.selectedIndex, row: row });
        }
        state._editor.close();
        $.messager.show({ msg: 'Saved', cls: 'success', timeout: 2000 });
      }, {
        method: 'post',
        dataType: 'json',
        error: function() {
          $.messager.show({ msg: 'Save failed', cls: 'error' });
        }
      });
  }

  /** Populate editor modal fields from row data (or clear for new row) */
  function populateEditor(dialog, row) {
    var inputs = dialog.querySelectorAll('input, select, textarea');
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      var field = inp.name;
      if (!field) continue;
      var val = row ? (row[field] != null ? row[field] : '') : '';
      inp.value = val;
    }
  }

  /** Collect all field values from editor modal into a plain object */
  function collectEditorData(dialog) {
    var data = {};
    var inputs = dialog.querySelectorAll('input, select, textarea');
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      var field = inp.name;
      if (!field) continue;
      data[field] = inp.value;
    }
    return data;
  }

  /** Find <tr> by row index */
  function _findTr(el, index) {
    var trs = el.querySelectorAll('tbody > tr');
    for (var i = 0; i < trs.length; i++) {
      if (trs[i]._rowIndex === index) return trs[i];
    }
    return null;
  }

  /** Internal select — shared by click handler and selectRow method */
  function _selectRow(el, state, index, skipScroll) {
    var tr = _findTr(el, index);
    if (!tr) return;
    var row = tr._rowData || null;
    var opts = state.options;

    // onBeforeSelect can cancel
    if (typeof opts.onBeforeSelect === 'function') {
      if (opts.onBeforeSelect.call(el, index, row) === false) return;
    }

    // singleSelect: clear others first
    if (opts.singleSelect) {
      var $el = $(el);
      $el.find('tbody tr.dg-selected').each(function() {
        if (this._rowIndex !== index) {
          $(this).removeClass('dg-selected');
        }
      });
    }

    $(tr).addClass('dg-selected');
    state.selectedRow = row;
    state.selectedIndex = index;

    // Enable toolbar buttons
    if (state._toolbar) {
      $(state._toolbar).find('button:not([data-always-enabled])').each(function() { tbarEnable(this); });
    }

    // Scroll into view
    if (!skipScroll) {
      var scroller = $(el).find('.overflow-x-auto')[0] || el;
      if (tr.scrollIntoView && scroller.scrollHeight > scroller.clientHeight) {
        tr.scrollIntoView({ block: 'nearest' });
      }
    }

    if (typeof opts.onSelect === 'function') {
      opts.onSelect.call(el, index, row);
    }
  }

  /** Internal unselect — shared by click handler and unselectRow method */
  function _unselectRow(el, state, index) {
    var tr = _findTr(el, index);
    if (!tr) return;
    var row = tr._rowData || null;
    var opts = state.options;

    // onBeforeUnselect can cancel
    if (typeof opts.onBeforeUnselect === 'function') {
      if (opts.onBeforeUnselect.call(el, index, row) === false) return;
    }

    $(tr).removeClass('dg-selected');

    if (state.selectedIndex === index) {
      state.selectedRow = null;
      state.selectedIndex = -1;
    }

    // Disable toolbar if no rows remain selected
    if ($(el).find('tbody tr.dg-selected').length === 0 && state._toolbar) {
      $(state._toolbar).find('button:not([data-always-enabled])').each(function() { tbarDisable(this); });
    }

    if (typeof opts.onUnselect === 'function') {
      opts.onUnselect.call(el, index, row);
    }
  }

  /** Bind row-click selection, dblclick, and context menu */
  function bindRowSelection(el, state) {
    var $el = $(el);
    $el.off('click.dgSelect').on('click.dgSelect', 'tbody tr', function(e) {
      var idx = this._rowIndex != null ? this._rowIndex : -1;
      var row = this._rowData || null;
      var wasSelected = $(this).hasClass('dg-selected');
      var opts = state.options;

      // onClickCell — fire if click target is inside a td[data-field] (matches EUI)
      var td = $(e.target).closest('td[data-field]', this)[0];
      if (td && typeof opts.onClickCell === 'function') {
        var field = td.getAttribute('data-field');
        opts.onClickCell.call(el, idx, field, row ? row[field] : undefined);
      }

      // Row selection — match EUI logic:
      // singleSelect: always select (never toggle)
      // ctrlSelect + ctrl/meta: toggle
      // ctrlSelect + plain: clear + select
      if (opts.singleSelect) {
        _selectRow(el, state, idx, true);
      } else if (e.metaKey || e.ctrlKey) {
        if (wasSelected) { _unselectRow(el, state, idx); }
        else { _selectRow(el, state, idx, true); }
      } else {
        $el.datagrid('clearSelections');
        _selectRow(el, state, idx, true);
      }

      // onClickRow — always fires on every click (matches EUI)
      if (typeof opts.onClickRow === 'function') {
        opts.onClickRow.call(el, state.selectedIndex, state.selectedRow);
      }
    });

    // Double-click
    $el.off('dblclick.dgSelect').on('dblclick.dgSelect', 'tbody tr', function(e) {
      var row = this._rowData || null;
      var idx = this._rowIndex != null ? this._rowIndex : -1;

      // Ensure row is selected
      state.selectedRow = row;
      state.selectedIndex = idx;

      // onDblClickCell — find clicked td[data-field]
      var td = $(e.target).closest('td[data-field]', this)[0];
      if (td && typeof state.options.onDblClickCell === 'function') {
        var field = td.getAttribute('data-field');
        state.options.onDblClickCell.call(el, idx, field, row ? row[field] : undefined);
      }

      // onDblClickRow — fires before editor; return false skips editor
      var skip = false;
      if (typeof state.options.onDblClickRow === 'function') {
        skip = state.options.onDblClickRow.call(el, idx, row) === false;
      }

      // Auto-open editor only if no onDblClickRow defined or it didn't return false
      if (!skip && state._editor && row && typeof state.options.onDblClickRow !== 'function') {
        populateEditor(state._editor, row);
        state._editMode = 'edit';
        state._editor.showModal();
      }
    });

    // Right-click context menu
    $el.off('contextmenu.dgSelect').on('contextmenu.dgSelect', 'tbody tr', function(e) {
      if (typeof state.options.onRowContextMenu === 'function') {
        var row = this._rowData || null;
        var idx = this._rowIndex != null ? this._rowIndex : -1;
        state.options.onRowContextMenu.call(el, e, idx, row);
      }
    });
  }

  /** Parse data attributes from the table element into options */
  function parseDataAttrs(el) {
    var $table = $(el).find('table').first();
    if (!$table.length) return {};
    var parsed = {};
    if ($table.data('url')) parsed.url = $table.data('url');
    if ($table.data('method')) parsed.method = $table.data('method');
    if ($table.data('singleSelect')) parsed.singleSelect = true;
    if ($table.data('fitColumns')) parsed.fitColumns = true;
    if ($table.data('rownumbers')) parsed.rownumbers = true;
    if ($table.data('striped')) parsed.striped = true;
    if ($table.data('idField')) parsed.idField = $table.data('idField');
    if ($table.data('sqlid')) {
      parsed.queryParams = { _sqlid: $table.data('sqlid') };
    }
    return parsed;
  }

  $.fn.datagrid = function(options, param) {
    if (typeof options === 'string') {
      var method = $.fn.datagrid.methods[options];
      if (method) return method(this, param);
      return this;
    }
    return this.each(function() {
      var state = $.data(this, 'datagrid');
      if (state) {
        $.extend(state.options, options);
      } else {
        // Merge: defaults < data-attrs from mixin < JS options
        var dataOpts = parseDataAttrs(this);
        state = {
          options: $.extend({}, $.fn.datagrid.defaults, dataOpts, options),
          selectedRow: null,
          selectedIndex: -1
        };
        $.data(this, 'datagrid', state);

        // Apply styling from options
        applyTableClasses(this, state.options);

        // Detect and wire toolbar + editor modal
        initToolbar(this, state);

        // Wire column chooser menu + restore saved visibility
        $.fn.datagrid.methods.columns($(this));

        // Bind row selection (always — toolbar needs it even without singleSelect)
        bindRowSelection(this, state);
      }
    });
  };

  $.fn.datagrid.methods = {
    options: function(jq) {
      if (!jq[0]) return $.fn.datagrid.defaults;
      var state = $.data(jq[0], 'datagrid');
      return state ? state.options : $.fn.datagrid.defaults;
    },
    setSelectionState: function(jq) {
      return jq;
    },
    createStyleSheet: function() {
      return null;
    },
    getPanel: function() {
      return null;
    },
    getPager: function() {
      return null;
    },
    getColumnFields: function() {
      return [];
    },
    getColumnOption: function() {
      return null;
    },
    resize: function(jq) {
      return jq;
    },
    load: function(jq, params) {
      return jq.each(function() {
        var state = $.data(this, 'datagrid');
        if (!state) return;
        if (params) {
          state.options.queryParams = $.extend(state.options.queryParams || {}, params);
        }
        requestData(this);
      });
    },
    reload: function(jq, params) {
      return jq.each(function() {
        var state = $.data(this, 'datagrid');
        if (!state) return;
        if (params) {
          state.options.queryParams = $.extend(state.options.queryParams || {}, params);
        }
        // Render columns once (first reload builds thead/tbody template + formatter maps)
        if (state.options.columns && !state._columnsRendered) {
          renderColumns(this, state.options.columns);
          state._columnsRendered = true;
          $.fn.datagrid.methods.columns($(this));
        }
        requestData(this);
      });
    },
    reloadFooter: function(jq) {
      return jq;
    },
    loading: function(jq) {
      return jq;
    },
    loaded: function(jq) {
      return jq;
    },
    fitColumns: function(jq) {
      return jq;
    },
    fixColumnSize: function(jq) {
      return jq;
    },
    fixRowHeight: function(jq) {
      return jq;
    },
    freezeRow: function(jq) {
      return jq;
    },
    autoSizeColumn: function(jq) {
      return jq;
    },
    loadData: function(jq, data) {
      return jq.each(function() {
        var el = this;
        var state = $.data(el, 'datagrid');
        if (!state) {
          state = { options: $.extend({}, $.fn.datagrid.defaults) };
          $.data(el, 'datagrid', state);
        }

        // Normalize: accept {total, rows} or plain array
        if (Array.isArray(data)) {
          data = { total: data.length, rows: data };
        }
        state.data = data;

        var $tbody = $(el).find('tbody');
        var tmpl = $tbody.find('template')[0];
        if (!tmpl) return;

        // Clear existing rows (keep the template)
        $tbody.children('tr').remove();

        // Deprecation warning: detect page-registered formatters/stylers
        if (!state._warnedFmt && state._formatters) {
          for (var fk in state._formatters) {
            if (state._formatters.hasOwnProperty(fk)) {
              console.warn('[datagrid] ' + (el.id || '?') + ': formatter "' + fk + '" registered via state._formatters — use JSON column config "formatter" instead');
              state._warnedFmt = true;
              break;
            }
          }
        }
        if (!state._warnedSty && state._stylers) {
          for (var sk in state._stylers) {
            if (state._stylers.hasOwnProperty(sk)) {
              console.warn('[datagrid] ' + (el.id || '?') + ': styler "' + sk + '" registered via state._stylers — use JSON column config "styler" instead');
              state._warnedSty = true;
              break;
            }
          }
        }

        var rows = data.rows || [];
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          var clone = tmpl.content.firstElementChild.cloneNode(true);
          var tds = clone.querySelectorAll('td');

          for (var j = 0; j < tds.length; j++) {
            var td = tds[j];
            var field = td.getAttribute('data-field');

            // Filler column — skip entirely
            if (td.hasAttribute('data-filler')) continue;
            // Row-number column (no data-field) — only when rownumbers enabled
            if (!field) {
              if (state.options.rownumbers) td.textContent = i + 1;
              continue;
            }

            var val = row[field];
            var fmtStr = td.getAttribute('data-formatter');
            var fmt = resolveFormatter(fmtStr);
            // Check state._formatters for function refs (from dynamic columns)
            if (!fmt && state._formatters && state._formatters[field]) {
              fmt = state._formatters[field];
            }

            // Render into .datagrid-cell div if present, else directly into td
            var target = td.querySelector('.datagrid-cell') || td;
            if (fmt) {
              target.innerHTML = fmt(val, row, i);
            } else {
              target.textContent = val != null ? val : '';
            }

            // Apply styler (CSS/class) to <td>
            applyStyler(td, resolveStyler(td, state, field), val, row, i);
          }

          // Store row data on the <tr> for later retrieval
          clone._rowData = row;
          clone._rowIndex = i;

          $tbody.append(clone);
        }

        // Render Lucide icons emitted by formatters (data-lucide spans)
        if (typeof lucide !== 'undefined') {
          var iconNodes = $tbody[0].querySelectorAll('[data-lucide]');
          if (iconNodes.length) lucide.createIcons({ nodes: iconNodes });
        }

        // Fire onLoadSuccess callback
        var opts = state.options;
        if (opts && typeof opts.onLoadSuccess === 'function') {
          opts.onLoadSuccess.call(el, data);
        }
      });
    },
    getData: function(jq) {
      if (!jq[0]) return { total: 0, rows: [] };
      var state = $.data(jq[0], 'datagrid');
      return (state && state.data) ? state.data : { total: 0, rows: [] };
    },
    getRows: function(jq) {
      if (!jq[0]) return [];
      var state = $.data(jq[0], 'datagrid');
      return (state && state.data) ? state.data.rows : [];
    },
    getFooterRows: function() {
      return [];
    },
    getRowIndex: function(jq, row) {
      if (!jq[0] || !row) return -1;
      var state = $.data(jq[0], 'datagrid');
      if (!state || !state.data || !state.data.rows) return -1;
      var rows = state.data.rows;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i] === row) return i;
      }
      return -1;
    },
    getChecked: function() {
      return [];
    },
    getSelected: function(jq) {
      if (!jq[0]) return null;
      var state = $.data(jq[0], 'datagrid');
      return (state && state.selectedRow) ? state.selectedRow : null;
    },
    getSelections: function(jq) {
      if (!jq[0]) return [];
      var state = $.data(jq[0], 'datagrid');
      return (state && state.selectedRow) ? [state.selectedRow] : [];
    },
    clearSelections: function(jq) {
      return jq.each(function() {
        $(this).find('tbody tr.dg-selected').removeClass('dg-selected');
        var state = $.data(this, 'datagrid');
        if (state) {
          state.selectedRow = null;
          state.selectedIndex = -1;
          // Disable all toolbar buttons
          if (state._toolbar) {
            $(state._toolbar).find('button:not([data-always-enabled])').each(function() { tbarDisable(this); });
          }
        }
      });
    },
    clearChecked: function(jq) {
      return jq;
    },
    scrollTo: function(jq) {
      return jq;
    },
    highlightRow: function(jq) {
      return jq;
    },
    selectAll: function(jq) {
      return jq;
    },
    unselectAll: function(jq) {
      return jq.each(function() { $(this).datagrid('clearSelections'); });
    },
    selectRow: function(jq, index) {
      return jq.each(function() {
        var state = $.data(this, 'datagrid');
        if (!state) return;
        _selectRow(this, state, index);
      });
    },
    selectRecord: function(jq, id) {
      return jq.each(function() {
        var state = $.data(this, 'datagrid');
        if (!state) return;
        var opts = state.options;
        if (!opts.idField) return;
        var rows = (state.data && state.data.rows) || [];
        for (var i = 0; i < rows.length; i++) {
          if (rows[i][opts.idField] == id) {
            _selectRow(this, state, i);
            break;
          }
        }
      });
    },
    unselectRow: function(jq, index) {
      return jq.each(function() {
        var state = $.data(this, 'datagrid');
        if (!state) return;
        _unselectRow(this, state, index);
      });
    },
    checkRow: function(jq) {
      return jq;
    },
    uncheckRow: function(jq) {
      return jq;
    },
    checkAll: function(jq) {
      return jq;
    },
    uncheckAll: function(jq) {
      return jq;
    },
    beginEdit: function(jq) {
      return jq;
    },
    endEdit: function(jq) {
      return jq;
    },
    cancelEdit: function(jq) {
      return jq;
    },
    getEditors: function() {
      return [];
    },
    getEditor: function() {
      return null;
    },
    refreshRow: function(jq) {
      return jq;
    },
    validateRow: function() {
      return true;
    },
    updateRow: function(jq, param) {
      // param: { index: N, row: { field: value, ... } }
      return jq.each(function() {
        var el = this;
        var state = $.data(el, 'datagrid');
        if (!state || !param) return;

        var idx = param.index;
        var newRow = param.row;
        if (idx == null || !newRow) return;

        // Update data array
        if (state.data && state.data.rows && state.data.rows[idx]) {
          $.extend(state.data.rows[idx], newRow);
          newRow = state.data.rows[idx]; // merged row
        }

        // Update DOM — find tr by _rowIndex
        var $tbody = $(el).find('tbody');
        var $trs = $tbody.children('tr');
        $trs.each(function() {
          if (this._rowIndex === idx) {
            this._rowData = newRow;
            var tds = this.querySelectorAll('td');
            for (var j = 0; j < tds.length; j++) {
              var td = tds[j];
              var field = td.getAttribute('data-field');
              if (!field) continue;
              if (newRow[field] === undefined) continue;
              var val = newRow[field];
              var fmtStr = td.getAttribute('data-formatter');
              var fmt = resolveFormatter(fmtStr);
              if (!fmt && state._formatters && state._formatters[field]) {
                fmt = state._formatters[field];
              }
              var target = td.querySelector('.datagrid-cell') || td;
              if (fmt) {
                target.innerHTML = fmt(val, newRow, idx);
              } else {
                target.textContent = val != null ? val : '';
              }

              // Apply styler
              applyStyler(td, resolveStyler(td, state, field), val, newRow, idx);
            }
          }
        });
      });
    },
    appendRow: function(jq, row) {
      return jq.each(function() {
        var el = this;
        var state = $.data(el, 'datagrid');
        if (!state || !row) return;

        // Initialize data if needed
        if (!state.data) state.data = { total: 0, rows: [] };

        var idx = state.data.rows.length;
        state.data.rows.push(row);
        state.data.total = state.data.rows.length;

        // Clone template and populate
        var $tbody = $(el).find('tbody');
        var tmpl = $tbody.find('template')[0];
        if (!tmpl) return;

        var clone = tmpl.content.firstElementChild.cloneNode(true);
        var tds = clone.querySelectorAll('td');
        for (var j = 0; j < tds.length; j++) {
          var td = tds[j];
          if (td.hasAttribute('data-filler')) continue;
          var field = td.getAttribute('data-field');
          if (!field) {
            if (state.options.rownumbers) td.textContent = idx + 1;
            continue;
          }
          var val = row[field];
          var fmtStr = td.getAttribute('data-formatter');
          var fmt = resolveFormatter(fmtStr);
          if (!fmt && state._formatters && state._formatters[field]) {
            fmt = state._formatters[field];
          }
          var target = td.querySelector('.datagrid-cell') || td;
          if (fmt) {
            target.innerHTML = fmt(val, row, idx);
          } else {
            target.textContent = val != null ? val : '';
          }

          // Apply styler
          applyStyler(td, resolveStyler(td, state, field), val, row, idx);
        }
        clone._rowData = row;
        clone._rowIndex = idx;
        $tbody.append(clone);
      });
    },
    insertRow: function(jq) {
      return jq;
    },
    deleteRow: function(jq, index) {
      return jq.each(function() {
        var el = this;
        var state = $.data(el, 'datagrid');
        if (!state || index == null) return;

        // Remove from data array
        if (state.data && state.data.rows) {
          state.data.rows.splice(index, 1);
          state.data.total = state.data.rows.length;
        }

        // Remove from DOM and re-index remaining rows
        var $tbody = $(el).find('tbody');
        var $trs = $tbody.children('tr');
        $trs.each(function() {
          if (this._rowIndex === index) {
            $(this).remove();
          }
        });

        // Re-index remaining rows
        $tbody.children('tr').each(function(i) {
          this._rowIndex = i;
          if (state.data && state.data.rows[i]) {
            this._rowData = state.data.rows[i];
          }
        });

        // Clear selection
        $(el).datagrid('clearSelections');
      });
    },
    getChanges: function() {
      return [];
    },
    acceptChanges: function(jq) {
      return jq;
    },
    rejectChanges: function(jq) {
      return jq;
    },
    mergeCells: function(jq) {
      return jq;
    },
    showColumn: function(jq, field) {
      return jq.each(function() {
        var sel = '[data-field="' + field + '"]';
        var table = this.querySelector('table.table');
        if (!table) return;
        table.querySelectorAll('th' + sel + ', td' + sel).forEach(function(el) { el.classList.remove('coloff'); });
        var tmpl = table.querySelector('tbody > template');
        if (tmpl) tmpl.content.querySelectorAll('td' + sel).forEach(function(el) { el.classList.remove('coloff'); });
        // Also show matching editor field
        var editor = document.getElementById(this.id + '_editor');
        if (editor) editor.querySelectorAll('.fitem' + sel).forEach(function(el) { el.classList.remove('coloff'); });
      });
    },
    hideColumn: function(jq, field) {
      return jq.each(function() {
        var sel = '[data-field="' + field + '"]';
        var table = this.querySelector('table.table');
        if (!table) return;
        table.querySelectorAll('th' + sel + ', td' + sel).forEach(function(el) { el.classList.add('coloff'); });
        var tmpl = table.querySelector('tbody > template');
        if (tmpl) tmpl.content.querySelectorAll('td' + sel).forEach(function(el) { el.classList.add('coloff'); });
        // Also hide matching editor field
        var editor = document.getElementById(this.id + '_editor');
        if (editor) editor.querySelectorAll('.fitem' + sel).forEach(function(el) { el.classList.add('coloff'); });
      });
    },
    columns: function(jq) {
      return jq.each(function() {
        var el = this, id = el.id;
        if (!id) return;
        var $menu = $('#' + id + '_colmenu');
        if (!$menu.length) return;

        // Restore saved state from remember plugin
        if ($.remember) {
          var saved = $.remember.get($menu);
          if (saved && Array.isArray(saved)) {
            $menu.find('input[type="checkbox"][data-field]').each(function() {
              var field = this.getAttribute('data-field');
              var show = saved.indexOf(field) > -1;
              this.checked = show;
              $(el).datagrid(show ? 'showColumn' : 'hideColumn', field);
            });
          }
        }

        // Wire checkbox toggles
        $menu.off('change.coloff').on('change.coloff', 'input[type="checkbox"][data-field]', function() {
          var field = this.getAttribute('data-field');
          $(el).datagrid(this.checked ? 'showColumn' : 'hideColumn', field);
          // Persist
          if ($.remember) {
            var fields = [];
            $menu.find('input[type="checkbox"][data-field]:checked').each(function() {
              fields.push(this.getAttribute('data-field'));
            });
            $.remember.set($menu, fields);
          }
        });
      });
    },
    sort: function(jq) {
      return jq;
    },
    gotoPage: function(jq) {
      return jq;
    },
    rowEditor: function(jq, opts) {
      return jq.datagrid(opts);
    },
    renderColumns: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'datagrid');
        if (state && state.options.columns) {
          renderColumns(this, state.options.columns);
          state._columnsRendered = true;
        }
      });
    },
    // ---- File grid methods ----
    // Load document files attached to a record (used by ~20 page scripts)
    docFiles: function(jq, key) {
      if (!key) return jq;
      var pageId = ($.page && $.page.state && $.page.state.pageId) ||
                   ($.dui && $.dui.menu && $.dui.menu.selected && $.dui.menu.selected.id) || '';
      return jq.each(function() {
        var state = $.data(this, 'datagrid');
        if (!state) return;
        state.options.url = '/';
        state.options.queryParams = {
          _dgrid: 'y',
          _sqlid: 'admin^file_appdoc',
          _func: 'get',
          appdoc: key,
          appid: pageId
        };
        requestData(this);
      });
    },
    // Load application/folder files (used by admin/files page)
    appFiles: function(jq, appid) {
      if (!appid) {
        appid = ($.page && $.page.state && $.page.state.pageId) ||
                ($.dui && $.dui.menu && $.dui.menu.selected && $.dui.menu.selected.id) || '';
      }
      return jq.each(function() {
        var state = $.data(this, 'datagrid');
        if (!state) return;
        state.options.url = '/';
        state.options.queryParams = {
          _dgrid: 'y',
          _sqlid: 'admin^file_app',
          _func: 'get',
          appid: appid
        };
        requestData(this);
      });
    },

    // ---- readonly: lock/unlock datagrid editing + toolbar ----
    readonly: function(jq, locked) {
      return jq.each(function() {
        var state = $.data(this, 'datagrid');
        if (!state) return;
        state._readonly = locked !== false;
        if (state._toolbar) {
          $(state._toolbar).find('button').each(function() {
            if (state._readonly) tbarDisable(this); else tbarEnable(this);
          });
        }
      });
    },

    // ---- editButs: show/hide/enable/disable/click toolbar buttons ----
    editButs: function(jq, opts) {
      return jq.each(function() {
        var state = $.data(this, 'datagrid');
        if (!state || !opts) return;
        var id = this.id;
        for (var key in opts) {
          if (!opts.hasOwnProperty(key)) continue;
          var action = opts[key];
          var btn = document.getElementById(id + '_' + key);
          if (!btn && state._toolbar) btn = $(state._toolbar).find('[data-action="' + key + '"]')[0];
          if (!btn) continue;
          if (action === 'hide') $(btn).hide();
          else if (action === 'show') $(btn).show();
          else if (action === 'enable') tbarEnable(btn);
          else if (action === 'disable') tbarDisable(btn);
          else if (action === 'click') $(btn).trigger('click');
        }
      });
    },

    // ---- editDone: end any active row editing ----
    editDone: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'datagrid');
        if (!state) return;
        if (state._editingIndex != null && state._editingIndex >= 0) {
          $(this).datagrid('endEdit', state._editingIndex);
        }
      });
    },

    // ---- findRows: find rows matching criteria ----
    findRows: function(jq, criteria) {
      var result = { rows: [], idxs: [] };
      if (!jq[0] || !criteria) return result;
      var state = $.data(jq[0], 'datagrid');
      if (!state || !state.data || !state.data.rows) return result;
      var rows = state.data.rows;
      for (var i = 0; i < rows.length; i++) {
        var match = true;
        for (var key in criteria) {
          if (!criteria.hasOwnProperty(key)) continue;
          var want = criteria[key];
          var have = rows[i][key];
          if (Array.isArray(want)) {
            if (want.indexOf(have) === -1) { match = false; break; }
          } else {
            if ((have + '') !== (want + '')) { match = false; break; }
          }
        }
        if (match) { result.rows.push(rows[i]); result.idxs.push(i); }
      }
      return result;
    },

    // ---- hideRow/showRow: toggle row visibility by index ----
    hideRow: function(jq, idx) {
      return jq.each(function() {
        var $trs = $(this).find('tbody > tr');
        $trs.each(function() { if (this._rowIndex === idx) this.style.display = 'none'; });
      });
    },
    showRow: function(jq, idx) {
      return jq.each(function() {
        var $trs = $(this).find('tbody > tr');
        $trs.each(function() { if (this._rowIndex === idx) this.style.display = ''; });
      });
    },

    // ---- showRows: bulk filter — show matching, hide non-matching ----
    showRows: function(jq, criteria) {
      var counts = { visible: 0, hidden: 0 };
      if (!jq[0] || !criteria) return counts;
      var state = $.data(jq[0], 'datagrid');
      if (!state || !state.data || !state.data.rows) return counts;
      var rows = state.data.rows;
      var $trs = $(jq[0]).find('tbody > tr');
      $trs.each(function() {
        var ri = this._rowIndex;
        if (ri == null || !rows[ri]) return;
        var match = true;
        for (var key in criteria) {
          if (!criteria.hasOwnProperty(key)) continue;
          var want = criteria[key];
          var have = rows[ri][key];
          if (Array.isArray(want)) {
            if (want.indexOf(have) === -1) { match = false; break; }
          } else {
            if ((have + '') !== (want + '')) { match = false; break; }
          }
        }
        if (match) { this.style.display = ''; counts.visible++; }
        else { this.style.display = 'none'; counts.hidden++; }
      });
      return counts;
    },

    // ---- resizeColumn: set column width by field name ----
    resizeColumn: function(jq, param) {
      return jq.each(function() {
        if (!param || !param.field) return;
        var sel = '[data-field="' + param.field + '"]';
        var table = this.querySelector('table.table');
        if (!table) return;
        var w = param.width;
        if (typeof w === 'number') w = w + 'px';
        table.querySelectorAll('th' + sel + ', td' + sel).forEach(function(el) { el.style.width = w; });
        var tmpl = table.querySelector('tbody > template');
        if (tmpl) tmpl.content.querySelectorAll('td' + sel).forEach(function(el) { el.style.width = w; });
      });
    },

    // ---- toExcel: export datagrid to downloadable HTML/XLS file ----
    toExcel: function(jq, filename) {
      return jq.each(function() {
        var el = this;
        var table = el.querySelector('table.table');
        if (!table) return;

        // Build HTML table from visible headers + rows
        var html = '<table border="1" cellspacing="0" cellpadding="4">';

        // Headers
        html += '<tr style="background:#eee;font-weight:bold">';
        var ths = table.querySelectorAll('thead th:not(.coloff):not([data-filler])');
        ths.forEach(function(th) { html += '<td>' + (th.textContent || '').trim() + '</td>'; });
        html += '</tr>';

        // Rows (visible only)
        var trs = table.querySelectorAll('tbody > tr');
        trs.forEach(function(tr) {
          if (tr.style.display === 'none') return;
          html += '<tr>';
          var tds = tr.querySelectorAll('td:not(.coloff):not([data-filler])');
          tds.forEach(function(td) { html += '<td>' + (td.textContent || '').trim() + '</td>'; });
          html += '</tr>';
        });
        html += '</table>';

        // Download via Blob
        var blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename || (el.id || 'datagrid') + '.xls';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
  };

  $.fn.datagrid.defaults = {
    data: null,
    tbar: _sink
  };

  // ========================================================================
  // Grid/misc utilities moved from ui.js → $.dui.fn
  // ========================================================================
  var dui = $.dui;

  // dgbars(val, row, idx) — datagrid bars formatter (1 page script)
  function dgbars(val, row, idx) {
    function stat(val) { if (val > 99) return 'grn'; return 'ora'; }
    var now = new Date().getTime() / 1000;
    function one(row) {
      var ul = "<ul class='ulbar'>";
      $.each(row, function(key, val) {
        if (!val.wor) return;
        var md = (val.md - 28800);
        var cls = stat(val.qp) + ' ';
        if (val.md && now - md < 300) cls += 'active ';
        if (val.late && parseInt(val.late) == 1) cls += 'late ';
        var li = '<li data-options="' + dic2str(val) + '" class="' + cls + '" style="background-size:' + val.qp + '% 100%">' + val.wor.replace(/\^/g, '.') + '</li>';
        ul += li;
      });
      ul += '</ul>';
      return ul;
    }
    return one(val);
  }

  // nboxbar(nv, ov) — numberbox progress bar overlay (2 page scripts)
  function nboxbar(nv, ov) {
    var me = $(this);
    var div = parseInt($(me.attr('data-divisor')).numberbox('getValue'));
    var pct = parseInt((nv / div) * 100);
    if (pct > 100) pct = 100;
    var box = me.data('textbox')?.textbox || me;
    if (!isNaN(pct)) box.css('background-size', pct + '% 100%').addClass('bar');
    else box.removeClass('bar');
  }

  // nodclick(me, ms) — prevent double-clicks on tree/list items (7 page scripts)
  function nodclick(me, ms) {
    // Body is intentionally empty — original was commented out.
    // Kept as a no-op shim so page scripts don't error.
  }

  // status(fail) — minimal error display (9 page scripts)
  function status(fail) {
    if (fail && fail.msg) alert(fail.msg);
  }

  dui.fn.dgbars   = dgbars;
  dui.fn.nboxbar  = nboxbar;
  dui.fn.nodclick = nodclick;
  dui.fn.status   = status;

  dui.register('dgbars',   dgbars);
  dui.register('nboxbar',  nboxbar);
  dui.register('nodclick', nodclick);
  // status() cannot be shimmed to window.status (native browser property)
  // Page scripts access it via $.dui.fn.status() or module scope

})(jQuery);
