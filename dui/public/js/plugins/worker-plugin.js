/**
 * Pure4 Worker Plugin — starts the background web worker
 *
 * Responsibilities:
 *   - Spawn worker.js and send 'start' with ping config
 *   - Forward user activity (mousemove/keydown) as throttled 'activity' messages
 *   - Handle worker responses: 'logout' → redirect, 'error' → console warn
 */
(function($) {
  'use strict';

  var worker = null;
  var activityThrottle = null;
  var THROTTLE_MS = 5000; // don't spam the worker more than once per 5s

  function sendActivity() {
    if (worker) worker.postMessage({ type: 'activity' });
  }

  function onActivity() {
    if (activityThrottle) return;
    sendActivity();
    activityThrottle = setTimeout(function() { activityThrottle = null; }, THROTTLE_MS);
  }

  function onWorkerMessage(e) {
    var msg = e.data;
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'pong':
        // Session alive — update online count
        if (msg.online != null) {
          var el = document.getElementById('footer-online-text');
          if (el) el.textContent = 'Online ' + msg.online;
        }
        break;

      case 'usermsg':
        // Admin message delivered via ping cycle
        if (msg.msg && typeof msgbox === 'function') {
          msgbox(msg.msg);
        }
        break;

      case 'logout':
        // Session expired or destroyed — redirect to login
        console.warn('[worker-plugin] session expired, redirecting to login');
        document.location.href = '/login';
        break;

      case 'error':
        console.warn('[worker-plugin] worker error:', msg.msg);
        break;
    }
  }

  function init() {
    if (typeof Worker === 'undefined') {
      console.warn('[worker-plugin] Web Workers not supported');
      return;
    }

    var uid = '';
    if ($.dui.udata) uid = $.dui.udata.userid || '';

    var pingInterval = 60000; // 1 minute

    worker = new Worker('/dui/js/worker.js');
    worker.onmessage = onWorkerMessage;
    worker.onerror = function(err) {
      console.warn('[worker-plugin] worker error event:', err.message);
    };

    worker.postMessage({
      type: 'start',
      pingUrl: '/',
      pingInterval: pingInterval,
      uid: uid
    });

    // Forward user activity (throttled)
    document.addEventListener('mousemove', onActivity, { passive: true });
    document.addEventListener('keydown', onActivity, { passive: true });
  }

  $(function() {
    setTimeout(init, 0);
  });

})(jQuery);
