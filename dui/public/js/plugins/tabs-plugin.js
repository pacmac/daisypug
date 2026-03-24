/**
 * Pure4 Tabs Plugin - EasyUI-compatible tabs API for DaisyUI radio-input tabs
 *
 * DaisyUI tabs DOM structure (rendered by +tabs/+tab-item mixins):
 *   div.tabs.easyui-tabs[role="tablist"]
 *     input.tab[type="radio" name="tabs_xxxxx" aria-label="Title" checked]
 *     div.tab-content
 *     input.tab[type="radio" name="tabs_xxxxx" aria-label="Title2"]
 *     div.tab-content
 */
(function($) {
  'use strict';

  // Overwrite jQuery UI tabs — DaisyUI uses radio-input tabs, not jQuery UI panels

  function parseOptions(target) {
    return $.extend({}, $.parser.parseOptions(target, [
      'width','height',{fit:'boolean',border:'boolean',plain:'boolean'}
    ]));
  }

  // Get all radio inputs (tabs) as an array of DOM elements
  function getInputs(el) {
    return Array.prototype.slice.call(el.querySelectorAll(':scope > input.tab[type="radio"]'));
  }

  // Resolve `which` (number=index, string=aria-label) to a radio input DOM element
  function resolveTab(el, which) {
    var inputs = getInputs(el);
    if (typeof which === 'number') return inputs[which] || null;
    if (typeof which === 'string') {
      for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].getAttribute('aria-label') === which) return inputs[i];
      }
    }
    return null;
  }

  // Get the .tab-content sibling following a radio input
  function getContent(input) {
    var next = input.nextElementSibling;
    return (next && next.classList.contains('tab-content')) ? next : null;
  }

  // Get index of a radio input within its tab set
  function indexOf(el, input) {
    var inputs = getInputs(el);
    return inputs.indexOf(input);
  }

  // Fire onSelect callback if defined
  function fireOnSelect(el, input) {
    var state = $.data(el, 'tabs');
    if (state && state.options && typeof state.options.onSelect === 'function') {
      var title = input.getAttribute('aria-label') || '';
      var idx = indexOf(el, input);
      state.options.onSelect.call(el, title, idx);
    }
  }

  $.fn.tabs = function(options, param) {
    if (typeof options === 'string') {
      var method = $.fn.tabs.methods[options];
      if (method) return method(this, param);
      return this;
    }

    options = options || {};
    return this.each(function() {
      var el = this;
      var state = $.data(el, 'tabs');
      if (state) {
        $.extend(state.options, options);
      } else {
        state = $.data(el, 'tabs', {
          options: $.extend({}, $.fn.tabs.defaults, parseOptions(el), options),
          bound: false
        });
      }
      // Bind native change listener once for onSelect callback
      if (!state.bound && state.options.onSelect) {
        state.bound = true;
        $(el).on('change', '> input.tab[type="radio"]', function() {
          fireOnSelect(el, this);
        });
      }
    });
  };

  $.fn.tabs.methods = {
    options: function(jq) {
      var state = $.data(jq[0], 'tabs');
      return state ? state.options : {};
    },

    tabs: function(jq) {
      var inputs = getInputs(jq[0]);
      var result = [];
      for (var i = 0; i < inputs.length; i++) {
        var c = getContent(inputs[i]);
        if (c) result.push($(c));
      }
      return result;
    },

    resize: function(jq) {
      return jq;
    },

    add: function(jq, options) {
      return jq;
    },

    close: function(jq, which) {
      return jq;
    },

    getTab: function(jq, which) {
      var input = resolveTab(jq[0], which);
      if (!input) return null;
      var c = getContent(input);
      return c ? $(c) : null;
    },

    getTabIndex: function(jq, tab) {
      if (!tab) return -1;
      // tab can be a jQuery object wrapping a .tab-content div
      var panel = tab.jquery ? tab[0] : tab;
      // Find the radio input whose next sibling is this panel
      var inputs = getInputs(jq[0]);
      for (var i = 0; i < inputs.length; i++) {
        if (getContent(inputs[i]) === panel) return i;
      }
      return -1;
    },

    getSelected: function(jq) {
      var checked = jq[0].querySelector(':scope > input.tab[type="radio"]:checked');
      if (!checked) return null;
      var c = getContent(checked);
      return c ? $(c) : null;
    },

    select: function(jq, which) {
      return jq.each(function() {
        var input = resolveTab(this, which);
        if (input && !input.disabled) {
          $(this).data('_programmaticSelect', true);
          input.click();
        }
      });
    },

    unselect: function(jq, which) {
      return jq;
    },

    exists: function(jq, which) {
      return resolveTab(jq[0], which) !== null;
    },

    update: function(jq) {
      return jq;
    },

    enableTab: function(jq, which) {
      return jq.each(function() {
        var input = resolveTab(this, which);
        if (input) {
          input.disabled = false;
          input.classList.remove('tab-disabled');
        }
      });
    },

    disableTab: function(jq, which) {
      return jq.each(function() {
        var input = resolveTab(this, which);
        if (input) {
          input.disabled = true;
          input.classList.add('tab-disabled');
        }
      });
    },

    enableAll: function(jq) {
      return jq.each(function() {
        var inputs = getInputs(this);
        for (var i = 0; i < inputs.length; i++) {
          inputs[i].disabled = false;
          inputs[i].classList.remove('tab-disabled');
        }
      });
    },

    disableAll: function(jq, except) {
      return jq.each(function() {
        var inputs = getInputs(this);
        for (var i = 0; i < inputs.length; i++) {
          if (i === except) {
            inputs[i].disabled = false;
            inputs[i].classList.remove('tab-disabled');
          } else {
            inputs[i].disabled = true;
            inputs[i].classList.add('tab-disabled');
          }
        }
      });
    },

    showHeader: function(jq) {
      return jq;
    },

    hideHeader: function(jq) {
      return jq;
    },

    showTool: function(jq) {
      return jq;
    },

    hideTool: function(jq) {
      return jq;
    },

    scrollBy: function(jq) {
      return jq;
    }
  };

  $.fn.tabs.defaults = {
    width: 'auto',
    height: 'auto',
    fit: false,
    border: true,
    plain: false
  };

})(jQuery);
