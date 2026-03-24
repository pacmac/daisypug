/**
 * Pure4 Datebox Plugin - DaisyUI/jQuery API
 *
 * Datebox compatibility for native <input type="date"> elements.
 * Provides EasyUI-style methods used by legacy page scripts.
 */
;(function($) {
  'use strict';

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function formatDate(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function parseDate(value) {
    if (value === undefined || value === null || value === '') return null;
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return null;
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    if (typeof value === 'number' && !isNaN(value)) {
      var n = new Date(value); return new Date(n.getFullYear(), n.getMonth(), n.getDate());
    }
    var s = String(value).trim();
    if (!s) return null;
    if (s === 'today') { var t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }

    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    }

    var d = new Date(s);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function normalizeValue(target, value) {
    var opts = $.data(target, 'datebox') ? $.data(target, 'datebox').options : $.fn.datebox.defaults;
    var d = opts.parser.call(target, value);
    if (d && !isNaN(d.getTime())) return opts.formatter.call(target, d);
    return '';
  }

  function applyState(target) {
    var state = $.data(target, 'datebox');
    if (!state) return;
    var opts = state.options;
    var $t = $(target);

    if ($t.attr('type') !== 'date') $t.attr('type', 'date');
    $t.prop('disabled', !!opts.disabled);
    $t.prop('readonly', !!opts.readonly);
    $t.prop('required', !!opts.required);
  }

  function setValue(target, value, silent) {
    var state = $.data(target, 'datebox');
    if (!state) return;
    if (typeof value === 'function') value = value();
    if (value === undefined) value = new Date();
    var $t = $(target);
    var oldVal = $t.val() || '';
    var newVal = normalizeValue(target, value);

    $t.val(newVal);
    if (!silent && oldVal !== newVal) {
      if (state.options.onChange) state.options.onChange.call(target, newVal, oldVal);
      var d = state.options.parser.call(target, newVal);
      if (d && state.options.onSelect) state.options.onSelect.call(target, d);
    }
    state.previousValue = newVal;
  }

  function setTodayIfEmpty(target) {
    var $t = $(target);
    if ($t.val()) return;
    var cls = String($t.attr('class') || '');
    if (/\btoday\b/.test(cls)) setValue(target, new Date(), true);
    if (/\bmonth\b/.test(cls)) {
      var d = new Date();
      d.setDate(1);
      setValue(target, d, true);
    }
    if (/\byear\b/.test(cls)) {
      var y = new Date();
      y = new Date(y.getFullYear(), 0, 1);
      setValue(target, y, true);
    }
  }

  function bindEvents(target) {
    var $t = $(target);
    $t.off('.datebox').on('change.datebox', function() {
      var state = $.data(target, 'datebox');
      if (!state) return;
      var newVal = $t.val() || '';
      var oldVal = state.previousValue || '';
      state.previousValue = newVal;
      if (state.options.onChange && newVal !== oldVal) {
        state.options.onChange.call(target, newVal, oldVal);
      }
      var d = state.options.parser.call(target, newVal);
      if (d && state.options.onSelect) {
        state.options.onSelect.call(target, d);
      }
    });
  }

  function init(target, options) {
    var state = $.data(target, 'datebox');
    if (state) {
      state.options = $.extend(state.options, options || {});
      applyState(target);
      if (options && Object.prototype.hasOwnProperty.call(options, 'value')) {
        setValue(target, options.value, true);
      }
      return state;
    }

    var opts = $.extend({}, $.fn.datebox.defaults, $.fn.datebox.parseOptions(target), options || {});
    state = {
      options: opts,
      originalValue: $(target).val() || '',
      previousValue: $(target).val() || ''
    };
    $.data(target, 'datebox', state);
    applyState(target);
    bindEvents(target);

    if (opts.value !== undefined && opts.value !== '') {
      setValue(target, opts.value, true);
    } else {
      setTodayIfEmpty(target);
      state.originalValue = $(target).val() || '';
      state.previousValue = state.originalValue;
    }
    return state;
  }

  $.fn.datebox = function(options, param) {
    if (typeof options === 'string') {
      if (!this.length) return this;
      var method = $.fn.datebox.methods[options];
      if (!method) return this;
      return method(this, param);
    }
    return this.each(function() {
      init(this, options);
    });
  };

  $.fn.datebox.methods = {
    options: function(jq) {
      var state = $.data(jq[0], 'datebox');
      return state ? state.options : $.fn.datebox.defaults;
    },
    textbox: function(jq) {
      return jq.eq(0);
    },
    calendar: function(jq) {
      var opts = $.fn.datebox.methods.options(jq);
      if (!opts.sharedCalendar) return $();
      return $(opts.sharedCalendar);
    },
    getValue: function(jq) {
      return jq.eq(0).val() || '';
    },
    getText: function(jq) {
      return $.fn.datebox.methods.getValue(jq);
    },
    setValue: function(jq, value) {
      return jq.each(function() {
        if (!$.data(this, 'datebox')) init(this);
        setValue(this, value, false);
      });
    },
    setText: function(jq, value) {
      return $.fn.datebox.methods.setValue(jq, value);
    },
    getDate: function(jq) {
      var target = jq[0];
      if (!target) return null;
      if (!$.data(target, 'datebox')) init(target);
      var val = $(target).val();
      var d = $.data(target, 'datebox').options.parser.call(target, val);
      return d && !isNaN(d.getTime()) ? d : null;
    },
    clear: function(jq) {
      return jq.each(function() {
        if (!$.data(this, 'datebox')) init(this);
        setValue(this, '', false);
      });
    },
    reset: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'datebox');
        if (!state) state = init(this);
        setValue(this, state.originalValue || '', true);
      });
    },
    today: function(jq) {
      return jq.each(function() {
        if (!$.data(this, 'datebox')) init(this);
        setValue(this, new Date(), false);
      });
    },
    month: function(jq) {
      return jq.each(function() {
        if (!$.data(this, 'datebox')) init(this);
        var d = new Date();
        d.setDate(1);
        setValue(this, d, false);
      });
    },
    year: function(jq) {
      return jq.each(function() {
        if (!$.data(this, 'datebox')) init(this);
        var d = new Date();
        d = new Date(d.getFullYear(), 0, 1);
        setValue(this, d, false);
      });
    },
    disable: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'datebox');
        if (!state) state = init(this);
        state.options.disabled = true;
        applyState(this);
      });
    },
    enable: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'datebox');
        if (!state) state = init(this);
        state.options.disabled = false;
        applyState(this);
      });
    },
    readonly: function(jq, mode) {
      return jq.each(function() {
        var state = $.data(this, 'datebox');
        if (!state) state = init(this);
        state.options.readonly = (mode === undefined ? true : !!mode);
        applyState(this);
      });
    },
    required: function(jq, mode) {
      return jq.each(function() {
        var state = $.data(this, 'datebox');
        if (!state) state = init(this);
        state.options.required = (mode === undefined ? true : !!mode);
        applyState(this);
      });
    },
    initValue: function(jq, value) {
      return jq.each(function() {
        if (!$.data(this, 'datebox')) init(this);
        setValue(this, value, true);
        var state = $.data(this, 'datebox');
        state.originalValue = $(this).val() || '';
        state.previousValue = state.originalValue;
      });
    },
    destroy: function(jq) {
      return jq.each(function() {
        $(this).off('.datebox');
        $.removeData(this, 'datebox');
      });
    },
    isValid: function(jq) {
      var $el = jq.eq(0);
      if (!$el.length) return true;
      var val = $el.val();
      if ($el.prop('required') && !val) return false;
      if ($el[0] && typeof $el[0].checkValidity === 'function') return $el[0].checkValidity();
      return true;
    },
    validate: function(jq) {
      var ok = $.fn.datebox.methods.isValid(jq);
      jq.each(function() {
        $(this).toggleClass('input-error', !ok);
      });
      return ok;
    }
  };

  $.fn.datebox.parseOptions = function(target) {
    return $.extend({}, $.parser.parseOptions(target, [
      'sharedCalendar',
      { disabled: 'boolean', readonly: 'boolean', required: 'boolean' }
    ]));
  };

  $.fn.datebox.defaults = {
    disabled: false,
    readonly: false,
    required: false,
    sharedCalendar: null,
    value: '',
    formatter: function(date) {
      return formatDate(date);
    },
    parser: function(value) {
      return parseDate(value);
    },
    onSelect: function() {},
    onChange: function() {}
  };
  // ── Keyboard shortcuts: T=today, M=month, Y=year (moved from main.js) ──
  $(document).on('keyup', 'input[type="date"]', function(e) {
    var $t = $(this);
    if (e.keyCode === 84) $t.datebox('today');
    if (e.keyCode === 77) $t.datebox('month');
    if (e.keyCode === 89) $t.datebox('year');
  });

})(jQuery);
