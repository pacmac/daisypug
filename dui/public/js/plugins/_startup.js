/**
 * DUI Plugin Startup — runs after all plugins are loaded
 * This file MUST be last in the concatenation order.
 */
(function($) {
  'use strict';

  // Wrap debug methods on all widget plugins
  if (window.duiDebug && typeof window.duiDebug.wrapMethods === 'function') {
    var widgets = [
      'parser','layout','textbox','combo','combobox','numberbox',
      'datebox','spinner','timespinner','form','panel','linkbutton','menubutton','window',
      'dialog','messager','tabs','tree','datagrid'
    ];
    widgets.forEach(function(name) {
      var fn = $.fn[name];
      if (fn && fn.methods) {
        window.duiDebug.wrapMethods(name, fn.methods);
      }
    });
  }

  window.duiHelpersLoaded = true;

  // Step label map — add entries here for new commands
  var STEP_LABELS = {
    restart: 'Server', css: 'Tailwind CSS', js: 'Plugin bundle', pug: 'Template cache'
  };

  // Poll /api/init until server is back, then reload
  function _pollForRecovery() {
    setTimeout(function poll() {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/init?_t=' + Date.now(), true);
      xhr.timeout = 3000;
      xhr.onload = function() {
        try {
          var data = JSON.parse(xhr.responseText);
          if (data && data.udata && data.udata.menus) { location.replace('/'); return; }
        } catch(e) {
          // Server returned HTML (login page) — session lost, just go home
          location.replace('/');
          return;
        }
        if (xhr.status === 200) { location.replace('/'); return; }
        setTimeout(poll, 1000);
      };
      xhr.onerror = function() { setTimeout(poll, 1000); };
      xhr.ontimeout = function() { setTimeout(poll, 1000); };
      xhr.send();
    }, 4000);
  }

  // Show step results in a messager dialog
  function _showResults(cmd, steps) {
    $.messager.progress('close');
    var allOk = steps.every(function(s) { return s.ok; });
    var rows = steps.map(function(s) {
      var icon = s.ok
        ? '<span style="color:oklch(0.72 0.19 163)">&#10003;</span>'
        : '<span style="color:oklch(0.71 0.19 22)">&#10007;</span>';
      var label = STEP_LABELS[s.step] || s.step;
      var err = s.err ? '<span style="opacity:0.5;font-size:0.8em"> — ' + s.err + '</span>' : '';
      return '<div style="display:flex;align-items:center;gap:8px;padding:4px 0">' + icon + ' ' + label + err + '</div>';
    }).join('');
    var body = '<div style="margin-top:4px">' + rows + '</div>';
    var title = allOk ? cmd + ' complete' : cmd + ' failed';
    $.messager.alert(title.charAt(0).toUpperCase() + title.slice(1), body, allOk ? 'success' : 'error', function() {
      location.reload();
    });
  }

  // Run a server command with overlay feedback
  function _runCommand(cmd) {
    $.messager.progress({ msg: cmd.charAt(0).toUpperCase() + cmd.slice(1) + '...' });
    ajaxget('', {}, function(d) {
      if (d.poll) {
        _pollForRecovery();
      } else {
        _showResults(cmd, d.steps);
      }
    }, {
      url: '/' + cmd + '/run',
      method: 'POST',
      dataType: 'json',
      error: function(xhr) {
        if (xhr.status === 0) {
          _pollForRecovery();
        } else {
          $.messager.progress('close');
          $.messager.alert('Error', 'Command failed: ' + xhr.statusText, 'error');
        }
      }
    });
  }

  // Fetch init data from server, then trigger page startup
  $(function() {
    ajaxget('', {}, function(data) {
      // _bhave is the full bhave tree — page-specific resolved by $.page.resolveBhave()
      Object.assign($.dui, data);
      // init loaded silently — errors are reported by ajaxget

      // Auto-theme: switch between day/night themes based on sun times
      if ($.dui.locale && $.dui.locale.sun && !localStorage.getItem('dui-theme-manual')) {
        var now = new Date();
        var hhmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        var sun = $.dui.locale.sun;
        var dayTheme = localStorage.getItem('dui-theme-day') || 'corporate';
        var nightTheme = localStorage.getItem('dui-theme-night') || 'dark';
        var theme = (hhmm >= sun.sunrise && hhmm < sun.sunset) ? dayTheme : nightTheme;
        var current = document.documentElement.getAttribute('data-theme');
        if (current !== theme) {
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('dui-theme', theme);
          var ft = document.getElementById('footer-theme');
          if (ft && window._themeFooter) window._themeFooter(theme);
          console.info('[auto-theme] ' + theme + ' (now=' + hhmm + ' sunrise=' + sun.sunrise + ' sunset=' + sun.sunset + ')');
        }
      }

      // Handle ?_cmd=<command> overlay commands
      var urlParams = new URLSearchParams(window.location.search);
      var cmd = urlParams.get('_cmd');
      if (cmd) {
        history.replaceState(null, '', '/');
        _runCommand(cmd);
      }

      // Build menu from loaded data (client-side menu mode)
      if ($.dui.fn.buildMenu && document.getElementById('tpl-menu-group')) {
        var menus = $.dui.udata && $.dui.udata.menus;
        if (menus) $.dui.fn.buildMenu(menus);
      }

      // Dashboard shell complete (topnav + sidebar) — render all Lucide icons once
      if (window.lucide) lucide.createIcons();

      // Signal dashboard ready — listeners can hook before first page loads
      $(document).trigger('dui:ready');

      // Load first page
      if ($.page) $.page.startup();
    }, {
      url: '/api/init',
      method: 'GET',
      dataType: 'json',
      cache: false,
      error: function(xhr) {
        console.error('[dui-init] /api/init failed:', xhr.status, xhr.statusText);
        if (window.lucide) lucide.createIcons();
        if ($.page) $.page.startup();
      }
    });
  });

  // Warn developers about oversized data responses (server sets X-Data-Warn header)
  $(document).ajaxComplete(function(_e, xhr) {
    var warn = xhr && xhr.getResponseHeader && xhr.getResponseHeader('X-Data-Warn');
    if (warn) {
      console.warn('[perf] ' + warn + ' — consider converting to searchbox');
      $.messager.show({ title: 'Big Data Warning', msg: warn, timeout: 10000, showType: 'fade', cls: 'warning' });
    }
  });

  var p = ($.dui && $.dui._plugins) || { loaded: [], failed: [] };
  var msg = '[dui-plugins] ' + p.loaded.length + ' plugins loaded';
  if (p.failed.length) {
    console.warn(msg + ', ' + p.failed.length + ' failed: ' + p.failed.join(', '));
  }

})(jQuery);
