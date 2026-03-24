/**
 * Pure4 Searchbox Plugin — type-to-search widget for large datasets
 *
 * DOM is server-rendered by the +searchbox() pug mixin:
 *   span.searchbox-wrap
 *     input[eui=searchbox]          — the text input
 *     .searchbox-dropdown           — positioned dropdown (hidden by default)
 *       .searchbox-list             — scrollable results area
 *         table.searchbox-table     — column headers + tbody (if columns defined)
 *       .searchbox-status           — loading / "N of M" / error bar
 *       template.searchbox-row-tpl  — row template cloned per result
 *
 * Config: JSON file (searchbox.<pageName>_<id>.json) base64-encoded in
 * data-searchbox attribute by the pug mixin.
 *
 * jQuery API:  $('#el').searchbox('getValue'), .searchbox('setValue', 'X'), etc.
 * Form-plugin: already lists 'searchbox' in fieldTypes — getValue/setValue work.
 */
(function($) {
  'use strict';

  // ── State management ────────────────────────────────────────────────
  function getState(el) {
    return $.data(el, 'searchbox');
  }

  function ensureState(el) {
    var state = getState(el);
    if (!state) {
      state = $.data(el, 'searchbox', {
        options: {},
        value: '',
        text: '',
        page: 1,
        total: 0,
        rows: [],
        loading: false,
        hilite: -1,
        timer: null
      });
    }
    return state;
  }

  // ── Locate server-rendered dropdown ─────────────────────────────────
  function findDropdown(el) {
    var state = getState(el);
    if (state && state.$drop) return state.$drop;

    var $wrap = $(el).closest('.searchbox-wrap');
    var $drop = $wrap.find('.searchbox-dropdown');
    if ($drop.length && state) {
      state.$drop = $drop;
      // If inside a <dialog>, append to dialog so dropdown stays in the
      // top-layer stacking context; otherwise append to body.
      var dialog = el.closest('dialog');
      state._inDialog = !!dialog;
      (dialog || document.body).appendChild($drop[0]);
    }
    return $drop;
  }

  function positionDropdown(el) {
    var state = getState(el);
    if (!state || !state.$drop) return;
    var $el = $(el);
    var h = $el.outerHeight();
    var inputW = $el.outerWidth();

    if (state._inDialog) {
      // Position relative to the dialog's offset
      var dlg = $(el.closest('dialog'));
      var dlgOff = dlg.offset();
      var elOff = $el.offset();
      state.$drop.css({
        left: elOff.left - dlgOff.left,
        top: elOff.top - dlgOff.top + h + 4,
        minWidth: inputW,
        width: 'auto'
      });
    } else {
      var offset = $el.offset();
      state.$drop.css({
        left: offset.left,
        top: offset.top + h + 4,
        minWidth: inputW,
        width: 'auto'
      });
    }
  }

  function showDropdown(el) {
    findDropdown(el);
    positionDropdown(el);
    var state = getState(el);
    if (state && state.$drop) state.$drop.addClass('searchbox-open');
  }

  function hideDropdown(el) {
    var state = getState(el);
    if (!state || !state.$drop) return;
    state.$drop.removeClass('searchbox-open');
    state.hilite = -1;
  }

  function isOpen(el) {
    var state = getState(el);
    return state && state.$drop && state.$drop.hasClass('searchbox-open');
  }

  function applyEditableState(el, editable) {
    var state = getState(el);
    var $el = $(el);
    var $wrap = $el.closest('.searchbox-wrap');
    var isEditable = editable !== false;

    $el.toggleClass('dui-noedit', !isEditable);
    if ($wrap.length) $wrap.toggleClass('dui-noedit', !isEditable);

    // Keep no-edit controls out of tab order/focus navigation without using readonly.
    if (!isEditable) {
      if ($el.attr('data-dui-tabindex') == null) {
        var prevTab = $el.attr('tabindex');
        $el.attr('data-dui-tabindex', prevTab == null ? '' : prevTab);
      }
      $el.attr('tabindex', '-1');
      if (document.activeElement === el) $el.blur();
    } else if ($el.attr('data-dui-tabindex') != null) {
      var savedTab = $el.attr('data-dui-tabindex');
      if (savedTab === '') $el.removeAttr('tabindex');
      else $el.attr('tabindex', savedTab);
      $el.removeAttr('data-dui-tabindex');
    }

    if (state && state.options) state.options.editable = isEditable;
  }

  function isTextEditKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    if (e.key === 'Backspace' || e.key === 'Delete') return true;
    return e.key && e.key.length === 1;
  }

  // ── Render results using <template> ─────────────────────────────────
  function renderResults(el, append) {
    var state = getState(el);
    if (!state || !state.$drop) return;

    var opts = state.options;
    var cols = opts.columns || [];
    var hasCols = cols.length > 0;
    var $tbody = hasCols ? state.$drop.find('.searchbox-table tbody') : null;
    var $list = hasCols ? null : state.$drop.find('.searchbox-list');
    var $status = state.$drop.find('.searchbox-status');
    var $tpl = state.$drop.find('template.searchbox-row-tpl');

    // Hide recents when showing search results
    state.$drop.find('.searchbox-recents').removeClass('has-recents');

    // Track which columns are still hidden (all start coloff via template)
    var hiddenCols = {};
    var hiddenCount = 0;
    if (hasCols) {
      if (!append) {
        // New search — all columns start hidden
        for (var ah = 0; ah < cols.length; ah++) {
          hiddenCols[ah] = cols[ah].field;
          hiddenCount++;
        }
        // Re-add coloff to header and template cells (may have been removed by previous search)
        state.$drop.find('.searchbox-table thead th').addClass('coloff');
        $tpl[0].content.querySelectorAll('td[data-field]').forEach(function(td) {
          td.classList.add('coloff');
        });
      } else {
        // Appending — carry over from previous state
        if (state._hiddenCols) {
          hiddenCols = state._hiddenCols;
          for (var k in hiddenCols) hiddenCount++;
        }
      }
    }

    if (!append) {
      if ($tbody) $tbody.empty();
      else if ($list) $list.empty();
    }

    var startIdx = append ? (state._prevLen || 0) : 0;
    for (var i = startIdx; i < state.rows.length; i++) {
      var row = state.rows[i];
      var text = row[opts.textField] || '';
      var value = row[opts.valueField] || '';

      if (hasCols && $tpl.length) {
        // Clone the server-rendered <template>
        var tplContent = $tpl[0].content.cloneNode(true);
        var $tr = $(tplContent).find('tr');
        $tr.attr('data-value', value);
        $tr.attr('data-text', text);
        $tr.attr('data-index', i);

        // Fill each <td> by data-field attribute
        $tr.find('td[data-field]').each(function() {
          var field = this.getAttribute('data-field');
          var val = row[field] != null ? row[field] : '';
          var col = null;
          for (var c = 0; c < cols.length; c++) {
            if (cols[c].field === field) { col = cols[c]; break; }
          }
          if (col && typeof col.formatter === 'function') {
            val = col.formatter(val, row);
          }
          this.textContent = val;
        });

        if (String(value) === String(state.value)) $tr.addClass('searchbox-selected');
        $tbody.append(tplContent);

        // Unhide columns that have data (row must be in DOM first for $tbody.find)
        if (hiddenCount > 0) {
          for (var ahi in hiddenCols) {
            var colIdx = parseInt(ahi, 10);
            var fld = hiddenCols[ahi];
            var cellVal = row[fld];
            if (cellVal != null && cellVal !== '') {
              // Unhide header
              var $thAll = state.$drop.find('.searchbox-table thead th');
              if ($thAll[colIdx]) $thAll[colIdx].classList.remove('coloff');
              // Unhide all existing tbody tds
              $tbody.find('td[data-field="' + fld + '"]').removeClass('coloff');
              // Unhide in template so future clones are visible
              $tpl[0].content.querySelectorAll('td[data-field="' + fld + '"]').forEach(function(td) {
                td.classList.remove('coloff');
              });
              delete hiddenCols[ahi];
              hiddenCount--;
            }
          }
        }
      } else {
        // No-columns fallback — simple div items
        var $item = $('<div class="searchbox-item"></div>');
        $item.attr('data-value', value);
        $item.attr('data-text', text);
        $item.attr('data-index', i);
        $item.text(text);
        if (String(value) === String(state.value)) $item.addClass('searchbox-selected');
        $list.append($item);
      }
    }
    state._prevLen = state.rows.length;
    state._hiddenCols = hiddenCols;

    // Status line
    var loaded = state.rows.length;
    var total = state.total || 0;
    if (total > loaded) {
      $status.html('<span class="searchbox-more" tabindex="-1">Showing ' + loaded + ' of ' + total + ' — click for more</span>');
      $status.show();
    } else if (loaded === 0 && !state.loading) {
      $status.html('<span class="searchbox-empty">No results</span>');
      $status.show();
    } else {
      $status.hide();
    }

    state.hilite = -1;
  }

  // ── Recents (via remember-plugin) ───────────────────────────────────
  var RECENT_PREFIX = 'sbx-recent';

  var RECENT_TTL_MS = 2 * 86400000; // 2 days

  function recentScope(el) {
    var state = getState(el);
    var sbref = state && state.options && state.options._sbref;
    return sbref ? RECENT_PREFIX + ':' + sbref : RECENT_PREFIX;
  }

  function getRecents(el) {
    if (!$.remember) return [];
    var scope = recentScope(el);
    var val = $.remember.get(el, scope);
    if (!Array.isArray(val)) return [];
    var now = Date.now();
    var fresh = val.filter(function(r) { return r._t && (now - r._t) < RECENT_TTL_MS; });
    if (fresh.length !== val.length) $.remember.set(el, fresh, scope);
    return fresh;
  }

  function addRecent(el, row) {
    if (!$.remember) return;
    var state = getState(el);
    if (!state) return;
    var opts = state.options;
    var recents = getRecents(el);
    // Remove duplicate by value
    var val = String(row[opts.valueField]);
    recents = recents.filter(function(r) { return String(r[opts.valueField]) !== val; });
    var max = (state.options && state.options.maxRecents != null) ? state.options.maxRecents : 5;
    var entry = $.extend({}, row, { _t: Date.now() });
    recents.unshift(entry);
    if (recents.length > max) recents = recents.slice(0, max);
    $.remember.set(el, recents, recentScope(el));
  }

  function renderRecents(el) {
    var state = getState(el);
    if (!state || !state.$drop) return;
    var opts = state.options;
    var cols = opts.columns || [];
    var hasCols = cols.length > 0;
    var $recents = state.$drop.find('.searchbox-recents');
    if (!$recents.length) return;

    var recents = getRecents(el);
    var $tbody = hasCols ? $recents.find('tbody') : $recents;
    var $tpl = state.$drop.find('template.searchbox-row-tpl');

    // Clear previous
    if ($tbody.length) $tbody.empty();

    if (!recents.length) {
      $recents.removeClass('has-recents');
      return;
    }

    for (var i = 0; i < recents.length; i++) {
      var row = recents[i];
      var text = row[opts.textField] || '';
      var value = row[opts.valueField] || '';

      if (hasCols && $tpl.length) {
        var tplContent = $tpl[0].content.cloneNode(true);
        var $tr = $(tplContent).find('tr');
        $tr.attr('data-value', value);
        $tr.attr('data-text', text);
        $tr.find('td[data-field]').each(function() {
          var field = this.getAttribute('data-field');
          var val = row[field] != null ? row[field] : '';
          this.textContent = val;
          // Remove coloff for cells that have data (template starts all cols hidden)
          if (val !== '') this.classList.remove('coloff');
        });
        if (String(value) === String(state.value)) $tr.addClass('searchbox-selected');
        $tbody.append(tplContent);
      } else {
        var $item = $('<div class="searchbox-item"></div>');
        $item.attr('data-value', value).attr('data-text', text).text(text);
        if (String(value) === String(state.value)) $item.addClass('searchbox-selected');
        $recents.append($item);
      }
    }
    $recents.addClass('has-recents');
  }

  // ── Highlight navigation ───────────────────────────────────────────
  function hilite(el, index) {
    var state = getState(el);
    if (!state || !state.$drop) return;
    var $items = state.$drop.find('.searchbox-item');
    $items.removeClass('searchbox-hilite');
    if (index < 0) index = $items.length - 1;
    if (index >= $items.length) index = 0;
    state.hilite = index;
    var item = $items.eq(index);
    item.addClass('searchbox-hilite');
    var li = item[0];
    if (li) li.scrollIntoView({ block: 'nearest' });
  }

  // ── Filter value collection ────────────────────────────────────────
  function getFilterValues(el) {
    var state = getState(el);
    if (!state || !state.$drop) return {};
    var vals = {};
    state.$drop.find('[data-filter-field]').each(function() {
      var v = $(this).val();
      if (v != null && v !== '') {
        var field = this.getAttribute('data-filter-field');
        // Textbox inputs use LIKE — select/combobox use exact match
        if (this.tagName === 'INPUT' && this.type !== 'checkbox') {
          vals[field + '_LIKE_'] = v.charAt(v.length - 1) === '%' ? v : v + '%';
        } else {
          vals[field] = v;
        }
      }
    });
    return vals;
  }

  function clearFilters(el) {
    var state = getState(el);
    if (!state || !state.$drop) return;
    state.$drop.find('[data-filter-field]').each(function() {
      if (this.tagName === 'SELECT') this.selectedIndex = 0;
      else $(this).val('');
    });
    updateFilterIndicator(el);
  }

  // ── Active filter indicator ───────────────────────────────────────
  function updateFilterIndicator(el) {
    var state = getState(el);
    if (!state || !state.$drop) return;
    var filters = getFilterValues(el);
    var count = Object.keys(filters).length;
    var $filters = state.$drop.find('.searchbox-filters');
    var $hdr = $filters.find('.searchbox-filters-hdr');
    var $indicator = $hdr.find('.searchbox-filters-count');
    if (count > 0) {
      $filters.addClass('searchbox-filters-active');
      if (!$indicator.length) {
        $indicator = $('<span class="searchbox-filters-count"></span>');
        $hdr.append($indicator);
      }
      $indicator.text(count + ' Active Filter' + (count > 1 ? 's' : ''));
    } else {
      $filters.removeClass('searchbox-filters-active');
      $indicator.remove();
    }
  }

  // ── Server request ─────────────────────────────────────────────────
  function doSearch(el, query, page) {
    var state = getState(el);
    if (!state) return;
    var opts = state.options;

    if (state.loading && state._xhr) {
      state._xhr.abort();
    }

    state.loading = true;
    state.page = page || 1;

    var params = $.extend({}, opts.queryParams || {});
    var sp = opts.searchParam || 'q';
    params[sp] = query + (opts.searchSuffix != null ? opts.searchSuffix : '');

    // Merge active filter values into query params
    var filters = getFilterValues(el);
    $.extend(params, filters);
    params._page = state.page;
    params._rows = opts.pageSize;

    showDropdown(el);
    state.$drop.find('.searchbox-list').show();
    var $status = state.$drop.find('.searchbox-status');
    if (state.page === 1) {
      var $tbody = state.$drop.find('.searchbox-table tbody');
      if ($tbody.length) $tbody.empty();
      else state.$drop.find('.searchbox-list').children('.searchbox-item').remove();
      $status.html('<span class="searchbox-loading">Searching...</span>').show();
    } else {
      $status.html('<span class="searchbox-loading">Loading more...</span>').show();
    }

    state._xhr = $.ajax({
      url: opts.url || '/',
      type: opts.method || 'post',
      data: params,
      dataType: 'json',
      success: function(data) {
        state.loading = false;
        state._xhr = null;

        var rows, total;
        if (data && Array.isArray(data.rows)) {
          rows = data.rows;
          total = data.total || rows.length;
        } else if (Array.isArray(data)) {
          rows = data;
          total = rows.length;
        } else {
          rows = [];
          total = 0;
        }

        if (state.page === 1) {
          state.rows = rows;
        } else {
          state.rows = state.rows.concat(rows);
        }
        state.total = total;

        renderResults(el, state.page > 1);

        if (typeof opts.onLoadSuccess === 'function') {
          opts.onLoadSuccess.call(el, data);
        }
      },
      error: function(xhr, status) {
        state.loading = false;
        state._xhr = null;
        if (status === 'abort') return;

        var $st = state.$drop.find('.searchbox-status');
        $st.html('<span class="searchbox-error">Search failed</span>').show();

        if (typeof opts.onLoadError === 'function') {
          opts.onLoadError.call(el, arguments);
        }
      }
    });
  }

  // ── Auto-populate fields on select ─────────────────────────────────
  function populateFields(el, row) {
    var state = getState(el);
    if (!state) return;
    var fields = state.options.fields;
    if (!fields || !fields.length) return;
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var val = row[f.field] != null ? row[f.field] : '';
      var target = f.name || f.field;
      var $target = $('#' + target);
      if (!$target.length) $target = $('[name="' + target + '"]');
      if ($target.length) $target.val(val);
    }
  }

  // ── Select a result ────────────────────────────────────────────────
  function selectItem(el, value, text) {
    var state = getState(el);
    if (!state) return;
    var opts = state.options;

    state.value = value;
    state.text = text;
    $(el).val(text);

    hideDropdown(el);

    // Find the full row — check search results first, then recents
    var row = null;
    for (var i = 0; i < state.rows.length; i++) {
      if (String(state.rows[i][opts.valueField]) === String(value)) {
        row = state.rows[i];
        break;
      }
    }
    if (!row) {
      var recents = getRecents(el);
      for (var j = 0; j < recents.length; j++) {
        if (String(recents[j][opts.valueField]) === String(value)) {
          row = recents[j];
          break;
        }
      }
    }

    var isFkeyLoad = false;

    if (row) {
      addRecent(el, row);
      renderRecents(el);

      var $el = $(el);
      var $frm = $el.closest('form');

      if ($el.hasClass('fkey') && $frm.length) {
        isFkeyLoad = true;
        $frm.form('fkeyLoad', $el, value);
      } else if (opts.fields && opts.fields.length) {
        populateFields(el, row);
      }
    }

    if (typeof opts.onSelect === 'function') {
      opts.onSelect.call(el, row || { value: value, text: text });
    }

    // Fire 'done' for EUI compatibility (page scripts listen for this)
    $(el).trigger('done', [row || { value: value, text: text }]);

    // Skip change trigger for fkey loads — mode('upd') handles state transition
    if (!isFkeyLoad) $(el).trigger('change');
  }

  // ── Debounced input handler ────────────────────────────────────────
  function onInput(el) {
    var state = getState(el);
    if (!state) return;
    var opts = state.options;
    if (opts.editable === false) {
      $(el).val(state.text || '');
      return;
    }
    var query = $(el).val().trim();

    if (state.timer) clearTimeout(state.timer);

    if (query.length < opts.minChars) {
      state.rows = [];
      state.total = 0;
      hideDropdown(el);
      return;
    }

    state.timer = setTimeout(function() {
      state._lastQuery = query;
      doSearch(el, query, 1);
    }, opts.delay);
  }

  // ── Initialise ─────────────────────────────────────────────────────
  function init(el, options) {
    var state = ensureState(el);
    var parsed = $.fn.searchbox.parseOptions(el);
    state.options = $.extend({}, $.fn.searchbox.defaults, parsed, options);
    // Compatibility aliasing: allow legacy keys to resolve searchbox definition scope.
    // Canonical key remains `sbref`; `sbdef` and `defid` are accepted aliases.
    var resolvedSbref = state.options.sbref || state.options.sbdef || state.options.defid || state.options._sbref;
    if (resolvedSbref) {
      state.options.sbref = resolvedSbref;
      state.options._sbref = resolvedSbref;
    }

    var $el = $(el);

    if (!$el.attr('type') || $el.attr('type') === 'text') {
      $el.attr('type', 'search');
    }

    $el.addClass('easyui-searchbox');

    // Suppress browser autocomplete unless config says otherwise
    if (state.options.autocomplete != null) {
      $el.attr('autocomplete', state.options.autocomplete);
    }

    // Find the server-rendered dropdown (moves it to body)
    findDropdown(el);

    // Init combobox widgets inside dropdown filters (they're outside #content
    // so dataloader-plugin won't find them automatically)
    if (state.$drop && $.fn.combobox) {
      state.$drop.find('select[_sqlid]').each(function() {
        var sqlid = $(this).attr('_sqlid');
        $(this).combobox({ url: '/?_func=get&_combo=y&_sqlid=' + sqlid });
      });
      state.$drop.find('select.combobox').not('[_sqlid]').each(function() {
        if (!$.data(this, 'combobox')) $(this).combobox();
      });
    }

    // Bind events (namespaced for clean destroy)
    $el.off('.duiSearchbox');

    $el.on('input.duiSearchbox', function() {
      onInput(el);
    });

    $el.on('keydown.duiSearchbox', function(e) {
      if (state.options.editable === false && isTextEditKey(e)) {
        e.preventDefault();
        return;
      }

      if (!isOpen(el)) {
        if (e.key === 'Enter' && $el.val().trim().length >= state.options.minChars) {
          e.preventDefault();
          state._lastQuery = $el.val().trim();
          doSearch(el, state._lastQuery, 1);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          hilite(el, (state.hilite < 0 ? 0 : state.hilite + 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          hilite(el, (state.hilite < 0 ? -1 : state.hilite - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (state.hilite >= 0) {
            var $item = state.$drop.find('.searchbox-item').eq(state.hilite);
            if ($item.length) {
              selectItem(el, $item.attr('data-value'), $item.attr('data-text'));
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          hideDropdown(el);
          break;
      }
    });

    $el.on('click.duiSearchbox', function() {
      if (state.options.editable === false) return;
      if (isOpen(el)) return;
      // Clear input on click so user starts fresh
      $el.val('');
      state.rows = [];
      state.total = 0;
      // Show list (table headers visible), clear rows
      state.$drop.find('.searchbox-list').show();
      var $tbody = state.$drop.find('.searchbox-table tbody');
      if ($tbody.length) $tbody.empty();
      state.$drop.find('.searchbox-status').hide();
      renderRecents(el);
      showDropdown(el);
    });

    $el.on('blur.duiSearchbox', function() {
      setTimeout(function() {
        if (!state.$drop || !state.$drop.is(':hover')) {
          hideDropdown(el);
        }
      }, 200);
    });

    // Bind dropdown events
    if (state.$drop) {
      state.$drop.off('.duiSearchbox');

      state.$drop.on('mousedown.duiSearchbox', '.searchbox-item', function(e) {
        e.preventDefault();
        var $item = $(this);
        selectItem(el, $item.attr('data-value'), $item.attr('data-text'));
      });

      state.$drop.on('mouseover.duiSearchbox', '.searchbox-item', function() {
        var $items = state.$drop.find('.searchbox-item');
        var idx = $items.index(this);
        hilite(el, idx);
      });

      state.$drop.on('mousedown.duiSearchbox', '.searchbox-more', function(e) {
        e.preventDefault();
        if (!state.loading && state._lastQuery != null) {
          doSearch(el, state._lastQuery, state.page + 1);
        }
      });

      // Filter accordion toggle
      state.$drop.on('mousedown.duiSearchbox', '.searchbox-filters-hdr', function(e) {
        e.preventDefault();
        state.$drop.find('.searchbox-filters').toggleClass('searchbox-filters-open');
      });

      // Filter apply
      state.$drop.on('mousedown.duiSearchbox', '.searchbox-filters-apply', function(e) {
        e.preventDefault();
        var query = $(el).val().trim();
        if (query.length < state.options.minChars) query = '';
        state._lastQuery = query;
        doSearch(el, query, 1);
        updateFilterIndicator(el);
      });

      // Filter clear
      state.$drop.on('mousedown.duiSearchbox', '.searchbox-filters-clear', function(e) {
        e.preventDefault();
        clearFilters(el);
      });

      // Prevent filter inputs from closing dropdown on focus
      state.$drop.on('mousedown.duiSearchbox', '.searchbox-filter-input', function(e) {
        e.stopPropagation();
      });

      // Enter in filter input triggers apply
      state.$drop.on('keydown.duiSearchbox', '.searchbox-filter-input', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          state.$drop.find('.searchbox-filters-apply').trigger('mousedown');
        }
      });
    }

    // Populate recents section from localStorage
    renderRecents(el);

    if (state.options.disabled) {
      $el.prop('disabled', true);
    }
    applyEditableState(el, state.options.editable);
    if (state.options.readonly) {
      $el.prop('readonly', true);
    }
  }

  // ── jQuery plugin ──────────────────────────────────────────────────
  $.fn.searchbox = function(options, param) {
    if (typeof options === 'string') {
      if (!this.length) return this;
      var method = $.fn.searchbox.methods[options];
      if (method) return method(this, param);
      return this;
    }

    options = options || {};
    return this.each(function() {
      init(this, options);
    });
  };

  // ── Methods ────────────────────────────────────────────────────────
  $.fn.searchbox.methods = {
    options: function(jq) {
      var state = getState(jq[0]);
      return state ? state.options : {};
    },
    getValue: function(jq) {
      var state = getState(jq[0]);
      return state ? state.value : '';
    },
    getText: function(jq) {
      var state = getState(jq[0]);
      return state ? state.text : '';
    },
    setValue: function(jq, value) {
      return jq.each(function() {
        var state = getState(this);
        if (!state) return;
        state.value = value;
        for (var i = 0; i < state.rows.length; i++) {
          if (String(state.rows[i][state.options.valueField]) === String(value)) {
            state.text = state.rows[i][state.options.textField] || '';
            $(this).val(state.text);
            return;
          }
        }
        state.text = '';
        $(this).val('');
      });
    },
    setText: function(jq, text) {
      return jq.each(function() {
        var state = getState(this);
        if (!state) return;
        state.text = text;
        $(this).val(text);
      });
    },
    select: function(jq, value) {
      return jq.each(function() {
        var state = getState(this);
        if (!state) return;
        var opts = state.options || {};
        var row = null;
        var i;
        for (i = 0; i < state.rows.length; i++) {
          if (String(state.rows[i][opts.valueField]) === String(value)) {
            row = state.rows[i];
            break;
          }
        }
        if (!row) {
          var recents = getRecents(this);
          for (i = 0; i < recents.length; i++) {
            if (String(recents[i][opts.valueField]) === String(value)) {
              row = recents[i];
              break;
            }
          }
        }
        var text = row ? (row[opts.textField] != null ? row[opts.textField] : (row.text != null ? row.text : value)) : value;
        selectItem(this, value, text);
      });
    },
    loadData: function(jq, data) {
      return jq.each(function() {
        var state = getState(this);
        if (!state) return;
        if (Array.isArray(data)) state.rows = data;
      });
    },
    reselect: function(jq) {
      return jq.each(function() {
        var state = getState(this);
        if (!state || !state.value) return;
        selectItem(this, state.value, state.text || state.value);
      });
    },
    loadForm: function(jq, value) {
      // qbe compatibility alias: preserve expected programmatic select/load behavior.
      return $.fn.searchbox.methods.select(jq, value);
    },
    clear: function(jq) {
      return jq.each(function() {
        var state = getState(this);
        if (!state) return;
        state.value = '';
        state.text = '';
        state.rows = [];
        state.total = 0;
        $(this).val('');
        hideDropdown(this);
      });
    },
    enable: function(jq) {
      return jq.each(function() {
        $(this).prop('disabled', false);
        var state = getState(this);
        if (state) state.options.disabled = false;
      });
    },
    disable: function(jq) {
      return jq.each(function() {
        $(this).prop('disabled', true);
        hideDropdown(this);
        var state = getState(this);
        if (state) state.options.disabled = true;
      });
    },
    editable: function(jq, mode) {
      return jq.each(function() {
        applyEditableState(this, mode !== false);
      });
    },
    reload: function(jq, query) {
      return jq.each(function() {
        var state = getState(this);
        if (!state) return;

        var q;
        if (query == null) {
          q = state._lastQuery;
          if (q == null || q === '') q = ($(this).val() || '').trim();
        } else {
          q = String(query);
          $(this).val(q);
        }

        state._lastQuery = q;
        doSearch(this, q, 1);
      });
    },
    readonly: function(jq, mode) {
      return jq.each(function() {
        $(this).prop('readonly', mode !== false);
      });
    },
    textbox: function(jq) {
      return jq.eq(0);
    },
    destroy: function(jq) {
      return jq.each(function() {
        var state = getState(this);
        if (state) {
          if (state.timer) clearTimeout(state.timer);
          if (state._xhr) state._xhr.abort();
          if (state.$drop) state.$drop.remove();
        }
        $(this).off('.duiSearchbox');
        $.removeData(this, 'searchbox');
      });
    }
  };

  // ── Parse options from DOM attributes ──────────────────────────────
  $.fn.searchbox.parseOptions = function(target) {
    var $t = $(target);
    var dopts = {};

    // Parse data-searchbox config (base64-encoded JSON from pug mixin)
    var jsonCfg = $t.attr('data-searchbox');
    if (jsonCfg) {
      try { dopts = JSON.parse(atob(jsonCfg)); } catch(e) {}
    }

    // Parse data-options string (EUI-style, lower priority)
    var raw = $t.attr('data-options');
    if (raw) {
      try {
        var eopts = new Function('return ({' + raw + '})')();
        dopts = $.extend(dopts, eopts);
      } catch(e) {}
    }

    return $.extend({}, {
      url: $t.attr('url') || undefined,
      valueField: $t.attr('valueField') || undefined,
      textField: $t.attr('textField') || undefined
    }, dopts);
  };

  // ── Defaults ───────────────────────────────────────────────────────
  $.fn.searchbox.defaults = {
    valueField: 'value',
    textField: 'text',
    url: null,
    method: 'post',
    queryParams: {},
    columns: null,
    fields: null,
    pageSize: 25,
    delay: 300,
    minChars: 2,
    searchParam: 'q',
    searchSuffix: '',
    maxRecents: 5,
    autocomplete: 'off',
    disabled: false,
    editable: true,
    readonly: false,
    formatter: null,
    onSelect: null,
    onLoadSuccess: null,
    onLoadError: null
  };

  // ── Auto-init: input[eui=searchbox] ────────────────────────────────
  $(document).on('dui:contentloaded', function(e, $panel) {
    var root = ($panel && $panel[0]) || document;
    $(root).find('input[eui="searchbox"], .easyui-searchbox').each(function() {
      if (!getState(this)) $(this).searchbox();
    });
  });

})(jQuery);
