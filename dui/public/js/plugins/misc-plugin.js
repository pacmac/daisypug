/**
 * Pure4 Misc Plugin — remaining utility functions from ui.js
 *
 * These functions lived in the legacy bundle (ui.js) and are called by
 * page scripts. They have no natural "owning" plugin, so they live here
 * under $.dui.fn.* with window.* shims for backward compat.
 *
 * Functions:
 *   dynjs(src, cb)      — dynamic script loader (1 page caller)
 *   jsonLoad(cb)         — load JSON from file picker (2 page callers)
 *   jsonSave(data, fn)   — save JSON to download (2 page callers)
 *   busy(me, ms)         — prevent double-clicks (6 page callers)
 *   maxHeight(elobj)     — size element to viewport height (1 page caller)
 *   showfrag(src, tgt)   — render HTML5 <template> elements (main.js + 1 page)
 *   grpMember(grp, hide) — check user group membership (1 page caller)
 *   bcscan(cb, opt)      — barcode scanner keypress detection (3 page callers)
 */
(function($) {
  'use strict';

  var dui = $.dui;

  // ── dynjs ──────────────────────────────────────────────────────────
  function dynjs(src, cb) {
    var scripts = $("script[src^='" + src + "']");
    if (scripts.length) { if (cb) return cb(); return; }
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function() { if (cb) cb(); };
    script.src = src;
    head.appendChild(script);
  }

  // ── jsonLoad ───────────────────────────────────────────────────────
  function jsonLoad(cb) {
    var inp = $('<input type="file" style="display:none"/>');
    inp.on('change', function() {
      var reader = new FileReader();
      var file = this.files[0];
      reader.onloadend = function() {
        return cb(jsonParse(this.result));
      };
      reader.readAsText(file);
      $(this).remove();
    }).appendTo('#content').click();
  }

  // ── jsonSave ───────────────────────────────────────────────────────
  function jsonSave(data, fn) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
    pom.setAttribute('download', fn || 'export.json');
    if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
    } else {
      pom.click();
    }
  }

  // ── busy ───────────────────────────────────────────────────────────
  function busy(me, ms) {
    if (me.data('_busy')) return true;
    me.data('_busy', true);
    setTimeout(function() { me.data('_busy', false); }, ms || 100);
    return false;
  }

  // ── maxHeight ──────────────────────────────────────────────────────
  function maxHeight(elobj) {
    elobj.height($(window).height() - elobj.offset().top - (elobj.outerHeight(true) - elobj.height() + 10));
  }

  // ── showfrag ───────────────────────────────────────────────────────
  function showfrag(src, tgt) {
    if (src.length === 0) return false;
    tgt = tgt || src.parent();
    var content = src[0].content;
    tgt.append(document.importNode(content, true));
    if ($.parser && $.parser.parse) $.parser.parse(tgt);
    src.remove();
  }

  // ── grpMember ──────────────────────────────────────────────────────
  function grpMember(grp, hide) {
    if ($.dui.udata.groups.indexOf(grp.toUpperCase()) === -1) {
      if (!hide) msgbox('Not authorised.');
      return false;
    }
    return true;
  }

  // ── bcscan ─────────────────────────────────────────────────────────
  function bcscan(cb, opt) {
    opt = opt || {};
    var arg = {
      debug:  false,
      msec:   50,
      tout:   null,
      last:   null,
      string: [],
      scan:   false,
      focel:  null,
      terms:  ['\r', '\t'],
      raw:    null,
      cbob:   {
        raw:   null,
        pre:   '0',
        data:  null,
        focel: { name: null, id: null, val: null }
      }
    };
    arg = Object.assign(arg, opt);

    $(window).off('keypress').on('keypress', function(e) {
      var now = new Date();
      var focel = $(':focus');
      if (focel.length > 0) arg.focel = $(focel[0]).parent('span.textbox').prev('input.textbox-f:hidden');
      if (arg.string.length === 0) { arg.last = now; arg.scan = false; }
      else { arg.scan = true; e.preventDefault(); }

      arg.string.push(String.fromCharCode(e.which));
      clearTimeout(arg.tout);
      arg.tout = setTimeout(function() {
        if (arg.focel && arg.string.length > 1) {
          arg.cbob.focel.name = arg.focel.attr('textboxname');
          arg.cbob.focel.id = arg.focel.attr('id');
          arg.cbob.focel.val = arg.focel.textbox('getValue') || '';
          var regex = new RegExp(arg.string[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$');
          arg.cbob.focel.val = arg.cbob.focel.val.replace(regex, '');
          arg.focel.textbox('setValue', arg.cbob.focel.val);
        }
        if (arg.scan) {
          arg.raw = arg.string.join('');
          arg.cbob.raw = arg.raw;
          var termRegex = new RegExp('[' + arg.terms.join('') + ']$');
          arg.cbob.data = arg.cbob.raw.replace(termRegex, '');
          var bits = arg.cbob.data.match(/^%([0-9])(.*)%$/);
          if (bits) {
            arg.cbob.pre = bits[1].toString();
            arg.cbob.data = bits[2];
            if (arg.cbob.pre === '2') {
              var wob = bits[2].split('$');
              if (wob.length === 5) arg.cbob.data = wob[0] + '^' + wob[3] + '^' + wob[4];
            }
          }
          cb(arg.cbob);
        }
        arg.focel = null;
        arg.string = [];
        arg.start = null;
        arg.last = null;
      }, arg.msec);
      arg.last = now;
    });
  }

  // ── input.upper — auto-uppercase keyup handler (moved from main.js) ──
  $(document).on('keyup','input.upper + span > input:visible, input.fkey:not(.noupper):not(.novali) + span.textbox > input.textbox-text', function(e) {
    $(this).val( $(this).val().toLocaleUpperCase());
  });

  // ── Register on $.dui.fn ───────────────────────────────────────────
  dui.fn.dynjs      = dynjs;
  dui.fn.jsonLoad   = jsonLoad;
  dui.fn.jsonSave   = jsonSave;
  dui.fn.busy       = busy;
  dui.fn.maxHeight  = maxHeight;
  dui.fn.showfrag   = showfrag;
  dui.fn.grpMember  = grpMember;
  dui.fn.bcscan     = bcscan;

  // ── Window globals (permanent DUI API) ─────────────────────────────
  dui.register('dynjs',     dynjs);
  dui.register('jsonLoad',  jsonLoad);
  dui.register('jsonSave',  jsonSave);
  dui.register('busy',      busy);
  dui.register('maxHeight', maxHeight);
  dui.register('showfrag',  showfrag);
  dui.register('grpMember', grpMember);
  dui.register('bcscan',    bcscan);

  if (dui._plugins) dui._plugins.loaded.push('misc-plugin');

})(jQuery);
