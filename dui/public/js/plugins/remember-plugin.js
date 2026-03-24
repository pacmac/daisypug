/**
 * Pure4 Remember Plugin — Persistent component state via .remember class
 *
 * Passive storage API that components call into to save/restore state.
 * Uses localStorage with namespaced keys and optional TTL expiry.
 *
 * Key format: rem:<pageId>:<elementId>
 * Value format: JSON { v: value, t: timestamp }
 *
 * Usage from components:
 *   if ($el.hasClass('remember') && $.remember) {
 *     var saved = $.remember.get($el);
 *     if (saved !== null) restore(saved);
 *     onChange: $.remember.set($el, newValue);
 *   }
 */
(function($) {
  'use strict';

  var PREFIX = 'rem:';
  var DEFAULT_TTL_DAYS = 30;

  function pageId() {
    return ($.page && $.page.state && $.page.state.pageId) || '_global';
  }

  function makeKey(el, scope) {
    var $el = (el instanceof $) ? el : $(el);
    var id = $el.attr('id');
    if (!id) return null;
    return PREFIX + (scope || pageId()) + ':' + id;
  }

  $.remember = {

    /** TTL in days — set to 0 to disable expiry */
    ttl: DEFAULT_TTL_DAYS,

    /**
     * Get saved value for an element.
     * Returns null if not found, expired, or element has no id.
     */
    get: function(el, scope) {
      var key = makeKey(el, scope);
      if (!key) return null;
      try {
        var raw = localStorage.getItem(key);
        if (!raw) return null;
        var data = JSON.parse(raw);
        // TTL check
        if (this.ttl > 0 && data.t) {
          var age = Date.now() - data.t;
          if (age > this.ttl * 86400000) {
            localStorage.removeItem(key);
            return null;
          }
        }
        return data.v !== undefined ? data.v : null;
      } catch (e) {
        return null;
      }
    },

    /**
     * Save value for an element.
     */
    set: function(el, value, scope) {
      var key = makeKey(el, scope);
      if (!key) return;
      try {
        localStorage.setItem(key, JSON.stringify({ v: value, t: Date.now() }));
      } catch (e) {
        // localStorage full or disabled — fail silently
      }
    },

    /**
     * Remove saved value for an element.
     */
    remove: function(el, scope) {
      var key = makeKey(el, scope);
      if (!key) return;
      localStorage.removeItem(key);
    },

    /**
     * Clear all remembered values for a specific page.
     * If no pageId given, clears current page.
     */
    clear: function(pid) {
      var prefix = PREFIX + (pid || pageId()) + ':';
      var toRemove = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(prefix) === 0) toRemove.push(k);
      }
      for (var j = 0; j < toRemove.length; j++) {
        localStorage.removeItem(toRemove[j]);
      }
    },

    /**
     * Clear ALL remembered values across all pages.
     */
    clearAll: function() {
      var toRemove = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(PREFIX) === 0) toRemove.push(k);
      }
      for (var j = 0; j < toRemove.length; j++) {
        localStorage.removeItem(toRemove[j]);
      }
    }
  };

  // ── Auto-wiring for known component types ──────────────────────────
  // Called after page content is injected (hooks into $.parser.parse)

  function initRememberElements(ctx) {
    var root = ctx ? $(ctx) : $(document);

    // Tabs: .remember.easyui-tabs
    root.find('.remember.easyui-tabs').addBack('.remember.easyui-tabs').each(function() {
      var $el = $(this);
      if ($el.data('_rememberBound')) return;
      $el.data('_rememberBound', true);
      var saved = $.remember.get($el);
      if (saved !== null) {
        $el.data('_rememberRestoring', true);
        var inputs = this.querySelectorAll(':scope > input.tab[type="radio"]');
        for (var i = 0; i < inputs.length; i++) {
          if (inputs[i].getAttribute('aria-label') === saved && !inputs[i].disabled) {
            inputs[i].click();
            break;
          }
        }
        $el.removeData('_rememberRestoring');
      }
      $el.on('change', '> input.tab[type="radio"]', function() {
        if ($el.data('_rememberRestoring')) return;
        // Programmatic select: re-apply saved tab instead of saving
        if ($el.data('_programmaticSelect')) {
          $el.removeData('_programmaticSelect');
          var remembered = $.remember.get($el);
          if (remembered && remembered !== this.getAttribute('aria-label')) {
            var inputs = $el[0].querySelectorAll(':scope > input.tab[type="radio"]');
            for (var j = 0; j < inputs.length; j++) {
              if (inputs[j].getAttribute('aria-label') === remembered && !inputs[j].disabled) {
                $el.data('_rememberRestoring', true);
                inputs[j].click();
                $el.removeData('_rememberRestoring');
                break;
              }
            }
          }
          return;
        }
        var title = this.getAttribute('aria-label') || '';
        $.remember.set($el, title);
      });
    });

  }

  // Hook into $.parser.parse to auto-wire after page content loads
  var _origParse = $.parser && $.parser.parse;
  if ($.parser) {
    $.parser.parse = function(target) {
      if (_origParse) _origParse.apply(this, arguments);
      initRememberElements(target);
    };
  }

  // Also run on document ready for initially rendered content
  $(function() {
    initRememberElements();
  });

})(jQuery);
