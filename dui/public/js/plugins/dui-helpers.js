// DUI helper loader (single include, ordered script injection)
(function() {

  // ===========================================================================
  // Legacy eui namespace — kept for unmigrated page scripts only.
  // Formatters are defined in dui-namespace.js ($.dui.fmt.*).
  // These getters delegate to $.dui.fmt.* with deprecation warnings.
  // ===========================================================================
  window.eui = window.eui || {};
  var euiFmtNames = ['date', 'number', 'currency', 'integer', 'ref2text', 'table', 'datetime'];
  var euiWarned = Object.create(null);
  euiFmtNames.forEach(function(name) {
    Object.defineProperty(window.eui, name, {
      get: function() {
        if (!euiWarned[name]) {
          euiWarned[name] = true;
          console.warn('[dui] eui.' + name + ' is deprecated — use $.dui.fmt.' + name);
        }
        return $.dui.fmt[name];  // resolve at call time from plugin bundle
      },
      configurable: true,
      enumerable: true
    });
  });

  // ===========================================================================
  // Block flash timer (ping is allowed through)
  // ===========================================================================
  (function() {
    // Intercept setInterval to block flash timer only
    var origSetInterval = window.setInterval;
    var blockedIds = {};
    window.setInterval = function(cb, delay) {
      if (delay === 5000) {
        var s = cb.toString();
        if (s.indexOf('flash') !== -1) {
          var id2 = Math.random(); blockedIds[id2] = 1; return id2;
        }
      }
      return origSetInterval.apply(this, arguments);
    };
    var origClearInterval = window.clearInterval;
    window.clearInterval = function(id) {
      if (blockedIds[id]) { delete blockedIds[id]; return; }
      return origClearInterval.apply(this, arguments);
    };

    // Block document.location = '/' reloads
    var locDesc = Object.getOwnPropertyDescriptor(window.Document.prototype, 'location');
    if (locDesc && locDesc.set) {
      Object.defineProperty(document, 'location', {
        set: function(v) {
          if (v === '/' || v === window.location.origin + '/') return;
          return locDesc.set.call(this, v);
        },
        get: function() { return window.location; }
      });
    }
  })();

  // ===========================================================================
  // localStorage debug clear
  // ===========================================================================
  (function() {
    var p = new URLSearchParams(window.location.search);
    if (p.has('debug') && $.remember) $.remember.remove($('#navmenu'), '_global');
  })();

  // ===========================================================================
  // Sync widget stubs — placeholder $.fn entries so main.js/legacy code
  // doesn't throw before the real async plugins arrive.
  // NOT stubbed here: textbox, combobox, numberbox, spinner, timespinner,
  //   messager — those have real plugins that load first/early.
  // ===========================================================================
  (function() {
    if (typeof $ === 'undefined') return;
    var noop = function() { return this; };
    var stubs = [
      'linkbutton','menubutton','window','dialog','datagrid',
      'combotree','combogrid','calendar','slider',
      'checkbox','radiobutton','switchbutton','treegrid','propertygrid',
      'layout','accordion','splitbutton','datebox','datetimebox',
      'searchbox','filebox','passwordbox'
    ];
    for (var i = 0; i < stubs.length; i++) {
      if (!$.fn[stubs[i]]) $.fn[stubs[i]] = noop;
    }
  })();

  // ===========================================================================
  // Debug infrastructure
  // ===========================================================================
  var debugState = Object.create(null);

  window.duiDebug = window.duiDebug || {
    enable: function(name) {
      if (name) {
        debugState[String(name)] = true;
        return String(name) + ' debug enabled';
      }
    },
    disable: function(name) {
      if (name) {
        debugState[String(name)] = false;
        return String(name) + ' debug disabled';
      }
    },
    enabled: function(name) {
      return !!debugState[String(name)];
    },
    log: function(name, method, args) {
      if (!this.enabled(name)) return;
      var list = Array.prototype.slice.call(args || []);
      console.log('[dui:' + name + ']', method, list);
    },
    wrapMethods: function(name, methods) {
      if (!methods) return methods;
      Object.keys(methods).forEach(function(key) {
        var fn = methods[key];
        if (typeof fn !== 'function') return;
        if (fn.__duiWrapped) return;
        var wrapped = function() {
          window.duiDebug.log(name, key, arguments);
          return fn.apply(this, arguments);
        };
        wrapped.__duiWrapped = true;
        methods[key] = wrapped;
      });
      return methods;
    }
  };

  // Plugins are now loaded from dui-plugins.min.js (single concatenated file)
  // See: npm run dui:plugins

})();
