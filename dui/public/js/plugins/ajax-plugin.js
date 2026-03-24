/**
 * Pure4 Ajax Plugin — single HTTP layer for the entire app
 *
 * Registers on: $.dui.ajax.ajaxget, $.dui.ajax.iserr, $.dui.ajax.gurl,
 *               $.dui.ajax.getapp, $.dui.ajax.addQsp
 *
 * Window globals: window.ajaxget, window.iserr, window.gurl, window.getapp
 *               (via $.dui.register)
 *
 * Also installs: $.ajaxPrefilter (injects _appid, wraps success with iserr)
 *
 * Dependencies (available as window globals by load time):
 *   msgbox()  — from bundle (later messager-plugin → $.dui.dialog)
 *   saveok()  — from toolbar-plugin (later → $.dui.toolbar)
 *   beep()    — from bundle
 *   url2obj() — from bundle (utils.js → later $.dui.fn)
 *   $.dui     — from dui-namespace.js (must load before this plugin)
 *   $.page    — from page-plugin.js (must load before this plugin)
 */
(function($) {
  'use strict';

  var dui = $.dui;

  // ── helpers ───────────────────────────────────────────────────────
  function pageId() {
    return ($.page && $.page.state && $.page.state.pageId) || '';
  }

  function modId() {
    var pid = pageId();
    return pid ? pid.split('^')[0] : '';
  }

  // ── getapp ────────────────────────────────────────────────────────
  function getapp() {
    return pageId();
  }

  // ── gurl ──────────────────────────────────────────────────────────
  function gurl(url) {
    var mod = modId();
    if (!url) return mod;
    if (!url.endsWith('&')) url += '&';
    if (!url.includes('_sqlid=' + mod + '^')) url += '_vpath=' + mod;
    return url;
  }

  // ── iserr ─────────────────────────────────────────────────────────
  function iserr(data) {
    try {
      if (!data) {
        msgbox('No Reply. Possible Connectivity Issues.');
        return true;
      }
      data = JSON.parse(data);
    } catch (e) {
      if (!data) {
        msgbox('No response from server.');
        return true;
      }
    }

    if (data.error && data.error == true) {
      if (typeof data.msg == 'object') data.msg = JSON.stringify(data.msg).replace(/"|\}|\{/g, '');
      msgbox(data.msg);
      saveok('ko');
      beep('error');
      return true;
    }
    else if (data.warn && data.warn == true) alert(data.msg);
    if (data.msg) saveok('ok');
    return false;
  }

  // ── ajaxget ───────────────────────────────────────────────────────
  function ajaxget(url, vars, cb, avar) {
    avar = avar || {};
    vars = $.extend(url2obj(url), vars);

    var opts = {
      async:       avar.async !== undefined ? avar.async : true,
      url:         avar.url || '/',
      type:        avar.method || 'post',
      data:        vars,
      success:     function(data) { if (cb) cb(data); },
      error:       avar.error || function(err) { if (cb) cb(err); }
    };

    if (avar.dataType !== undefined)    opts.dataType = avar.dataType;
    if (avar.contentType !== undefined) opts.contentType = avar.contentType;
    if (avar.processData !== undefined) opts.processData = avar.processData;
    if (avar.cache !== undefined)       opts.cache = avar.cache;
    if (avar.timeout !== undefined)     opts.timeout = avar.timeout;
    if (avar.headers !== undefined)     opts.headers = avar.headers;
    if (avar.beforeSend !== undefined)  opts.beforeSend = avar.beforeSend;
    if (avar.complete !== undefined)    opts.complete = avar.complete;

    return $.ajax(opts);
  }

  // ── addQsp ────────────────────────────────────────────────────────
  function addQsp(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) return uri.replace(re, '$1' + key + "=" + value + '$2');
    else return uri + separator + key + "=" + value;
  }

  // ── Register on $.dui.ajax ────────────────────────────────────────
  dui.ajax.ajaxget = ajaxget;
  dui.ajax.iserr   = iserr;
  dui.ajax.gurl    = gurl;
  dui.ajax.getapp  = getapp;
  dui.ajax.addQsp  = addQsp;

  // Keep $.addQsp for jQuery plugin compat (used by $.ajaxPrefilter below)
  $.addQsp = addQsp;

  // ── Window globals (permanent DUI API) ────────────────────────────
  dui.register('ajaxget', ajaxget);
  dui.register('iserr',   iserr);
  dui.register('gurl',    gurl);
  dui.register('getapp',  getapp);

  // ── loading spinner for slow requests ─────────────────────────────
  var _pending = 0;          // count of requests that triggered the spinner
  var SLOW_MS  = 400;        // delay before showing spinner

  function spinnerShow() {
    _pending++;
    if (_pending === 1 && $.messager && $.messager.progress) {
      $.messager.progress({ msg: 'Loading...' });
    }
  }

  function spinnerHide() {
    _pending = Math.max(0, _pending - 1);
    if (_pending === 0 && $.messager && $.messager.progress) {
      $.messager.progress('close');
    }
  }

  // ── $.ajaxPrefilter ───────────────────────────────────────────────
  $.ajaxPrefilter(function(opt, oopt, jqXHR) {
    // Cross-domain requests
    if (!opt.url.startsWith('/') && !opt.url.startsWith(location.href)) {
      console.warn('[ajax-plugin] cross-domain:', opt.url);
      opt.xhr.withCredentials = true;
      opt.crossDomain = true;
    }

    // _appid is resolved server-side from session — no longer injected here

    // Misc
    opt.async = true;
    opt.cache = true;

    // Slow-request spinner: show after SLOW_MS, hide on complete
    var _timer = setTimeout(function() { _timer = null; spinnerShow(); }, SLOW_MS);

    var complete = opt.complete;
    opt.complete = function() {
      if (_timer) { clearTimeout(_timer); _timer = null; }
      else { spinnerHide(); }
      if (typeof complete === 'function') return complete.apply(this, arguments);
    };

    // Wrap success with iserr check
    var success = opt.success;
    opt.success = function(data, textStatus, jqXHR) {
      iserr(data);
      if (typeof success === 'function') return success(data, textStatus, jqXHR);
    };

    // Wrap error to show server authorization/error messages
    var error = opt.error;
    opt.error = function(jqXHR, textStatus, errorThrown) {
      // Try to parse JSON error body from server (e.g. 403 from authorize())
      try {
        var body = JSON.parse(jqXHR.responseText);
        if (body && body.error && body.msg) {
          msgbox(body.msg);
          beep('error');
        } else {
          msgbox('Server error: ' + jqXHR.status + ' ' + errorThrown);
        }
      } catch (e) {
        if (jqXHR.status === 0) {
          msgbox('No Reply. Possible Connectivity Issues.');
        } else {
          msgbox('Server error: ' + jqXHR.status + ' ' + errorThrown);
        }
      }
      if (typeof error === 'function') return error(jqXHR, textStatus, errorThrown);
    };
  });

  if (dui._plugins) dui._plugins.loaded.push('ajax-plugin');

})(jQuery);
