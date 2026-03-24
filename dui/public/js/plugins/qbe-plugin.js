/**
 * Pure4 QBE Plugin - Query By Example (DUI)
 *
 * Typeahead search on input fields backed by server-side QBE definitions.
 * Loads definitions from eui.qbe_def (via qbedef.js).
 *
 * Features:
 *  - Debounced typeahead: queries server as user types
 *  - Multi-column dropdown results from qbedef fields
 *  - Selection triggers change event (fkey cascading via dataloader)
 *  - Prev/next navigation for .navi fields
 *
 * API: init({defid, queryParams, onSelect}), getValue, setValue,
 *      select, clear, reload, loadForm, readonly, enable, disable
 *
 * Dependencies: jQuery, qbedef.js (provides eui.qbe_def)
 */
(function($) {
  'use strict';

  var DEBOUNCE_MS = 400;
  var MAX_ROWS = 20;
  var shimWarnState = {
    seenCalls: {},
    controls: {},
    order: [],
    toast: null
  };

  // ── Helpers ──────────────────────────────────────────────────────────────

  function isSearchboxTarget(el) {
    var $el = $(el);
    return !!(
      $.data(el, 'searchbox') ||
      $el.attr('eui') === 'searchbox' ||
      $el.hasClass('searchbox') ||
      $el.hasClass('easyui-searchbox')
    );
  }

  function mapInitOptionsToSearchbox(options) {
    var opts = $.extend({}, options || {});
    // qbe defid maps to searchbox definition alias keys
    if (!opts.sbref && !opts.sbdef && opts.defid) opts.sbdef = opts.defid;
    // qbe readonly is inverse of searchbox editable
    if (opts.readonly !== undefined && opts.editable === undefined) {
      opts.editable = (opts.readonly === false);
      delete opts.readonly;
    }
    return opts;
  }

  function getShimControlMeta($el, opts, method) {
    var id = ($el && $el.length && $el.attr('id')) ? ('#' + $el.attr('id')) : '<no-id>';
    var sbopts = null;
    try {
      if ($el && $el.length && $.data($el[0], 'searchbox')) sbopts = $el.searchbox('options') || null;
    } catch (e) { /* ignore */ }
    var defid = (opts && (opts.defid || opts.sbdef || opts.sbref)) ||
      (sbopts && (sbopts.defid || sbopts.sbdef || sbopts.sbref || sbopts._sbref)) ||
      '<none>';
    return { id: id, defid: defid, method: method || 'init' };
  }

  function ensureShimWarning(meta) {
    if (!meta) return;
    var callKey = [meta.id, meta.defid, meta.method].join('|');
    if (!shimWarnState.seenCalls[callKey]) {
      shimWarnState.seenCalls[callKey] = true;
      if (window.console && typeof console.warn === 'function') {
        console.warn('[qbe->searchbox shim] Convert qbe(...) to searchbox(...) id=' + meta.id +
          ' defid=' + meta.defid + ' method=' + meta.method);
      }
    }

    var ctrlKey = [meta.id, meta.defid].join('|');
    if (!shimWarnState.controls[ctrlKey]) {
      shimWarnState.controls[ctrlKey] = true;
      shimWarnState.order.push(meta.id + '(' + meta.defid + ')');
    }

    if ($.messager && typeof $.messager.show === 'function') {
      var count = shimWarnState.order.length;
      var names = shimWarnState.order.slice(0, 8).join(', ');
      if (count > 8) names += ', ...';
      var msg = 'QBE Deprecated: ' + names;

      if (!shimWarnState.toast || !shimWarnState.toast.length || !$.contains(document.body, shimWarnState.toast[0])) {
        shimWarnState.toast = $.messager.show({
          title: 'QBE Deprecated',
          msg: msg,
          cls: 'warning',
          timeout: 0
        });
      } else {
        var $msg = shimWarnState.toast.find('.text-sm');
        if ($msg.length) $msg.text(msg);
      }
    }
  }

  function buildSearchboxOptionsFacade($el) {
    var opts = $el.searchbox('options') || {};
    if (!opts.queryParams) opts.queryParams = {};

    // qbe compatibility: expose readonly as inverse of editable
    if (!opts.__qbeReadonlyAlias) {
      Object.defineProperty(opts, 'readonly', {
        configurable: true,
        enumerable: true,
        get: function() { return this.editable === false; },
        set: function(v) {
          var ro = (v !== false);
          this.editable = !ro;
          $el.searchbox('editable', !ro);
        }
      });
      Object.defineProperty(opts, '__qbeReadonlyAlias', {
        configurable: true,
        enumerable: false,
        value: true
      });
    }

    // qbe compatibility: options().dlog.dg.datagrid('reload')
    if (!opts.dlog || !opts.dlog.dg || typeof opts.dlog.dg.datagrid !== 'function') {
      opts.dlog = opts.dlog || {};
      opts.dlog.dg = opts.dlog.dg || {};
      opts.dlog.dg.datagrid = function(cmd) {
        if (cmd === 'reload') $el.searchbox('reload');
        return opts.dlog.dg;
      };
    }

    return opts;
  }

  function dlog() {
    if (!window.duiDebug || !window.duiDebug.enabled('qbe')) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[dui:qbe]');
    console.log.apply(console, args);
  }

  /** Resolve the QBE definition from eui.qbe_def by name or _sqlid */
  function resolveDef(defid, sqlid) {
    if (!window.eui || !eui.qbe_def) return null;
    // Direct name lookup
    if (defid && eui.qbe_def[defid]) {
      return eui.qbe_def[defid];
    }
    // Fallback: match by _sqlid
    if (sqlid) {
      var defs = eui.qbe_def;
      for (var key in defs) {
        if (defs[key].queryParams && defs[key].queryParams._sqlid === sqlid) {
          return defs[key];
        }
      }
    }
    return null;
  }

  /** Return all fields from the qbedef — no filtering */
  function getFields(fields) {
    if (!fields || !fields.length) return [];
    return fields;
  }

  // ── Dropdown DOM ─────────────────────────────────────────────────────────

  function buildDropdown($el, state) {
    // Append to body to avoid overflow:hidden clipping from parent containers
    var $dd = $('<div class="qbe-dropdown"></div>').css({
      position: 'absolute',
      zIndex: 99999,
      maxHeight: '280px',
      minWidth: '300px',
      overflowY: 'auto',
      background: '#fff',
      border: '1px solid #d1d5db',
      borderRadius: '0 0 6px 6px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'none'
    });

    var $table = $('<table class="table table-xs table-pin-rows" style="margin:0;"></table>');
    var $thead = $('<thead></thead>');
    var $tbody = $('<tbody></tbody>');
    $table.append($thead, $tbody);
    $dd.append($table);
    $(document.body).append($dd);

    state.$dropdown = $dd;
    state.$thead = $thead;
    state.$tbody = $tbody;
    state.$el = $el;

    // Render header row from fields
    var cols = getFields(state.options.fields);
    if (cols.length) {
      var $hr = $('<tr></tr>');
      cols.forEach(function(col) {
        $hr.append($('<th></th>').text(col.title).css({ fontSize: '11px', padding: '4px 6px' }));
      });
      $thead.append($hr);
    }
  }

  /** Position dropdown below the input element */
  function positionDropdown(state) {
    if (!state.$dropdown || !state.$el) return;
    var el = state.$el[0];
    var rect = el.getBoundingClientRect();
    state.$dropdown.css({
      top: rect.bottom + window.scrollY + 'px',
      left: rect.left + window.scrollX + 'px',
      minWidth: Math.max(rect.width, 300) + 'px'
    });
  }

  function showDropdown(state) {
    if (state.$dropdown) {
      positionDropdown(state);
      state.$dropdown.show();
    }
  }

  function hideDropdown(state) {
    if (state.$dropdown) state.$dropdown.hide();
    state.highlightIndex = -1;
  }

  function renderResults(state, rows) {
    var $tbody = state.$tbody;
    $tbody.empty();
    state.data = rows || [];
    state.highlightIndex = -1;

    if (!rows || !rows.length) {
      $tbody.append(
        $('<tr><td colspan="99" style="text-align:center;color:#999;padding:8px;">No results</td></tr>')
      );
      return;
    }

    var cols = getFields(state.options.fields);
    var vf = state.options.valueField || 'value';

    rows.forEach(function(row, idx) {
      var $tr = $('<tr class="hover cursor-pointer"></tr>');
      $tr.attr('data-idx', idx);
      $tr.css({ cursor: 'pointer' });

      if (cols.length) {
        cols.forEach(function(col) {
          var val = row[col.field];
          if (val === undefined || val === null) val = '';
          if (col.formatter && typeof col.formatter === 'function') {
            try { val = col.formatter(val); } catch (e) { /* ignore */ }
          }
          $tr.append($('<td></td>').text(val).css({ padding: '4px 6px', fontSize: '12px' }));
        });
      } else {
        // Fallback: show value field
        $tr.append($('<td></td>').text(row[vf] || row.value || '').css({ padding: '4px 6px' }));
      }
      $tbody.append($tr);
    });
  }

  function highlightRow(state, idx) {
    if (!state.$tbody) return;
    state.$tbody.find('tr').removeClass('active bg-base-200');
    if (idx >= 0 && idx < state.data.length) {
      state.highlightIndex = idx;
      var $row = state.$tbody.find('tr[data-idx="' + idx + '"]');
      $row.addClass('active bg-base-200');
      // Scroll into view
      var dd = state.$dropdown[0];
      var row = $row[0];
      if (dd && row) {
        if (row.offsetTop < dd.scrollTop) dd.scrollTop = row.offsetTop;
        else if (row.offsetTop + row.offsetHeight > dd.scrollTop + dd.clientHeight) {
          dd.scrollTop = row.offsetTop + row.offsetHeight - dd.clientHeight;
        }
      }
    }
  }

  // ── Server Query ─────────────────────────────────────────────────────────

  function queryServer($el, state, searchText) {
    var opts = state.options;
    var qp = $.extend({}, opts.queryParams);
    var vf = opts.valueField || 'value';

    // Add search filter — use LIKE wildcard on the value field
    if (searchText) {
      qp[vf + '_LIKE_'] = searchText + '%';
    }

    qp._func = 'get';
    qp._dgrid = 'y';
    qp._rows = MAX_ROWS;
    qp._page = 1;

    dlog('query', qp);

    ajaxget('', qp, function(data) {
      var rows = [];
      if ($.isArray(data)) rows = data;
      else if (data && data.rows) rows = data.rows;
      else if (data && data.total !== undefined && $.isArray(data.rows)) rows = data.rows;

      dlog('results', rows.length);
      renderResults(state, rows);
      showDropdown(state);
    }, {
      method: 'post',
      dataType: 'json',
      error: function() {
        dlog('query failed');
        renderResults(state, []);
        showDropdown(state);
      }
    });
  }

  // ── Selection ────────────────────────────────────────────────────────────

  function selectRow($el, state, row) {
    if (!row) return;
    var vf = state.options.valueField || 'value';
    var value = row[vf] || row.value || '';

    dlog('select', value, row);
    $el.val(value);
    hideDropdown(state);

    // Fire onSelect callback from definition
    if (state.options.onSelect && typeof state.options.onSelect === 'function') {
      state.options.onSelect.call($el[0], row);
    }

    // Trigger change for fkey cascading
    $el.trigger('change');
  }

  // ── QBE Modal Wiring ────────────────────────────────────────────────────

  function openQbeModal($el, state) {
    var $modal = $('#qbe-modal');
    var dialog = $modal[0];
    if (!dialog) return;

    var $grid = $('#qbe-datagrid');
    var $filters = $modal.find('.qbe-filters');
    var $searchBtn = $('#qbe-search-btn');
    var opts = state.options;
    var fields = getFields(opts.fields);
    var vf = opts.valueField || 'value';

    // Columns from qbedef fields (include formatter for truncation etc)
    var columns = fields.map(function(f) {
      var col = { field: f.field, title: f.title };
      if (f.width) col.width = f.width;
      if (f.formatter) col.formatter = f.formatter;
      return col;
    });

    // Query params from qbedef (includes _sqlid)
    var qp = $.extend({}, opts.queryParams, {
      _func: 'get',
      _dgrid: 'y',
      _rows: 20,
      _page: 1
    });

    // Build filter fields via dynadd() — single source of truth for fitem rendering
    $filters.empty();
    var dynFields = fields.map(function(f) {
      var df = { id: f.field, label: f.title };
      if (f.editor && typeof f.editor === 'object' && f.editor.type === 'combobox') {
        df.type = 'combobox';
        df.data = (f.editor.options && f.editor.options.data) || [];
      } else {
        df.type = 'textbox';
      }
      return df;
    });
    if (typeof dynadd === 'function') dynadd($filters, dynFields);

    // Configure datagrid with qbedef columns and query
    $grid.datagrid({
      url: '/',
      columns: columns,
      queryParams: qp,
      singleSelect: true,
      striped: true,
      fitColumns: true,
      onClickRow: function(index, row) {
        var val = row.value || row[vf] || '';
        // For <select>: add option if absent so setValue can select it
        if ($el.is('select') && val && !$el.find('option[value="' + val + '"]').length) {
          $el.append($('<option>').val(val).text(val));
        }
        $el.combobox('setValue', val);
        if (opts.onSelect && typeof opts.onSelect === 'function') {
          opts.onSelect.call($el[0], row);
        }
        $el.trigger('change');
        dialog.close();
      }
    });

    // Wire search button → reload datagrid with filter values
    // EUI convention: textbox → value field maps to valueField, append _LIKE_
    //                 combobox → exact value, no _LIKE_ suffix (skip empty = "All")
    $searchBtn.off('click.qbe').on('click.qbe', function() {
      var filterParams = {};
      // Textbox inputs: LIKE filter
      $filters.find('input').each(function() {
        var val = $(this).val().trim();
        if (val) {
          var fname = this.name;
          if (fname === 'value') fname = vf;
          filterParams[fname + '_LIKE_'] = val + '%';
        }
      });
      // Select (combobox) inputs: exact match, skip empty ("All")
      $filters.find('select').each(function() {
        var val = $(this).val();
        if (val) {
          filterParams[this.name] = val;
        }
      });
      $grid.datagrid('reload', $.extend({}, qp, filterParams));
    });

    // Load data and open
    $grid.datagrid('reload');
    dialog.showModal();
  }

  // ── Select element data loading ─────────────────────────────────────────

  /** Load qbedef data into a <select> element via combobox plugin */
  function loadSelectData($el, state) {
    var opts = state.options;
    var sqlid = opts.queryParams && opts.queryParams._sqlid;
    if (!sqlid) {
      // Try _sqlid attribute on the element itself
      sqlid = $el.attr('_sqlid');
    }
    if (!sqlid) {
      dlog('loadSelectData', 'no _sqlid — skip');
      return;
    }

    var qp = { _func: 'get', _combo: 'y', _sqlid: sqlid };
    dlog('loadSelectData', 'request', qp);

    ajaxget('/', qp, function(data) {
      var rows = [];
      if ($.isArray(data)) rows = data;
      else if (data && $.isArray(data.rows)) rows = data.rows;

      dlog('loadSelectData', 'rows', rows.length);
      state.data = rows;

      if (typeof $el.combobox === 'function') {
        $el.combobox('loadData', rows);
      }
    });
  }

  // ── Navigation (prev/next) ───────────────────────────────────────────────

  function buildNavi($el, state) {
    if (!$el.hasClass('navi')) return;

    var $wrap = $el.parent();
    var $nav = $('<span class="qbe-navi inline-flex ml-1 gap-0.5"></span>');
    var btnCss = {
      cursor: 'pointer',
      padding: '0 4px',
      fontSize: '14px',
      lineHeight: $el.outerHeight() + 'px',
      userSelect: 'none',
      color: '#6b7280'
    };

    var $prev = $('<span class="qbe-nav-prev" title="Previous">&#9664;</span>').css(btnCss);
    var $next = $('<span class="qbe-nav-next" title="Next">&#9654;</span>').css(btnCss);

    $prev.on('click', function() {
      naviMove($el, state, -1);
    });
    $next.on('click', function() {
      naviMove($el, state, 1);
    });

    $nav.append($prev, $next);
    $wrap.append($nav);
    state.$navi = $nav;
  }

  function naviMove($el, state, dir) {
    var rows = state.data || [];
    if (!rows.length) {
      // Load data first, then navigate
      queryServer($el, state, '');
      return;
    }

    var idx = state.naviIndex || 0;
    idx += dir;
    if (idx < 0) idx = 0;
    if (idx >= rows.length) idx = rows.length - 1;
    state.naviIndex = idx;

    selectRow($el, state, rows[idx]);
  }

  // ── Event Binding ────────────────────────────────────────────────────────

  function attachEvents($el, state) {
    var searchTimeout = null;

    // Typing → debounced search
    $el.on('input.qbe', function() {
      clearTimeout(searchTimeout);
      var val = $el.val().trim();
      if (val.length === 0) {
        hideDropdown(state);
        return;
      }
      searchTimeout = setTimeout(function() {
        queryServer($el, state, val);
      }, DEBOUNCE_MS);
    });

    // Enter → immediate search or select highlighted
    $el.on('keydown.qbe', function(e) {
      if (e.keyCode === 13) { // Enter
        e.preventDefault();
        if (state.highlightIndex >= 0 && state.data[state.highlightIndex]) {
          selectRow($el, state, state.data[state.highlightIndex]);
        } else {
          clearTimeout(searchTimeout);
          queryServer($el, state, $el.val().trim());
        }
      } else if (e.keyCode === 27) { // Escape
        hideDropdown(state);
      } else if (e.keyCode === 40) { // Down
        e.preventDefault();
        var next = (state.highlightIndex || 0) + 1;
        if (state.data && next < state.data.length) {
          highlightRow(state, next);
        } else if (!state.$dropdown || !state.$dropdown.is(':visible')) {
          queryServer($el, state, $el.val().trim());
        }
      } else if (e.keyCode === 38) { // Up
        e.preventDefault();
        var prev = (state.highlightIndex || 0) - 1;
        if (prev >= 0) highlightRow(state, prev);
      }
    });

    // Dropdown row click (dropdown is on body, bind directly)
    state.$dropdown.on('mousedown.qbe', 'tbody tr[data-idx]', function(e) {
      e.preventDefault(); // Prevent blur from firing before click
      var idx = parseInt($(this).attr('data-idx'), 10);
      var row = state.data[idx];
      if (row) selectRow($el, state, row);
    });

    // Hide dropdown on blur (with delay for click)
    $el.on('blur.qbe', function() {
      setTimeout(function() {
        hideDropdown(state);
      }, 200);
    });

    // Show dropdown on focus if we have data
    $el.on('focus.qbe', function() {
      if (state.data && state.data.length && $el.val().trim()) {
        showDropdown(state);
      }
    });
  }

  // ── Main Plugin ──────────────────────────────────────────────────────────

  $.fn.qbe = function(options, param) {
    if (typeof options === 'string') {
      var method = $.fn.qbe.methods[options];
      if (method) return method(this, param);
      return this;
    }

    options = options || {};
    return this.each(function() {
      var $el = $(this);

      // Alias mode: qbe init routed to searchbox-owned elements
      if (isSearchboxTarget(this)) {
        var mapped = mapInitOptionsToSearchbox(options);
        ensureShimWarning(getShimControlMeta($el, mapped, 'init'));
        $el.searchbox(mapped);
        return;
      }

      var state = $.data(this, 'qbe');

      if (state) {
        var hadSqlid = state.options.queryParams && state.options.queryParams._sqlid;
        $.extend(state.options, options);
        // For select: re-run data load if sqlid just became available
        if (state.isSelect && !hadSqlid) {
          var nowSqlid = state.options.queryParams && state.options.queryParams._sqlid;
          if (!nowSqlid) nowSqlid = $el.attr('_sqlid');
          if (nowSqlid) loadSelectData($el, state);
        }
        return;
      }

      // Merge defaults + qbedef definition + caller options
      var opts = $.extend({}, $.fn.qbe.defaults, options);
      var def = resolveDef(opts.defid, $el.attr('_sqlid'));
      if (def) {
        // Apply definition but let caller options win
        opts = $.extend({}, $.fn.qbe.defaults, def, options);
        // Merge queryParams from both
        opts.queryParams = $.extend({}, def.queryParams, options.queryParams);
      }

      state = $.data(this, 'qbe', {
        options: opts,
        data: [],
        highlightIndex: -1,
        naviIndex: 0,
        isSelect: $el.is('select')
      });

      dlog('init', $el.attr('id'), opts.defid, opts);

      // Select elements use combobox UI — skip typeahead dropdown/events,
      // but still load data from qbedef's _sqlid into the <select>.
      if (state.isSelect) {
        dlog('init', 'select element — loading as combobox');
        loadSelectData($el, state);

        // Fire onSelect when user picks from native <select> dropdown
        $el.on('change.qbe-select', function() {
          var val = $(this).val();
          var row = null;
          var vf = state.options.valueField || 'value';
          if (state.data) {
            for (var i = 0; i < state.data.length; i++) {
              if (String(state.data[i][vf] || state.data[i].value || '') === String(val)) {
                row = state.data[i];
                break;
              }
            }
          }
          if (!row) row = { value: val };
          if (state.options.onSelect && typeof state.options.onSelect === 'function') {
            state.options.onSelect.call($el[0], row);
          }
        });

        // QBE search button click — opens server-rendered #qbe-modal
        // (modal structure from +qbemodal pug mixin, JS only configures columns/filters/events)
        var $searchBtn = $el.parent().find('.qbe-search');
        if ($searchBtn.length) {
          $searchBtn.on('click', function(e) {
            e.preventDefault();
            openQbeModal($el, state);
          });
        }
        return;
      }

      // Build dropdown UI
      buildDropdown($el, state);

      // Build navi buttons
      buildNavi($el, state);

      // Attach events
      attachEvents($el, state);

      // Preload if requested
      if (opts.preload) {
        queryServer($el, state, '');
      }
    });
  };

  // ── Methods ──────────────────────────────────────────────────────────────

  $.fn.qbe.methods = {
    options: function(jq) {
      if (!jq[0]) return $.fn.qbe.defaults;
      if (isSearchboxTarget(jq[0])) {
        ensureShimWarning(getShimControlMeta(jq.eq(0), null, 'options'));
        return buildSearchboxOptionsFacade(jq.eq(0));
      }
      var state = $.data(jq[0], 'qbe');
      return state ? state.options : $.fn.qbe.defaults;
    },

    getValue: function(jq) {
      if (jq[0] && isSearchboxTarget(jq[0])) {
        ensureShimWarning(getShimControlMeta(jq.eq(0), null, 'getValue'));
        return jq.eq(0).searchbox('getValue');
      }
      return jq.eq(0).val() || '';
    },

    setValue: function(jq, value) {
      if (jq[0] && isSearchboxTarget(jq[0])) {
        ensureShimWarning(getShimControlMeta(jq.eq(0), null, 'setValue'));
        return jq.searchbox('setValue', value);
      }
      return jq.each(function() {
        $(this).val(value || '');
      });
    },

    select: function(jq, value) {
      if (jq[0] && isSearchboxTarget(jq[0])) {
        ensureShimWarning(getShimControlMeta(jq.eq(0), null, 'select'));
        return jq.searchbox('select', value);
      }
      return jq.each(function() {
        $(this).val(value || '');
        $(this).trigger('change');
      });
    },

    clear: function(jq) {
      if (jq[0] && isSearchboxTarget(jq[0])) {
        ensureShimWarning(getShimControlMeta(jq.eq(0), null, 'clear'));
        return jq.searchbox('clear');
      }
      return jq.each(function() {
        $(this).val('');
        var state = $.data(this, 'qbe');
        if (state) hideDropdown(state);
      });
    },

    reload: function(jq, searchText) {
      if (jq[0] && isSearchboxTarget(jq[0])) {
        ensureShimWarning(getShimControlMeta(jq.eq(0), null, 'reload'));
        return jq.searchbox('reload', searchText);
      }
      return jq.each(function() {
        var state = $.data(this, 'qbe');
        if (state) {
          queryServer($(this), state, searchText || '');
        }
      });
    },

    loadForm: function(jq, value) {
      if (jq[0] && isSearchboxTarget(jq[0])) {
        ensureShimWarning(getShimControlMeta(jq.eq(0), null, 'loadForm'));
        return jq.searchbox('loadForm', value);
      }
      return jq.each(function() {
        $(this).val(value || '');
        $(this).trigger('change');
      });
    },

    readonly: function(jq, mode) {
      if (jq[0] && isSearchboxTarget(jq[0])) {
        // qbe readonly:true => searchbox editable:false (inverse mapping)
        var editable = (mode === false);
        ensureShimWarning(getShimControlMeta(jq.eq(0), null, 'readonly'));
        return jq.searchbox('editable', editable);
      }
      return jq.each(function() {
        $(this).prop('readonly', mode !== false);
      });
    },

    enable: function(jq) {
      if (jq[0] && isSearchboxTarget(jq[0])) {
        ensureShimWarning(getShimControlMeta(jq.eq(0), null, 'enable'));
        return jq.searchbox('enable');
      }
      return jq.each(function() { $(this).prop('disabled', false); });
    },

    disable: function(jq) {
      if (jq[0] && isSearchboxTarget(jq[0])) {
        ensureShimWarning(getShimControlMeta(jq.eq(0), null, 'disable'));
        return jq.searchbox('disable');
      }
      return jq.each(function() { $(this).prop('disabled', true); });
    },

    destroy: function(jq) {
      if (jq[0] && isSearchboxTarget(jq[0])) {
        ensureShimWarning(getShimControlMeta(jq.eq(0), null, 'destroy'));
        return jq.searchbox('destroy');
      }
      return jq.each(function() {
        var state = $.data(this, 'qbe');
        if (state) {
          if (state.$dropdown) state.$dropdown.remove();
          if (state.$navi) state.$navi.remove();
        }
        $(this).off('.qbe');
        $(this).parent().off('.qbe');
        $.removeData(this, 'qbe');
      });
    }
  };

  $.fn.qbe.defaults = {
    defid: null,
    preload: false,
    queryParams: {},
    valueField: 'value',
    fields: [],
    onSelect: null
  };

  // Register with parser so .qbe elements auto-initialize
  $.parser.plugins.push('qbe');

})(jQuery);
