/**
 * drag-plugin.js — Draggable & Droppable using HTML5 Drag API
 *
 * Thin jQuery wrapper that exposes EUI-compatible $.fn.draggable and
 * $.fn.droppable method calls, backed by native HTML5 drag events.
 *
 * Dropped EUI features (silently ignored): axis, revert, proxy, edge,
 * delay, deltaX/Y, cursor — the browser handles ghost images and cursors.
 */
(function($) {
  'use strict';

  // ── Global drag state ─────────────────────────────────────────────
  var _currentSource = null;  // element being dragged

  // ════════════════════════════════════════════════════════════════════
  // $.fn.draggable
  // ════════════════════════════════════════════════════════════════════

  $.fn.draggable = function(options, param) {
    if (typeof options === 'string') {
      var method = $.fn.draggable.methods[options];
      if (method) return method(this, param);
      return this;
    }

    options = options || {};
    return this.each(function() {
      var el = this;
      var state = $.data(el, 'draggable');
      if (state) {
        $.extend(state.options, options);
        el.draggable = !state.options.disabled;
        return;
      }

      var opts = $.extend({}, $.fn.draggable.defaults, options);
      state = { options: opts };
      $.data(el, 'draggable', state);

      el.draggable = !opts.disabled;
      el.classList.add('draggable');

      // Resolve handle
      var handle = el;
      if (opts.handle) {
        handle = (typeof opts.handle === 'string')
          ? el.querySelector(opts.handle) || el
          : $(opts.handle)[0] || el;
      }
      // cursor handled by CSS (.draggable { cursor: grab })

      // ── dragstart ───────────────────────────────────────────────
      $(el).on('dragstart.draggable', function(e) {
        if (opts.disabled) { e.preventDefault(); return; }

        _currentSource = el;
        $.fn.draggable.isDragging = true;

        // Allow callbacks to cancel
        if (opts.onBeforeDrag && opts.onBeforeDrag.call(el, e) === false) {
          e.preventDefault();
          _currentSource = null;
          $.fn.draggable.isDragging = false;
          return;
        }

        // Set drag data (required for Firefox)
        var dt = e.originalEvent.dataTransfer;
        dt.effectAllowed = 'move';
        try { dt.setData('text/plain', el.id || ''); } catch(ex) {}

        el.classList.add('dragging');
        if (opts.onStartDrag) opts.onStartDrag.call(el, e);
      });

      // ── dragend ─────────────────────────────────────────────────
      $(el).on('dragend.draggable', function(e) {
        el.classList.remove('dragging');
        if (opts.onEndDrag) opts.onEndDrag.call(el, e);
        if (opts.onStopDrag) opts.onStopDrag.call(el, e);
        _currentSource = null;
        $.fn.draggable.isDragging = false;
      });
    });
  };

  $.fn.draggable.isDragging = false;

  $.fn.draggable.defaults = {
    handle: null,
    disabled: false,
    // EUI compat — accepted but ignored
    proxy: null, revert: false, cursor: 'move',
    deltaX: null, deltaY: null, axis: null, edge: 0, delay: 100,
    // Callbacks
    onBeforeDrag: null,
    onStartDrag: null,
    onDrag: null,
    onEndDrag: null,
    onStopDrag: null
  };

  $.fn.draggable.methods = {
    options: function(jq) {
      var state = $.data(jq[0], 'draggable');
      return state ? state.options : {};
    },
    enable: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'draggable');
        if (state) {
          state.options.disabled = false;
          this.draggable = true;
        }
      });
    },
    disable: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'draggable');
        if (state) {
          state.options.disabled = true;
          this.draggable = false;
        }
      });
    },
    proxy: function(jq) {
      return jq[0]; // no proxy — return element itself
    }
  };

  // ════════════════════════════════════════════════════════════════════
  // $.fn.droppable
  // ════════════════════════════════════════════════════════════════════

  $.fn.droppable = function(options, param) {
    if (typeof options === 'string') {
      var method = $.fn.droppable.methods[options];
      if (method) return method(this, param);
      return this;
    }

    options = options || {};
    return this.each(function() {
      var el = this;
      var state = $.data(el, 'droppable');
      if (state) {
        $.extend(state.options, options);
        return;
      }

      var opts = $.extend({}, $.fn.droppable.defaults, options);
      state = { options: opts };
      $.data(el, 'droppable', state);

      el.classList.add('droppable');

      // Check if source is accepted by this droppable
      function accepted() {
        if (opts.disabled || !_currentSource) return false;
        if (!opts.accept) return true;
        return $(opts.accept).filter(function() {
          return this === _currentSource;
        }).length > 0;
      }

      // ── dragenter ───────────────────────────────────────────────
      $(el).on('dragenter.droppable', function(e) {
        if (!accepted()) return;
        e.preventDefault();
        if (opts.onDragEnter) opts.onDragEnter.call(el, e, _currentSource);
      });

      // ── dragover ────────────────────────────────────────────────
      $(el).on('dragover.droppable', function(e) {
        if (!accepted()) return;
        e.preventDefault(); // required to allow drop
        e.originalEvent.dataTransfer.dropEffect = 'move';
        if (opts.onDragOver) opts.onDragOver.call(el, e, _currentSource);
      });

      // ── dragleave ───────────────────────────────────────────────
      $(el).on('dragleave.droppable', function(e) {
        if (!accepted()) return;
        if (opts.onDragLeave) opts.onDragLeave.call(el, e, _currentSource);
      });

      // ── drop ────────────────────────────────────────────────────
      $(el).on('drop.droppable', function(e) {
        if (!accepted()) return;
        e.preventDefault();
        if (opts.onDrop) opts.onDrop.call(el, e, _currentSource);
      });
    });
  };

  $.fn.droppable.defaults = {
    accept: null,
    disabled: false,
    onDragEnter: null,
    onDragOver: null,
    onDragLeave: null,
    onDrop: null
  };

  $.fn.droppable.methods = {
    options: function(jq) {
      var state = $.data(jq[0], 'droppable');
      return state ? state.options : {};
    },
    enable: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'droppable');
        if (state) state.options.disabled = false;
      });
    },
    disable: function(jq) {
      return jq.each(function() {
        var state = $.data(this, 'droppable');
        if (state) state.options.disabled = true;
      });
    }
  };

})(jQuery);
