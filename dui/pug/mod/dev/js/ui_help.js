/**
 * ui_help.js — UI Help page script
 * Loads DUI component documentation from /docs/dui/*.md
 * Splits markdown on ## headings and renders into tab panels
 */
$.page.ready(function() {
  'use strict';

  // Inject CSS for nested sub-tabs height propagation
  $('<style>').text(
    '#tab-output, #tab-examples { display:flex!important; flex-direction:column; height:100%; overflow:hidden; }' +
    '#output-tabs, #example-tabs { flex:1; min-height:0; }' +
    '#output-tabs > input.tab:checked + .tab-content, #example-tabs > input.tab:checked + .tab-content { flex-grow:1; min-height:0; display:flex!important; flex-direction:column; }' +
    '#output-pug, #output-html, #output-js, #output-rendered, #example-preview, #example-code { flex:1; min-height:0; display:flex; flex-direction:column; }' +
    '#output-pug > div, #output-pug textarea { flex:1; min-height:0; }' +
    '#output-html > div, #output-js > div { flex:1; min-height:0; display:flex; flex-direction:column; }' +
    '#output-html pre, #output-js pre { flex:1; min-height:0; overflow:auto; }'
  ).appendTo('head');

  // Load marked.js dynamically (bypasses ajax-plugin interception)
  function loadMarked(cb) {
    if (window.marked) return cb();
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    s.onload = cb;
    s.onerror = function() { console.error('[ui_help] failed to load marked.js'); };
    document.head.appendChild(s);
  }

  // Tab content containers
  var tabEls = {
    overview:   '#tab-overview',
    mixins:     '#tab-mixins',
    parameters: '#tab-parameters',
    examples:   '#tab-examples',
    output:     '#tab-output',
    jsapi:      '#tab-jsapi',
    notes:      '#tab-notes'
  };

  // Section heading → tab key mapping
  var sectionMap = {
    'Overview':   'overview',
    'Mixins':     'mixins',
    'Parameters': 'parameters',
    'Examples':   'examples',
    'Output':     'output',
    'JS API':     'jsapi',
    'Notes':      'notes'
  };

  // Cache fetched docs
  var cache = {};

  /**
   * Split raw markdown into sections by ## headings.
   * Returns { title: 'Page Title', sections: { 'Overview': '...', 'Mixins': '...' } }
   */
  function splitSections(md) {
    var lines = md.split('\n');
    var title = '';
    var sections = {};
    var currentKey = null;
    var buf = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (/^# /.test(line) && !title) {
        title = line.replace(/^# /, '').trim();
        continue;
      }
      if (/^## /.test(line)) {
        if (currentKey !== null) {
          sections[currentKey] = buf.join('\n').trim();
        }
        currentKey = line.replace(/^## /, '').trim();
        buf = [];
        continue;
      }
      buf.push(line);
    }
    if (currentKey !== null) {
      sections[currentKey] = buf.join('\n').trim();
    }
    return { title: title, sections: sections };
  }

  /**
   * Extract code blocks from markdown section.
   * Returns array of { lang: 'html', code: '...' }
   */
  function extractCodeBlocks(mdSection) {
    var blocks = [];
    var re = /```(\w*)\n([\s\S]*?)```/g;
    var m;
    while ((m = re.exec(mdSection)) !== null) {
      blocks.push({ lang: m[1] || '', code: m[2].trim() });
    }
    return blocks;
  }

  /**
   * Escape HTML for display in code blocks
   */
  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /**
   * Render the Examples tab with Preview/Code sub-tabs
   */
  function renderExamples(mdSection) {
    var blocks = extractCodeBlocks(mdSection);
    // Render full section as prose in Code sub-tab
    var codeHtml = '';
    for (var i = 0; i < blocks.length; i++) {
      codeHtml += '<pre><code>' + escHtml(blocks[i].code) + '</code></pre>';
    }
    $('#example-code').html('<div class="prose max-w-none">' + (codeHtml || '<p>No code examples.</p>') + '</div>');

    // Preview: render full markdown (headings + code) as prose for now
    // Phase 4 will replace this with live server-rendered Pug partials
    var html = marked.parse(mdSection);
    $('#example-preview').html('<div class="prose max-w-none">' + html + '</div>');

    $('#example-tabs').tabs('select', 0);
  }

  /**
   * Compile pug source via server endpoint.
   * Returns promise resolving to compiled HTML string.
   */
  function compilePug(source) {
    // Extract //- @module <name> pragma from first line
    var moduleMatch = source.match(/^\/\/- @module (\w+)\n/);
    var mod = moduleMatch ? moduleMatch[1] : null;
    var cleanSource = moduleMatch ? source.replace(/^\/\/- @module \w+\n/, '') : source;
    var body = { source: cleanSource };
    if (mod) body.module = mod;
    return fetch('/api/render-pug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.error) throw new Error(data.message || 'Compilation failed');
      return data.html;
    });
  }

  /**
   * Render the Output tab with Pug/HTML/Rendered sub-tabs.
   * Pug blocks are compiled server-side to produce HTML.
   */
  /**
   * Compile pug source and update HTML + Rendered tabs.
   * Accepts raw pug string (may include //- @module pragma).
   */
  function compileAndUpdate(pugSource, jsCode) {
    $('#output-html').html('<p class="text-base-content opacity-40">Compiling...</p>');
    $('#output-rendered').html('<p class="text-base-content opacity-40">Compiling...</p>');

    compilePug(pugSource).then(function(html) {
      $('#output-html').html('<div class="prose max-w-none"><pre><code>' + escHtml(html) + '</code></pre></div>');
      $('#output-rendered').html(html);
      // Initialize any DUI widgets in the rendered output
      if ($.parser && $.parser.parse) {
        $.parser.parse($('#output-rendered'));
      }
      // Execute associated JS blocks (e.g. loadData for datagrids)
      if (jsCode) {
        try { new Function(jsCode)(); }
        catch (e) { console.warn('[ui_help] JS exec error:', e.message); }
      }
      // Auto-select Rendered tab after compile
      $('#output-tabs').tabs('select', 'Rendered');
    }).catch(function(err) {
      $('#output-html').html('<p class="text-error">Failed to compile: ' + escHtml(err.message) + '</p>');
      $('#output-rendered').html('<p class="text-error">Failed to compile: ' + escHtml(err.message) + '</p>');
    });
  }

  function renderOutput(mdSection) {
    var blocks = extractCodeBlocks(mdSection);
    var pugBlocks = [];
    var jsBlocks = [];
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].lang === 'pug') pugBlocks.push(blocks[i].code);
      if (blocks[i].lang === 'js') jsBlocks.push(blocks[i].code);
    }

    if (pugBlocks.length === 0) {
      $('#output-pug, #output-html, #output-js, #output-rendered').html(
        '<p class="text-base-content opacity-40 italic">No output examples.</p>'
      );
      $('#output-tabs').tabs('select', 0);
      return;
    }

    // Combine all pug blocks into one editable source
    var originalPug = pugBlocks.join('\n\n');

    // Pug sub-tab: editable textarea with Compile/Reset buttons
    var pugTab = '<div class="flex flex-col h-full">' +
      '<div class="flex gap-1 mb-2">' +
        '<button class="btn btn-primary btn-sm" id="pug-compile">Compile</button>' +
        '<button class="btn btn-ghost btn-sm" id="pug-reset">Reset</button>' +
      '</div>' +
      '<textarea id="pug-editor" class="textarea textarea-bordered font-mono text-sm flex-1 w-full leading-relaxed" ' +
        'style="min-height:200px; tab-size:2; white-space:pre; overflow-wrap:normal; overflow-x:auto;">' +
        escHtml(originalPug) +
      '</textarea></div>';
    $('#output-pug').html(pugTab);

    // Combine JS blocks for execution after render
    var jsCode = jsBlocks.length > 0 ? jsBlocks.join('\n\n') : '';

    // Compile button
    $('#pug-compile').on('click', function() {
      var source = $('#pug-editor').val();
      if (!source.trim()) return;
      compileAndUpdate(source, jsCode);
    });

    // Reset button
    $('#pug-reset').on('click', function() {
      $('#pug-editor').val(originalPug);
      compileAndUpdate(originalPug, jsCode);
    });

    // JS sub-tab: show associated JavaScript
    if (jsBlocks.length > 0) {
      var jsHtml = '';
      for (var j = 0; j < jsBlocks.length; j++) {
        jsHtml += '<pre><code>' + escHtml(jsBlocks[j]) + '</code></pre>';
      }
      $('#output-js').html('<div class="prose max-w-none">' + jsHtml + '</div>');
    } else {
      $('#output-js').html('<p class="text-base-content opacity-40 italic">No JavaScript for this component.</p>');
    }

    // Initial compile
    compileAndUpdate(originalPug, jsCode);

    $('#output-tabs').tabs('select', 0);
  }

  /**
   * Render parsed sections into tabs
   */
  function renderTabs(parsed) {
    // Update summary
    var iconEl = currentIcon ? $.dui.icon(currentIcon, {size: 'lg', color: 'text-primary'}) : null;
    var iconHtml = iconEl ? iconEl.outerHTML + ' ' : '';
    var summaryHtml = '<h3 class="font-bold text-base flex items-center gap-2">' + iconHtml + parsed.title + '</h3>';
    if (parsed.sections['Overview']) {
      var firstLine = parsed.sections['Overview'].split('\n')[0].trim();
      if (firstLine) {
        summaryHtml += '<p class="mt-1 opacity-70">' + firstLine + '</p>';
      }
    }
    $('#help-summary').html(summaryHtml);
    if (window.lucide) lucide.createIcons({ nodes: $('#help-summary').get() });

    // Render each tab
    var keys = Object.keys(tabEls);
    for (var i = 0; i < keys.length; i++) {
      var tabKey = keys[i];
      var sectionName = null;
      for (var heading in sectionMap) {
        if (sectionMap[heading] === tabKey) {
          sectionName = heading;
          break;
        }
      }

      var el = $(tabEls[tabKey]);
      var content = sectionName ? parsed.sections[sectionName] : null;

      if (!content) {
        if (tabKey === 'examples') {
          $('#example-preview, #example-code').html('<p class="text-base-content opacity-40 italic">No content for this section.</p>');
        } else if (tabKey === 'output') {
          $('#output-pug, #output-html, #output-js, #output-rendered').html('<p class="text-base-content opacity-40 italic">No content for this section.</p>');
        } else {
          el.html('<p class="text-base-content opacity-40 italic">No content for this section.</p>');
        }
        continue;
      }

      // Special handling for Examples and Output tabs (sub-tabs)
      if (tabKey === 'examples') {
        renderExamples(content);
      } else if (tabKey === 'output') {
        renderOutput(content);
      } else {
        var html = marked.parse(content);
        el.html('<div class="prose max-w-none">' + html + '</div>');
      }
    }

    // Select first tab
    $('#help-tabs').tabs('select', 0);
  }

  /**
   * Load a component doc by value (filename without .md)
   */
  var currentIcon = '';

  function loadDoc(value, icon) {
    if (!value) return;
    currentIcon = icon || '';

    if (cache[value]) {
      renderTabs(cache[value]);
      return;
    }

    // Show loading state (skip tabs with sub-tab structure)
    var subTabParents = { examples: true, output: true };
    var keys = Object.keys(tabEls);
    for (var i = 0; i < keys.length; i++) {
      if (subTabParents[keys[i]]) {
        // Clear inner panels only
        $(tabEls[keys[i]]).find('#example-preview, #example-code, #output-pug, #output-html, #output-js, #output-rendered')
          .html('<p class="text-base-content opacity-40">Loading...</p>');
      } else {
        $(tabEls[keys[i]]).html('<p class="text-base-content opacity-40">Loading...</p>');
      }
    }

    fetch('/docs/dui/' + value + '.md')
      .then(function(res) {
        if (!res.ok) throw new Error(res.status);
        return res.text();
      })
      .then(function(md) {
        var parsed = splitSections(md);
        cache[value] = parsed;
        loadMarked(function() { renderTabs(parsed); });
      })
      .catch(function() {
        $('#help-summary').html('<p class="text-error">Failed to load documentation for "' + value + '".</p>');
        var keys2 = Object.keys(tabEls);
        for (var j = 0; j < keys2.length; j++) {
          if (subTabParents[keys2[j]]) {
            $(tabEls[keys2[j]]).find('#example-preview, #example-code, #output-pug, #output-html, #output-js, #output-rendered').html('');
          } else {
            $(tabEls[keys2[j]]).html('');
          }
        }
      });
  }

  // Bind combobox selection (items pre-sorted in Pug, Overview first)
  $('#COMPONENT').combobox({
    onSelect: function(rec) {
      if (rec && rec.value) loadDoc(rec.value, rec.icon);
    }
  });
});
