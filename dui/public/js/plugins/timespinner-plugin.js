/**
 * Timespinner Helper - jQuery plugin for time input (HH:MM:SS)
 * 
 * Extends: spinner
 * Purpose: Parse and format time values with constraints (0-23h, 0-59m/s)
 * 
 * Methods:
 * - getValue() - Get formatted time "HH:MM:SS"
 * - setValue(time) - Set and validate time
 * - getHours() - Extract hours from value
 * - getMinutes() - Extract minutes from value
 * - getSeconds() - Extract seconds from value
 * - options() - Get/set options (inherited from spinner)
 * 
 * Usage:
 *   $('input.easyui-timespinner').timespinner({
 *     value: '08:30:45',
 *     showSeconds: true,
 *     min: '06:00:00',
 *     max: '18:30:00'
 *   });
 *   
 *   $input.timespinner('setValue', '10:15:30');
 *   $input.timespinner('getHours');        // 10
 *   $input.timespinner('getMinutes');      // 15
 *   $input.timespinner('getSeconds');      // 30
 */

(function($) {
  'use strict';

  // Helper: Pad number to 2 digits
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  // Helper: Parse time string "HH:MM:SS" to components
  function parseTime(timeStr) {
    if (!timeStr) return { h: 0, m: 0, s: 0 };
    
    const parts = String(timeStr).split(':');
    return {
      h: Math.max(0, Math.min(23, parseInt(parts[0]) || 0)),
      m: Math.max(0, Math.min(59, parseInt(parts[1]) || 0)),
      s: Math.max(0, Math.min(59, parseInt(parts[2]) || 0))
    };
  }

  // Helper: Format components to "HH:MM:SS"
  function formatTime(h, m, s) {
    h = Math.max(0, Math.min(23, parseInt(h) || 0));
    m = Math.max(0, Math.min(59, parseInt(m) || 0));
    s = Math.max(0, Math.min(59, parseInt(s) || 0));
    return pad(h) + ':' + pad(m) + ':' + pad(s);
  }

  // Main plugin
  $.fn.timespinner = function(method) {
    const $target = this.eq(0);
    const target = $target[0];
    
    if (!target) return this;

    // Initialize spinner first (composition pattern)
    if (method === undefined || (typeof method === 'object')) {
      const options = method || {};
      
      // Initialize as spinner if not already
      if (!$.data(target, 'spinner')) {
        $target.spinner(options);
      }
      
      // Store timespinner state
      let state = $.data(target, 'timespinner');
      if (!state) {
        state = {
          showSeconds: options.showSeconds !== false,
          min: options.min || '00:00:00',
          max: options.max || '23:59:59'
        };
        $.data(target, 'timespinner', state);
      }
      
      // Ensure value is in time format
      let val = target.value || '';
      if (!val || !/^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(val)) {
        val = options.value || '00:00:00';
        target.value = formatTime(
          parseTime(val).h,
          parseTime(val).m,
          parseTime(val).s
        );
      }
      
      return this;
    }

    // Get/set methods
    const jq = $target.eq(0);
    const state = $.data(target, 'timespinner') || {};
    
    switch (method) {
      case 'options':
        return jq.spinner('options', arguments[1]);
      
      case 'getValue':
        return target.value || '00:00:00';
      
      case 'setValue': {
        const newTime = arguments[1];
        const parsed = parseTime(newTime);
        const formatted = formatTime(parsed.h, parsed.m, parsed.s);
        
        // Validate against min/max if set
        if (state.min || state.max) {
          const minParsed = parseTime(state.min);
          const maxParsed = parseTime(state.max);
          
          const minSeconds = minParsed.h * 3600 + minParsed.m * 60 + minParsed.s;
          const maxSeconds = maxParsed.h * 3600 + maxParsed.m * 60 + maxParsed.s;
          const curSeconds = parsed.h * 3600 + parsed.m * 60 + parsed.s;
          
          if (curSeconds < minSeconds) {
            const clamped = parseTime(state.min);
            target.value = formatTime(clamped.h, clamped.m, clamped.s);
            return this;
          }
          if (curSeconds > maxSeconds) {
            const clamped = parseTime(state.max);
            target.value = formatTime(clamped.h, clamped.m, clamped.s);
            return this;
          }
        }
        
        target.value = formatted;
        return this;
      }
      
      case 'getHours': {
        const parsed = parseTime(target.value);
        return parsed.h;
      }
      
      case 'getMinutes': {
        const parsed = parseTime(target.value);
        return parsed.m;
      }
      
      case 'getSeconds': {
        const parsed = parseTime(target.value);
        return parsed.s;
      }
      
      // Delegate inherited methods to spinner
      case 'enable':
      case 'disable':
      case 'readonly':
      case 'isValid':
      case 'validate':
      case 'clear':
      case 'reset':
      case 'destroy':
        return jq.spinner(method, arguments[1]);
      
      default:
        return jq.spinner(method, arguments[1]);
    }
  };

})(jQuery);
