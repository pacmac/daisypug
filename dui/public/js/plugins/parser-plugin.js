/**
 * Pure4 Parser Helper - EasyUI-compatible data-options parser
 *
 * Implements $.parser.parseOptions to support legacy data-options attributes.
 */
(function($) {
  'use strict';

  $.parser = $.parser || {};
  $.parser.plugins = $.parser.plugins || [];

  // Parse method — auto-initializes registered plugins on matching elements
  if (!$.parser.parse) {
    $.parser.parse = function(target) {
      var $ctx = target ? $(target) : $(document);
      for (var i = 0; i < $.parser.plugins.length; i++) {
        var name = $.parser.plugins[i];
        if ($.fn[name]) {
          $ctx.find('.' + name)[name]();
        }
      }
    };
  }

  $.parser.parseOptions = function(target, properties) {
    var t = $(target);
    var options = {};
    
    // 1. Parse data-options attribute
    var s = $.trim(t.attr('data-options'));
    if (s) {
      if (s.substring(0, 1) !== '{') {
        s = '{' + s + '}';
      }
      try {
        options = (new Function('return ' + s))();
      } catch(e) {
        var msg = '[parser] failed to parse data-options on #' + (t.attr('id') || t.attr('name') || '?') + ': ' + e.message;
        console.error(msg, { raw: s, error: e });
        if ($.messager && $.messager.show) {
          $.messager.show({ title: 'Parse Error', msg: msg, timeout: 5000, showType: 'fade', cls: 'error' });
        }
      }
    }

    // 2. Parse HTML5 data-* attributes (optional, but good for modernizing)
    var data = t.data();
    if (data) {
      $.extend(options, data);
    }

    // 3. Parse explicit properties from attributes/style
    if (properties) {
      var opts = {};
      for (var i = 0; i < properties.length; i++) {
        var pp = properties[i];
        if (typeof pp === 'string') {
          if (pp === 'width' || pp === 'height' || pp === 'left' || pp === 'top') {
            opts[pp] = parseInt(target.style[pp]) || undefined;
          } else {
            opts[pp] = t.attr(pp);
          }
        } else {
          for (var name in pp) {
            var type = pp[name];
            var val = t.attr(name);
            if (val !== undefined) {
              if (type === 'boolean') {
                opts[name] = (val === 'true' || val === 'checked' || val === 'selected' || val === '');
              } else if (type === 'number') {
                opts[name] = (val === '0' ? 0 : parseFloat(val) || undefined);
              } else {
                opts[name] = val;
              }
            }
          }
        }
      }
      $.extend(options, opts);
    }
    
    return options;
  };

})(jQuery);
