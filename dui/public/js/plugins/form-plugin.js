/**
 * Pure4 Form Plugin - DaisyUI/jQuery API
 *
 * EasyUI-compatible form plugin for DUI with centralized state engine.
 *
 * Form Types (CSS class on <form>):
 *   .single — single-record form (default mode: upd, asdpx: s)
 *   .multi  — master-detail form with fkey combo (default mode: add, asdpx: ax)
 *
 * Form Modes (state machine):
 *   add → upd   (after load or save success)
 *   upd → add   (but_add click)
 *   upd → del   (but_del click)
 *   del → add   (after delete success)
 *
 * Change Tracking:
 *   opts.changed[]  — array of modified field elements
 *   .changed class  — added to modified fields (used by form_submit nosubs filter)
 *   form('unchange') — clear changed tracking
 *
 * Enable/Disable (form-lock pattern):
 *   .form-lock class — disables form fields via CSS
 *   .fkey .fitem gets .unlock class — fkey always stays accessible
 *
 * Events emitted:
 *   beforeBeginAdd()              — fired before add transition, return false to cancel
 *   modeChange(newMode, oldMode)  — fired on mode transitions
 *   changed(target)               — fired when a field changes
 *   beforeSubmit(param)           — fired before submit, return false to cancel
 *   done(mode)                    — fired after successful save
 *   success({mode, res})          — fired after successful save with data
 *   loadDone(data)                — fired after load completes (250ms delay)
 *   dui:dataloaded(data)          — fired after load completes
 */
(function($) {
  'use strict';

  if ($.fn.form) return;

  // ==========================================================================
  // Utilities
  // ==========================================================================

  function debug(fn, msg, extra) {
    if (!window.duiDebug || !window.duiDebug.enabled('form')) return;
    if (extra === undefined) {
      console.log('[' + fn + '] ' + msg);
      return;
    }
    console.log('[' + fn + '] ' + msg, extra);
  }

  // Multi-form support: collect all form elements sharing the same name.
  // Pages with fields in different panels/tabs use multiple +form#head —
  // first gets id+name, subsequent get name only. This function returns
  // a jQuery set of ALL forms with that name, so .find() searches them all.
  // For single-form pages, returns just $form (identical behavior).
  function allFields($form) {
    var name = $form.attr('name');
    if (!name) return $form;
    return $('form[name="' + name + '"]');
  }

  function findField($form, name) {
    var $scope = allFields($form);
    if ($form.attr('data-loadby') === 'name') {
      return $scope.find('[name="' + name + '"]').first();
    }
    return $scope.find('[name="' + name + '"], #' + name).first();
  }

  function hasWidgetClass($field, cls) {
    return $field.hasClass(cls) || $field.hasClass('easyui-' + cls);
  }

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function asDateObject(value) {
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    if (value === undefined || value === null || value === '') return null;
    var d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  function toLocalDate(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function toLocalDateTime(d) {
    return toLocalDate(d) + 'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function normalizeTemporalValue(value, inputType) {
    if (value === undefined || value === null) return '';
    var str = String(value).trim();
    if (!str) return '';

    if (inputType === 'date') {
      var dmatch = str.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dmatch) return dmatch[1];
      var d = asDateObject(value);
      return d ? toLocalDate(d) : str;
    }

    if (inputType === 'datetime-local') {
      var dtmatch = str.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
      if (dtmatch) return dtmatch[1] + 'T' + dtmatch[2];
      var dOnly = str.match(/^(\d{4}-\d{2}-\d{2})$/);
      if (dOnly) return dOnly[1] + 'T00:00';
      var dt = asDateObject(value);
      return dt ? toLocalDateTime(dt) : str;
    }

    return str;
  }

  function normalizeInputValue($field, value) {
    if (!$field.length) return value;
    var inputType = String($field.attr('type') || '').toLowerCase();
    if (inputType === 'date' || inputType === 'datetime-local') {
      return normalizeTemporalValue(value, inputType);
    }
    return value;
  }

  function getFieldDisplayText($field) {
    if (!$field || !$field.length) return '';
    var $src = $field.eq(0);

    if ($src.is('select')) {
      var $opt = $src.find('option:selected').first();
      if ($opt.length) return $opt.text();
      var sval = $src.val();
      return sval === undefined || sval === null ? '' : String(sval);
    }

    if (typeof $src.combobox === 'function' && ($src.data('combobox') || hasWidgetClass($src, 'combobox'))) {
      try {
        var rec = $src.combobox('getRec');
        if (rec) {
          var copt = $src.combobox('options') || {};
          var textField = copt.textField || 'text';
          if (rec[textField] !== undefined && rec[textField] !== null) return String(rec[textField]);
          if (rec.text !== undefined && rec.text !== null) return String(rec.text);
        }
      } catch (e) {}
    }

    if (typeof $src.textbox === 'function' && ($src.data('textbox') || hasWidgetClass($src, 'textbox'))) {
      try {
        return $src.textbox('getText');
      } catch (e) {}
    }

    var val = $src.val();
    return val === undefined || val === null ? '' : String(val);
  }

  function refreshAliases($scope) {
    if (!$scope || !$scope.length) return;
    $scope.find('input[data-alias], textarea[data-alias], select[data-alias]').each(function() {
      var $alias = $(this);
      var selector = String($alias.attr('data-alias') || '').trim();
      if (!selector) return;
      var $source = $();
      try {
        $source = $scope.find(selector).first();
      } catch (e) {
        return;
      }
      if (!$source.length) {
        try {
          $source = $(selector).first();
        } catch (e2) {
          return;
        }
      }
      if (!$source.length) return;
      setFieldValue($alias, getFieldDisplayText($source));
    });
  }

  function setFieldValue($field, value) {
    if (!$field.length) return;
    value = normalizeInputValue($field, value);
    if (value === undefined || value === null) value = '';

    if (typeof $field.multibox === 'function') {
      var $mb = $field.is('input[type="hidden"]') ? $field.next('div.multibox') : $field;
      if ($mb.length && $.data($mb[0], 'multibox')) {
        $mb.multibox('setValue', value);
        return;
      }
    }
    if (typeof $field.combobox === 'function' && hasWidgetClass($field, 'combobox')) {
      $field.combobox('setValue', value);
      return;
    }
    if (typeof $field.numberbox === 'function' && hasWidgetClass($field, 'numberbox')) {
      $field.numberbox('setValue', value);
      return;
    }
    if (typeof $field.textbox === 'function' && hasWidgetClass($field, 'textbox')) {
      $field.textbox('setValue', value);
      return;
    }
    $field.val(value);
  }

  // ==========================================================================
  // State Machine — states, transitions, and state-derived UI rules
  // ==========================================================================

  var STATE = {
    IDLE:     'idle',      // No record selected, form locked
    LOADING:  'loading',   // Record loading via AJAX
    VIEW:     'view',      // Record displayed, form enabled, no edits
    EDIT:     'edit',      // Record displayed, user has made changes (dirty)
    NEW:      'new',       // Adding new record, form cleared and enabled
    SAVING:   'saving',    // Submit in progress (save)
    DELETING: 'deleting'   // Submit in progress (delete)
  };

  // Allowed transitions: state → [valid next states]
  var TRANSITIONS = {
    idle:     ['loading', 'new'],
    loading:  ['view', 'idle'],           // view on success, idle on error/cancel
    view:     ['loading', 'new', 'deleting', 'edit', 'idle'],
    edit:     ['saving', 'loading', 'new', 'deleting', 'view'],
    new:      ['saving', 'idle', 'loading'],
    saving:   ['view', 'edit', 'new'],    // view on success, edit/new on error
    deleting: ['idle', 'view']            // idle on success, view on error
  };

  // Map state → legacy mode string (backward compat for 105+ page scripts)
  var STATE_TO_MODE = {
    idle:     'add',
    loading:  'upd',
    view:     'upd',
    edit:     'upd',
    new:      'add',
    saving:   'upd',
    deleting: 'del'
  };

  // State-derived button rules: state → asdpx string
  // These are the BASE rules; dirty flag modifies them
  var STATE_BUTTONS = {
    idle:     'a',      // Only Add
    loading:  '',       // Nothing during load
    view:     'adx',    // Add, Delete, Cancel
    edit:     'sx',     // Save, Cancel (dirty)
    new:      'x',      // Cancel only when clean; 'sx' when dirty
    saving:   '',       // Nothing during save
    deleting: ''        // Nothing during delete
  };

  // State-derived form lock: true = form-lock class applied
  var STATE_LOCKED = {
    idle:     true,
    loading:  true,
    view:     false,
    edit:     false,
    new:      false,
    saving:   true,
    deleting: true
  };

  /**
   * transition(opts, newState, $form) — validated state transition
   * Returns true if transition succeeded, false if invalid.
   */
  function transition(opts, newState, $form) {
    var oldState = opts.state || STATE.IDLE;
    if (oldState === newState) return true;

    var allowed = TRANSITIONS[oldState];
    if (!allowed || allowed.indexOf(newState) === -1) {
      console.warn('[form:state] Invalid transition: ' + oldState + ' → ' + newState);
      return false;
    }

    opts.state = newState;
    // Keep legacy mode in sync
    opts.mode = STATE_TO_MODE[newState] || opts.mode;
    if ($form && $form.length) $form.attr('mode', opts.mode);

    // console.log('[form:state] ' + oldState + ' → ' + newState);

    // Apply UI rules for the new state
    applyState(opts, $form);

    // Fire modeChange for backward compat (page scripts may listen)
    if ($form && $form.length) {
      var oldMode = STATE_TO_MODE[oldState] || 'add';
      var newMode = STATE_TO_MODE[newState] || opts.mode;
      if (oldMode !== newMode) {
        $form.trigger('modeChange', [newMode, oldMode]);
      }
    }

    return true;
  }

  /**
   * applyState(opts, $form) — apply UI rules derived from current state + dirty
   * This is the SINGLE place that controls form lock and toolbar buttons.
   */
  function applyState(opts, $form) {
    var state = opts.state || STATE.IDLE;
    var dirty = opts.dirty || false;

    // Form lock/unlock
    if ($form && $form.length) {
      if (STATE_LOCKED[state]) {
        $form.addClass('form-lock');
      } else {
        $form.removeClass('form-lock');
      }
    }

    // Button set — base from state, modified by dirty
    var set = STATE_BUTTONS[state] || '';
    if (state === 'new' && dirty) set = 'sx';
    if (state === 'view' && dirty) {
      // Shouldn't happen (view = clean), but safety: treat as edit
      set = 'sx';
    }

    // Loading flags (backward compat — $.dui.loading, $.page.state.loading)
    var isLoading = (state === 'loading');
    opts.loading = isLoading;
    $.dui.loading = isLoading;
    if ($.page) $.page.state.loading = isLoading;

    butEn(set, 'form.state(' + state + (dirty ? '+dirty' : '') + ')');
  }

  // Legacy syncToolbar — now delegates to applyState
  function syncToolbar($form) {
    var opts = $.fn.form.methods.options($form);
    applyState(opts, $form);
  }

  // ==========================================================================
  // Load Data into Form Fields
  // ==========================================================================

  function loadData($form, data, loadOpts) {
    loadOpts = loadOpts || {};
    var skipIds = loadOpts.skipIds || [];
    var skipNames = loadOpts.skipNames || [];
    var keys = Object.keys(data || {});
    var miss = 0, hit = 0, failed = [];
    keys.forEach(function(key) {
      var $field = findField($form, key);
      if ($field.length) {
        var id = $field.attr('id') || '';
        var name = $field.attr('name') || '';
        if (skipIds.indexOf(id) !== -1 || skipNames.indexOf(name) !== -1) return;
        var val = data[key];
        if (val && typeof val === 'object') return;
        try {
          setFieldValue($field, val);
          hit++;
        } catch (e) {
          failed.push(key);
        }
      } else {
        miss++;
      }
    });
    if (failed.length) {
      console.warn('[loadData] failed to update:', failed);
    }
  }

  // ==========================================================================
  // Init Form
  // ==========================================================================

  function initForm(target, options) {
    var state = $.data(target, 'form');
    if (state && !options) return state.options;

    var opts = $.extend({}, $.fn.form.defaults, $.fn.form.parseOptions(target), options || {});

    // Per-instance state (don't share arrays/booleans with defaults)
    opts.changed = [];
    opts.loading = false;
    opts.dirty = false;
    if (!opts.state) opts.state = STATE.IDLE;

    $.data(target, 'form', { options: opts });

    // Delegated change listener — bridges native field changes to form onChange
    // Bind on all form parts (multi-form support) so changes in any panel trigger dirty
    var $form = $(target);
    if (!$form.data('form-dirty-bound')) {
      allFields($form).each(function() {
        var $part = $(this);
        if (!$part.data('form-dirty-bound')) {
          $part.data('form-dirty-bound', true);
          $part.on('change.form-dirty', 'input, select, textarea', function() {
            var formOpts = $form.form('options');
            if (formOpts.onChange) formOpts.onChange.call(target, this);
          });
        }
      });
      $form.data('form-dirty-bound', true);
    }

    return opts;
  }

  // ==========================================================================
  // jQuery Plugin Entry Point
  // ==========================================================================

  $.fn.form = function(options, param, param2) {
    if (typeof options === 'string') {
      this.each(function() { initForm(this); });
      var method = $.fn.form.methods[options];
      if (method) return method(this, param, param2);
      return this;
    }
    return this.each(function() {
      initForm(this, options);
    });
  };

  // ==========================================================================
  // Methods
  // ==========================================================================

  $.fn.form.methods = {
    options: function(jq) {
      var state = $.data(jq[0], 'form');
      return state ? state.options : $.fn.form.defaults;
    },

    // ---- State getter/setter — the authoritative state machine ----
    state: function(jq, newState) {
      var $form = $(jq[0]);
      var opts = $.fn.form.methods.options($form);

      // Getter
      if (newState === undefined) {
        return opts.state || STATE.IDLE;
      }

      // Setter — validated transition
      transition(opts, newState, $form);
      return jq;
    },

    // ---- Mode getter/setter — backward compat shim over state machine ----
    mode: function(jq, newMode) {
      var $form = $(jq[0]);
      var opts = $.fn.form.methods.options($form);

      // Getter — derive from state
      if (newMode === undefined) {
        return STATE_TO_MODE[opts.state] || opts.mode || 'add';
      }

      // Setter — route to state transition
      if (newMode === 'del') {
        transition(opts, STATE.DELETING, $form);
      } else if (newMode === 'add') {
        // add from upd/view means beginAdd; add from del/saving means back to idle
        var st = opts.state;
        if (st === 'deleting' || st === 'saving') {
          transition(opts, STATE.IDLE, $form);
        } else if (st === 'view' || st === 'edit') {
          transition(opts, STATE.NEW, $form);
        } else {
          // Already idle or new — just update legacy mode
          opts.mode = newMode;
          $form.attr('mode', newMode);
        }
      } else if (newMode === 'upd') {
        // upd typically means record loaded — transition to view
        var cur = opts.state;
        if (cur === 'loading') {
          transition(opts, STATE.VIEW, $form);
        } else if (cur === 'new' || cur === 'idle') {
          transition(opts, STATE.LOADING, $form);
          transition(opts, STATE.VIEW, $form);
        } else {
          // Already view/edit — just update legacy mode
          opts.mode = newMode;
          $form.attr('mode', newMode);
        }
      } else {
        // Unknown mode — just set it raw
        opts.mode = newMode;
        $form.attr('mode', newMode);
      }
      return jq;
    },

    // ---- Load (URL string or data object) ----
    load: function(jq, data, loadOpts) {
      return jq.each(function() {
        var $form = $(this);
        var opts = $.fn.form.methods.options($form);

        if (typeof data === 'string') {
          // URL load
          var param = {};
          if (opts.onBeforeLoad.call(this, param) === false) return;
          ajaxget('', param, function(res) {
            if (typeof res === 'string') {
              try { res = JSON.parse(res); } catch (e) {}
            }
            loadData($form, res, loadOpts);
            opts.onLoadSuccess.call($form[0], res);
          }, {
            url: data,
            dataType: 'json',
            error: function() {
              opts.onLoadError.apply($form[0], arguments);
            }
          });
        } else {
          // Object load — no onBeforeLoad (matches EUI behavior)
          loadData($form, data || {}, loadOpts);
          opts.onLoadSuccess.call($form[0], data || {});
        }
      });
    },

    // ---- Preload: populate fields without state transition or events ----
    preload: function(jq, data, loadOpts) {
      return jq.each(function() {
        var $form = $(this);
        loadData($form, data || {}, loadOpts);
      });
    },

    // ---- fkeyLoad: any fkey control triggers full record load ----
    // Builds /?_func=get&_sqlid=<form._sqlid>&<name>=<value> and calls form('load', url).
    // Usage: $frm.form('fkeyLoad', $fkeyEl, selectedValue);
    fkeyLoad: function(jq, $fkey, value) {
      return jq.each(function() {
        var $frm = $(this);
        var name = $fkey.attr('comboname') || $fkey.attr('name');
        var sqlid = $frm.attr('_sqlid');
        if (!sqlid || !name || !value) return;
        var url = '/?_func=get&_sqlid=' + sqlid + '&' + name + '=' + encodeURIComponent(value);
        if (typeof getapp === 'function') {
          try { url += '&_vpath=' + getapp(); } catch (e) {}
        }
        $frm.form('load', url);
      });
    },

    // ---- Submit with sub-on/sub-off filtering ----
    submit: function(jq, optsOverride) {
      return jq.each(function() {
        var $form = $(this);
        var opts = $.fn.form.methods.options($form);
        opts = $.extend({}, opts, optsOverride || {});
        var param = $.extend({}, opts.queryParams || {});
        if (opts.onSubmit.call(this, param) === false) return;

        var url = opts.url || $form.attr('action') || '/';
        var method = ($form.attr('method') || opts.method || 'post').toLowerCase();

        // Prevent duplicate routing params when opts.url came from load URL
        // (e.g. /?_sqlid=...&_func=get&...). submit() appends fresh routing params
        // from `param`, so stale ones must be removed from base URL first.
        var hash = '';
        var hashIdx = url.indexOf('#');
        if (hashIdx !== -1) {
          hash = url.slice(hashIdx);
          url = url.slice(0, hashIdx);
        }
        var qIdx = url.indexOf('?');
        if (qIdx !== -1) {
          var base = url.slice(0, qIdx) || '/';
          var rawQ = url.slice(qIdx + 1);
          var keep = [];
          rawQ.split('&').forEach(function(part) {
            if (!part) return;
            var eq = part.indexOf('=');
            var key = decodeURIComponent(eq === -1 ? part : part.slice(0, eq));
            if (key === '_func' || key === '_sqlid' || key === '_vpath') return;
            keep.push(part);
          });
          url = base + (keep.length ? ('?' + keep.join('&')) : '') + hash;
        } else if (hash) {
          url = url + hash;
        }

        // Routing params go in URL query string, not POST body
        var qsParts = [];
        ['_func', '_sqlid', '_vpath'].forEach(function(k) {
          if (param[k] !== undefined) {
            qsParts.push(k + '=' + encodeURIComponent(param[k]));
            delete param[k];
          }
        });
        if (qsParts.length) {
          url += (url.indexOf('?') === -1 ? '?' : '&') + qsParts.join('&');
        }

        // Sub-on/sub-off: temporarily disable fields that shouldn't be serialized
        var mode = opts.mode || $form.attr('mode');
        var $all = allFields($form);
        var nosubs;
        if (mode === 'upd' && $form.hasClass('changeonly')) {
          nosubs = $all.find('input.textbox-f:not(.fkey):not(.changed):not(:disabled):not(.sub-on), input.sub-off');
        } else {
          nosubs = $all.find('input.sub-off, input:not(:disabled):not(.changed).changeonly');
        }
        // Exclude DaisyUI tab radios — they are UI-only, not data fields
        nosubs = nosubs.add($all.find('input.tab'));
        // Exclude fields inside <dialog> (datagrid editor modals rendered inside form)
        nosubs = nosubs.add($all.find('dialog input, dialog select, dialog textarea'));
        nosubs.prop('disabled', true);

        var formArr = $all.serializeArray();
        // Append remaining non-routing params to POST body
        formArr.push.apply(formArr, $.map(param, function(v, k) { return { name: k, value: v }; }));

        // Re-enable immediately after serialization (EUI pattern)
        nosubs.prop('disabled', false);

        // Convert [{name,value},...] array to plain object for ajaxget()
        var formData = {};
        for (var fi = 0; fi < formArr.length; fi++) {
          var fn = formArr[fi].name, fv = formArr[fi].value;
          if (formData[fn] !== undefined) {
            if (!Array.isArray(formData[fn])) formData[fn] = [formData[fn]];
            formData[fn].push(fv);
          } else {
            formData[fn] = fv;
          }
        }

        // Collapse <select multiple> arrays to comma-separated strings
        $all.find('select[multiple][name]').each(function() {
          var n = this.name;
          if (Array.isArray(formData[n])) formData[n] = formData[n].join(',');
        });

        ajaxget('', formData, function(res) {
          opts.success.call($form[0], res);
        }, {
          url: url,
          method: method,
          error: function() {
            opts.onLoadError.apply($form[0], arguments);
          }
        });
      });
    },

    // ---- Reset ----
    reset: function(jq) {
      return jq.each(function() {
        var $all = allFields($(this));
        $all.each(function() {
          this.reset();
        });
        // Clear multibox widgets (native reset only clears hidden inputs)
        if ($.fn.multibox) {
          $all.find('div.multibox').each(function() {
            if ($.data(this, 'multibox')) $(this).multibox('clear');
          });
        }
      });
    },

    // ---- Validate ----
    validate: function(jq) {
      var $form = $(jq[0]);
      var opts = $.fn.form.methods.options($form);
      if (opts.novalidate) return true;

      // Target all native inputs/selects/textareas (not hidden, not disabled)
      // Exclude fields inside <dialog> (datagrid editor modals rendered inside form)
      var $all = allFields($form);
      var $fields = $all.find('input:not(:disabled):not([type=hidden]), select:not(:disabled), textarea:not(:disabled)')
        .not($all.find('dialog input, dialog select, dialog textarea'));

      if ($.fn.validatebox) {
        // Lazy-init validatebox on fields that don't have it yet
        $fields.each(function() {
          if (!$.data(this, 'validatebox')) $(this).validatebox();
        });
        $fields.validatebox('validate');
      } else {
        // Fallback: just check required using DaisyUI error class
        $fields.filter('[required]').each(function() {
          var $f = $(this), v = $f.val();
          if (!v || v === '') $f.addClass('input-error');
          else $f.removeClass('input-error');
        });
      }

      var $invalid = $all.find('.input-error:not(:disabled)');
      if ($invalid.length === 0) return true;

      // Focus first visible invalid field
      var $vis = $invalid.filter(':visible').first();
      if ($vis.length) {
        $vis.focus();
      } else {
        // Invalid field on hidden tab — activate that tab
        var $hidden = $invalid.first();
        var $tabContent = $hidden.closest('.tab-content');
        if ($tabContent.length) {
          // DUI tabs: .tab-content is preceded by an input[type=radio].tab sibling
          var $radio = $tabContent.prev('input.tab[type="radio"]');
          if ($radio.length) {
            $radio.prop('checked', true).trigger('change');
            setTimeout(function() { $hidden.focus(); }, 100);
          }
        }
        // EUI compat: try eltaben if available
        if (typeof eltaben === 'function') {
          try { eltaben($hidden); } catch (e) {}
        }
      }
      return false;
    },

    // ---- Clear ----
    clear: function(jq) {
      return jq.each(function() {
        allFields($(this)).find('input,select,textarea').val('');
      });
    },

    // ---- Change Tracking ----
    unchange: function(jq) {
      return jq.each(function() {
        var $form = $(this);
        var $all = allFields($form);
        $all.find('.changed:not(.fkey)').removeClass('changed');
        var opts = $.fn.form.methods.options($form);
        opts.changed = [$all.find('.fkey')];
        opts.dirty = false;
      });
    },

    isChanged: function(jq) {
      var opts = $.fn.form.methods.options($(jq[0]));
      return opts.dirty || opts.changed.length > 1;
    },

    // ---- Enable/Disable (form lock) ----
    // Uses .form-lock CSS class only (pointer-events + opacity).
    // Native disabled is reserved for permanently-readonly fields ([data-readonly]).
    enable: function(jq) {
      return jq.each(function() {
        allFields($(this)).removeClass('form-lock');
      });
    },

    disable: function(jq, omit) {
      return jq.each(function() {
        allFields($(this)).addClass('form-lock');
      });
    },

    // ---- Reload current record via fkey ----
    reload: function(jq) {
      return jq.each(function() {
        var $form = $(this);
        var sqlid = $form.attr('_sqlid');
        var $fkey = allFields($form).find('.fkey').first();
        if (!$fkey.length || !sqlid) return;
        var kid = $fkey.attr('name') || $fkey.attr('comboname');
        var kval = '';
        if (typeof $fkey.combobox === 'function' && $.data($fkey[0], 'combobox')) {
          kval = $fkey.combobox('getValue');
        } else {
          kval = $fkey.val();
        }
        if (!kval) return;
        $form.form('load', '/?_func=get&_sqlid=' + sqlid + '&' + kid + '=' + kval);
      });
    },

    // ---- Focus first editable field ----
    focusFirst: function(jq) {
      return jq.each(function() {
        var $form = $(this);
        setTimeout(function() {
          allFields($form).find(':input:enabled:visible:not([readonly]):not([eui="searchbox"]):first').focus();
        }, 200);
      });
    },

    // ---- Get form data as object ----
    getData: function(jq) {
      var result = {};
      allFields($(jq[0])).find('input[name], select[name], textarea[name]').each(function() {
        var v = $(this).val();
        result[this.name] = (this.multiple && Array.isArray(v)) ? v.join(',') : v;
      });
      return result;
    },

    // ---- Validation control ----
    disableValidation: function(jq) {
      return jq.each(function() {
        var opts = $.fn.form.methods.options($(this));
        opts.novalidate = true;
        if ($.fn.validatebox) {
          allFields($(this)).find('input, select, textarea').filter(function() {
            return $.data(this, 'validatebox');
          }).validatebox('disableValidation');
        }
      });
    },

    enableValidation: function(jq) {
      return jq.each(function() {
        var opts = $.fn.form.methods.options($(this));
        opts.novalidate = false;
        if ($.fn.validatebox) {
          allFields($(this)).find('input, select, textarea').filter(function() {
            return $.data(this, 'validatebox');
          }).validatebox('enableValidation');
        }
      });
    },

    resetValidation: function(jq) {
      return jq.each(function() {
        $(this).find('.input-error').removeClass('input-error');
        if ($.fn.validatebox) {
          $(this).find('input, select, textarea').filter(function() {
            return $.data(this, 'validatebox');
          }).validatebox('resetValidation');
        }
      });
    },

    // ---- Sync toolbar to current form state ----
    syncToolbar: function(jq) {
      syncToolbar($(jq[0]));
      return jq;
    },

    // ---- Legacy compat ----
    resetDirty: function(jq) {
      return jq.each(function() {
        $(this).form('options').dirtyFields = [];
      });
    },

    // ---- beginAdd: transition to 'new' state ----
    // Uses $.page.hook('beforeAdd') to let page JS gate the transition
    // (e.g. auto-PN prompt). Falls back to immediate proceed when no hook.
    beginAdd: function(jq) {
      return jq.each(function() {
        var $form = $(this);
        var opts = $form.form('options');

        // Guard: can only add from idle or view
        if (opts.state !== 'idle' && opts.state !== 'view') return;

        if ($form.triggerHandler('beforeBeginAdd') === false) return;

        $.page.hook('beforeAdd', function proceed() {
          // Transition to new state (applyState handles form unlock + buttons)
          opts.dirty = false;
          transition(opts, STATE.NEW, $form);

          $form.form('reset');
          $form.form('resetValidation');

          // Tell fkey to enter add mode
          var $fkey = allFields($form).find('.fkey').first();
          var autonum = $.page && $.page.autonum;
          if ($fkey.length && $.fn.combobox && $.data($fkey[0], 'combobox')) {
            $fkey.combobox('editbox');
          } else if (autonum) {
            var $af = $(autonum.field);
            if ($af.length && $.data($af[0], 'searchbox')) {
              $af.data('_origPlaceholder', $af.attr('placeholder') || '');
              $af.val('').attr('placeholder', '-AUTONUMBER-');
              $af.searchbox('editable', false);
            }
          }

          // Focus first editable field
          $form.form('focusFirst');

          $.page.hook('afterAdd');
        });
      });
    },

    // ---- reselect: noop — EUI pattern replaced by afterSave hooks ----
    reselect: function(jq) {
      return jq;
    }
  };

  // ==========================================================================
  // Defaults (including state machine callbacks)
  // ==========================================================================

  $.fn.form.defaults = {
    fieldTypes: ['tagbox', 'combobox', 'combotree', 'combogrid', 'combotreegrid',
      'datetimebox', 'datebox', 'combo', 'datetimespinner', 'timespinner',
      'numberspinner', 'spinner', 'slider', 'searchbox', 'numberbox',
      'passwordbox', 'filebox', 'textbox', 'switchbutton'],
    novalidate: false,
    ajax: true,
    iframe: true,
    dirtyFields: [],
    url: null,
    queryParams: {},

    // State engine
    state: 'idle',
    dirty: false,
    mode: null,
    type: null,
    asdpx: null,
    changed: [],
    loading: false,

    // --- onChange: track field modifications, set dirty flag ---
    onChange: function(tgt) {
      var $form = $(this);
      var opts = $form.form('options');
      if (opts.state === 'loading' || opts.state === 'saving' || opts.state === 'deleting') return;

      if (opts.changed.length === 0) opts.changed = [allFields($form).find('.fkey')];
      if (!$(tgt).hasClass('sub-off') && opts.changed.indexOf(tgt) === -1) {
        opts.changed.push(tgt);
      }
      $(tgt).addClass('changed');

      // Set dirty flag and transition view→edit on first change
      if (!opts.dirty && opts.changed.length > 1) {
        opts.dirty = true;
        if (opts.state === 'view') {
          transition(opts, STATE.EDIT, $form);
        } else {
          // Already in new/edit — just refresh buttons for dirty
          applyState(opts, $form);
        }
      }

      $form.trigger('changed', tgt);
    },

    // --- onSubmit: inject server routing params + ronly check + validation ---
    onSubmit: function(param) {
      if (!$.dui.noron && $.page.state.ronly) return false;

      var $form = $(this);
      var opts = $form.form('options');

      // Determine _func from state BEFORE transitioning
      var stateBeforeSubmit = opts.state;
      var func;
      if (stateBeforeSubmit === 'deleting') {
        func = 'del';
      } else if (stateBeforeSubmit === 'new') {
        func = 'add';
      } else {
        func = 'upd';
      }

      // Transition to saving (unless already deleting)
      if (stateBeforeSubmit !== 'deleting') {
        if (!transition(opts, STATE.SAVING, $form)) {
          console.warn('[form.onSubmit] Cannot save from state: ' + stateBeforeSubmit);
          return false;
        }
      }
      // Remember what we were before submit for error recovery
      opts._stateBeforeSubmit = stateBeforeSubmit;

      param._func = func;
      param._sqlid = $form.attr('_sqlid') || '';

      var b4 = $form.triggerHandler('beforeSubmit', param);
      if (b4 === false) {
        // Revert state on cancel
        transition(opts, stateBeforeSubmit, $form);
        return false;
      }

      if (func !== 'del') {
        var valid = $form.form('validate');
        if (!valid) {
          alert('Complete all highlighted fields.');
          transition(opts, stateBeforeSubmit, $form);
          return false;
        }
      }
      return true;
    },

    // --- success: state transitions after save ---
    success: function(data) {
      if (typeof jsontry === 'function') {
        data = jsontry(data);
      } else if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) {}
      }

      if (typeof iserr === 'function') {
        if (iserr(data)) {
          // Error — revert to pre-submit state
          var $ef = $(this);
          var eopts = $ef.form('options');
          var revert = eopts._stateBeforeSubmit || 'view';
          transition(eopts, revert, $ef);
          return;
        }
      } else if (data && data.err) {
        console.error('[form.success] Server error:', data.err);
        var $ef2 = $(this);
        var eopts2 = $ef2.form('options');
        var revert2 = eopts2._stateBeforeSubmit || 'view';
        transition(eopts2, revert2, $ef2);
        return;
      }

      var $form = $(this);
      var opts = $form.form('options');
      var wasDeleting = (opts.state === 'deleting');
      var mode = wasDeleting ? 'del' : (STATE_TO_MODE[opts.state] || 'upd');
      var $fkey = allFields($form).find('.fkey').first();
      var hasCombo = $fkey.length && typeof $fkey.combobox === 'function' && $.data($fkey[0], 'combobox');

      if (wasDeleting) {
        // Delete success → idle, trigger reload
        saveok();
        transition(opts, STATE.IDLE, $form);
        reload();
        return;
      } else {
        // Save success → view (clean)
        var autonum = $.page && $.page.autonum;
        if (hasCombo) {
          var next = (data && data._next) || true;
          $fkey.combobox('editbox', next);
        } else if (autonum) {
          var $af = $(autonum.field);
          if ($af.length && $.data($af[0], 'searchbox')) {
            var next = (data && data._next) || '';
            var origPh = $af.data('_origPlaceholder');
            if (origPh != null) $af.attr('placeholder', origPh);
            $af.searchbox('editable', true);
            if (next) {
              $af.val(next);
              $form.form('fkeyLoad', $af, next);
            }
          }
        }
        $form.form('unchange');
        opts.dirty = false;
        transition(opts, STATE.VIEW, $form);
      }

      // Visual feedback
      saveok();

      $form.trigger('done', mode);
      $form.trigger('success', { mode: mode, res: data });
      if ($.page) $.page.hook('afterSave', mode, data);
    },

    // --- onBeforeLoad: transition to loading state ---
    onBeforeLoad: function(param) {
      var $form = $(this);
      $form.form('unchange');
      $form.form('resetValidation');
      var opts = $form.form('options');
      opts.dirty = false;
      transition(opts, STATE.LOADING, $form);
      return true;
    },

    // --- onLoadSuccess: transition to view state ---
    onLoadSuccess: function(data) {
      var $form = $(this);
      var opts = $form.form('options');

      // Unlock tabs
      allFields($form).find('ul.tabs').addClass('unlock');

      // Store fkey value (select.fkey for combobox, input.fkey for text)
      var $fkey = allFields($form).find('.fkey').first();
      var fkeyVal = null;
      if ($fkey.length) {
        if (typeof $fkey.combobox === 'function' && $.data($fkey[0], 'combobox')) {
          fkeyVal = $fkey.combobox('getValue');
        } else {
          fkeyVal = $fkey.val();
        }
        if (!$.dui.page) $.dui.page = {};
        $.dui.page.fkey = fkeyVal;
        if ($.page) $.page.state.fkey = fkeyVal;
      }

      // Record loaded → view state (clean)
      opts.dirty = false;
      transition(opts, STATE.VIEW, $form);

      // Read-only override after state transition
      if (!$.dui.noron && $.page.state.ronly) {
        $form.addClass('form-lock');
      }

      // Delayed completion (250ms for combo reselection — matches EUI pattern)
      setTimeout(function() {
        if (opts.noload) {
          delete opts.noload;
          return;
        }
        refreshAliases($form);
        $form.trigger('loadDone', [data]);
        $form.trigger('dui:dataloaded', [data]);
        if ($.page) {
          $.page.hook('afterLoad', data);
        }
      }, 250);
    },

    onLoadError: function() {
      var $form = $(this);
      var opts = $form.form('options');
      // Go back to idle on load error
      transition(opts, STATE.IDLE, $form);
      console.error('[form.onLoadError]', arguments);
    },

    onProgress: function() { return true; }
  };

  // ==========================================================================
  // Parse Options — Form type/mode detection
  // ==========================================================================

  $.fn.form.parseOptions = function(target) {
    var $form = $(target);
    var base = {};
    if ($.parser && $.parser.parseOptions) {
      base = $.parser.parseOptions(target, [
        { ajax: 'boolean', dirty: 'boolean' }
      ]);
    }

    var opts = $.extend({}, base, {
      url: ($form.attr('action') ? $form.attr('action') : undefined)
    });

    // --- Form type detection from CSS classes ---
    if ($form.hasClass('single')) {
      opts.type = 'single';
      opts.mode = $form.attr('mode') || 'upd';
      opts.asdpx = $form.attr('asdpx') || 's';
      opts.state = STATE.IDLE;
      $form.attr('mode', opts.mode);
      $form.attr('asdpx', opts.asdpx);

      // Auto-load for .single.load forms
      var sqlid = $form.attr('_sqlid');
      if (sqlid) {
        opts.url = [
          '/?_sqlid=' + sqlid,
          '_func=get',
          allFields($form).find('input[value][type=hidden]:not(.textbox-value)').serialize()
        ].join('&').replace(/\&$/, '');

        if ($form.hasClass('load')) {
          setTimeout(function() { $form.form('load', opts.url); });
        }
      }
    } else if ($form.hasClass('multi')) {
      opts.type = 'multi';
      opts.mode = $form.attr('mode') || 'add';
      opts.asdpx = $form.attr('asdpx') || 'ax';
      opts.state = STATE.IDLE;
      opts.dirty = false;
      $form.attr('mode', opts.mode);
      $form.attr('asdpx', opts.asdpx);

      // Initial idle state: form locked, only Add enabled
      setTimeout(function() {
        applyState(opts, $form);
        $form.form('focusFirst');
      });
    }

    return opts;
  };

  window.duiFormHelperLoaded = true;

  // ==========================================================================
  // Form / Field Utility Functions (moved from ui.js)
  // ==========================================================================
  // These were scattered window globals. Now live on $.dui.form.* with
  // legacy window.* globals via $.dui.register().

  var dui = $.dui;

  // ---------- getform / getfkey / getf1 / getCombo ----------

  function getform() {
    return $('#content form').not('.lock').filter(':visible:first');
  }

  function getfkey() {
    var fk = $('#content form:visible input.fkey:first');
    return fk.length ? fk : undefined;
  }

  function getf1() {
    var fk = $('#content form:visible input:visible:first');
    return fk.length ? fk : undefined;
  }

  function getCombo() {
    var ret = {};
    ret.frm = getform();
    ret.cbo = ret.frm.find('.fkey');
    if (ret.cbo.length === 0 || !ret.cbo.attr('comboname')) ret.cbo = null;
    return ret;
  }

  // ---------- frm2dic / formdata ----------

  function formdata(form, fdat) {
    if (form.selector === undefined) form = $(form);
    fdat = fdat || {};
    $.each(allFields(form).find('input.textbox-value'), function() {
      if ($(this).val() && $(this).attr('name')) fdat[$(this).attr('name')] = $(this).val();
    });
    return fdat;
  }

  function frm2dic(frm, all) {
    if (all) return formdata(frm);
    var obj = {};
    $.each(allFields(frm).serializeArray(), function(k, v) { obj[v.name] = v.value; });
    return obj;
  }

  // ---------- setudfs ----------

  function setudfs(rec, frm) {
    rec = rec || {};
    frm = frm || $(this).closest('form');
    var $all = allFields(frm);

    var labels = $all.find('label[id^=UDF_], label[for^=USER_]');
    if (!labels.length) {
      $all
        .find('input[id^=USER_], input[name^=USER_], textarea[id^=USER_], textarea[name^=USER_]')
        .each(function() {
          var fid = this.id || this.name;
          if (fid) labels = labels.add($all.find('label[for="' + fid + '"]'));
        });
    }

    labels.each(function() {
      var box = 'textbox';
      var lab = $(this);
      var lid = lab.attr('id');
      var forId = lab.attr('for') || '';
      var m = forId.match(/^USER_(\d+)$/i);
      if (!lid && m) lid = 'UDF_' + m[1];
      if (!lid || lid.indexOf('UDF_') !== 0) return;

      var div = lab.closest('div.fitem, div.mb-2, [data-role="fieldcontain"]');
      if (!div.length) div = lab.closest('div');

      var tbox = div.find('input:hidden').first();
      if (!tbox.length && forId) tbox = div.find('#' + forId).first();
      if (!tbox.length) {
        var idx = lid.replace('UDF_', '');
        tbox = div.find('#USER_' + idx + ', [name="USER_' + idx + '"]').first();
      }
      if (!tbox.length) tbox = div.find('input,textarea,select').first();

      var tf = false;
      var lbl = rec[lid] || rec[lid.toUpperCase()] || rec[lid.toLowerCase()];
      if (lbl != null && lbl !== '') {
        lbl = lbl.toString();
        if (lbl.indexOf('*') === 0) {
          tf = true;
          lbl = lbl.substring(1);
        }

        var opts = lbl.match(/^\{(.*)\}/);
        if (opts) {
          var opt = opts[1];
          lbl = lbl.replace(opts[0], '').trim();
          var data = [];
          var bits = opt.split(',').map(function(bit) { return bit.toString().trim(); }).filter(Boolean);
          var b0 = (bits[0] || '').toLowerCase();
          box = { date: 'datebox', number: 'numberbox', spinner: 'numberspinner' }[b0] || 'combobox';

          if ($.isFunction(tbox[box])) tbox[box]();
          if (box === 'combobox' && $.isFunction(tbox.combobox)) {
            bits.map(function(bit) { data.push({ value: bit, text: bit.toUpperCase() }); });
            tbox.combobox({ data: data, editable: false });
          }
        }
      } else {
        lbl = '';
      }

      if ($.isFunction(tbox[box])) tbox[box]('required', tf);
      if (lbl) {
        lab.text(lbl.replace('*', ''));
        div.show();
      } else {
        div.hide();
      }
    });
  }

  // ---------- euiLoadById ----------

  function euiLoadById(data) {
    var boxes = ['combobox-f', 'numberbox-f', 'combobox-f', 'numberspinner-f', 'datebox-f', 'textbox-f'];
    for (var key in data) {
      var el = $('#' + key);
      var cls = el.attr('class');
      if (cls) {
        cls = cls.split(' ');
        for (var c in cls) {
          if (boxes.indexOf(cls[c]) !== -1) {
            $('#' + key)[cls[c].split('-')[0]]('setValue', data[key]);
            break;
          }
        }
      }
    }
  }

  // ---------- tabcombos ----------

  function tabcombos(tabid) {
    var tab = $(tabid).tabs('getSelected');
    var mod = (typeof getmod === 'function') ? getmod() : ($.dui.menu && $.dui.menu.selected ? $.dui.menu.selected.id.split('^')[0] : '');
    tab.find('input.combobox-f').each(function() {
      var sid = $(this).attr('_sqlid_');
      if (sid) {
        var opt = $(this).combobox('options');
        if (!opt.url) {
          var isdis = opt.disabled;
          if (isdis) $(this).combobox('enable');
          opt.url = '/?_func=get&_combo=y&_sqlid=' + mod + '^' + sid;
          $(this).combobox('reload');
          if (isdis) $(this).combobox('disable');
        }
      }
    });
  }

  // ---------- cboEdit / cbodata / cboall / cbocols ----------

  function cboEdit(cboel, reset) {
    var cbo = $(cboel);
    if (reset) {
      var val = cbo.combobox('getValue');
      cbo.combobox('options').autoload = val;
      cbo.combobox('options').editable = true;
      cbo.data('cspan').show();
      cbo.data('espan').hide();
      cbo.combobox('reload');
    } else {
      cbo.combobox('options').editable = false;
      cbo.data('cspan').hide();
      cbo.data('espan').show();
      setTimeout(function() { cbo.data('ebox').combobox('textbox').focus(); });
    }
  }

  function cbodata(arr, val, txt) {
    if (!val) return;
    txt = txt || val;
    var idx = (typeof objidx === 'function') ? objidx(arr, 'value', val) : -1;
    if (idx === -1 && val) arr.push({ text: txt, value: val });
  }

  function cboall(arr) {
    var obj = (typeof clone === 'function') ? clone(arr[0]) : $.extend({}, arr[0]);
    if (!obj) return [];
    for (var key in obj) { obj[key] = ''; }
    obj.value = 'ALL'; obj.text = 'ALL'; obj.selected = true;
    arr.unshift(obj);
    return arr;
  }

  function cbocols(row) {
    if (!row._cols) return row.text;
    var bits = row._cols.split('^');
    if (bits.length === 1) return row.text;
    var widths = $(this).combobox('options').widths;
    var line = '';
    for (var k in bits) {
      var text = bits[k].toUpperCase();
      line += '<span class="cbocol" style="width:' + widths[k] + '">' + text + '</span>';
    }
    return line;
  }

  // ---------- eltab / eltaben ----------

  function eltab(elob) {
    var pan = $(elob).closest('.tabs-panels');
    var tab, idx = -1, tob = pan.parent('.tabs-container');
    pan.children('.panel').each(function() {
      if ($(this).find(elob).length > 0) idx = $(this).index();
    });
    var tabel = tob.find('ul.tabs').children().eq(idx);
    return { tob: tob, idx: idx, tab: tob.tabs('getTab', idx), tabel: tabel };
  }

  function eltaben(elob) {
    var obj = eltab(elob);
    if (obj.idx) obj.tob.tabs('select', obj.idx);
  }

  // ---------- nextno / autono ----------

  function nextno(sqlid, cbo, cb) {
    var vpath = (typeof gurl === 'function') ? gurl() : '';
    ajaxget('', { _func: 'get', _sqlid: sqlid, _vpath: vpath }, function(next) {
      $(cbo).combobox('setValue', next.NEXT); cb(next);
    }, { method: 'get', async: false });
  }

  function autono(nxt, cbo, cb) {
    var mod = (typeof gurl === 'function') ? gurl() : '';
    if (typeof ajaxget === 'function') {
      ajaxget('/', { type: nxt.type, id: nxt.id, _func: 'get', _sqlid: 'nextno', _vpath: mod }, function(next) {
        $(cbo).combobox('setValue', next.NEXT); cb(next);
      });
    }
  }

  // ---------- grnflash / elreset / euifocus / inpsrc ----------

  function grnflash(el) {
    var but = $(el);
    but.addClass('bg-grn bright');
    setTimeout(function() { but.removeClass('bg-grn bright'); }, 1000);
  }

  function elreset(el) {
    el.wrap('<form>').closest('form').get(0).reset();
    el.unwrap();
  }

  function euifocus(esel) {
    var el = $(esel).next().find('input:visible');
    setTimeout(function() { el.focus(); });
    return el;
  }

  function inpsrc(el) {
    return el.closest('input.textbox-f:hidden');
  }

  // ---------- form_submit (legacy — used by EUI code path) ----------

  function form_submit(mode) {
    var frm = getform();
    if (mode) frm.attr('mode', mode);
    else mode = frm.attr('mode');

    var nosubs;
    if (mode === 'upd' && frm.hasClass('changeonly')) {
      nosubs = frm.find('input.textbox-f:not(.fkey):not(.changed):not(:disabled):not(.sub-on), input.sub-off');
    } else {
      nosubs = frm.find('input.sub-off, input:not(:disabled):not(.changed).changeonly');
    }

    // Exclude fields inside <dialog>
    var dlgFields = frm.find('dialog input, dialog select, dialog textarea');
    dlgFields.prop('disabled', true);

    nosubs.textbox('disable');
    setTimeout(function() {
      var param = {
        _func: frm.attr('mode'),
        _sqlid: frm.attr('_sqlid')
      };

      frm.form({ frm: frm, queryParams: param }).form('submit');
      nosubs.textbox('enable');
      dlgFields.prop('disabled', false);
    });
  }

  // ==========================================================================
  // Register on $.dui.form
  // ==========================================================================

  dui.form.getform     = getform;
  dui.form.getfkey     = getfkey;
  dui.form.getf1       = getf1;
  dui.form.getCombo    = getCombo;
  dui.form.frm2dic     = frm2dic;
  dui.form.formdata    = formdata;
  dui.form.setudfs     = setudfs;
  dui.form.euiLoadById = euiLoadById;
  dui.form.tabcombos   = tabcombos;
  dui.form.cboEdit     = cboEdit;
  dui.form.cbodata     = cbodata;
  dui.form.cboall      = cboall;
  dui.form.cbocols     = cbocols;
  dui.form.eltab       = eltab;
  dui.form.eltaben     = eltaben;
  dui.form.nextno      = nextno;
  dui.form.autono      = autono;
  dui.form.grnflash    = grnflash;
  dui.form.elreset     = elreset;
  dui.form.euifocus    = euifocus;
  dui.form.inpsrc      = inpsrc;
  dui.form.form_submit = form_submit;

  // ==========================================================================
  // Window globals (permanent DUI API)
  // ==========================================================================

  dui.register('getform',     getform);
  dui.register('getfkey',     getfkey);
  dui.register('getf1',       getf1);
  dui.register('getCombo',    getCombo);
  dui.register('frm2dic',     frm2dic);
  dui.register('formdata',    formdata);
  dui.register('setudfs',     setudfs);
  dui.register('euiLoadById', euiLoadById);
  dui.register('tabcombos',   tabcombos);
  dui.register('cboEdit',     cboEdit);
  dui.register('cbodata',     cbodata);
  dui.register('cboall',      cboall);
  dui.register('cbocols',     cbocols);
  dui.register('eltab',       eltab);
  dui.register('eltaben',     eltaben);
  dui.register('nextno',      nextno);
  dui.register('autono',      autono);
  dui.register('grnflash',    grnflash);
  dui.register('elreset',     elreset);
  dui.register('euifocus',    euifocus);
  dui.register('inpsrc',      inpsrc);
  dui.register('form_submit', form_submit);

  // ==========================================================================
  // Formatters — enrich $.dui.fmt.* (base set defined in dui-helpers.js)
  // ==========================================================================
  var fmt = $.dui.fmt;

  fmt.datetime = function(val) {
    if (val) return val.replace('T', ' ').substring(0, 19);
  };

  // Override table with proper DOM version
  fmt.table = function(head, rows) {
    if (!Array.isArray(rows)) rows = [rows];
    var tb = $('<table class="dui-table" />');
    var hed = $('<thead />');
    var bod = $('<tbody />');
    head.map(function(e) {
      hed.append($('<th field="' + e.field + '" />').text(e.title));
    });
    rows.map(function(row) {
      var tr = $('<tr />');
      for (var idx in head) {
        var field = head[idx].field;
        var val = head[idx].formatter
          ? head[idx].formatter(row[field])
          : (row[field] || '');
        tr.append($('<td />').text(val).attr('style', head[idx].style || ''));
      }
      tr.appendTo(bod);
    });
    return tb.append(hed, bod);
  };

  // eui.* legacy aliases are handled by dui-helpers.js (deprecation warnings there)

})(jQuery);
