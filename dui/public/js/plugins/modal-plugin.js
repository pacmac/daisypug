/**
 * Pure4 Modal Plugin — DUI modal/dialog/window API
 *
 * Replaces window-plugin.js + dialog-plugin.js with a unified modal plugin.
 * Uses native <dialog> with DaisyUI modal structure.
 *
 * API:
 *   $.fn.modal(options)     — initialise with options
 *   $.fn.modal('open')      — show modal (showModal on <dialog>)
 *   $.fn.modal('close')     — close modal
 *   $.fn.modal('destroy')   — remove from DOM
 *   $.fn.modal('setTitle', t) — update title
 *   $.fn.modal('options')   — get options object
 *   $.fn.modal('form')      — get the <form> inside modal-box
 *
 * Backward compat:
 *   $.fn.dialog  — alias for $.fn.modal
 *   $.fn.window  — alias for $.fn.modal
 *
 * Buttons option:
 *   .modal({ buttons: [{id, text, iconCls, handler}, ...] })
 *   Renders buttons into .modal-action footer inside .modal-box.
 *
 * dynDialog(vars, buts):
 *   Dynamic dialog builder for legacy page scripts (3 pages).
 *   Also available as $.modal.create(vars, buts).
 */
(function($) {
  'use strict';

  var DATA_KEY = 'modal';

  function parseOptions(target) {
    return $.extend({}, $.parser.parseOptions(target, [
      'title','iconCls',{modal:'boolean',closed:'boolean',titlebar:'boolean',bordered:'boolean',draggable:'boolean'}
    ]));
  }

  // ── Render buttons into .modal-action ────────────────────────────────
  // EUI button format: {id, text, iconCls, handler}
  // Renders into .modal-action div inside .modal-box
  function renderButtons(el, buttons) {
    if (!buttons || !buttons.length) return;
    var $el = $(el);
    var $box = $el.find('.modal-box');
    if (!$box.length) return;

    // Find or create .modal-action
    var $action = $box.find('.modal-action');
    if (!$action.length) {
      $action = $('<div class="modal-action flex justify-end gap-2 pt-4 border-t border-base-200 mt-4"/>');
      // Titlebar modals have p-0 box with .p-6 content child — append inside it for padding
      var $content = $box.children('.p-6');
      ($content.length ? $content : $box).append($action);
    }
    // Clear existing JS-rendered buttons (keep server-rendered ones on first call)
    $action.find('[data-js-button]').remove();

    for (var i = 0; i < buttons.length; i++) {
      var def = buttons[i];
      var $btn = $('<button type="button" class="btn btn-sm ' + (def.cls || '') + '" data-js-button="1"/>');
      if (def.id) $btn.attr('id', def.id);
      if (def.text) $btn.text(def.text);
      if (def.iconCls) {
        var ico = $.dui.icon(def.iconCls);
        if (ico) $btn.prepend(ico);
      }
      if (def.handler) {
        (function(handler) {
          $btn.on('click', function() { handler.call(this); });
        })(def.handler);
      }
      // Insert before Cancel button if present, otherwise append
      var $cancel = $action.children('button').filter(function() {
        return $(this).text().trim() === 'Cancel' && !$(this).attr('data-js-button');
      });
      if ($cancel.length) {
        $cancel.before($btn);
      } else {
        $action.append($btn);
      }
    }
  }

  // ── Titlebar drag-to-move ─────────────────────────────────────────────
  function enableDrag(dialog) {
    var $bar = $(dialog).find('[data-modal-titlebar]');
    if (!$bar.length) return;
    var $box = $(dialog).find('.modal-box');
    if (!$box.length) return;
    $bar.css('cursor', 'move');

    var dragging = false, startX, startY, dx, dy;

    $bar.on('mousedown.modaldrag', function(e) {
      if (e.target.closest('button')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      // Read current translate offset (default 0,0)
      dx = parseFloat($box.data('dragX')) || 0;
      dy = parseFloat($box.data('dragY')) || 0;
      e.preventDefault();
    });

    $(document).on('mousemove.modaldrag' + dialog.id, function(e) {
      if (!dragging) return;
      var newX = dx + e.clientX - startX;
      var newY = dy + e.clientY - startY;
      $box[0].style.translate = newX + 'px ' + newY + 'px';
    });

    $(document).on('mouseup.modaldrag' + dialog.id, function(e) {
      if (!dragging) return;
      // Persist final offset
      $box.data('dragX', dx + e.clientX - startX);
      $box.data('dragY', dy + e.clientY - startY);
      dragging = false;
    });
  }

  // ── Core plugin ──────────────────────────────────────────────────────

  $.fn.modal = function(options, param) {
    if (typeof options === 'string') {
      var method = $.fn.modal.methods[options];
      if (method) return method(this, param);
      return this;
    }

    options = options || {};
    return this.each(function() {
      var state = $.data(this, DATA_KEY);
      if (state) {
        $.extend(state.options, options);
      } else {
        state = $.data(this, DATA_KEY, {
          options: $.extend({}, $.fn.modal.defaults, parseOptions(this), options)
        });
      }

      // Render buttons if provided
      if (state.options.buttons && state.options.buttons.length) {
        renderButtons(this, state.options.buttons);
      }

      // Enable titlebar drag-to-move
      if (state.options.draggable !== false && this.tagName === 'DIALOG') {
        enableDrag(this);
      }

      // Basic visibility handling for non-dialog elements
      if (state.options.closed) {
        if (this.tagName !== 'DIALOG') $(this).hide();
      }
    });
  };

  $.fn.modal.methods = {
    options: function(jq) {
      var state = $.data(jq[0], DATA_KEY);
      return state ? state.options : {};
    },

    open: function(jq) {
      return jq.each(function() {
        var state = $.data(this, DATA_KEY);
        if (!state) {
          state = $.data(this, DATA_KEY, {
            options: $.extend({}, $.fn.modal.defaults)
          });
        }
        state.options.closed = false;

        if (this.tagName === 'DIALOG' && typeof this.showModal === 'function') {
          // Move to body to escape layout containers that collapse dialog dimensions
          if (this.parentElement !== document.body) {
            state._originalParent = this.parentElement;
            state._originalNext = this.nextSibling;
            document.body.appendChild(this);
          }
          try { this.showModal(); } catch(e) {}
        } else {
          $(this).show();
        }
        if (state.options.onOpen) state.options.onOpen.call(this);
      });
    },

    close: function(jq) {
      return jq.each(function() {
        var state = $.data(this, DATA_KEY);
        if (state) state.options.closed = true;

        if (this.tagName === 'DIALOG' && typeof this.close === 'function') {
          try { this.close(); } catch(e) {}
        } else {
          $(this).hide();
        }
        // Move back to original parent so page teardown can clean it up
        if (state && state._originalParent) {
          if (state._originalNext) state._originalParent.insertBefore(this, state._originalNext);
          else state._originalParent.appendChild(this);
          state._originalParent = null;
          state._originalNext = null;
        }
        if (state && state.options.onClose) state.options.onClose.call(this);
      });
    },

    destroy: function(jq) {
      return jq.each(function() {
        $.removeData(this, DATA_KEY);
        $(this).remove();
      });
    },

    setTitle: function(jq, title) {
      return jq.each(function() {
        var state = $.data(this, DATA_KEY);
        if (state) state.options.title = title;
        // Titlebar mode: update span inside [data-modal-titlebar]
        var $bar = $(this).find('[data-modal-titlebar]');
        if ($bar.length) {
          $bar.find('span.font-semibold').text(title);
          return;
        }
        // Bare h3 mode
        var $h3 = $(this).find('.modal-box > h3').first();
        if ($h3.length) {
          $h3.text(title);
        }
        // Also try legacy .panel-title
        $(this).find('.panel-title').text(title);
      });
    },

    form: function(jq) {
      return jq.find('.modal-box form').first();
    },

    // Stubs for methods called by legacy page scripts
    resize: function(jq, param) {
      // Native <dialog> handles sizing via CSS — no-op stub
      return jq;
    },

    move: function(jq, param) {
      // Native <dialog> is centered by browser — no-op stub
      return jq;
    },

    // EUI compat: .window('window') returns self
    window: function(jq) {
      return jq;
    }
  };

  $.fn.modal.defaults = {
    title: null,
    iconCls: null,
    titlebar: false,
    bordered: false,
    draggable: true,
    modal: false,
    closed: false,
    buttons: null,
    onOpen: function(){},
    onClose: function(){},
    onSave: function(){}
  };

  // ── Backward compat aliases ──────────────────────────────────────────

  $.fn.dialog = $.fn.modal;
  $.fn.dialog.methods = $.fn.modal.methods;
  $.fn.dialog.defaults = $.fn.modal.defaults;

  $.fn.window = $.fn.modal;
  $.fn.window.methods = $.fn.modal.methods;
  $.fn.window.defaults = $.fn.modal.defaults;

  // ── Patch native showModal to auto-init drag ─────────────────────────
  var _nativeShowModal = HTMLDialogElement.prototype.showModal;
  HTMLDialogElement.prototype.showModal = function() {
    if (!this._dragInit && this.querySelector('[data-modal-titlebar]')) {
      enableDrag(this);
      this._dragInit = true;
    }
    return _nativeShowModal.apply(this, arguments);
  };

  // ── dynDialog — dynamic dialog builder ───────────────────────────────
  // Used by 3 page scripts: sysbut.js, logins.js, wo_bas.inc.js
  // Creates a <dialog> with form fields from dynadd(), renders buttons.

  function dynDialog(vars, buts) {
    var id = vars.id || '_ebox';
    var title = vars.title || 'Enter Data';
    var useTitlebar = vars.titlebar || false;
    var useBordered = vars.bordered || false;
    var iconCls = vars.iconCls || '';
    if ($('#' + id).length > 0) return $('#' + id);

    // Build native <dialog> with DaisyUI modal structure
    var dlg = $('<dialog class="modal" id="' + id + '"/>');
    var boxCls = useTitlebar && title ? 'modal-box p-0 overflow-hidden' : 'modal-box p-6';
    if (useBordered) boxCls += ' border border-base-300';
    var box = $('<div class="' + boxCls + '"/>');

    // Title: titlebar or bare h3
    if (title && useTitlebar) {
      var bar = $('<div class="bg-primary text-primary-content flex items-center gap-2 pl-3 pr-1 h-10 min-h-0 shrink-0" data-modal-titlebar/>');
      if (iconCls) {
        var ico = $.dui.icon(iconCls, {opacity: 'opacity-80', cls: 'w-6 h-6'});
        if (ico) bar.append(ico);
      }
      bar.append($('<span class="font-semibold text-sm flex-1"/>').text(title));
      bar.append('<button type="button" class="btn btn-ghost btn-xs btn-circle text-primary-content" onclick="this.closest(\'dialog\').close()" aria-label="Close"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"></path></svg></button>');
      box.append(bar);
      // Content wrapper with padding
      var content = $('<div class="p-6"/>');
      content.append('<template id="dui-fitem-tpl"><div class="mb-2 flex items-center gap-2"><label class="shrink-0" style="width:150px"></label><div class="flex-1"><input class="input input-xs input-bordered w-full"></div></div></template>');
      var form = $('<form/>');
      content.append(form);
      box.append(content);
    } else {
      if (title) box.append($('<h3 class="font-bold mb-4"/>').text(title));
      box.append('<template id="dui-fitem-tpl"><div class="mb-2 flex items-center gap-2"><label class="shrink-0" style="width:150px"></label><div class="flex-1"><input class="input input-xs input-bordered w-full"></div></div></template>');
      var form = $('<form/>');
      box.append(form);
    }

    dlg.append(box);
    // Backdrop close
    dlg.append($('<div class="modal-backdrop"/>').append(
      $('<button type="button"/>').text('close').on('click', function() {
        dlg[0].close();
      })
    ));

    // Append to body (no #_fragments_ needed)
    $(document.body).append(dlg);
    // dynadd is from dynadd-plugin.js (loaded later but called at runtime)
    // Called after DOM assembly so closest('.modal-box') finds the fitem template
    if (typeof dynadd === 'function') dynadd(form, vars.fields);
    // Parse form fields
    $.parser.parse(form);
    // Initialise modal with buttons
    dlg.modal({ buttons: buts || [], closed: true, titlebar: useTitlebar, bordered: useBordered });
    // Render any Lucide icons created by $.dui.icon()
    if (window.lucide) lucide.createIcons({ nodes: dlg[0].querySelectorAll('[data-lucide]') });
    return dlg;
  }

  // Expose on $.dui namespace and register as window global
  var dui = $.dui;
  dui.fn.dynDialog = dynDialog;
  dui.register('dynDialog', dynDialog);

  // Modern API alias
  $.modal = { create: dynDialog };

})(jQuery);
