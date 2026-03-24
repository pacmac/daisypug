/**
 * DUI Namespace — single canonical namespace for all DUI functionality
 *
 * MUST load before ALL other DUI plugins (first in dui-helpers.js file list).
 *
 * Structure:
 *   $.dui.ajax.*    — HTTP layer (ajax-plugin.js)
 *   $.dui.dialog.*  — messaging (messager-plugin.js)
 *   $.dui.form.*    — form utilities (form-plugin.js)
 *   $.dui.toolbar.* — toolbar state (toolbar-plugin.js)
 *   $.dui.grid.*    — datagrid/tree (datagrid-plugin.js)
 *   $.dui.nav.*     — navigation (page-plugin.js)
 *   $.dui.win.*     — windows/dialogs (window-plugin.js)
 *   $.dui.page.*    — page state & lifecycle (page-plugin.js)
 *   $.dui.fmt.*     — formatters (date, number, currency, etc.)
 *   $.dui.fn.*      — generic utilities/helpers
 *
 * Global registration:
 *   $.dui.register(name, fn)     — permanent DUI global: window[name] = fn (no warning)
 *   $.dui.euifix(name, fn)       — temporary EUI compat: window[name] with deprecation warning
 *   $.dui.euifixProp(name, get)  — temporary EUI compat: window[name] getter with deprecation warning
 */
(function($) {
  'use strict';

  // ── Namespace skeleton ──────────────────────────────────────────────
  $.dui = {
    ajax:    {},
    dialog:  {},
    form:    {},
    toolbar: {},
    grid:    {},
    nav:     {},
    win:     {},
    page:    {},   // page-plugin.js will populate this
    fmt:     {},   // formatters (date, number, currency, etc.)
    fn:      {},   // generic utilities

    // ── Server data (populated by globals.pug / utils.pug) ──────────
    bhave:    {},
    udata:    {},
    pdata:    {},
    codata:   {},
    ronly:    false,
    noron:    false,
    isdev:    false,
    debug:    false,
    runmode:  '',
    planplus: false,
    idlemin:  30,
    mobile:   false,
    loading:  false,
    reps:     {},

    // ── UI state (populated by main.js / plugins) ───────────────────
    menu:         {},    // { selected: { id, text, target } } — set by nav-plugin
    doc:          {},    // { id, ref } — document auto-load ref, set by nav-plugin
    tbut:         $(),   // toolbar button jQuery collection — set by toolbar-plugin
    buts:         {},    // button ID → asdpx char map — set by toolbar-plugin
    add:          {},    // { a: $add, n: $addm } — set by toolbar-plugin
    asdpx:        '',    // current asdpx button state string
    ajax_method:  'post' // default ajax method for forms
  };

  // ── Deprecation tracking ────────────────────────────────────────────
  // Only warn once per global name to avoid console spam
  var warned = Object.create(null);

  function deprecationWarn(name) {
    if (warned[name]) return;
    warned[name] = true;
    console.warn('[dui] window.' + name + '() is deprecated — use $.dui equivalent');
  }

  // ── $.dui.register(name, fn) ────────────────────────────────────────
  // Register a permanent DUI global function on window[name].
  // No deprecation warning — these are the canonical DUI API.
  $.dui.register = function(globalName, fn) {
    window[globalName] = fn;
  };

  // ── $.dui.euifix(name, fn) ────────────────────────────────────────
  // Register a temporary EUI compatibility shim on window[name].
  // Delegates to fn and logs a deprecation warning on first use.
  // These MUST be migrated away — they exist only for legacy page compat.
  $.dui.euifix = function(globalName, fn) {
    window[globalName] = function() {
      deprecationWarn(globalName);
      return fn.apply(this, arguments);
    };
  };

  // ── $.dui.euifixProp(name, getter, setter) ─────────────────────────
  // Create a temporary EUI compat property on window[name] with deprecation logging.
  $.dui.euifixProp = function(globalName, getter, setter) {
    var desc = {
      get: function() {
        deprecationWarn(globalName);
        return getter();
      },
      configurable: true,
      enumerable: true
    };
    if (setter) {
      desc.set = function(v) {
        deprecationWarn(globalName);
        setter(v);
      };
    }
    Object.defineProperty(window, globalName, desc);
  };

  // ── $.dui.icon(cls, opts) — shared icon renderer ────────────────────
  // Creates a <span data-lucide="..."> element with standard classes.
  // cls:  EUI iconCls (e.g. 'icon-part') or raw Lucide name (e.g. 'search')
  // opts.size:    'sm' (14px) | 'md' (16px, default) | 'lg' (20px)
  // opts.color:   DaisyUI color class (e.g. 'text-primary')
  // opts.opacity: opacity class (e.g. 'opacity-70')
  // opts.bold:    true → stroke-width 2.75 (via .icon-bold class)
  // opts.cls:     extra classes
  var iconSizeMap = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };

  $.dui.icon = function(cls, opts) {
    if (!cls) return null;
    opts = opts || {};
    var resolved = $.dui.getIcon ? $.dui.getIcon(cls) : cls;
    if (!resolved) return null;
    var sizeClass = iconSizeMap[opts.size] || iconSizeMap.md;
    var classes = [sizeClass, 'flex-shrink-0'];
    if (opts.bold) classes.push('icon-bold');
    if (opts.autocolor) classes.push($.dui.iconColor($.dui._iconColorIndex++));
    else if (opts.color) classes.push(opts.color);
    if (opts.opacity) classes.push(opts.opacity);
    if (opts.cls) classes.push(opts.cls);
    var el = document.createElement('span');
    el.setAttribute('data-lucide', resolved);
    el.className = classes.join(' ');
    return el;
  };

  // ── $.dui.iconColors — shared colour palette for auto-colouring icons ──
  // Matches the server-side _iconColors palette in helpers.pug.
  // $.dui.iconColor(i) returns the colour class at index i (cycling).
  $.dui._iconColorIndex = 0;
  $.dui.iconColors = ['text-primary','text-secondary','text-accent','text-info','text-success','text-warning','text-error'];
  $.dui.iconColor = function(i) {
    return $.dui.iconColors[i % $.dui.iconColors.length];
  };

  // ── $.dui.fmt.* — canonical formatters ──────────────────────────────
  // Used by datagrid columns, QBE definitions, page scripts.
  // Legacy eui.* aliases are set up in dui-helpers.js with deprecation warnings.
  var fmt = $.dui.fmt;

  fmt.date = function(val) {
    if (!val) return '';
    var d = new Date(val);
    if (isNaN(d.getTime())) return val;
    var mm = ('0' + (d.getMonth() + 1)).slice(-2);
    var dd = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + mm + '-' + dd;
  };

  fmt.number = function(val, dec) {
    if (dec === undefined) dec = 2;
    if (!val || isNaN(val)) val = 0;
    if (!isNaN(parseFloat(val))) val = parseFloat(val);
    return val.toFixed(dec);
  };

  fmt.currency = function(val) {
    return '$' + fmt.number(val, 2);
  };

  fmt.integer = function(val) {
    return fmt.number(val);
  };

  fmt.ref2text = function(val) {
    if (val) return val.replace(/\^/g, '.');
  };

  fmt.table = function(cols, data) {
    if (!data || !data.length) return $('<span/>');
    var html = '<table style="border-collapse:collapse;font-size:12px;">';
    html += '<tr>' + cols.map(function(c){ return '<th style="padding:2px 6px;border-bottom:1px solid #666;">' + c.title + '</th>'; }).join('') + '</tr>';
    data.forEach(function(row) {
      html += '<tr>' + cols.map(function(c) {
        var val = row[c.field];
        if (c.formatter) val = c.formatter(val, row);
        return '<td style="padding:2px 6px;' + (c.style || '') + '">' + (val == null ? '' : val) + '</td>';
      }).join('') + '</tr>';
    });
    html += '</table>';
    return $(html);
  };

  // Plugin load tracker — _startup.js reports the summary
  $.dui._plugins = { loaded: ['dui-namespace'], failed: [] };

  // ── Global cl() alias for console.log ─────────────────────────────
  // Many page scripts declare `var cl = console.log` — provide it globally
  // so pages that forget still work.  Page-level declarations override this.
  if (!window.cl) window.cl = console.log.bind(console);

  // ── Global ce() alias for console.error ─────────────────────────────
  // Legacy page scripts (dg_resutil.js) use ce() as shorthand.
  if (!window.ce) window.ce = console.error.bind(console);

})(jQuery);
