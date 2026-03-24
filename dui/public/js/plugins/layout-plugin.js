// Layout jQuery Plugin
// Handles .easyui-layout elements - two-pane flex layout with regions
// Usage: $(element).layout(options)

(function($) {
  $.fn.layout = function(options) {
    options = options || {};

    return this.each(function() {
      const $layout = $(this);
      
      // Parse options using EasyUI parser if available
      let opts = {};
      if ($.parser && $.parser.parseOptions) {
        opts = $.parser.parseOptions(this, ['fit', 'border']);
      } else {
        // Fallback or legacy .data('options') usage
        opts = $layout.data('options') || {};
      }
      
      const settings = $.extend({}, { fit: true, border: false }, opts, options);

      // Add flex layout classes
      $layout.addClass('flex h-screen gap-0 overflow-hidden');

      // Process child regions (panels with region attribute)
      $layout.children('[region]').each(function() {
        const $region = $(this);
        const region = $region.attr('region');

        // Map region to grid column sizing
        if (region === 'west') {
          $region.addClass('flex-shrink-0'); // Don't grow, use width from style
        } else if (region === 'center' || region === 'main') {
          $region.addClass('flex-1 min-w-0'); // Take remaining space
        } else if (region === 'east') {
          $region.addClass('flex-shrink-0'); // Don't grow
        }
      });

      // Store settings for later access
      $layout.data('layout-settings', settings);
    });
  };

})(jQuery);
