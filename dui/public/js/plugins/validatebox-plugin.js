/**
 * Pure4 ValidateBox Plugin - DaisyUI/jQuery API
 *
 * Lightweight field validation for native <input>, <select>, <textarea>.
 * Provides the $.fn.validatebox API that form-plugin.js delegates to.
 *
 * Validation rules (ported from eui.extend.js:884-959):
 *   length[min,max]  — string length
 *   inList           — combo value exists in loaded data
 *   csn              — numeric chars only (0-9, comma, space)
 *   neq[value]       — not equal
 *   isJSON           — valid JSON string
 *   sqlsafe          — safe characters only
 *   email            — email format
 *   file             — no dots/stars/spaces
 *   xlsx             — must end in .xlsx
 *   udfLabels[max]   — length after stripping {…} prefix
 *
 * CSS: .validatebox-invalid is added/removed on the element.
 */
(function($) {
  'use strict';

  if ($.fn.validatebox) return;

  // ========================================================================
  // Validation Rules Registry
  // ========================================================================

  var rules = {
    length: {
      validator: function(value, param) {
        var len = (value || '').length;
        var min = parseInt(param[0]) || 0;
        var max = parseInt(param[1]) || Infinity;
        return len >= min && len <= max;
      },
      message: 'Length must be between {0} and {1}.'
    },

    email: {
      validator: function(value) {
        return /^[\w.+-]+@[\w.-]+\.\w{2,}$/.test(value);
      },
      message: 'Invalid email address.'
    },

    inList: {
      validator: function(value) {
        var $el = $(this);
        // Native select — any non-empty value is valid
        if ($el.is('select')) {
          return value !== '' && value !== null && value !== undefined;
        }
        // Combobox — delegate to exists method
        if (typeof $el.combobox === 'function' && $.data(this, 'combobox')) {
          return $el.combobox('exists', value);
        }
        return true;
      },
      message: 'Invalid Selection.'
    },

    csn: {
      validator: function(value) {
        return /^[0-9, ]*$/.test(value);
      },
      message: 'Numeric values only.'
    },

    neq: {
      validator: function(value, param) {
        return parseFloat(value) !== parseFloat(param[0]);
      },
      message: 'Value cannot equal {0}'
    },

    isJSON: {
      validator: function(value) {
        try { JSON.parse(value); return true; } catch (e) { return false; }
      },
      message: 'Invalid JSON.'
    },

    sqlsafe: {
      validator: function(value) {
        var reg = /[.A-Z0-9\-\/\\]/;
        for (var i = 0; i < value.length; i++) {
          if (!reg.test(value[i])) return false;
        }
        return true;
      },
      message: 'Character not permitted.'
    },

    file: {
      validator: function(value) { return !/(\.|\*| )/.test(value); },
      message: 'Invalid filename.'
    },

    xlsx: {
      validator: function(value) { return /\w+\.xlsx$/.test(value); },
      message: 'Must be .xlsx file.'
    },

    udfLabels: {
      validator: function(value, param) {
        value = value.replace(/^\*?\{.*\}|^\*/g, '').trim();
        return value.length <= (parseInt(param[0]) || 80);
      },
      message: 'Must be less than {0} chars.'
    }
  };

  // ========================================================================
  // Parse validType from data-options attribute
  // ========================================================================

  function parseValidType(target) {
    var dataOpts = $(target).attr('data-options') || '';
    // Match validType:'...' or validType: ['...']
    var match = dataOpts.match(/validType\s*:\s*(?:'([^']+)'|\[([^\]]+)\])/);
    if (!match) return null;
    var raw = match[1] || match[2];
    return parseRuleString(raw);
  }

  function parseRuleString(str) {
    if (!str) return [];
    var result = [];
    // Strip outer array brackets only (e.g. ['length[1,15]','sqlsafe'] → 'length[1,15]','sqlsafe')
    // Do NOT strip when string is a bare rule like length[1,15]
    if (str.charAt(0) === '[') str = str.slice(1);
    if (str.charAt(str.length - 1) === ']' && str.indexOf('[') === -1) str = str.slice(0, -1);
    // Split by comma not inside brackets
    var parts = str.split(/,(?![^\[]*\])/);
    parts.forEach(function(part) {
      part = part.replace(/^['"\s]+|['"\s]+$/g, '').trim();
      if (!part) return;
      var m = part.match(/^(\w+)(?:\[(.+)\])?$/);
      if (m) {
        result.push({
          name: m[1],
          params: m[2] ? m[2].split(',').map(function(s) { return s.trim(); }) : []
        });
      }
    });
    return result;
  }

  // ========================================================================
  // Core validation
  // ========================================================================

  // DaisyUI v5: input-error works on all field types (input, select, textarea)
  var ERR_CLASS = 'input-error';

  function clearError($el) {
    $el.removeClass(ERR_CLASS);
  }

  function doValidate(target) {
    var state = $.data(target, 'validatebox');
    if (!state || state.disabled) return true;

    var $el = $(target);
    var value = $el.val();
    if (value === null || value === undefined) value = '';
    var valid = true;

    // 1. Required check
    var isRequired = $el.prop('required') || $el.attr('required') === 'true';
    if (isRequired && (value === '' || ($.isArray(value) && value.length === 0))) {
      valid = false;
    }

    // 2. ValidType rules (only if value is non-empty — empty + not-required = ok)
    if (valid && value !== '' && state.options.validType) {
      for (var i = 0; i < state.options.validType.length; i++) {
        var rule = state.options.validType[i];
        var ruleDef = rules[rule.name];
        if (ruleDef && !ruleDef.validator.call(target, value, rule.params)) {
          valid = false;
          break;
        }
      }
    }

    // 3. Apply DaisyUI error class
    state.valid = valid;
    if (valid) {
      $el.removeClass(ERR_CLASS);
    } else {
      $el.addClass(ERR_CLASS);
    }
    return valid;
  }

  // ========================================================================
  // Plugin entry point
  // ========================================================================

  $.fn.validatebox = function(options, param) {
    if (typeof options === 'string') {
      var method = $.fn.validatebox.methods[options];
      if (method) return method(this, param);
      return this;
    }

    // Init
    return this.each(function() {
      var state = $.data(this, 'validatebox');
      if (state) {
        if (options) $.extend(state.options, options);
        return;
      }
      var vt = parseValidType(this);
      state = $.data(this, 'validatebox', {
        options: $.extend({}, $.fn.validatebox.defaults, { validType: vt }, options),
        valid: true,
        disabled: false
      });
    });
  };

  // ========================================================================
  // Methods
  // ========================================================================

  $.fn.validatebox.methods = {
    options: function(jq) {
      var state = $.data(jq[0], 'validatebox');
      return state ? state.options : $.fn.validatebox.defaults;
    },

    validate: function(jq) {
      return jq.each(function() {
        doValidate(this);
      });
    },

    isValid: function(jq) {
      return doValidate(jq[0]);
    },

    disableValidation: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'validatebox');
        if (state) {
          state.disabled = true;
          clearError($(this));
        }
      });
    },

    enableValidation: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'validatebox');
        if (state) state.disabled = false;
      });
    },

    resetValidation: function(jq) {
      return jq.each(function() {
        clearError($(this));
        var state = $.data(this, 'validatebox');
        if (state) state.valid = true;
      });
    },

    required: function(jq, required) {
      return jq.each(function() {
        $(this).prop('required', required !== undefined ? required : true);
      });
    }
  };

  // ========================================================================
  // Defaults
  // ========================================================================

  $.fn.validatebox.defaults = {
    required: false,
    validType: null
  };

  // Expose rules so pages can add custom rules: $.fn.validatebox.defaults.rules.myRule = { ... }
  $.fn.validatebox.defaults.rules = rules;

})(jQuery);
