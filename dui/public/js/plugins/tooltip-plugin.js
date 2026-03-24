/**
 * tooltip-plugin.js — Floating tooltip for [data-tip] elements
 *
 * Replaces DaisyUI's CSS-only tooltip (which clips inside overflow:hidden
 * containers) with a JS-positioned div appended to document.body.
 *
 * Usage: add data-tip="text" to any element. Optional data-tip-pos="top|bottom|left"
 * (default: right). The tooltip appears on hover after a short delay.
 */
(function($) {
  'use strict';

  var TIP_DELAY = 400;   // ms before showing
  var TIP_GAP = 8;       // px gap between target and tooltip
  var timer = null;
  var tip = null;         // the single reusable tooltip element
  var activeTrigger = null;

  function createTip() {
    if (tip && tip.parentNode) return tip;
    tip = document.createElement('div');
    tip.className = 'dui-tip';
    tip.style.cssText = [
      'position:fixed',
      'z-index:99999',
      'pointer-events:none',
      'opacity:0',
      'transition:opacity 0.15s',
      'max-width:20rem',
      'padding:0.25rem 0.5rem',
      'font-size:0.8rem',
      'line-height:1.25',
      'white-space:pre-line',
      'border-radius:var(--radius-field, 0.25rem)',
      'background:var(--color-neutral)',
      'color:var(--color-neutral-content)'
    ].join(';');
    document.body.appendChild(tip);
    return tip;
  }

  function showTip(el) {
    var text = el.getAttribute('data-tip');
    if (!text) return;

    // data-tip-if="selector" — only show if element matches or has ancestor matching selector
    var cond = el.getAttribute('data-tip-if');
    if (cond && !el.closest(cond)) return;

    var t = createTip();
    t.textContent = text;
    // Position offscreen first to measure without flash
    t.style.opacity = '0';
    t.style.top = '-9999px';
    t.style.left = '-9999px';
    t.style.display = 'block';

    // Measure after content set
    var rect = el.getBoundingClientRect();
    var pos = el.getAttribute('data-tip-pos') || 'right';

    // Force layout to get tip dimensions
    var tw = t.offsetWidth;
    var th = t.offsetHeight;

    var top, left;
    if (pos === 'right') {
      top = rect.top + (rect.height - th) / 2;
      left = rect.right + TIP_GAP;
    } else if (pos === 'left') {
      top = rect.top + (rect.height - th) / 2;
      left = rect.left - tw - TIP_GAP;
    } else if (pos === 'bottom') {
      top = rect.bottom + TIP_GAP;
      left = rect.left + (rect.width - tw) / 2;
    } else { // top
      top = rect.top - th - TIP_GAP;
      left = rect.left + (rect.width - tw) / 2;
    }

    // Clamp to viewport
    if (left + tw > window.innerWidth) left = window.innerWidth - tw - 4;
    if (left < 4) left = 4;
    if (top + th > window.innerHeight) top = window.innerHeight - th - 4;
    if (top < 4) top = 4;

    // Position then fade in on next frame — prevents text flash
    t.style.top = top + 'px';
    t.style.left = left + 'px';
    requestAnimationFrame(function() {
      t.style.opacity = '1';
    });
    activeTrigger = el;
  }

  function hideTip() {
    clearTimeout(timer);
    timer = null;
    activeTrigger = null;
    if (tip) {
      tip.style.opacity = '0';
      tip.style.display = 'none';
    }
  }

  // Event delegation on document — works for dynamically added elements
  $(document).on('mouseenter', '[data-tip]', function() {
    var el = this;
    clearTimeout(timer);
    timer = setTimeout(function() { showTip(el); }, TIP_DELAY);
  });

  $(document).on('mouseleave', '[data-tip]', function() {
    hideTip();
  });

  // Hide visible tooltip on click (not scroll — scroll kills pending timers causing intermittent failures)
  $(document).on('click', function() {
    if (activeTrigger) hideTip();
  });

})(jQuery);
