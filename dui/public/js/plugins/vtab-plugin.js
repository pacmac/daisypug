/**
 * Pure4 VTab Plugin — vertical tabs using vsplit layout
 *
 * DOM structure (rendered by +vtab/+vtab-item mixins):
 *   div.vtab (vsplit grid container)
 *     div.panel.pan-west        — tab nav column
 *       div.panel-body
 *         div.vtab-nav           — labels moved here by init
 *     div.panel.pan-center      — tab content column
 *       div.panel-body
 *         div.vtab-body
 *           div.vtab-label.active  — moved to vtab-nav
 *           div.vtab-panel.active  — stays here
 *           div.vtab-label         — moved to vtab-nav
 *           div.vtab-panel         — stays here
 */
(function($) {
  'use strict';

  function initVtab(el) {
    var $vtab = $(el);
    if ($vtab.data('vtab-init')) return;
    $vtab.data('vtab-init', true);

    var $nav = $vtab.find('.vtab-nav');
    var $body = $vtab.find('.vtab-body');
    if (!$nav.length || !$body.length) return;

    // Move labels from body to nav
    $body.children('.vtab-label').appendTo($nav);

    // Click handler — switch active tab
    $nav.on('click', '.vtab-label', function() {
      var idx = $(this).index();
      $nav.children('.vtab-label').removeClass('active');
      $(this).addClass('active');
      $body.children('.vtab-panel').removeClass('active').eq(idx).addClass('active');
    });
  }

  // Init on page ready
  $(document).on('dui:contentloaded', function() {
    $('.vtab').each(function() { initVtab(this); });
  });

  // Also init immediately for statically rendered pages
  $(function() {
    $('.vtab').each(function() { initVtab(this); });
  });

})(jQuery);
