/**
 * Pure4 Page Plugin — DUI Page Lifecycle Manager
 *
 * Singleton namespace ($.page) that owns page lifecycle hooks, state,
 * and page-specific utility functions.
 *
 * Page JS files (sa_parts.js, etc.) register via $.page.register().
 * Plugins (form-plugin, toolbar-plugin) invoke hooks via $.page.hook().
 *
 * Hook conventions:
 *   before* — async: hook receives a done() callback; call it to proceed
 *   after*  — sync fire-and-forget
 *
 * Page functions:
 *   $.page.fn.xxx() — page-specific utilities (replaces legacy dwap.page.xxx)
 *   Cleared automatically on navigation via $.page.reset()
 *
 * Loaded before form-plugin.js in script order.
 */
(function($) {
  'use strict';

  var hooks = {};
  var state = { fkey: null, mode: null, loading: false, ronly: false, pageId: null };
  var _listeners = [];  // [{target, event, handler}, ...]
  var _intervals = [];  // timer IDs
  var _timeouts = [];   // timer IDs

  $.page = {
    state: state,
    fn: {},
    reps: {},    // report definitions keyed by appId — set from $.dui.reps at init
    pmens: {},   // active report menu items cache — rebuilt on each page navigation

    /**
     * Page-ready entry point — replaces $(document).ready() in page scripts.
     * DOM is already available when page scripts execute (loaded via panel refresh),
     * so fn is invoked immediately. This is a seam for future pre/post init logic.
     * @param {Function} fn - page init function
     */
    ready: function(fn) {
      if (typeof fn === 'function') fn();
    },

    on: function(target, event, handler) {
      $(target).on(event, handler);
      _listeners.push({target: target, event: event, handler: handler});
    },

    setInterval: function(fn, ms) {
      var id = setInterval(fn, ms);
      _intervals.push(id);
      return id;
    },

    setTimeout: function(fn, ms) {
      var id = setTimeout(fn, ms);
      _timeouts.push(id);
      return id;
    },

    /**
     * Register page hooks and/or utility functions.
     * @param {Object} opts - { hooks: { ... }, fn: { ... } }
     */
    register: function(opts) {
      if (!opts) return;
      if (opts.hooks) $.extend(hooks, opts.hooks);
      if (opts.fn) $.extend($.page.fn, opts.fn);
      if (opts.autonum) $.page.autonum = opts.autonum;
    },

    /**
     * Invoke a hook by name.
     *
     * Before-hooks: $.page.hook('beforeAdd', proceedFn)
     *   → no hook registered: calls proceedFn() immediately
     *   → hook registered: calls hook(proceedFn) — page decides whether to call it
     *
     * After-hooks: $.page.hook('afterLoad', data)
     *   → no hook registered: no-op
     *   → hook registered: calls hook(data)
     */
    hook: function(name) {
      var fn = hooks[name];
      var args = Array.prototype.slice.call(arguments, 1);

      if (/^before/.test(name)) {
        var proceed = args.pop();
        if (!fn) { proceed(); return; }
        fn.apply(null, args.concat([proceed]));
      } else {
        if (!fn) return;
        fn.apply(null, args);
      }
    },

    /**
     * Save current page ID to localStorage.
     * Called from trclick() on every page navigation.
     * @param {string} pageId - e.g. 'inv^sa_parts'
     * @param {string} [pageName] - human-readable name e.g. 'Part Masters'
     */
    savePage: function(pageId, pageName) {
      if (!pageId || pageId === 'user^task_todo') return;
      state.pageId = pageId;
      state.pageName = pageName || pageId;
      // Resolve module name from menu tree
      state.pageModule = '';
      var menus = $.dui.udata && $.dui.udata.menus;
      if (menus) {
        var items = Array.isArray(menus) ? menus : Object.values(menus);
        for (var i = 0; i < items.length; i++) {
          var grp = items[i];
          if (grp && grp.children) {
            for (var j = 0; j < grp.children.length; j++) {
              if (grp.children[j].id === pageId) { state.pageModule = grp.text || ''; break; }
            }
          }
          if (state.pageModule) break;
        }
      }
      // Update footer with current page name (Module → Page)
      var $fn = $('#footer-page-name');
      if ($fn.length) {
        var display = state.pageModule ? state.pageModule + ' \u2192 ' + state.pageName : state.pageName;
        $fn.text(display);
      }
      // Resolve ronly from filtered menu tree (set by /api/init from .ro suffix)
      if (!$.dui.noron) {
        state.ronly = false;
        var menus = $.dui.udata && $.dui.udata.menus;
        if (menus) {
          var items = Array.isArray(menus) ? menus : Object.values(menus);
          (function find(list) {
            for (var i = 0; i < list.length; i++) {
              if (list[i].id === pageId) { state.ronly = !!list[i].ronly; return; }
              if (list[i].children) find(list[i].children);
            }
          })(items);
        }
        $.dui.ronly = state.ronly; // sync for legacy page scripts
        if (typeof isronly === 'function') isronly();
      }
      if ($.remember) $.remember.set($('#navmenu'), pageId, '_global');
      // Resolve page-specific bhave from full bhave tree
      $.page.resolveBhave(pageId);
      // Rebuild report dropdown for the new page
      if (typeof window.repmenus === 'function') {
        window.repmenus({ id: pageId });
      }
    },

    /**
     * Resolve page-specific bhave from the full bhave tree ($.dui._bhave).
     * Mirrors server-side logic in pages.js:401-405:
     *   pageBhave = { ...bhaveAll[module][page] }
     *   pageBhave._global = bhaveAll.global
     * Sets $.dui.bhave for the current page.
     * @param {string} pageId - e.g. 'inv^sa_parts'
     */
    resolveBhave: function(pageId) {
      var all = ($.dui && $.dui._bhave) || {};
      if (!pageId) { $.dui.bhave = {}; return; }
      var parts = pageId.split('^');
      var mod = parts[0] || '';
      var page = parts.slice(1).join('^');
      var modBhave = all[mod] || {};
      var pageBhave = $.extend({}, modBhave[page] || {});
      pageBhave._global = all.global || {};
      $.dui.bhave = pageBhave;
    },

    /**
     * Get last visited page ID from localStorage.
     * @returns {string|null}
     */
    getLastPage: function() {
      return ($.remember) ? $.remember.get($('#navmenu'), '_global') : null;
    },

    /**
     * Reset on page navigation. Clears hooks, fn, resets state, wipes $.dui.page.
     * Automatically saves the current page ID from the content panel URL.
     */
    reset: function() {
      // Teardown tracked listeners
      _listeners.forEach(function(l) { $(l.target).off(l.event, l.handler); });
      _listeners = [];
      // Teardown tracked timers
      _intervals.forEach(function(id) { clearInterval(id); });
      _intervals = [];
      _timeouts.forEach(function(id) { clearTimeout(id); });
      _timeouts = [];

      hooks = {};
      $.page.fn = {};
      $.page.autonum = null;
      $.page.pmens = {};  // clear report menu cache on navigation
      state.fkey = null;
      state.mode = null;
      state.loading = false;
      // Clear toolbar buttons on navigation (empty state)
      if (typeof butEn === 'function') butEn('', 'page.reset');
      // Don't reset ronly — set by savePage() from menu tree, persists across form loads
      // Don't reset reps — full report set for all apps, persists across navigations
      $.dui.page = {};

      // Save current page ID from content panel URL (_page=mod^page)
      try {
        var panelOpts = $('#content').panel('options');
        var url = panelOpts && panelOpts.href;
        if (url) {
          var match = url.match(/[?&]_page=([^&]+)/);
          if (match) $.page.savePage(decodeURIComponent(match[1]));
        }
      } catch (e) {}
    },

    /**
     * Startup — load last page or hash route.
     * Called from dui-helpers.js after all plugins are loaded.
     */
    // --- History nav (Back button) ---
    history: [],

    historyAdd: function(menid) {
      var h = $.page.history;
      if (h.length === 0) h.push(menid);
      else if (h.slice(-1)[0].split('&')[0] !== menid) h.push(menid);
    },

    historyBack: function() {
      var h = $.page.history;
      var last = h.slice(-2)[0];
      h.splice(-1);
      if (!last) return;
      if (typeof loadpage === 'function') loadpage(last);
    },

    startup: function() {
      // Transfer report definitions from $.dui (server-injected) to $.page
      if ($.dui.reps && Object.keys($.dui.reps).length) {
        $.page.reps = $.dui.reps;
      }

      $('#layout div.opaque').addClass('fadein');

      // Hash route takes priority
      if (location.hash && location.hash.length > 1) {
        var hash = location.hash.slice(1);
        if (typeof loadpage === 'function') loadpage(hash);
        return;
      }

      // Load last visited page from localStorage
      var lpage = $.page.getLastPage();
      if (typeof lpage === 'string' && typeof loadpage === 'function') {
        loadpage(lpage);
      } else if (typeof splash === 'function') {
        splash();
      }
    }
  };

  // ── Content panel lifecycle (moved from main.js) ───────────────────
  // Binds onBeforeLoad (page teardown) and onLoad (page init) to the
  // #content panel. This is the central page lifecycle orchestrator.
  $(document).ready(function() {
    $('#content').panel({

      onBeforeLoad: function(par) {
        // Gate: $.page.onBeforePageLoad can prevent page load (return false to block)
        if (typeof $.page.onBeforePageLoad === 'function' && $.page.onBeforePageLoad() === false) return false;
        if ($.page) $.page.reset();
        $(this).panel('clear');
        $('a,form').off('done');
        // Remove toolbar application buttons & controls
        $('a.appbut, span.app-sep, #dyn-toolbar').remove();
        // Remove toolbut-mounted buttons from previous page
        if ($.dui.toolbar && $.dui.toolbar._unmount) $.dui.toolbar._unmount();
      },

      onLoad: function(data) {

        // Excel export button (toolbar #dg2excel)
        $('a#dg2excel').linkbutton({
          text: 'Excel',
          iconCls: 'icon-xls',
          onClick: function() {
            var cbo = $('#content .datagrid-view:visible:first .datagrid-f');
            cbo.datagrid('toExcel', cbo.attr('id') + '.xls' || 'datagrid.xls');
          }
        });

        // .now timespinner — set to current time on load and on keypress
        $('.now').timespinner('setValue', hrmin());
        $('.now').keydown(function(e) { e.preventDefault(); $(this).timespinner('setValue', hrmin()); });

        // .valuetip — tooltip on textbox info icon showing full value
        $('.valuetip').css('text-overflow', 'ellipsis').each(function() {
          $(this).textbox({
            icons: [{ iconCls: 'icon-info' }]
          }).textbox('getIcon', 0).tooltip({
            onShow: function() {
              var value = $(this).closest('.textbox').prev().textbox('getText').replace(/(\r\n|\n|\r)/g, '<br />');
              if (value) $(this).tooltip('update', value).tooltip('reposition');
              else $(this).tooltip('tip').css('left', '-9999px');
            }
          });
        });

        // Auto-init forms with .single or .multi class
        $('#content form.single, #content form.multi').form();

        // Load document by ID, name, or callback-function link
        if ($.dui.doc && $.dui.doc.id) {
          if (typeof($.dui.page[$.dui.doc.id]) == 'function') {
            setTimeout(function() {
              $.dui.page[$.dui.doc.id]($.dui.doc.ref);
            }, 500);
          } else {
            var fkey = $('input.fkey[comboname="' + $.dui.doc.id + '"]');
            if (fkey.length == 0) fkey = $('#' + $.dui.doc.id);
            if (fkey.length == 0) return;
            setTimeout(function() {
              fkey.combobox('select', $.dui.doc.ref);
              $.dui.doc = {};
            }, 500);
          }
        }

        // Render Lucide icons in newly loaded page content
        if (window.lucide) {
          var icons = document.getElementById('content').querySelectorAll('span[data-lucide]');
          if (icons.length) lucide.createIcons({ nodes: icons });
        }

      } // onLoad
    });
  });

  // Hash change listener (moved from main.js by claude)
  $(window).on('hashchange', function() {
    if (!location.hash || location.hash.length <= 1) return;
    var hash = location.hash.slice(1);
    if (typeof loadpage === 'function') loadpage(hash);
  });

})(jQuery);
