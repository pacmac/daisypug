/**
 * Pure4 Messager Plugin — DaisyUI
 *
 * EasyUI-compatible $.messager API using DaisyUI toast + modal components.
 *
 * API:
 *   $.messager.show(opts)               — toast notification (auto-dismiss)
 *   $.messager.alert(title,msg,icon,fn) — modal alert dialog
 *   $.messager.confirm(title,msg,fn)    — modal confirm dialog
 *   $.messager.prompt(title,msg,fn)     — modal prompt with text input
 *   $.messager.progress(opts|'close')   — progress overlay
 *
 * Toast renders in a fixed container (bottom-end).
 * Modal renders in a native <dialog> element (DaisyUI .modal class).
 */
(function($) {
  'use strict';

  $.messager = $.messager || {};

  // ========================================================================
  // Icons — inline SVG for each message type (used by toasts)
  // ========================================================================
  function _icon(type, size) {
    var cls = size === 'lg' ? 'w-10 h-10 shrink-0' : 'w-5 h-5 shrink-0';
    var paths = {
      info:     '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
      error:    '<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>',
      warning:  '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
      question: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>',
      success:  '<circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>'
    };
    if (!paths[type]) return '';
    return '<svg class="' + cls + '" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' + paths[type] + '</svg>';
  }

  // Back-compat: object with small icons (used by toasts)
  var ICONS = {};
  ['info','error','warning','question','success'].forEach(function(t) { ICONS[t] = _icon(t, 'sm'); });

  // Map icon/cls name → DaisyUI alert variant class
  var ALERT_CLS = {
    info:     'alert-info',
    error:    'alert-error',
    warning:  'alert-warning',
    question: 'alert-info',
    success:  'alert-success'
  };

  // ========================================================================
  // Toast container — fixed, bottom-right
  // ========================================================================
  var $toastBox = null;

  function toastContainer() {
    if (!$toastBox || !$toastBox.length || !$.contains(document.body, $toastBox[0])) {
      $toastBox = $('<div class="toast toast-end toast-bottom z-[9999]"></div>');
      $('body').append($toastBox);
    }
    return $toastBox;
  }

  // ========================================================================
  // $.messager.show(options) — Toast notification
  // ========================================================================
  // options: { title, msg, showType, timeout, cls }
  // cls: 'success' | 'error' | 'warning' | 'info' (default)
  $.messager.show = function(options) {
    options = options || {};
    var timeout = options.timeout != null ? options.timeout : 3000;
    var cls = options.cls || 'info';
    var alertCls = ALERT_CLS[cls] || 'alert-info';
    var icon = ICONS[cls] || ICONS.info;

    var $el = $(
      '<div class="alert ' + alertCls + ' shadow-lg py-2 px-3 gap-2 min-w-0 messager-toast-in">' +
        icon +
        '<div class="flex flex-col gap-0 min-w-0">' +
          (options.title ? '<span class="font-semibold text-xs">' + options.title + '</span>' : '') +
          '<span class="text-sm">' + (options.msg || '') + '</span>' +
        '</div>' +
      '</div>'
    );

    toastContainer().append($el);

    if (timeout > 0) {
      setTimeout(function() {
        $el.addClass('messager-toast-out');
        setTimeout(function() { $el.remove(); }, 300);
      }, timeout);
    }

    return $el;
  };

  // ========================================================================
  // Modal helper — uses $.modal.create (dynDialog) for consistent styling
  // ========================================================================
  // opts: { title, msg, icon, buttons: [{text, cls, fn}], input, onClose }

  var MSG_ICONS = {
    info:     'info',
    error:    'circle-x',
    warning:  'alert-triangle',
    question: 'help-circle',
    success:  'check-circle'
  };

  var _msgId = 0;

  function showModal(opts) {
    var id = '_msg' + (++_msgId);

    // Map messager buttons to modal-plugin format
    var handled = false;
    var modalButtons = (opts.buttons || []).map(function(b) {
      return {
        text: b.text,
        cls: b.cls || '',
        handler: function() {
          handled = true;
          if (b.fn) b.fn($dlg);
          $dlg[0].close();
        }
      };
    });

    // Create dialog via $.modal.create (dynDialog) — titlebar with icon
    var $dlg = $.modal.create({
      id: id,
      title: opts.title || 'Info',
      titlebar: true,
      iconCls: MSG_ICONS[opts.icon] || MSG_ICONS.info,
      fields: []
    }, modalButtons);

    // Inject message content into the .p-6 content area
    var $content = $dlg.find('.p-6');
    $content.prepend($('<div class="text-sm whitespace-pre-line"/>').html(opts.msg || ''));
    if (opts.input) {
      $content.find('.text-sm').after('<input type="text" class="input input-bordered input-sm w-full mt-3" />');
    }

    // Enter key on prompt input triggers OK
    if (opts.input) {
      $dlg.find('input').on('keydown', function(e) {
        if (e.key === 'Enter') {
          handled = true;
          var okBtn = opts.buttons[opts.buttons.length - 1];
          if (okBtn && okBtn.fn) okBtn.fn($dlg);
          $dlg[0].close();
        }
      });
    }

    // Close handler — backdrop, ESC, or button
    $dlg[0].addEventListener('close', function() {
      if (!handled && opts.onClose) opts.onClose();
      setTimeout(function() { $dlg.remove(); }, 200);
    });

    $dlg[0].showModal();

    if (opts.input) {
      setTimeout(function() { $dlg.find('input').focus(); });
    }

    return $dlg;
  }

  // ========================================================================
  // $.messager.alert(title, msg, icon, fn)
  // ========================================================================
  // Signatures:
  //   (title, msg, icon, fn)
  //   (title, msg, fn)
  //   ({ title, msg, icon, fn })
  $.messager.alert = function(title, msg, icon, fn) {
    if (typeof title === 'object') {
      fn = title.fn; icon = title.icon; msg = title.msg; title = title.title;
    }
    if (typeof icon === 'function') { fn = icon; icon = undefined; }

    showModal({
      title: title || 'Alert',
      msg: msg,
      icon: icon || 'info',
      buttons: [
        { text: 'OK', cls: 'btn-primary', fn: function() { if (fn) fn(); } }
      ],
      onClose: function() { if (fn) fn(); }
    });
  };

  // ========================================================================
  // $.messager.confirm(title, msg, fn)
  // ========================================================================
  // Signatures:
  //   (title, msg, fn)
  //   ({ title, msg, fn })
  // fn receives true (OK) or false (Cancel / backdrop / ESC)
  $.messager.confirm = function(title, msg, fn) {
    if (typeof title === 'object') {
      fn = title.fn; msg = title.msg; title = title.title;
    }

    showModal({
      title: title || 'Confirm',
      msg: msg,
      icon: 'question',
      buttons: [
        { text: 'Cancel', cls: '',           fn: function() { if (fn) fn(false); } },
        { text: 'OK',     cls: 'btn-primary', fn: function() { if (fn) fn(true); } }
      ],
      onClose: function() { if (fn) fn(false); }
    });
  };

  // ========================================================================
  // $.messager.prompt(title, msg, fn)
  // ========================================================================
  // fn receives the input string or undefined (Cancel / backdrop / ESC)
  $.messager.prompt = function(title, msg, fn) {
    if (typeof title === 'object') {
      fn = title.fn; msg = title.msg; title = title.title;
    }

    showModal({
      title: title || 'Input',
      msg: msg,
      icon: 'question',
      input: true,
      buttons: [
        { text: 'Cancel', cls: '',           fn: function()     { if (fn) fn(undefined); } },
        { text: 'OK',     cls: 'btn-primary', fn: function($dlg) { if (fn) fn($dlg.find('input').val()); } }
      ],
      onClose: function() { if (fn) fn(undefined); }
    });
  };

  // ========================================================================
  // $.messager.progress(options | 'close')
  // ========================================================================
  var $progress = null;

  $.messager.progress = function(options) {
    if (options === 'close') {
      if ($progress) { $progress.remove(); $progress = null; }
      return;
    }
    options = options || {};
    if ($progress) $progress.remove();

    $progress = $(
      '<div class="fixed inset-0 bg-base-300/50 z-[9998] flex items-center justify-center">' +
        '<div class="bg-base-100 rounded-lg p-6 shadow-xl flex flex-col items-center gap-3">' +
          '<span class="loading loading-spinner loading-lg text-primary"></span>' +
          '<span class="text-sm">' + (options.msg || 'Loading...') + '</span>' +
        '</div>' +
      '</div>'
    );
    $('body').append($progress);
  };

  // ========================================================================
  // $.dui.dialog — dialog wrapper globals (migrated from ui.js)
  // ========================================================================
  var dui = $.dui;

  // ── beep ─────────────────────────────────────────────────────────────
  function beep(fn) {
    fn = fn || 'alert';
    var audio = new Audio('sound/' + fn + '.wav');
    audio.play();
  }

  // ── msgbox ───────────────────────────────────────────────────────────
  // 51 page scripts call this — wraps $.messager.alert
  function msgbox(msg, cb) {
    if (typeof cb === 'function')
      $.messager.alert('Info', msg.replace(/[\r\n]/g, '<br/>'), 'info', cb);
    else
      $.messager.alert('Info', msg.replace(/[\r\n]/g, '<br/>'), 'info');
  }

  // ── alert ────────────────────────────────────────────────────────────
  // 31 page scripts — wraps $.messager.show (toast, NOT modal)
  // NOTE: this overrides the native browser alert()
  function duiAlert(msg, title, cls) {
    $.messager.show({ title: title || 'Alert', msg: msg, showType: 'show', timeout: 2000 });
    if (cls) $('.messager-body').addClass(cls);
  }

  // ── confirm ──────────────────────────────────────────────────────────
  // 27 page scripts — wraps $.messager.confirm
  // NOTE: this overrides the native browser confirm()
  function duiConfirm(cb, msg) {
    msg = msg || 'Are you sure ?';
    $.messager.confirm('Please Confirm', msg, function(r) {
      return cb(r);
    });
  }

  // ── mask ──────────────────────────────────────────────────────────────
  function mask(show) {
    if (show) $('.window-mask').show();
    else $('.window-mask').hide();
  }

  // ── progress ─────────────────────────────────────────────────────────
  function duiProgress(show) {
    if (show) $.messager.progress();
    else $.messager.progress('close');
  }

  // ── loading ──────────────────────────────────────────────────────────
  function loading(show) {
    if (show) { mask(true); duiProgress(true); }
    else { mask(); duiProgress(); }
  }

  // ── Register on $.dui.dialog ─────────────────────────────────────────
  dui.dialog.beep     = beep;
  dui.dialog.msgbox   = msgbox;
  dui.dialog.alert    = duiAlert;
  dui.dialog.confirm  = duiConfirm;
  dui.dialog.mask     = mask;
  dui.dialog.progress = duiProgress;
  dui.dialog.loading  = loading;

  // ── Window globals (permanent DUI API) ───────────────────────────────
  dui.register('beep',     beep);
  dui.register('msgbox',   msgbox);
  dui.register('alert',    duiAlert);
  dui.register('confirm',  duiConfirm);
  dui.register('mask',     mask);
  dui.register('progress', duiProgress);
  dui.register('loading',  loading);

  if (dui._plugins) dui._plugins.loaded.push('messager-plugin');

})(jQuery);
