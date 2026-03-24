/**
 * Pure4 Combobox Helper - DaisyUI/jQuery API Shim
 * 
 * Extends the base 'combo' plugin to add specific Combobox features:
 * - Remote data loading (url, method, queryParams)
 * - Filtering (mode='remote'|'local')
 * - Value mapping (valueField, textField)
 * 
 * Dependencies: combo-plugin.js
 */
(function($) {
  'use strict';

  // Ensure combo is loaded
  if (!$.fn.combo) {
    console.error('combobox-plugin.js requires combo-plugin.js');
    return;
  }

  // ===========================================================================
  // .edit — editable option list (add/edit items via modal)
  // Mirrors EUI's easyui-combobox edit class from eui.extend.js:982-1081.
  // The combo's value IS the JSON array of options — used by bhave config pages.
  //
  // Data flow:
  //   1. Name moves from <select> to a sibling <input type="hidden">
  //   2. Form plugin loads data → sets hidden input value (JSON string)
  //   3. dui:dataloaded fires → we parse JSON → loadData into select
  //   4. User edits via modal → updates select options + serializes back to hidden
  // ===========================================================================
  var EDIT_DEFAULT_FIELDS = [{ type: 'textbox', label: 'Text', id: 'text' }];

  function initEditCombo(sel, state) {
    var $el = $(sel);
    if (!$el.hasClass('edit') || state._editInit) return;
    state._editInit = true;

    var opts = state.options;
    if (!opts.fields) opts.fields = EDIT_DEFAULT_FIELDS;

    // Move name and id from select to hidden input so form plugin sets JSON there.
    // findField() matches by [name] and #id — both must point to the hidden input.
    var name = $el.attr('name');
    var id = $el.attr('id');
    state._editName = name;
    var $hidden = $('<input type="hidden" data-edit-combo/>').attr('name', name);
    if (id) { $hidden.attr('id', id); $el.removeAttr('id'); }
    $el.after($hidden);
    $el.removeAttr('name');
    state._editHidden = $hidden;

    // Inject add/edit icons into fitem-suf
    var $suf = $el.closest('.fitem-body').find('.fitem-suf');
    if (!$suf.length) return;

    var addIcon = $.dui.icon('plus', { size: 'sm', color: 'text-primary', cls: 'cursor-pointer edit-add' });
    var editIcon = $.dui.icon('pencil', { size: 'sm', color: 'text-secondary', cls: 'cursor-pointer edit-mod' });
    if (!addIcon || !editIcon) return;

    $suf.prepend(editIcon);
    $suf.prepend(addIcon);
    if (window.lucide) lucide.createIcons({ nodes: [addIcon, editIcon] });

    // Track selected record
    var selectedRec = null;
    $el.on('change.editCombo', function() {
      selectedRec = findRow(state, $el.val());
    });

    // Lazy-create modal
    var ebox = null;
    var isEditMode = false;
    var comboId = id || name || 'edit';

    function getEditBox() {
      if (ebox) return ebox;
      ebox = dynDialog(
        { id: comboId + '_ebox', title: 'Edit Item', fields: opts.fields, titlebar: true },
        [
          { text: 'Save', iconCls: 'check', handler: function() { onSave(); } },
          { text: 'Close', iconCls: 'x', handler: function() { ebox.modal('close'); } }
        ]
      );
      return ebox;
    }

    function onSave() {
      var form = ebox.modal('form');
      var fdat = frm2dic(form);
      if (!fdat.value) fdat.value = fdat.text; // text-only combos
      var cdat = (state.data || []).slice();

      if (isEditMode && selectedRec) {
        for (var i = 0; i < cdat.length; i++) {
          if (cdat[i] === selectedRec) { cdat[i] = fdat; selectedRec = fdat; break; }
        }
      } else {
        cdat.push(fdat);
      }

      loadData(sel, cdat);
      $el.combobox('select', fdat.value);
      $hidden.val(JSON.stringify(state.data || []));
      ebox.modal('close');
    }

    // Add icon click (delegated — Lucide replaces span with svg, losing direct bindings)
    $suf.on('click', '.edit-add', function() {
      var dlg = getEditBox();
      isEditMode = false;
      var form = dlg.modal('form');
      if (form.length) form[0].reset();
      dlg.modal('open');
    });

    // Edit icon click
    $suf.on('click', '.edit-mod', function() {
      if (!selectedRec) return;
      var dlg = getEditBox();
      isEditMode = true;
      var form = dlg.modal('form');
      if (form.length) {
        form[0].reset();
        for (var k in selectedRec) {
          var inp = form.find('[name="' + k + '"]');
          if (inp.length) {
            if (inp.is('select')) inp.combobox('setValue', selectedRec[k]);
            else inp.val(selectedRec[k]);
          }
        }
      }
      dlg.modal('open');
    });
  }

  // After form data loads, parse JSON from edit combo hidden inputs → load into selects
  $(document).on('dui:dataloaded', function() {
    $('input[type="hidden"][data-edit-combo]').each(function() {
      var $hidden = $(this);
      var raw = $hidden.val();
      if (!raw) return;
      try {
        var data = JSON.parse(raw);
        if (!Array.isArray(data)) return;
        // Find the sibling select (edit combo is immediately before the hidden)
        var $sel = $hidden.prev('select');
        if (!$sel.length) return;
        loadData($sel[0], data);
      } catch (e) { /* not JSON */ }
    });
  });

  // ===========================================================================
  // Boolean combo icon — check/x indicator in fitem-suf slot
  // ===========================================================================
  var boolPositive = ['yes','y','true','1','active','on','enabled'];
  var boolNegative = ['no','n','false','0','inactive','off','disabled'];

  function isBoolCombo(sel) {
    var opts = sel.options;
    var real = [];
    for (var i = 0; i < opts.length; i++) {
      if (!(opts[i].disabled && opts[i].defaultSelected)) real.push(opts[i]);
    }
    if (real.length !== 2) return false;
    var t0 = (real[0].text || '').toLowerCase().trim();
    var t1 = (real[1].text || '').toLowerCase().trim();
    return (boolPositive.indexOf(t0) !== -1 && boolNegative.indexOf(t1) !== -1) ||
           (boolNegative.indexOf(t0) !== -1 && boolPositive.indexOf(t1) !== -1);
  }

  function updateBoolIcon(sel) {
    var $suf = $(sel).closest('.fitem-body').find('.fitem-suf');
    if (!$suf.length) return;
    var opt = sel.options[sel.selectedIndex];
    if (!opt || opt.disabled) { $suf.find('.bool-icon').remove(); return; }
    var val = (opt.text || '').toLowerCase().trim();
    if (!val) { $suf.find('.bool-icon').remove(); return; }
    var isPositive = boolPositive.indexOf(val) !== -1;
    var icon = $.dui.icon(isPositive ? 'check' : 'x', {
      color: isPositive ? 'text-success' : 'text-error',
      bold: true
    });
    $suf.find('.bool-icon').remove();
    if (icon) { icon.classList.add('bool-icon'); $suf.prepend(icon); lucide.createIcons({ nodes: [icon] }); }
  }

  // User interaction — delegated for dynamically created combos
  document.addEventListener('change', function(e) {
    if (e.target.tagName === 'SELECT' && e.target.hasAttribute('data-bool-icon')) updateBoolIcon(e.target);
  });

  // Programmatic load (form-plugin sets .val() without firing change)
  $(document).on('dui:dataloaded', function() {
    $('select[data-bool-icon]').each(function() { updateBoolIcon(this); });
  });

  // AJAX-loaded pages: auto-init bool icons + .colours combos in new content
  $(document).on('dui:contentloaded', function(e, $panel) {
    var root = ($panel && $panel[0]) || document;
    var selects = root.querySelectorAll('select');
    for (var i = 0; i < selects.length; i++) {
      if (isBoolCombo(selects[i])) {
        selects[i].setAttribute('data-bool-icon', '');
        updateBoolIcon(selects[i]);
      }
    }
    // Auto-init .edit combos (editable option lists)
    $(root).find('select.edit').each(function() {
      if (!$.data(this, 'combobox')) $(this).combobox({});
    });
    // Auto-init .colours combos with built-in colour palette
    $(root).find('select.colours').each(function() {
      var state = $.data(this, 'combobox');
      if (!state || !state._coloursInit) {
        $(this).combobox({ data: COLOUR_DATA });
      }
    });
  });

  // After form data loads, apply colour styles to .colours combos
  $(document).on('dui:dataloaded', function() {
    $('select.colours').each(function() { applyColourStyles(this); });
  });

  // ===========================================================================
  // .colours — built-in colour-picker combo
  // ===========================================================================
  var COLOUR_DATA = [
    {value:'bg-brn',text:'Brown',hex:'#EACDC1'},
    {value:'bg-red',text:'Red',hex:'#FFB5B5'},
    {value:'bg-ora',text:'Orange',hex:'#FFE1C6'},
    {value:'bg-yel',text:'Yellow',hex:'#FFFFC8'},
    {value:'bg-grn',text:'Green',hex:'#CAFFD8'},
    {value:'bg-cyn',text:'Cyan',hex:'#B8E2EF'},
    {value:'bg-blu',text:'Blue',hex:'#D0E6FF'},
    {value:'bg-pur',text:'Purple',hex:'#E8C6FF'},
    {value:'bg-gry',text:'Grey',hex:'#DDDDDD'},
    {value:'bg-sil',text:'Silver',hex:'#FAFAFA'},
    {value:'bg-clr',text:'Clear',hex:''}
  ];
  var COLOUR_HEX = {};
  COLOUR_DATA.forEach(function(c){ COLOUR_HEX[c.value] = c.hex; });

  function applyColourStyles(target) {
    var $el = $(target);
    // style each <option>
    $el.find('option').each(function(){
      var hex = COLOUR_HEX[this.value];
      if (hex) { this.style.backgroundColor = hex; this.style.color = '#333'; }
    });
    // style the <select> for current value
    var hex = COLOUR_HEX[$el.val()] || '';
    target.style.backgroundColor = hex;
    target.style.color = hex ? '#333' : '';
  }

  /**
   * Main Plugin Function
   */
  $.fn.combobox = function(options, param) {
    if (typeof options === 'string') {
      if (!this.length) return this;
      var method = $.fn.combobox.methods[options];
      if (method) {
        return method(this, param);
      } else {
        return this.combo(options, param);
      }
    }

    options = options || {};
    return this.each(function() {
      var state = $.data(this, 'combobox');
      if (state) {
        $.extend(state.options, options);
      } else {
        state = $.data(this, 'combobox', {
          options: $.extend({}, $.fn.combobox.defaults, $.fn.combobox.parseOptions(this), options),
          data: []
        });
      }

      var $el = $(this);

      // Initialize base combo for non-select elements
      if (!$el.is('select')) {
        $(this).combo(state.options);
      }

      // Load initial data
      if (state.options.data && state.options.data.length) {
        loadData(this, state.options.data);
      } else {
        var parsed = $.fn.combobox.parseData(this);
        if (parsed.length) loadData(this, parsed);
      }

      // Load data if url is present
      if (state.options.url) {
        request(this);
      }

      // Bool icon: detect boolean combo and mark for icon updates
      if ($el.is('select') && isBoolCombo(this)) {
        this.setAttribute('data-bool-icon', '');
        updateBoolIcon(this);
      }

      // .colours: auto-load colour palette and apply styles
      if ($el.hasClass('colours') && !state._coloursInit) {
        state._coloursInit = true;
        if (!state.options.data || !state.options.data.length) {
          loadData(this, COLOUR_DATA);
        }
        applyColourStyles(this);
      }

      // .edit: editable option list with add/edit icons
      if ($el.hasClass('edit')) {
        initEditCombo(this, state);
      }

      // Bind change -> onSelect
      var isColours = $el.hasClass('colours');
      $el.off('change.duiCombobox').on('change.duiCombobox', function() {
        var val = $el.val();
        var row = findRow(state, val);
        if (row) {
          state.options.onSelect.call(this, row);
        }
        if (isColours) applyColourStyles(this);
      });

      // .remember — persist selected value across page loads
      if ($.remember && $el.hasClass('remember') && !state._rememberBound) {
        state._rememberBound = true;
        var saved = $.remember.get($el);
        if (saved !== null) {
          // Remote-data combos (fkey/_sqlid/url) haven't loaded yet — defer via autoload
          if ($el.hasClass('fkey') || $el.attr('_sqlid') || state.options.url) {
            state.options.autoload = saved;
          } else {
            $el.combobox('select', saved);
          }
        }
        $el.on('change.remember', function() {
          $.remember.set($el, $el.combobox('getValue'));
        });
      }

      // Nav buttons: prev/next record cycling
      var $navBtns = $el.closest('.join').find('.combobox-nav');
      if ($navBtns.length) {
        $navBtns.off('click.duiCombobox').on('click.duiCombobox', function() {
          var dir = parseInt($(this).attr('data-dir'), 10) || 0;
          var idx = $el[0].selectedIndex + dir;
          // Skip disabled placeholder (index 0)
          if (idx <= 0 && $el[0].options[0] && $el[0].options[0].disabled) idx = 1;
          if (idx < 0) idx = 0;
          if (idx >= $el[0].options.length) idx = $el[0].options.length - 1;
          if (idx !== $el[0].selectedIndex) {
            $el[0].selectedIndex = idx;
            $el.trigger('change');
          }
        });
      }
    });
  };

  /**
   * Data Loader
   */
  function ensureComboboxState(target) {
    var state = $.data(target, 'combobox');
    if (!state) {
      $(target).combobox({});
      state = $.data(target, 'combobox');
    }
    return state || null;
  }

  function request(target, url, param) {
    var state = ensureComboboxState(target);
    if (!state) return;
    var opts = state.options;
    
    if (url) opts.url = url;
    param = param || {};
    
    var queryParams = $.extend({}, opts.queryParams, param);

    if (opts.onBeforeLoad.call(target, queryParams) == false) return;

    if (opts.loader && typeof opts.loader === 'function') {
      opts.loader.call(target, queryParams, function(data) {
        loadData(target, data);
        opts.onLoadSuccess.call(target, data);
      }, function() {
        opts.onLoadError.apply(target, arguments);
      });
      return;
    }

    // Derive URL from _sqlid attribute if no explicit url
    if (!opts.url) {
      var sqlid = $(target).attr('_sqlid');
      if (sqlid) opts.url = '/?_func=get&_sqlid=' + sqlid;
    }
    if (!opts.url) return;

    ajaxget('', queryParams, function(data) {
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) {}
      }
      loadData(target, data);
      opts.onLoadSuccess.call(target, data);
    }, {
      url: opts.url,
      method: opts.method || 'post',
      dataType: 'json',
      error: function() {
        opts.onLoadError.apply(target, arguments);
      }
    });
  }

  function loadData(target, data) {
    var state = ensureComboboxState(target);
    if (!state) return;
    var opts = state.options;
    state.data = opts.loadFilter ? opts.loadFilter.call(target, data) : data;
    if (!Array.isArray(state.data)) state.data = [];

    // Update combo data
    if (!$(target).is('select')) {
      $(target).combo('options', { data: state.data });
    }
    // If select element, populate options directly
    var $el = $(target);
    if ($el.is('select')) {
      var vf = opts.valueField || 'value';
      var tf = opts.textField || 'text';
      var placeholder = $el.find('option[disabled][selected]').first().clone();
      $el.empty();
      var hasPlaceholder = placeholder && placeholder.length;
      if (hasPlaceholder) $el.append(placeholder);
      var hasExplicitSelect = false;
      (state.data || []).forEach(function(row) {
        var value = row[vf];
        var text = row[tf];
        if (value === undefined || value === null) value = row.value || row.VALUE || row.id || row.ID || '';
        if (text === undefined || text === null) text = row.text || row.TEXT || row.name || row.NAME || value || '';
        var opt = $('<option/>').val(value).text(text);
        if (row.selected) { opt.prop('selected', true); hasExplicitSelect = true; }
        $el.append(opt);
      });
      // Don't auto-select first option — keep empty unless explicitly selected
      if (!hasExplicitSelect && !hasPlaceholder && !opts.autoload) {
        $el[0].selectedIndex = -1;
      }
    }
    opts.onLoadSuccess.call(target, data);

    // Auto-select pending value after options are populated
    if (opts.autoload) {
      var val = opts.autoload;
      delete opts.autoload;
      $(target).combobox('select', val);
    }

    // .first/.last class — auto-select first or last non-placeholder option
    var $t = $(target);
    if ($t.is('select') && !opts.autoload) {
      var selOpts = target.options;
      var skip = (selOpts[0] && selOpts[0].disabled && selOpts[0].defaultSelected) ? 1 : 0;
      if ($t.hasClass('first') && selOpts.length > skip && target.selectedIndex < skip) {
        target.selectedIndex = skip;
        $t.trigger('change');
      } else if ($t.hasClass('last') && selOpts.length > skip && target.selectedIndex < skip) {
        target.selectedIndex = selOpts.length - 1;
        $t.trigger('change');
      }
    }
  }

  function findRow(state, value) {
    var opts = state.options;
    var data = state.data || [];
    for (var i = 0; i < data.length; i += 1) {
      if ((data[i][opts.valueField] + '') === (value + '')) return data[i];
    }
    return null;
  }

  function rowsOf(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.rows)) return data.rows;
    return [];
  }

  function resolveModuleId($cbo) {
    var $form = $cbo.closest('form');
    var sqlid = $form.attr('_sqlid') || '';
    if (sqlid.indexOf('^') > -1) return sqlid.split('^')[0];

    if (typeof getapp === 'function') {
      try {
        var app = getapp() || '';
        if (app.indexOf('^') > -1) return app.split('^')[0];
      } catch (e) {}
    }
    return '';
  }

  function requestJson(params, cb) {
    ajaxget('', params, function(data) {
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) {}
      }
      cb(data);
    }, {
      method: 'post',
      dataType: 'json',
      error: function() { cb(null); }
    });
  }

  function formatNngSuffix(suffix) {
    if (!suffix) return '';
    var now = new Date();
    var y4 = String(now.getFullYear());
    var y2 = y4.slice(-2);
    var m = String(now.getMonth() + 1);
    var d = String(now.getDate());
    var m2 = m.length < 2 ? ('0' + m) : m;
    var d2 = d.length < 2 ? ('0' + d) : d;

    return String(suffix)
      .replace(/\$Y4/g, y4)
      .replace(/\$Y2/g, y2)
      .replace(/\$Y/g, y4)
      .replace(/\$M2/g, m2)
      .replace(/\$M/g, m)
      .replace(/\$D2/g, d2)
      .replace(/\$D/g, d);
  }

  function buildNngValue(rec) {
    if (!rec) return '';
    var num = parseInt(rec.NEXT_NUMBER, 10);
    if (isNaN(num)) return '';

    var places = parseInt(rec.DECIMAL_PLACES, 10);
    if (isNaN(places)) places = 0;

    var lead = String(rec.LEADING_ZEROS || '').toUpperCase() === 'Y';
    var seq = String(num);
    if (lead && places > 0) seq = seq.padStart(places, '0');

    var prefix = rec.PREFIX || '';
    var suffix = formatNngSuffix(rec.SUFFIX || '');
    return String(prefix) + seq + suffix;
  }

  // Resolve next-number for fkey.autonum by matching NNG COLUMN_NAME to field name.
  // Async by design: sync XHR is unreliable in modern browsers and can return before callbacks fire.
  function resolveAutonumValue($cbo, done) {
    done = typeof done === 'function' ? done : function() {};
    var mod = resolveModuleId($cbo);
    var fieldName = ($cbo.attr('name') || $cbo.attr('comboname') || '').toUpperCase();
    if (!mod || !fieldName) return done('');

    requestJson({
      _func: 'get',
      _sqlid: mod + '^nng',
      _combo: 'y'
    }, function(typesRaw) {
      var types = rowsOf(typesRaw);
      if (!types.length) return done('');

      var fallback = null;
      function walk(i) {
        if (i >= types.length) return done(buildNngValue(fallback));

        var t = types[i] || {};
        var typeVal = t.value || t.text || t.TYPE;
        if (!typeVal) return walk(i + 1);

        requestJson({
          _func: 'get',
          _sqlid: mod + '^nngall',
          TYPE: typeVal
        }, function(rec) {
          if (!rec || rec.error) return walk(i + 1);
          if (Array.isArray(rec)) rec = rec[0] || null;
          if (!rec) return walk(i + 1);

          var col = String(rec.COLUMN_NAME || '').toUpperCase();
          if (!fallback) fallback = rec;
          if (col && col === fieldName) return done(buildNngValue(rec));
          walk(i + 1);
        });
      }
      walk(0);
    });
  }

  /**
   * Methods
   */
  $.fn.combobox.methods = {
    options: function(jq) {
      var state = $.data(jq[0], 'combobox');
      if (!state) return $.fn.combobox.defaults;
      return state.options;
    },
    getData: function(jq) {
      var state = $.data(jq[0], 'combobox');
      return state ? state.data : [];
    },

    // ---- getRec: return the full data row for the current value ----
    getRec: function(jq) {
      var state = $.data(jq[0], 'combobox');
      if (!state) return null;
      var val = $(jq[0]).val();
      if (val === '' || val === undefined || val === null) return null;
      return findRow(state, val);
    },

    // ---- formLoad: fkey combo triggers form load ----
    formLoad: function(jq) {
      return jq.each(function() {
        var $cbo = $(this);
        var rec = $.fn.combobox.methods.getRec($cbo);
        if (!rec || !$cbo.hasClass('fkey')) return;

        var $frm = $cbo.closest('form');
        if (!$frm.length) return;

        var val = rec[$cbo.combobox('options').valueField] || rec.value || '';
        if (!val) return;

        $frm.form('fkeyLoad', $cbo, val);
        $cbo.trigger('done', rec);
      });
    },

    // ---- editbox: toggle between combo (select) and text (add-new) mode ----
    // Uses <template data-editbox> sibling rendered by input.pug for fkey combos.
    // data-id attribute links the select/input pair; real id moves to the active element.
    editbox: function(jq, reset) {
      return jq.each(function() {
        var $cbo = $(this);
        var $parent = $cbo.parent();
        var dataId = $cbo.attr('data-id');

        if (reset) {
          // --- Exit add mode: remove textbox, restore select ---
          var $editInput = $parent.find('.fkey-editbox');
          var editVal = $editInput.length ? $editInput.val() : '';
          if (!editVal) editVal = $cbo.data('dui-autonum') || '';
          if ($editInput.length) {
            $editInput.remove();
            // Restore id, show + enable select
            if (dataId) $cbo.attr('id', dataId);
            $cbo.prop('disabled', false).show();
          }
          // Reload combo data (new record now in list), then auto-select
          var opts = $cbo.combobox('options');
          var selectVal = editVal || $cbo.combobox('getValue');
          if (typeof reset === 'string') selectVal = reset;
          opts.loaded = false;
          // QBE-backed selects have no combobox URL and paged data may not
          // include the new record — inject option directly and select it.
          var qbeState = $.data($cbo[0], 'qbe');
          if (!opts.url && !$cbo.attr('_sqlid') && qbeState && selectVal) {
            if (!$cbo.find('option[value="' + selectVal + '"]').length) {
              $cbo.append($('<option>').val(selectVal).text(selectVal));
            }
            $cbo.val(selectVal);
            $cbo.trigger('change');
          } else {
            opts.autoload = selectVal;
            $cbo.combobox('reload');
          }
          $cbo.removeData('dui-autonum');
        } else {
          // --- Enter add mode: show textbox, hide select ---
          var $existing = $parent.find('.fkey-editbox');
          if ($existing.length) {
            // Already in edit mode — just clear and focus (idempotent)
            $existing.val('');
            if ($cbo.hasClass('autonum')) {
              $existing.prop('readonly', true);
              var existingTicket = String(Date.now()) + ':' + Math.random();
              $existing.attr('data-autonum-ticket', existingTicket);
              resolveAutonumValue($cbo, function(nextExisting) {
                if (!$existing.closest('html').length) return;
                if ($existing.attr('data-autonum-ticket') !== existingTicket) return;
                if (nextExisting) {
                  $existing.val(nextExisting);
                  $cbo.data('dui-autonum', nextExisting);
                } else {
                  $cbo.removeData('dui-autonum');
                }
              });
            }
            $existing.focus();
            return;
          }
          var $tpl = $parent.find('template[data-editbox]');
          if (!$tpl.length) {
            // No template — fallback to focusFirst
            var $frm = $cbo.closest('form');
            if ($frm.length) $frm.form('focusFirst');
            return;
          }
          // Clone input from template
          var $input = $($tpl[0].content.firstElementChild.cloneNode(true));
          // Move real id from select to input
          if (dataId) {
            $cbo.removeAttr('id');
            $input.attr('id', dataId);
          }
          // Hide + disable select (removes from serialization)
          $cbo.prop('disabled', true).hide();
          // Insert input and focus
          $tpl.before($input);
          if ($cbo.hasClass('autonum')) {
            $input.prop('readonly', true);
            var ticket = String(Date.now()) + ':' + Math.random();
            $input.attr('data-autonum-ticket', ticket);
            resolveAutonumValue($cbo, function(next) {
              if (!$input.closest('html').length) return;
              if ($input.attr('data-autonum-ticket') !== ticket) return;
              if (next) {
                $input.val(next);
                $cbo.data('dui-autonum', next);
              } else {
                $cbo.removeData('dui-autonum');
              }
            });
          }
          setTimeout(function() { $input.focus(); });
        }
      });
    },

    loadData: function(jq, data) {
      return jq.each(function() {
        loadData(this, data);
      });
    },
    reload: function(jq, url) {
      return jq.each(function() {
        request(this, url);
      });
    },
    setValues: function(jq, values) {
      return jq.each(function() {
        var $el = $(this);
        if ($el.is('select') && $el.prop('disabled')) {
          var $edit = $el.parent().find('.fkey-editbox').first();
          if ($edit.length) {
            $edit.val($.isArray(values) ? values[0] : values);
            return;
          }
        }
        var prev = $el.val();
        var val = $.isArray(values) ? values[0] : values;
        if ($el.is('select') && $el.prop('multiple') && $.isArray(values)) {
          $el.val(values);
        } else {
          $el.val(val);
        }
        // If value didn't stick (option not yet loaded), queue for autoload
        if (val && $el.is('select') && $el.val() !== val) {
          var state = $.data(this, 'combobox');
          if (state) state.options.autoload = val;
        }
        // Fire change so cascading onSelect handlers run (matches EUI behavior)
        // Suppress during form load — onSelect should not fire for programmatic setValue
        var $frm = $el.closest('form');
        var fst = $frm.length && $.data($frm[0], 'form');
        if ($el.val() !== prev && !(fst && fst.options.loading)) $el.trigger('change');
      });
    },
    setValue: function(jq, value) {
      return jq.each(function() {
        $(this).combobox('setValues', $.isArray(value) ? value : [value]);
      });
    },
    getValue: function(jq) {
      var $el = jq.eq(0);
      if ($el.is('select') && $el.prop('disabled')) {
        var $edit = $el.parent().find('.fkey-editbox').first();
        if ($edit.length) return $edit.val() || '';
      }
      if ($el.is('select') && $el.prop('multiple')) {
        var vals = $el.val() || [];
        return vals.length ? vals[0] : '';
      }
      return $el.val() || '';
    },
    getValues: function(jq) {
      var $el = jq.eq(0);
      if ($el.is('select') && $el.prop('multiple')) {
        return $el.val() || [];
      }
      var v = $el.val();
      return v ? [v] : [];
    },
    clear: function(jq) {
      return jq.each(function() {
        $(this).val('');
      });
    },
    reset: function(jq) {
      return jq.each(function() {
        $(this).val('');
      });
    },
    select: function(jq, value) {
      return jq.each(function() {
        var $el = $(this);
        $el.val(value);
        var state = $.data(this, 'combobox');
        if (state) {
          var row = findRow(state, value);
          if (row) state.options.onSelect.call(this, row);
        }
        if ($el.hasClass('colours')) applyColourStyles(this);
      });
    },
    unselect: function(jq, value) {
      return jq.each(function() {
        var $el = $(this);
        if ($el.is('select') && $el.prop('multiple')) {
          var vals = $el.val() || [];
          $el.val($.grep(vals, function(v){ return (v + '') !== (value + ''); }));
        } else {
          if ($el.val() + '' === value + '') $el.val('');
        }
      });
    },
    // ---- exists: check if value exists in loaded data ----
    exists: function(jq, value) {
      if (value === undefined) value = $(jq[0]).val();
      var state = $.data(jq[0], 'combobox');
      if (!state) return false;
      return !!findRow(state, value);
    },
    sort: function(jq, opts) {
      return jq.each(function() {
        var state = ensureComboboxState(this);
        if (!state || !state.data || !state.data.length) return;
        var $el = $(this);
        var prevVal = $el.combobox('getValue');
        if (!prevVal && $.remember && $el.hasClass('remember')) {
          prevVal = $.remember.get($el) || '';
        }
        var field = (opts && opts.field) || state.options.textField || 'text';
        var dir = (opts && opts.order === 'desc') ? -1 : 1;
        state.data.sort(function(a, b) {
          var av = (a[field] || '') + '', bv = (b[field] || '') + '';
          return dir * av.localeCompare(bv);
        });
        loadData(this, state.data);
        if (prevVal) $el.combobox('select', prevVal);
      });
    },
    textbox: function(jq) {
      return jq.eq(0);
    },
    panel: function(jq) {
      return $();
    },
    enable: function(jq) {
      return jq.each(function() { $(this).prop('disabled', false); });
    },
    disable: function(jq) {
      return jq.each(function() { $(this).prop('disabled', true); });
    },
    destroy: function(jq) {
      return jq.each(function() {
        $(this).off('.duiCombobox');
        $.removeData(this, 'combobox');
      });
    },

    // ---- aliases for EUI compatibility ----
    find: function(jq, param) {
      var val = param && param.value !== undefined ? param.value : param;
      return $.fn.combobox.methods.exists(jq, val);
    },
    toText: function(jq) {
      return $.fn.combobox.methods.editbox(jq);
    },
    toCombo: function(jq) {
      return $.fn.combobox.methods.editbox(jq, true);
    },
    sticky: function(jq) {
      return jq; // noop — native select has no scrollable panel
    },
    required: function(jq, val) {
      return jq.each(function() {
        $(this).prop('required', val !== undefined ? val : true);
      });
    },

    // ---- filtertip: filter tooltip with checkboxes modifying queryParams ----
    filtertip: function(jq, opts) {
      return jq.each(function() {
        var cbo = $(this);
        var pageId = ($.page && $.page.state && $.page.state.pageId) || '';
        var cookid = pageId + '^' + cbo.attr('id');
        opts['default'] = opts['default'] || null;
        var cooks = getacook(cookid, opts['default']);

        // Set initial queryParams from saved/default selections
        var state = ensureComboboxState(this);
        if (state) {
          if (!state.options.queryParams) state.options.queryParams = {};
          state.options.queryParams[opts.field] = cooks.join(',');
        }

        // Build filter button with Lucide icon
        var $fitem = cbo.closest('.fitem');
        var $label = $fitem.find('label').first();
        var $wrap = $('<div class="dropdown dropdown-bottom"/>');
        var $btn = $('<button type="button" tabindex="0" class="cbo-filter-btn"/>');
        var icon = $.dui.icon('list-filter', { size: 14, color: 'text-primary opacity-60' });
        if (icon) $btn.append(icon);
        $wrap.append($btn);

        // Build dropdown content with checkboxes
        var $menu = $('<div tabindex="0" class="dropdown-content bg-base-100 rounded-box shadow-md z-50 p-2 min-w-40"/>');
        (opts.data || []).forEach(function(item) {
          var checked = cooks.indexOf(item.name) !== -1 && !item.nosave;
          var $row = $('<label class="flex items-center gap-2 py-0.5 cursor-pointer text-sm"/>');
          var $chk = $('<input type="checkbox" class="checkbox checkbox-xs checkbox-primary"/>');
          $chk.attr('name', item.name);
          if (checked) $chk.prop('checked', true);
          $row.append($chk).append($('<span/>').text(item.text));
          $menu.append($row);
        });
        $wrap.append($menu);

        // Insert after label
        $label.after($wrap);
        if (icon) lucide.createIcons({ nodes: [icon] });

        // Checkbox change handler
        $menu.on('change', 'input[type="checkbox"]', function(e) {
          var $checks = $menu.find('input[type="checkbox"]');
          // Single-select: uncheck others
          if (opts.singleSelect) {
            var clicked = e.target.name;
            $checks.each(function() {
              if (this.name !== clicked) $(this).prop('checked', false);
            });
          }
          var stats = [];
          $checks.each(function() {
            if ($(this).is(':checked')) stats.push(this.name);
          });
          var st = ensureComboboxState(cbo[0]);
          if (st) {
            if (!st.options.queryParams) st.options.queryParams = {};
            st.options.queryParams[opts.field] = stats.join(',');
          }
          cbo.combobox('reload');
          putcook(cookid, stats);
        });
      });
    }
  };

  $.fn.combobox.parseOptions = function(target) {
    var t = $(target);
    var base = {};
    if ($.parser && $.parser.parseOptions) {
      base = $.parser.parseOptions(target, [
        {editable:'boolean',disabled:'boolean',multiple:'boolean'}
      ]);
    }
    return $.extend({}, base, {
      valueField: t.attr('valueField') || undefined,
      textField: t.attr('textField') || undefined,
      url: t.attr('url') || undefined,
      method: t.attr('method') || undefined
    });
  };

  $.fn.combobox.parseData = function(target) {
    var $el = $(target);
    if (!$el.is('select')) return [];
    var data = [];
    $el.find('option').each(function() {
      var $opt = $(this);
      if ($opt.prop('disabled') && $opt.prop('selected')) return;
      data.push({
        value: $opt.val(),
        text: $opt.text(),
        selected: $opt.prop('selected')
      });
    });
    return data;
  };

  function eventStub(name) {
    return function() {
      var e = arguments[0];
      if (e && e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
  }

  $.fn.combobox.defaults = $.extend({}, $.fn.combo.defaults, {
    valueField: 'value',
    textField: 'text',
    separator: ',',
    groupField: null,
    groupFormatter: function(group){ return group; },
    mode: 'local', // or 'remote'
    method: 'post',
    url: null,
    data: null,
    queryParams: {},
    loadFilter: function(data){
      // Server returns {rows:[...]} — unwrap to plain array
      if (data && !Array.isArray(data) && Array.isArray(data.rows)) return data.rows;
      return data;
    },
    disabled: false,
    readonly: false,
    editable: false,
    keyHandler: {
      up: eventStub('combobox.keyHandler.up'),
      down: eventStub('combobox.keyHandler.down'),
      left: eventStub('combobox.keyHandler.left'),
      right: eventStub('combobox.keyHandler.right'),
      enter: eventStub('combobox.keyHandler.enter'),
      query: eventStub('combobox.keyHandler.query')
    },
    filter: function(q, row) {
      var opts = $(this).combobox('options');
      return row[opts.textField].toLowerCase().indexOf(q.toLowerCase()) >= 0;
    },
    formatter: function(row) {
      var opts = $(this).combobox('options');
      return row[opts.textField];
    },
    loader: null,
    onBeforeLoad: eventStub('combobox.onBeforeLoad'),
    onLoadSuccess: eventStub('combobox.onLoadSuccess'),
    onLoadError: eventStub('combobox.onLoadError'),
    // onSelect: fkey combos trigger formLoad (mirrors eui.extend.js:1197-1200)
    // Non-fkey combos fall through harmlessly (formLoad checks .fkey class)
    onSelect: function(rec) {
      $(this).combobox('formLoad');
      $(this).trigger('select', rec);
    },
    onUnselect: eventStub('combobox.onUnselect')
  });

})(jQuery);
