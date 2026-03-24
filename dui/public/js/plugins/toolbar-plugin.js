/**
 * Pure4 Toolbar Plugin — DUI
 *
 * Owns all toolbar concerns previously scattered across main.js:
 *   - butEn()    — enable/disable toolbar buttons via asdpx string
 *   - asdpx()    — read asdpx attribute from visible form
 *   - but_add()  — add-new handler (delegates to form-plugin)
 *   - but_save() — save handler (delegates to form-plugin)
 *   - but_del()  — delete handler (confirm + form submit)
 *   - but_clr()  — cancel handler (unlock + reload)
 *   - saveok()   — visual save feedback flash
 *   - backgo()   — navigate back
 *
 * Self-initializes on DOMContentLoaded. Overrides main.js globals so
 * legacy call paths (e.g. butEn('asdx','src') from form-plugin) work.
 *
 * Toolbar HTML is rendered by +toolbar mixin (toolbar-mixin.pug).
 * Buttons are native <button> elements with class .tbut and IDs
 * matching EUI: but_add, but_save, but_del, but_clr, but_print, but_addm.
 */
(function($) {
  'use strict';

  // Button ID → asdpx character mapping (same as EUI $.dui.buts)
  var BUTS = {
    but_add:   'a',
    but_save:  's',
    but_del:   'd',
    but_print: 'p',
    but_clr:   'x',
    but_addm:  'n'
  };

  // ========================================================================
  // asdpx() — read asdpx attribute from the first visible form in #content
  // ========================================================================
  function asdpx() {
    var el = $('#content').find('[asdpx]:visible').first();
    return (el.length && el.attr('asdpx')) || '';
  }

  // ========================================================================
  // _butEn(set, src) — INTERNAL: enable/disable toolbar buttons
  // ========================================================================
  // set: string of asdpx chars to enable (e.g. 'asdx')
  //      prefix '-' to force-disable matched chars
  //      prefix '+' to force-enable matched chars
  // src: caller ID for debug tracing
  // ========================================================================
  function _butEn(set, src) {
    set = set || '';
    if (!$.dui.noron && $.page.state.ronly === true) set = '';

    var mode = set.charAt(0);
    if (mode === '-' || mode === '+') {
      set = set.slice(1);
    } else {
      mode = '';
    }

    // Swap 'a' for 'n' when form declares add-menu variant
    var pset = asdpx();
    if (pset && pset.indexOf('n') !== -1) set = set.replace('a', 'n');

    $.dui.tbut.each(function() {
      var $btn = $(this);
      var id = $btn.attr('id');
      var ch = BUTS[id];
      if (!ch) return; // skip unknown buttons
      if (id === 'but_print') return; // print button owned by repmenus() in print-plugin

      var inSet = set.indexOf(ch) !== -1;
      var alwaysOn = $btn.hasClass('on');
      var shouldEnable = inSet || alwaysOn;

      if (mode === '-') shouldEnable = false;

      if (shouldEnable) {
        $btn.removeClass('opacity-40 pointer-events-none').removeAttr('disabled');
      } else {
        $btn.addClass('opacity-40 pointer-events-none').removeAttr('disabled');
      }
    });

    // Add / Add-menu button swap — show one, hide the other
    if (set.indexOf('n') !== -1) {
      $.dui.add.a.hide();
      $.dui.add.n.show().removeClass('opacity-40 pointer-events-none');
    } else {
      $.dui.add.n.hide();
      $.dui.add.a.show();
    }

    $.dui.asdpx = set;
  }

  // ========================================================================
  // butEn(set, src) — PUBLIC gate for toolbar button state
  // ========================================================================
  // When a form with state machine is active, page-script calls are logged
  // and ignored — only form-plugin syncToolbar (src starts with 'form.')
  // and page.reset are authoritative.
  // ========================================================================
  function butEn(set, src) {
    src = src || '';

    // Authoritative callers bypass the gate
    if (src.indexOf('form.') === 0 || src === 'page.reset') {
      _butEn(set, src);
      return;
    }

    // Check if a form with state machine is active
    var $form = $('#content form').not('.lock').filter(':visible:first');
    if ($form.length && $.fn.form && $.data($form[0], 'form')) {
      // Form state machine is active — log and ignore page-script call
      console.log('[butEn] intercepted: butEn("' + set + '", "' + src + '") — form state machine active');
      return;
    }

    // No form / no state machine — apply normally (dashboard, etc.)
    _butEn(set, src);
  }

  // ========================================================================
  // saveok(cls) — flash visual feedback on save button
  // ========================================================================
  function saveok(cls) {
    cls = cls || 'btn-success';
    var isError = (cls === 'ko');
    var btnCls = isError ? 'btn-error' : cls;

    // Flash save button colour
    var $btn = $('#but_save');
    $btn.addClass(btnCls);
    setTimeout(function() { $btn.removeClass(btnCls); }, 750);

    // Toolbar status badge
    var $status = $('#toolbar-status');
    if ($status.length) {
      var label = isError ? 'Error' : 'Saved';
      var badgeCls = isError ? 'badge-error' : 'badge-success';
      $status.html(
        '<span class="badge badge-sm ' + badgeCls + ' messager-toast-in">' + label + '</span>'
      );
      setTimeout(function() {
        $status.find('.badge').addClass('messager-toast-out');
        setTimeout(function() { $status.empty(); }, 300);
      }, 2500);
    }
  }

  // ========================================================================
  // Helper — get visible form + fkey combo
  // ========================================================================
  function getVisibleForm() {
    return $('#content form').not('.lock').filter(':visible:first');
  }

  function getFkey(frm) {
    var $fk = frm.find('.fkey:first');
    return $fk.length ? $fk : null;
  }

  // ========================================================================
  // but_add() — add new record
  // ========================================================================
  function but_add() {
    var $btn = $('#but_add');
    var b4 = $btn.triggerHandler('beforeClick');
    if (b4 === false) return false;

    var frm = getVisibleForm();
    if (!frm.length) return;

    frm.form('beginAdd');
    $btn.trigger('done', 'but_add');
  }

  // ========================================================================
  // but_save() — save current record
  // ========================================================================
  function but_save() {
    var $btn = $('#but_save');
    var b4 = $btn.triggerHandler('beforeClick');
    if (b4 === false) return false;

    // Blur active field so change event fires before submit
    if (document.activeElement) document.activeElement.blur();

    var frm = getVisibleForm();
    if (!frm.length) return;

    frm.form('submit');
  }

  // ========================================================================
  // but_del() — delete current record (with confirmation)
  // ========================================================================
  function but_del() {
    var $btn = $('#but_del');
    var b4 = $btn.triggerHandler('beforeClick');
    if (b4 === false) return false;

    $.messager.confirm('Confirm', 'Delete This Record ?', function(yn) {
      if (yn) {
        var frm = getVisibleForm();
        if (!frm.length) return;
        frm.form('state', 'deleting');
        frm.form('submit');
      }
    });
  }

  // ========================================================================
  // but_clr() — cancel / clear (unlock UI and reload page)
  // ========================================================================
  function but_clr() {
    var $btn = $('#but_clr');
    var frm = getVisibleForm();

    if (frm.length && $.fn.form && $.data(frm[0], 'form')) {
      var opts = frm.form('options');
      if (opts.state === 'new') {
        // Restore autonum searchbox fkey if it was in add mode
        var autonum = $.page && $.page.autonum;
        if (autonum) {
          var $af = $(autonum.field);
          if ($af.length && $.data($af[0], 'searchbox')) {
            var origPh = $af.data('_origPlaceholder');
            if (origPh != null) $af.attr('placeholder', origPh);
            $af.searchbox('editable', true);
            $af.val('');
          }
        }
        // Cancel add — go back to idle
        opts.dirty = false;
        frm.form('state', 'idle');
        frm.form('unchange');
      } else if (opts.state === 'edit') {
        // Cancel edit — reload original data
        opts.dirty = false;
        frm.form('unchange');
        if (typeof window.uiunlock === 'function') window.uiunlock();
        if (typeof window.reload === 'function') window.reload();
      } else {
        // Fallback for other states
        if (typeof window.uiunlock === 'function') window.uiunlock();
        if (typeof window.reload === 'function') window.reload();
      }
    } else {
      // No form state machine — legacy behavior
      if (typeof window.uiunlock === 'function') window.uiunlock();
      if (typeof window.reload === 'function') window.reload();
    }
    $btn.trigger('done', 'but_clr');
  }

  // ========================================================================
  // backgo() — navigate to previous page (delegated to page-plugin.js)
  // ========================================================================
  function backgo() {
    if ($.page) $.page.historyBack();
  }

  // ========================================================================
  // _mountToolbut() — move #toolbut children into the navbar actions group
  // Called on init and after toolbut() adds new buttons.
  // ========================================================================
  function _unmountToolbut() {
    var $group = $('#but_clr').parent();
    if (!$group.length) return;
    $group.children().filter(function() { return $(this).data('tb-mounted'); }).remove();
    $('#toolbut').remove();
  }

  function _mountToolbut() {
    var $container = $('#toolbut');
    if (!$container.length) return;

    var $group = $('#but_clr').parent();
    if (!$group.length) return;

    $container.children().each(function() {
      var $el = $(this);
      if ($el.data('tb-mounted')) return;
      $el.data('tb-mounted', true);

      // Ensure navbar-compatible styling on buttons
      if ($el.is('button')) {
        $el.addClass('btn btn-ghost btn-sm px-1 gap-1');
        // Convert HTML disabled attr to CSS disabled (matches navbar pattern)
        if ($el.prop('disabled')) {
          $el.prop('disabled', false);
          $el.addClass('opacity-40 pointer-events-none');
        }
      }

      $group.append($el);
    });

    // Render any Lucide icons
    if (window.lucide && $group[0]) {
      var pending = $group[0].querySelectorAll('[data-lucide]:not(svg)');
      if (pending.length) lucide.createIcons({ nodes: pending });
    }

    $container.hide();
  }

  // ========================================================================
  // toolbut(data) — add custom page toolbar buttons (29 pages call this)
  // ========================================================================
  function toolbut(data) {
    if (!$.isArray(data)) data = [data];

    var $container = $('#toolbut');
    if (!$container.length) {
      // Create container if page template didn't provide one
      $container = $('<div id="toolbut" style="display:none;"/>');
      $('#content').append($container);
    }

    data.map(function(e) {
      if (Object.keys(e).length === 0) {
        // Separator
        $container.append($('<div class="toolbar-sep self-center h-5/6"/>'));
      } else {
        e.id = e.id || e.text.replace(/\s/g, '__');
        if ($('#' + e.id).length) return; // already exists

        if (e.type) {
          // Dynadd-type button
          var wrap = $('<div class="inline"/>');
          dynadd(wrap, [e]);
          $container.append(wrap);
        } else {
          // Standard button — create DUI-native <button>
          var $btn = $('<button type="button"/>');
          $btn.attr('id', e.id);
          $btn.attr('title', e.text || '');
          $btn.addClass('btn btn-ghost btn-sm px-1 gap-1');

          if (e.disabled) {
            $btn.addClass('opacity-40 pointer-events-none');
          }

          // Icon via $.dui.icon() (resolves icon-* to Lucide names)
          if (e.iconCls) {
            var ico = $.dui.icon(e.iconCls, { size: 'sm' });
            if (ico) $btn.append(ico);
          }

          // Label text
          if (e.text && !e.noText) {
            $btn.append($('<span/>').text(e.text));
          }

          // Click handler via button-plugin for consistency
          if (e.onClick) {
            $btn.button({ onClick: e.onClick, disabled: !!e.disabled });
          }

          $container.append($btn);
        }
      }
    });

    // Mount into navbar
    _mountToolbut();
  }

  // ========================================================================
  // roset(dglok) — set form fields readonly (13 pages call this)
  // ========================================================================
  function roset(dglok) {
    if (dglok) $('.datagrid-cell-check > input[type=checkbox]').addClass('lock');
    $('input.textbox-f:not(input[readonly]):not(.fkey):not(#filewin input)').addClass('printed_').textbox('readonly', true);
  }

  function roclr(dgulok) {
    if (dgulok) $('input[type=checkbox].lock').removeClass('lock');
    $('input.printed_').textbox('readonly', false).removeClass('printed_');
  }

  // ========================================================================
  // uilock / uiunlock — lock/unlock UI clickable elements
  // ========================================================================
  function uilock(omit) {
    $('a:not(.textbox-icon), ul.tabs > li, .tree-node').not(omit).addClass('lock');
  }

  function uiunlock() {
    $('a:not(.textbox-icon), ul.tabs > li, .tree-node').removeClass('lock');
  }

  // ========================================================================
  // isronly() — check if page is in readonly mode (3 pages)
  // ========================================================================
  function isronly() {
    if ($.dui.noron) return;
    if ($.page.state.ronly === true) {
      $('#content').addClass('ronly');
      return true;
    } else {
      $('#content').removeClass('ronly');
      return false;
    }
  }

  // ========================================================================
  // readonly(el, tf) — set readonly on element children (2 pages)
  // ========================================================================
  function duiReadonly(el, tf) {
    if ($.dui.noron) return;
    if (tf === undefined || tf === true) el.addClass('ronly');
    else el.removeClass('ronly');
  }

  // ========================================================================
  // Register on $.dui.toolbar
  // ========================================================================
  var dui = $.dui;

  dui.toolbar.butEn     = butEn;
  dui.toolbar.asdpx     = asdpx;
  dui.toolbar.saveok    = saveok;
  dui.toolbar.backgo    = backgo;
  dui.toolbar.but_add   = but_add;
  dui.toolbar.but_save  = but_save;
  dui.toolbar.but_del   = but_del;
  dui.toolbar.but_clr   = but_clr;
  dui.toolbar.toolbut   = toolbut;
  dui.toolbar._unmount  = _unmountToolbut;
  dui.toolbar.roset     = roset;
  dui.toolbar.roclr     = roclr;
  dui.toolbar.uilock    = uilock;
  dui.toolbar.uiunlock  = uiunlock;
  dui.toolbar.isronly   = isronly;
  dui.toolbar.readonly  = duiReadonly;

  // ========================================================================
  // Window globals (permanent DUI API)
  // ========================================================================
  dui.register('toolbut',   toolbut);
  dui.register('roset',     roset);
  dui.register('roclr',     roclr);
  dui.register('uilock',    uilock);
  dui.register('uiunlock',  uiunlock);
  dui.register('isronly',   isronly);
  dui.register('readonly',  duiReadonly);

  // ========================================================================
  // Initialization — runs after main.js document.ready
  // ========================================================================
  function init() {
    // Collect toolbar buttons (native <button> elements with .tbut)
    $.dui.tbut = $('.tbut');
    $.dui.buts = BUTS;
    $.dui.add = { a: $('#but_add'), n: $('#but_addm') };

    // All toolbar buttons start disabled (class-based, no disabled attr)
    $.dui.tbut.addClass('opacity-40 pointer-events-none').removeAttr('disabled');

    // Hide Add+ by default (butEn will show the correct one)
    $.dui.add.n.hide();

    // Bind click handlers directly on the buttons
    $('#but_add').on('click', but_add);
    $('#but_addm').on('click', but_add);
    $('#but_save').on('click', but_save);
    $('#but_del').on('click', but_del);
    $('#but_clr').on('click', but_clr);
    $('#but_bak').on('click', backgo);
    // but_print click is handled by print-plugin.js (DaisyUI dropdown)

    // Mount any Pug-defined #toolbut buttons into the navbar
    _mountToolbut();

    // Legacy window.* overrides for functions that need DOM init first
    window.butEn = butEn;
    window.but_add = but_add;
    window.but_save = but_save;
    window.but_del = but_del;
    window.but_clr = but_clr;
    window.asdpx = asdpx;
    window.saveok = saveok;
    window.backgo = backgo;
  }

  // Run init after main.js document.ready has completed.
  // setTimeout(fn, 0) inside $(fn) ensures we queue AFTER all sync ready handlers.
  $(function() {
    setTimeout(init, 0);
  });

  // Re-mount toolbut when a new page content fragment is loaded
  $(document).on('dui:contentloaded', _mountToolbut);

  if (dui._plugins) dui._plugins.loaded.push('toolbar-plugin');

})(jQuery);
