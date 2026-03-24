/**
 * Pure4 Validatebox Helper - EasyUI-compatible validatebox stub
 */
(function($) {
  'use strict';
  if ($.fn.validatebox) return;

  $.fn.validatebox = function(options, param) { 
    if (typeof options === 'string') {
      var method = $.fn.validatebox.methods[options];
      if (method) return method(this, param);
      return this;
    }
    return this.each(function() {
      var state = $.data(this, 'validatebox');
      if (state) {
        $.extend(state.options, options);
      } else {
        $.data(this, 'validatebox', {
          options: $.extend({}, $.fn.validatebox.defaults, options)
        });
      }
    });
  };

  $.fn.validatebox.methods = {
    options: function(jq) {
      var state = $.data(jq[0], 'validatebox');
      return state ? state.options : $.fn.validatebox.defaults;
    },
    destroy: function(jq) {
      return jq;
    },
    validate: function(jq) {
      return jq;
    },
    isValid: function() {
      return true;
    },
    enableValidation: function(jq) {
      return jq;
    },
    disableValidation: function(jq) {
      return jq;
    },
    resetValidation: function(jq) {
      return jq;
    },
    enable: function(jq) {
      return jq;
    },
    disable: function(jq) {
      return jq;
    },
    readonly: function(jq) {
      return jq;
    }
  };

  $.fn.validatebox.defaults = {
    required: false,
    validType: null,
    missingMessage: 'This field is required.',
    invalidMessage: null,
    novalidate: false,
    editable: true,
    disabled: false,
    readonly: false
  };
})(jQuery);
