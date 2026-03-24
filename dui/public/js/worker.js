/**
 * Pure4 Background Worker
 *
 * Runs in a web worker thread. Handles:
 *   - Session keepalive ping with idle status reporting
 *   - Extensible via message API for future tasks
 *
 * Message API (main → worker):
 *   {type:'start', pingUrl:'/', pingInterval:60000, uid:'...'}
 *   {type:'activity'}          — user moved mouse/pressed key, reset idle
 *   {type:'stop'}              — stop all timers
 *
 * Message API (worker → main):
 *   {type:'pong'}              — ping succeeded, session alive
 *   {type:'logout'}            — session expired or destroyed, redirect to login
 *   {type:'error', msg:'...'}  — unexpected error
 *
 * Ping always fires every interval.
 *   - Sends idle=true|false so the server can track activity.
 *   - Active pings keep the session alive (server refreshes lastActive).
 *   - Idle pings let the server check idlemin and expire the session.
 *   - If response is not "pong" (expired, login redirect, error), posts 'logout'.
 */
(function() {
  'use strict';

  var pingTimer = null;
  var idle = false;
  var cfg = { pingUrl: '/', pingInterval: 60000, uid: '' };

  function doPing() {
    var body = '_func=ping&uid=' + encodeURIComponent(cfg.uid) + '&idle=' + idle;
    fetch(cfg.pingUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body,
      credentials: 'same-origin'
    })
    .then(function(res) { return res.text(); })
    .then(function(text) {
      var t = text.trim();
      // JSON response (contains userMsg or future extensions)
      if (t.charAt(0) === '{') {
        try {
          var data = JSON.parse(t);
          if (data.pong != null) {
            self.postMessage({ type: 'pong', online: data.pong });
            if (data.userMsg) {
              self.postMessage({ type: 'usermsg', msg: data.userMsg });
            }
          } else {
            self.postMessage({ type: 'logout' });
            stop();
          }
        } catch (e) {
          self.postMessage({ type: 'error', msg: 'Bad JSON from ping' });
        }
      } else if (t === 'pong' || t.indexOf('pong:') === 0) {
        var parts = t.split(':');
        var online = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;
        self.postMessage({ type: 'pong', online: online });
      } else {
        // "expired", login page HTML, or any non-pong → session is gone
        self.postMessage({ type: 'logout' });
        stop();
      }
    })
    .catch(function(err) {
      self.postMessage({ type: 'error', msg: err.message || String(err) });
    });

    // After each ping, assume idle until next activity message arrives
    idle = true;
  }

  function start() {
    stop();
    idle = false; // user just loaded the page
    doPing(); // immediate first ping
    pingTimer = setInterval(doPing, cfg.pingInterval);
  }

  function stop() {
    if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
  }

  self.onmessage = function(e) {
    var msg = e.data;
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'start':
        if (msg.pingUrl) cfg.pingUrl = msg.pingUrl;
        if (msg.pingInterval) cfg.pingInterval = msg.pingInterval;
        if (msg.uid) cfg.uid = msg.uid;
        start();
        break;

      case 'activity':
        idle = false;
        break;

      case 'stop':
        stop();
        break;
    }
  };
})();
