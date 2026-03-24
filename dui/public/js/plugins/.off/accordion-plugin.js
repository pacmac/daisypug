/**
 * Pure4 Accordion Helper - EasyUI-compatible accordion stub
 */
(function($) {
  'use strict';
  if ($.fn.accordion) return;

  $.fn.accordion = function(options, param) {
    if (typeof options === 'string') {
      var method = $.fn.accordion.methods[options];
      if (method) return method(this, param);
      return this;
    }
    return this.each(function() {
      var state = $.data(this, 'accordion');
      if (state) {
        $.extend(state.options, options);
      } else {
        $.data(this, 'accordion', {
          options: $.extend({}, $.fn.accordion.defaults, options)
        });
      }
    });
  };

  $.fn.accordion.methods = {
    options: function(jq) {
      var state = $.data(jq[0], 'accordion');
      return state ? state.options : $.fn.accordion.defaults;
    },
    panels: function() {
      return [];
    },
    resize: function(jq) {
      return jq;
    },
    getSelections: function() {
      return [];
    },
    getSelected: function() {
      return null;
    },
    getPanel: function() {
      return null;
    },
    getPanelIndex: function() {
      return -1;
    },
    select: function(jq) {
      return jq;
    },
    unselect: function(jq) {
      return jq;
    },
    add: function(jq) {
      return jq;
    },
    remove: function(jq) {
      return jq;
    }
  };

  $.fn.accordion.defaults = {
    width: 'auto',
    height: 'auto',
    fit: false,
    border: true,
    animate: true,
    multiple: false,
    selected: 0,
    halign: 'top'
  };
})(jQuery);
