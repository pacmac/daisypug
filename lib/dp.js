/**
 * DaisyPug Component API — dp.js
 * Zero-dependency client-side API for interacting with DaisyPug components.
 * Auto-discovers components via dp-{name} CSS class hooks.
 */
(function(global) {
  'use strict';

  // ============================================================
  // DpComponent — Base class for all components
  // ============================================================

  class DpComponent {
    constructor(el) {
      this.el = el;
      this._listeners = new Map();
      this._subCache = {};
    }

    // --- Properties ---
    get id() { return this.el.id; }
    get type() { return this._dpType(); }
    get classes() { return this.el.classList; }

    _dpType() {
      for (const cls of this.el.classList) {
        if (cls.startsWith('dp-') && cls !== 'dp-') return cls.slice(3);
      }
      return 'component';
    }

    // --- Event system ---
    _on(event, fn, opts) {
      const wrapper = (e) => fn(e, this);
      wrapper._orig = fn;
      this.el.addEventListener(event, wrapper, opts);
      if (!this._listeners.has(event)) this._listeners.set(event, []);
      this._listeners.get(event).push(wrapper);
      return this;
    }

    _off(event, fn) {
      const list = this._listeners.get(event) || [];
      if (fn) {
        const idx = list.findIndex(w => w._orig === fn);
        if (idx >= 0) {
          this.el.removeEventListener(event, list[idx]);
          list.splice(idx, 1);
        }
      } else {
        list.forEach(w => this.el.removeEventListener(event, w));
        this._listeners.set(event, []);
      }
      return this;
    }

    onClick(fn, opts) { return this._on('click', fn, opts); }
    offClick(fn) { return this._off('click', fn); }
    onDblClick(fn, opts) { return this._on('dblclick', fn, opts); }
    offDblClick(fn) { return this._off('dblclick', fn); }
    onMouseEnter(fn, opts) { return this._on('mouseenter', fn, opts); }
    offMouseEnter(fn) { return this._off('mouseenter', fn); }
    onMouseLeave(fn, opts) { return this._on('mouseleave', fn, opts); }
    offMouseLeave(fn) { return this._off('mouseleave', fn); }
    onFocus(fn, opts) { return this._on('focus', fn, opts); }
    offFocus(fn) { return this._off('focus', fn); }
    onBlur(fn, opts) { return this._on('blur', fn, opts); }
    offBlur(fn) { return this._off('blur', fn); }
    onKeyDown(fn, opts) { return this._on('keydown', fn, opts); }
    offKeyDown(fn) { return this._off('keydown', fn); }
    onKeyUp(fn, opts) { return this._on('keyup', fn, opts); }
    offKeyUp(fn) { return this._off('keyup', fn); }
    onContextMenu(fn, opts) { return this._on('contextmenu', fn, opts); }
    offContextMenu(fn) { return this._off('contextmenu', fn); }

    // --- Visibility ---
    show() { this.el.style.display = ''; return this; }
    hide() { this.el.style.display = 'none'; return this; }
    toggle() { return this.isVisible() ? this.hide() : this.show(); }
    isVisible() { return this.el.style.display !== 'none' && !this.el.hidden; }

    // --- Enable/Disable ---
    enable() { this.el.disabled = false; this.el.classList.remove('btn-disabled'); return this; }
    disable() { this.el.disabled = true; this.el.classList.add('btn-disabled'); return this; }
    isEnabled() { return !this.el.disabled; }

    // --- CSS Classes ---
    addClass(cls) { this.el.classList.add(cls); return this; }
    removeClass(cls) { this.el.classList.remove(cls); return this; }
    toggleClass(cls) { this.el.classList.toggle(cls); return this; }
    hasClass(cls) { return this.el.classList.contains(cls); }

    // --- Attributes ---
    getAttr(name) { return this.el.getAttribute(name); }
    setAttr(name, val) { this.el.setAttribute(name, val); return this; }
    removeAttr(name) { this.el.removeAttribute(name); return this; }
    getData(key) { return this.el.dataset[key]; }
    setData(key, val) { this.el.dataset[key] = val; return this; }

    // --- Styles ---
    getStyle(prop) { return getComputedStyle(this.el)[prop]; }
    setStyle(prop, val) { this.el.style[prop] = val; return this; }

    // --- DOM ---
    remove() { this.el.remove(); }
    clone() { return _wrap(this.el.cloneNode(true)); }

    parent() {
      let p = this.el.parentElement;
      while (p) {
        for (const cls of p.classList) {
          if (cls.startsWith('dp-')) return _wrap(p);
        }
        p = p.parentElement;
      }
      return null;
    }

    find(sel) {
      const el = this.el.querySelector(sel);
      return el ? _wrap(el) : null;
    }

    findAll(sel) {
      return Array.from(this.el.querySelectorAll(sel)).map(el => _wrap(el));
    }

    // --- Custom Events ---
    emit(name, detail) {
      this.el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
      return this;
    }

    on(name, fn) {
      return this._on(name, (e, comp) => fn(e.detail, e, comp));
    }

    off(name, fn) { return this._off(name, fn); }

    // --- Sub-element access (lazy cached) ---
    _sub(dpClass) {
      if (!this._subCache[dpClass]) {
        const el = this.el.querySelector(`.dp-${dpClass}`);
        this._subCache[dpClass] = el ? _wrap(el) : null;
      }
      return this._subCache[dpClass];
    }
  }

  // ============================================================
  // DpInput — Text input (THE reference class)
  // ============================================================

  class DpInput extends DpComponent {
    onChange(fn, opts) {
      return this._on('change', (e, comp) => fn(comp.getValue(), e, comp), opts);
    }
    offChange(fn) { return this._off('change', fn); }

    onInput(fn, opts) {
      return this._on('input', (e, comp) => fn(comp.getValue(), e, comp), opts);
    }
    offInput(fn) { return this._off('input', fn); }

    onKeyPress(fn, opts) {
      return this._on('keypress', (e, comp) => fn(e.key, e, comp), opts);
    }

    onEnter(fn) {
      return this._on('keydown', (e, comp) => {
        if (e.key === 'Enter') fn(comp.getValue(), e, comp);
      });
    }

    onEscape(fn) {
      return this._on('keydown', (e, comp) => {
        if (e.key === 'Escape') fn(e, comp);
      });
    }

    getText() { return this.el.value; }
    setText(str) { this.el.value = str; return this; }
    getValue() { return this.el.value; }
    setValue(val) { this.el.value = val; return this; }
    clear() { this.el.value = ''; return this; }

    focus() { this.el.focus(); return this; }
    blur() { this.el.blur(); return this; }
    select() { this.el.select(); return this; }

    getPlaceholder() { return this.el.placeholder; }
    setPlaceholder(str) { this.el.placeholder = str; return this; }

    isRequired() { return this.el.required; }
    setRequired(bool) { this.el.required = bool; return this; }

    isReadOnly() { return this.el.readOnly; }
    setReadOnly(bool) { this.el.readOnly = bool; return this; }

    getType() { return this.el.type; }
    setType(str) { this.el.type = str; return this; }

    getName() { return this.el.name; }
    setName(str) { this.el.name = str; return this; }
  }

  // ============================================================
  // DpSelect
  // ============================================================

  class DpSelect extends DpInput {
    getOptions() {
      return Array.from(this.el.options).map(o => ({
        value: o.value, text: o.text, selected: o.selected
      }));
    }

    setOptions(arr) {
      this.el.innerHTML = '';
      arr.forEach(opt => this.addOption(
        typeof opt === 'string' ? opt : opt.value,
        typeof opt === 'string' ? opt : opt.text
      ));
      return this;
    }

    addOption(val, text) {
      const o = document.createElement('option');
      o.value = val;
      o.textContent = text || val;
      this.el.appendChild(o);
      return this;
    }

    removeOption(val) {
      const o = this.el.querySelector(`option[value="${val}"]`);
      if (o) o.remove();
      return this;
    }

    getSelectedIndex() { return this.el.selectedIndex; }
    setSelectedIndex(n) { this.el.selectedIndex = n; return this; }
    getSelectedText() { return this.el.options[this.el.selectedIndex]?.text || ''; }
    getSelectedValue() { return this.el.value; }
  }

  // ============================================================
  // DpTextarea
  // ============================================================

  class DpTextarea extends DpInput {
    getRows() { return parseInt(this.el.rows) || 0; }
    setRows(n) { this.el.rows = n; return this; }
    getCols() { return parseInt(this.el.cols) || 0; }
    setCols(n) { this.el.cols = n; return this; }
    getLength() { return this.el.value.length; }
    getLineCount() { return (this.el.value.match(/\n/g) || []).length + 1; }
  }

  // ============================================================
  // DpCheckbox / DpToggle
  // ============================================================

  class DpCheckbox extends DpInput {
    isChecked() { return this.el.checked; }
    setChecked(bool) { this.el.checked = bool; return this; }
    toggle() { this.el.checked = !this.el.checked; return this; }
    getValue() { return this.el.checked; }
    setValue(val) { this.el.checked = !!val; return this; }

    onChange(fn, opts) {
      return this._on('change', (e, comp) => fn(comp.isChecked(), e, comp), opts);
    }
  }

  class DpToggle extends DpCheckbox {}

  // ============================================================
  // DpRadio
  // ============================================================

  class DpRadio extends DpInput {
    isSelected() { return this.el.checked; }
    select() { this.el.checked = true; return this; }

    getGroup() {
      if (!this.el.name) return [this];
      return Array.from(document.querySelectorAll(`input[name="${this.el.name}"].dp-radio`))
        .map(el => _wrap(el));
    }

    getGroupValue() {
      const checked = this.getGroup().find(r => r.el.checked);
      return checked ? checked.el.value : null;
    }

    setGroupValue(val) {
      this.getGroup().forEach(r => { r.el.checked = r.el.value === val; });
      return this;
    }

    onChange(fn, opts) {
      return this._on('change', (e, comp) => fn(comp.el.value, e, comp), opts);
    }
  }

  // ============================================================
  // DpRange
  // ============================================================

  class DpRange extends DpInput {
    getValue() { return parseFloat(this.el.value); }
    setValue(n) { this.el.value = n; return this; }
    getMin() { return parseFloat(this.el.min) || 0; }
    setMin(n) { this.el.min = n; return this; }
    getMax() { return parseFloat(this.el.max) || 100; }
    setMax(n) { this.el.max = n; return this; }
    getStep() { return parseFloat(this.el.step) || 1; }
    setStep(n) { this.el.step = n; return this; }

    getPercent() {
      const min = this.getMin(), max = this.getMax();
      return ((this.getValue() - min) / (max - min)) * 100;
    }

    onSlide(fn) {
      return this._on('input', (e, comp) => fn(comp.getValue(), comp.getPercent(), e));
    }
  }

  // ============================================================
  // DpFileInput
  // ============================================================

  class DpFileInput extends DpInput {
    getFiles() { return this.el.files; }
    getFileNames() { return Array.from(this.el.files).map(f => f.name); }
    getFileCount() { return this.el.files.length; }
    clear() { this.el.value = ''; return this; }
    getAccept() { return this.el.accept; }
    setAccept(str) { this.el.accept = str; return this; }
    isMultiple() { return this.el.multiple; }
    setMultiple(bool) { this.el.multiple = bool; return this; }

    onChange(fn, opts) {
      return this._on('change', (e, comp) => fn(comp.getFiles(), e, comp), opts);
    }
  }

  // ============================================================
  // DpContainer — Base for components with children
  // ============================================================

  class DpContainer extends DpComponent {
    getChildren() {
      return Array.from(this.el.children)
        .filter(c => Array.from(c.classList).some(cls => cls.startsWith('dp-')))
        .map(c => _wrap(c));
    }

    getContent() { return this.el.innerHTML; }
    setContent(html) { this.el.innerHTML = html; return this; }

    append(child) {
      if (typeof child === 'string') {
        this.el.insertAdjacentHTML('beforeend', child);
      } else if (child instanceof DpComponent) {
        this.el.appendChild(child.el);
      } else {
        this.el.appendChild(child);
      }
      return this;
    }

    prepend(child) {
      if (typeof child === 'string') {
        this.el.insertAdjacentHTML('afterbegin', child);
      } else if (child instanceof DpComponent) {
        this.el.prepend(child.el);
      } else {
        this.el.prepend(child);
      }
      return this;
    }

    clear() { this.el.innerHTML = ''; return this; }
    getChildCount() { return this.el.children.length; }
  }

  // ============================================================
  // DpToggleable — open/close behavior
  // ============================================================

  class DpToggleable extends DpContainer {
    open() { this._setOpen(true); return this; }
    close() { this._setOpen(false); return this; }
    toggle() { this._setOpen(!this.isOpen()); return this; }
    isOpen() { return false; } // overridden

    _setOpen(state) {} // overridden

    onOpen(fn) { return this.on('dp:open', fn); }
    onClose(fn) { return this.on('dp:close', fn); }
    onToggle(fn) { return this.on('dp:toggle', fn); }

    _fireToggle(isOpen) {
      this.emit(isOpen ? 'dp:open' : 'dp:close');
      this.emit('dp:toggle', isOpen);
    }
  }

  // ============================================================
  // DpCard
  // ============================================================

  class DpCard extends DpContainer {
    get body() { return this._sub('card-body'); }
    get title() { return this._sub('card-title'); }
    get actions() { return this._sub('card-actions'); }

    getTitle() { return this.title?.el.textContent.trim() || ''; }
    setTitle(str) { if (this.title) this.title.el.textContent = str; return this; }
  }

  // ============================================================
  // DpAlert
  // ============================================================

  class DpAlert extends DpContainer {
    getMessage() { return this.el.textContent.trim(); }
    setMessage(str) {
      const span = this.el.querySelector('span');
      if (span) span.textContent = str;
      else this.el.textContent = str;
      return this;
    }

    getColor() {
      for (const cls of this.el.classList) {
        const m = cls.match(/^alert-(\w+)$/);
        if (m && !['vertical', 'horizontal', 'outline', 'dash', 'soft'].includes(m[1])) return m[1];
      }
      return null;
    }

    setColor(color) {
      const old = this.getColor();
      if (old) this.el.classList.remove(`alert-${old}`);
      this.el.classList.add(`alert-${color}`);
      return this;
    }

    dismiss() {
      this.el.style.transition = 'opacity 0.3s';
      this.el.style.opacity = '0';
      setTimeout(() => this.remove(), 300);
      this.emit('dp:dismiss');
      return this;
    }

    onDismiss(fn) { return this.on('dp:dismiss', fn); }
  }

  // ============================================================
  // DpCollapse
  // ============================================================

  class DpCollapse extends DpToggleable {
    get title() { return this._sub('collapse-title'); }
    get content() { return this._sub('collapse-content'); }

    isOpen() {
      const cb = this.el.querySelector('input[type="checkbox"], input[type="radio"]');
      if (cb) return cb.checked;
      return this.el.classList.contains('collapse-open');
    }

    _setOpen(state) {
      const cb = this.el.querySelector('input[type="checkbox"], input[type="radio"]');
      if (cb) cb.checked = state;
      else {
        this.el.classList.toggle('collapse-open', state);
        this.el.classList.toggle('collapse-close', !state);
      }
      this._fireToggle(state);
    }
  }

  // ============================================================
  // DpModal
  // ============================================================

  class DpModal extends DpToggleable {
    get box() { return this._sub('modal-box'); }
    get actions() { return this._sub('modal-action'); }

    isOpen() { return this.el.open; }

    open() {
      this.el.showModal();
      this._fireToggle(true);
      return this;
    }

    close() {
      this.el.close();
      this._fireToggle(false);
      return this;
    }

    _setOpen(state) { state ? this.open() : this.close(); }
  }

  // ============================================================
  // DpDropdown
  // ============================================================

  class DpDropdown extends DpToggleable {
    get trigger() {
      const s = this.el.querySelector('summary');
      return s ? _wrap(s) : null;
    }
    get content() { return this._sub('dropdown-content'); }

    isOpen() { return this.el.open; }
    _setOpen(state) {
      this.el.open = state;
      this._fireToggle(state);
    }
  }

  // ============================================================
  // DpDrawer
  // ============================================================

  class DpDrawer extends DpToggleable {
    get content() { return this._sub('drawer-content'); }
    get side() { return this._sub('drawer-side'); }

    _getToggle() { return this.el.querySelector('.drawer-toggle'); }

    isOpen() { return this._getToggle()?.checked || false; }
    _setOpen(state) {
      const cb = this._getToggle();
      if (cb) cb.checked = state;
      this._fireToggle(state);
    }
  }

  // ============================================================
  // DpSwap
  // ============================================================

  class DpSwap extends DpToggleable {
    get on() { return this._sub('swap-on'); }
    get off() { return this._sub('swap-off'); }

    isOpen() {
      const cb = this.el.querySelector('input[type="checkbox"]');
      return cb?.checked || false;
    }

    _setOpen(state) {
      const cb = this.el.querySelector('input[type="checkbox"]');
      if (cb) cb.checked = state;
      this._fireToggle(state);
    }
  }

  // ============================================================
  // DpTabs
  // ============================================================

  class DpTabs extends DpContainer {
    _getTabs() { return Array.from(this.el.querySelectorAll('.dp-tab, .tab[role="tab"]')); }

    getActive() {
      return this._getTabs().findIndex(t => t.checked);
    }

    setActive(n) {
      const tabs = this._getTabs();
      if (tabs[n]) { tabs[n].checked = true; this.emit('dp:tabchange', { index: n, label: tabs[n].getAttribute('aria-label') }); }
      return this;
    }

    getActiveLabel() {
      const tabs = this._getTabs();
      const active = tabs.find(t => t.checked);
      return active?.getAttribute('aria-label') || '';
    }

    getTabCount() { return this._getTabs().length; }

    getTabLabels() {
      return this._getTabs().map(t => t.getAttribute('aria-label') || '');
    }

    onTabChange(fn) { return this.on('dp:tabchange', fn); }
  }

  // ============================================================
  // DpTooltip
  // ============================================================

  class DpTooltip extends DpContainer {
    getTip() { return this.el.dataset.tip || ''; }
    setTip(str) { this.el.dataset.tip = str; return this; }
  }

  // ============================================================
  // DpTable
  // ============================================================

  class DpTable extends DpComponent {
    _thead() { return this.el.querySelector('thead'); }
    _tbody() { return this.el.querySelector('tbody'); }
    _rows() { return Array.from((this._tbody() || this.el).querySelectorAll('tr')); }

    getHeaders() {
      const thead = this._thead();
      if (!thead) return [];
      return Array.from(thead.querySelectorAll('th')).map(th => th.textContent.trim());
    }

    setHeaders(arr) {
      let thead = this._thead();
      if (!thead) { thead = document.createElement('thead'); this.el.prepend(thead); }
      thead.innerHTML = '<tr>' + arr.map(h => `<th>${h}</th>`).join('') + '</tr>';
      return this;
    }

    getColCount() { return this.getHeaders().length || (this._rows()[0]?.children.length || 0); }
    getRowCount() { return this._rows().length; }

    getData() {
      const auto = this._isAutoWidth();
      return this._rows().map(tr => {
        const tds = Array.from(tr.querySelectorAll('td'));
        const cells = auto ? tds.slice(0, -1) : tds;
        return cells.map(td => td.textContent.trim());
      });
    }

    _isAutoWidth() {
      const th = this.el.querySelector('th');
      return th?.style?.width === '1%' || th?.style?.whiteSpace === 'nowrap';
    }

    _cellHtml(cell, isLast) {
      if (isLast && this._isAutoWidth()) return '<td></td>';
      const style = this._isAutoWidth() ? ' style="width:1%;white-space:nowrap"' : '';
      return `<td${style}>${cell}</td>`;
    }

    _rowHtml(row) {
      const auto = this._isAutoWidth();
      let html = '<tr>' + row.map(cell => {
        const style = auto ? ' style="width:1%;white-space:nowrap"' : '';
        return `<td${style}>${cell}</td>`;
      }).join('');
      if (auto) html += '<td></td>';
      html += '</tr>';
      return html;
    }

    setData(rows) {
      let tbody = this._tbody();
      if (!tbody) { tbody = document.createElement('tbody'); this.el.appendChild(tbody); }
      tbody.innerHTML = rows.map(row => this._rowHtml(row)).join('');
      this.emit('dp:datachange', this.getData());
      return this;
    }

    getRow(n) {
      const row = this._rows()[n];
      if (!row) return null;
      const tds = Array.from(row.querySelectorAll('td'));
      // Exclude spacer column if autoWidth
      const cells = this._isAutoWidth() ? tds.slice(0, -1) : tds;
      return cells.map(td => td.textContent.trim());
    }

    addRow(data, idx) {
      const tr = document.createElement('tr');
      tr.innerHTML = this._rowHtml(data).replace(/^<tr>|<\/tr>$/g, '');
      let tbody = this._tbody();
      if (!tbody) { tbody = document.createElement('tbody'); this.el.appendChild(tbody); }
      if (idx !== undefined && tbody.children[idx]) {
        tbody.children[idx].before(tr);
      } else {
        tbody.appendChild(tr);
      }
      this._bindRowEvents(tr);
      this.emit('dp:datachange', this.getData());
      return this;
    }

    removeRow(n) {
      const rows = this._rows();
      if (rows[n]) rows[n].remove();
      this.emit('dp:datachange', this.getData());
      return this;
    }

    updateRow(n, data) {
      const rows = this._rows();
      if (rows[n]) rows[n].innerHTML = data.map(cell => `<td>${cell}</td>`).join('');
      this.emit('dp:datachange', this.getData());
      return this;
    }

    getCell(row, col) {
      const r = this._rows()[row];
      return r?.children[col]?.textContent.trim() || null;
    }

    setCell(row, col, val) {
      const r = this._rows()[row];
      if (r?.children[col]) r.children[col].textContent = val;
      return this;
    }

    selectRow(n) {
      this._rows().forEach((tr, i) => {
        tr.classList.toggle('bg-primary/10', i === n);
        tr.classList.toggle('dp-selected', i === n);
      });
      this._selectedIndex = n;
      this.emit('dp:rowselect', { data: this.getRow(n), index: n });
      return this;
    }

    deselectRow() {
      this._rows().forEach(tr => {
        tr.classList.remove('bg-primary/10', 'dp-selected');
      });
      this._selectedIndex = -1;
      return this;
    }

    getSelectedRow() {
      return this._selectedIndex >= 0 ? this.getRow(this._selectedIndex) : null;
    }

    getSelectedIndex() { return this._selectedIndex ?? -1; }

    sort(col, dir = 'asc') {
      const data = this.getData();
      data.sort((a, b) => {
        const va = a[col], vb = b[col];
        const cmp = isNaN(va) ? va.localeCompare(vb) : parseFloat(va) - parseFloat(vb);
        return dir === 'desc' ? -cmp : cmp;
      });
      this.setData(data);
      this.emit('dp:sort', { col, dir });
      return this;
    }

    filter(fn) {
      if (!this._origData) this._origData = this.getData();
      this.setData(this._origData.filter(fn));
      return this;
    }

    clearFilter() {
      if (this._origData) { this.setData(this._origData); this._origData = null; }
      return this;
    }

    search(query) {
      const q = query.toLowerCase();
      return this.filter(row => row.some(cell => cell.toLowerCase().includes(q)));
    }

    clearSearch() { return this.clearFilter(); }

    toCSV() {
      const headers = this.getHeaders();
      const rows = this.getData();
      const lines = [];
      if (headers.length) lines.push(headers.join(','));
      rows.forEach(r => lines.push(r.join(',')));
      return lines.join('\n');
    }

    toJSON() {
      const headers = this.getHeaders();
      return this.getData().map(row => {
        const obj = {};
        row.forEach((cell, i) => { obj[headers[i] || `col${i}`] = cell; });
        return obj;
      });
    }

    _bindRowEvents(tr) {
      // Row events bound during discovery
    }

    onRowClick(fn) { return this.on('dp:rowclick', fn); }
    onRowDblClick(fn) { return this.on('dp:rowdblclick', fn); }
    onRowSelect(fn) { return this.on('dp:rowselect', fn); }
    onCellClick(fn) { return this.on('dp:cellclick', fn); }
    onSort(fn) { return this.on('dp:sort', fn); }
    onDataChange(fn) { return this.on('dp:datachange', fn); }

    _initTableEvents() {
      this._selectedIndex = -1;
      (this._tbody() || this.el).addEventListener('click', (e) => {
        const td = e.target.closest('td');
        const tr = e.target.closest('tr');
        if (!tr) return;
        const rowIdx = this._rows().indexOf(tr);
        const rowData = this.getRow(rowIdx);
        if (td) {
          const colIdx = Array.from(tr.children).indexOf(td);
          this.emit('dp:cellclick', { value: td.textContent.trim(), rowIdx, colIdx });
        }
        this.emit('dp:rowclick', { data: rowData, index: rowIdx });
      });

      (this._tbody() || this.el).addEventListener('dblclick', (e) => {
        const tr = e.target.closest('tr');
        if (!tr) return;
        const rowIdx = this._rows().indexOf(tr);
        this.emit('dp:rowdblclick', { data: this.getRow(rowIdx), index: rowIdx });
      });
    }
  }

  // ============================================================
  // DpList
  // ============================================================

  class DpList extends DpComponent {
    getItems() {
      return Array.from(this.el.querySelectorAll('.dp-list-row, li')).map(el => _wrap(el));
    }
    getItemCount() { return this.getItems().length; }
    addItem(html) { this.el.insertAdjacentHTML('beforeend', `<li class="dp-list-row list-row">${html}</li>`); return this; }
    removeItem(n) { const items = this.el.querySelectorAll('.dp-list-row, li'); if (items[n]) items[n].remove(); return this; }
    getItem(n) { const items = this.getItems(); return items[n] || null; }
    clear() { this.el.innerHTML = ''; return this; }
    onItemClick(fn) {
      this.el.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        const idx = Array.from(this.el.children).indexOf(li);
        fn(_wrap(li), idx, e);
      });
      return this;
    }
  }

  // ============================================================
  // DpMenu
  // ============================================================

  class DpMenu extends DpComponent {
    getItems() {
      return Array.from(this.el.querySelectorAll('li:not(.dp-menu-title)')).map(el => _wrap(el));
    }
    getActive() {
      const a = this.el.querySelector('.menu-active');
      return a ? _wrap(a) : null;
    }
    getActiveIndex() {
      const items = this.getItems();
      return items.findIndex(item => item.hasClass('menu-active'));
    }
    setActive(n) {
      this.getItems().forEach((item, i) => {
        item.el.classList.toggle('menu-active', i === n);
      });
      return this;
    }
    onSelect(fn) {
      this.el.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li || li.classList.contains('dp-menu-title')) return;
        const idx = this.getItems().findIndex(item => item.el === li);
        fn(_wrap(li), idx, e);
      });
      return this;
    }
  }

  // ============================================================
  // DpSteps
  // ============================================================

  class DpSteps extends DpComponent {
    _steps() { return Array.from(this.el.querySelectorAll('.dp-step')); }

    getActive() {
      const steps = this._steps();
      for (let i = steps.length - 1; i >= 0; i--) {
        if (Array.from(steps[i].classList).some(c => c.startsWith('step-') && c !== 'step')) return i;
      }
      return -1;
    }

    setActive(n, color = 'primary') {
      this._steps().forEach((step, i) => {
        // Remove existing step-* color classes
        Array.from(step.classList).filter(c => c.startsWith('step-')).forEach(c => step.classList.remove(c));
        if (i <= n) step.classList.add(`step-${color}`);
      });
      this.emit('dp:stepchange', n);
      return this;
    }

    getStepCount() { return this._steps().length; }
    next() { return this.setActive(Math.min(this.getActive() + 1, this.getStepCount() - 1)); }
    prev() { return this.setActive(Math.max(this.getActive() - 1, 0)); }
    reset() { return this.setActive(-1); }
    onStepChange(fn) { return this.on('dp:stepchange', fn); }
  }

  // ============================================================
  // DpCarousel
  // ============================================================

  class DpCarousel extends DpComponent {
    _items() { return Array.from(this.el.querySelectorAll('.dp-carousel-item')); }
    getSlideCount() { return this._items().length; }
    getActive() { return this._activeIdx || 0; }
    setActive(n) {
      const items = this._items();
      if (items[n]) { items[n].scrollIntoView({ behavior: 'smooth', inline: 'center' }); this._activeIdx = n; this.emit('dp:slidechange', n); }
      return this;
    }
    next() { return this.setActive(Math.min(this.getActive() + 1, this.getSlideCount() - 1)); }
    prev() { return this.setActive(Math.max(this.getActive() - 1, 0)); }
    onSlideChange(fn) { return this.on('dp:slidechange', fn); }
  }

  // ============================================================
  // DpRating
  // ============================================================

  class DpRating extends DpComponent {
    _inputs() { return Array.from(this.el.querySelectorAll('input[type="radio"]')); }
    getValue() {
      const checked = this._inputs().findIndex(i => i.checked);
      return checked >= 0 ? checked + 1 : 0;
    }
    setValue(n) {
      const inputs = this._inputs();
      if (inputs[n - 1]) inputs[n - 1].checked = true;
      return this;
    }
    getMax() { return this._inputs().length; }
    onChange(fn) {
      this.el.addEventListener('change', () => fn(this.getValue(), this));
      return this;
    }
  }

  // ============================================================
  // DpChat
  // ============================================================

  class DpChat extends DpContainer {
    getMessages() {
      return Array.from(this.el.querySelectorAll('.dp-chat')).map(el => ({
        from: el.querySelector('.dp-chat-header')?.textContent.trim() || '',
        text: el.querySelector('.dp-chat-bubble')?.textContent.trim() || '',
        position: el.classList.contains('chat-start') ? 'start' : 'end',
      }));
    }
  }

  // ============================================================
  // DpCountdown
  // ============================================================

  class DpCountdown extends DpComponent {
    getValue() {
      const span = this.el.querySelector('span[style]');
      const m = span?.style.cssText.match(/--value:\s*(\d+)/);
      return m ? parseInt(m[1]) : 0;
    }
    setValue(n) {
      const span = this.el.querySelector('span[style]');
      if (span) span.style.setProperty('--value', n);
      return this;
    }
    start(from, interval = 1000) {
      this.setValue(from);
      this._timer = setInterval(() => {
        const v = this.getValue() - 1;
        this.setValue(v);
        this.emit('dp:tick', v);
        if (v <= 0) { this.stop(); this.emit('dp:complete'); }
      }, interval);
      return this;
    }
    stop() { clearInterval(this._timer); return this; }
    onComplete(fn) { return this.on('dp:complete', fn); }
    onTick(fn) { return this.on('dp:tick', fn); }
  }

  // ============================================================
  // DpRadialProgress
  // ============================================================

  class DpRadialProgress extends DpComponent {
    getValue() {
      const m = this.el.style.cssText.match(/--value:\s*(\d+)/);
      return m ? parseInt(m[1]) : 0;
    }
    setValue(n) {
      this.el.style.setProperty('--value', n);
      this.el.textContent = n + '%';
      return this;
    }
    animate(to, duration = 500) {
      const from = this.getValue();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        this.setValue(Math.round(from + (to - from) * p));
        if (p < 1) requestAnimationFrame(tick);
        else this.emit('dp:change', to);
      };
      requestAnimationFrame(tick);
      return this;
    }
    onChange(fn) { return this.on('dp:change', fn); }
  }

  // ============================================================
  // DpThemeController
  // ============================================================

  class DpThemeController extends DpComponent {
    getTheme() { return this.el.value; }
    setTheme(str) { this.el.value = str; this.el.checked = true; return this; }
    getThemes() {
      if (!this.el.name) return [this.el.value];
      return Array.from(document.querySelectorAll(`input[name="${this.el.name}"]`))
        .map(el => el.value);
    }
    onThemeChange(fn) {
      return this._on('change', (e, comp) => fn(comp.getTheme(), comp));
    }
  }

  // ============================================================
  // Simple container classes (no extra methods)
  // ============================================================

  class DpHero extends DpContainer {
    get content() { return this._sub('hero-content'); }
    get overlay() { return this._sub('hero-overlay'); }
  }

  class DpToast extends DpContainer {}
  class DpStack extends DpContainer {}
  class DpJoin extends DpContainer {}
  class DpIndicator extends DpContainer {}
  class DpDiff extends DpContainer {}
  class DpFieldset extends DpContainer {}
  class DpDock extends DpComponent {
    _items() { return Array.from(this.el.querySelectorAll('button')); }

    getItems() { return this._items().map(el => _wrap(el)); }
    getItemCount() { return this._items().length; }

    getActive() {
      const idx = this._items().findIndex(b => b.classList.contains('dock-active'));
      return idx >= 0 ? idx : -1;
    }

    getActivePanel() {
      const active = this._items().find(b => b.classList.contains('dock-active'));
      return active?.dataset.panel || null;
    }

    setActive(n) {
      this._items().forEach((b, i) => b.classList.toggle('dock-active', i === n));
      const panel = this._items()[n]?.dataset.panel;
      this.emit('dp:dock-change', { index: n, panel });
      return this;
    }

    setActiveByPanel(name) {
      const idx = this._items().findIndex(b => b.dataset.panel === name);
      if (idx >= 0) this.setActive(idx);
      return this;
    }

    getLabel(n) {
      return this._items()[n]?.querySelector('.dock-label')?.textContent.trim() || '';
    }

    getLabels() {
      return this._items().map(b => b.querySelector('.dock-label')?.textContent.trim() || '');
    }

    onSelect(fn) {
      this.el.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const idx = this._items().indexOf(btn);
        this.setActive(idx);
        fn({ index: idx, panel: btn.dataset.panel, label: this.getLabel(idx) }, e, this);
      });
      return this;
    }

    onChange(fn) { return this.on('dp:dock-change', fn); }
  }

  // ============================================================
  // DpVsplit / DpHsplit / DpPanel — Layout system
  // ============================================================

  class DpVsplit extends DpContainer {
    getPanels() { return Array.from(this.el.querySelectorAll(':scope > .dp-panel')).map(el => _wrap(el)); }
    getPanel(name) {
      const el = this.el.querySelector(`:scope > .dp-panel-${name}`);
      return el ? _wrap(el) : null;
    }
  }

  class DpHsplit extends DpVsplit {} // same API

  class DpPanel extends DpContainer {
    get header() {
      const el = this.el.querySelector(':scope > .dp-panel-header');
      return el ? _wrap(el) : null;
    }

    get body() {
      const el = this.el.querySelector(':scope > .dp-panel-body');
      return el ? _wrap(el) : null;
    }

    getName() {
      for (const cls of this.el.classList) {
        const m = cls.match(/^dp-panel-(\w+)$/);
        if (m && m[1] !== 'header' && m[1] !== 'body') return m[1];
      }
      return 'center';
    }

    getTitle() {
      const h = this.el.querySelector(':scope > .dp-panel-header span');
      return h?.textContent.trim() || '';
    }

    setTitle(str) {
      const h = this.el.querySelector(':scope > .dp-panel-header span');
      if (h) h.textContent = str;
      else {
        // Create header if missing
        const header = document.createElement('div');
        header.className = 'dp-panel-header bg-base-200 border-b border-base-300 px-3 py-2 flex items-center gap-2 flex-shrink-0';
        header.innerHTML = `<span class="font-semibold text-sm">${str}</span>`;
        this.el.prepend(header);
      }
      return this;
    }

    open() { this.el.style.display = ''; return this; }
    close() { this.el.style.display = 'none'; return this; }

    clear(which) {
      if (which === 'header') {
        const h = this.el.querySelector(':scope > .dp-panel-header');
        if (h) h.remove();
      } else {
        const body = this.el.querySelector(':scope > .dp-panel-body');
        if (body) body.innerHTML = '';
      }
      return this;
    }

    async refresh(url) {
      const body = this.el.querySelector(':scope > .dp-panel-body');
      if (!body) return this;
      const result = await _fetch('GET', url);
      body.innerHTML = typeof result.data === 'string' ? result.data : '';
      this.emit('dp:refresh');
      return this;
    }
  }

  class DpBreadcrumbs extends DpComponent {}
  class DpTimeline extends DpComponent {}
  class DpMockup extends DpContainer {}
  class DpButton extends DpComponent {}
  class DpBadge extends DpComponent {}
  class DpLink extends DpComponent {}
  class DpKbd extends DpComponent {}
  class DpLoading extends DpComponent {}
  class DpProgress extends DpComponent {}
  class DpStatus extends DpComponent {}
  class DpDivider extends DpComponent {}
  class DpSkeleton extends DpComponent {}

  // ============================================================
  // DpNavbar (for sub-element access)
  // ============================================================

  class DpNavbar extends DpContainer {
    get start() { return this._sub('navbar-start'); }
    get center() { return this._sub('navbar-center'); }
    get end() { return this._sub('navbar-end'); }
  }

  // ============================================================
  // Composite classes
  // ============================================================

  class DpFormField extends DpComponent {
    getInput() {
      const input = this.el.querySelector('.dp-input, .dp-select, .dp-textarea, .dp-checkbox, .dp-toggle, .dp-radio, .dp-range, .dp-file-input');
      return input ? _wrap(input) : null;
    }
    getValue() { return this.getInput()?.getValue(); }
    setValue(val) { this.getInput()?.setValue(val); return this; }
    getLabel() {
      const lbl = this.el.querySelector('.dp-formfield-label');
      return lbl?.textContent.trim() || '';
    }
    setLabel(str) {
      const lbl = this.el.querySelector('.dp-formfield-label');
      if (lbl) lbl.textContent = str;
      return this;
    }
    onChange(fn) { this.getInput()?.onChange(fn); return this; }
  }

  class DpFormCard extends DpContainer {
    getFields() {
      return Array.from(this.el.querySelectorAll('.dp-formfield-label')).map(lbl => {
        // Walk to next sibling input
        const parent = lbl.parentElement;
        return _wrap(parent) instanceof DpFormField ? _wrap(parent) : new DpFormField(parent);
      });
    }
    getData() {
      const data = {};
      this.el.querySelectorAll('.dp-input, .dp-select, .dp-textarea, .dp-checkbox, .dp-toggle').forEach(el => {
        const comp = _wrap(el);
        const name = el.name || el.getAttribute('placeholder') || '';
        data[name] = comp.getValue();
      });
      return data;
    }
    setData(obj) {
      Object.entries(obj).forEach(([key, val]) => {
        const el = this.el.querySelector(`[name="${key}"]`);
        if (el) _wrap(el).setValue(val);
      });
      return this;
    }
    reset() {
      this.el.querySelectorAll('.dp-input, .dp-select, .dp-textarea').forEach(el => {
        _wrap(el).clear();
      });
      return this;
    }
    onSubmit(fn) {
      const btn = this.el.querySelector('.dp-btn');
      if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); fn(this.getData(), this); });
      return this;
    }
  }

  class DpConversation extends DpContainer {
    getMessages() {
      return Array.from(this.el.querySelectorAll('.dp-chat')).map(el => ({
        from: el.querySelector('.dp-chat-header')?.textContent.trim() || '',
        text: el.querySelector('.dp-chat-bubble')?.textContent.trim() || '',
        position: el.classList.contains('chat-start') ? 'start' : 'end',
      }));
    }
    addMessage(opts) {
      const pos = opts.position || 'start';
      const color = opts.color ? ` chat-bubble-${opts.color}` : '';
      const html = `<div class="dp-chat chat chat-${pos}">` +
        (opts.from ? `<div class="dp-chat-header chat-header">${opts.from}</div>` : '') +
        `<div class="dp-chat-bubble chat-bubble${color}">${opts.text}</div>` +
        (opts.footer ? `<div class="dp-chat-footer chat-footer">${opts.footer}</div>` : '') +
        `</div>`;
      this.el.insertAdjacentHTML('beforeend', html);
      this.emit('dp:message', opts);
      return this;
    }
    getMessageCount() { return this.el.querySelectorAll('.dp-chat').length; }
    clear() { this.el.innerHTML = ''; return this; }
    scrollToBottom() { this.el.scrollTop = this.el.scrollHeight; return this; }
    onMessage(fn) { return this.on('dp:message', fn); }
  }

  class DpModalForm extends DpModal {
    getData() {
      const data = {};
      this.el.querySelectorAll('.dp-input, .dp-select, .dp-textarea, .dp-checkbox, .dp-toggle').forEach(el => {
        const comp = _wrap(el);
        data[el.name || el.placeholder || ''] = comp.getValue();
      });
      return data;
    }
    setData(obj) {
      Object.entries(obj).forEach(([key, val]) => {
        const el = this.el.querySelector(`[name="${key}"]`);
        if (el) _wrap(el).setValue(val);
      });
      return this;
    }
    reset() {
      this.el.querySelectorAll('.dp-input, .dp-select, .dp-textarea').forEach(el => _wrap(el).clear());
      return this;
    }
    onSubmit(fn) {
      const btn = this.el.querySelector('.dp-btn[class*="primary"], .dp-btn:last-child');
      if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); fn(this.getData(), this); });
      return this;
    }
  }

  class DpHeroCta extends DpContainer {
    getTitle() { return this.el.querySelector('h1')?.textContent.trim() || ''; }
    setTitle(str) { const h = this.el.querySelector('h1'); if (h) h.textContent = str; return this; }
    getSubtitle() { return this.el.querySelector('p')?.textContent.trim() || ''; }
    setSubtitle(str) { const p = this.el.querySelector('p'); if (p) p.textContent = str; return this; }
    onPrimaryClick(fn) {
      const btn = this.el.querySelector('.dp-btn');
      if (btn) btn.addEventListener('click', fn);
      return this;
    }
  }

  class DpPageLayout extends DpContainer {
    _drawer() { return this.el.querySelector('.dp-drawer') ? _wrap(this.el.querySelector('.dp-drawer')) : null; }
    isSidebarOpen() { return this._drawer()?.isOpen() || false; }
    toggleSidebar() { this._drawer()?.toggle(); return this; }
    openSidebar() { this._drawer()?.open(); return this; }
    closeSidebar() { this._drawer()?.close(); return this; }
    getNav() { const el = this.el.querySelector('.dp-navbar'); return el ? _wrap(el) : null; }
    getContent() { return this._sub('pagelayout-content'); }
  }

  class DpDataTable extends DpTable {
    constructor(el) {
      // If el is the wrapper div, use the inner table for DpTable methods
      const tableEl = el.tagName === 'TABLE' ? el : el.querySelector('table') || el;
      super(tableEl);
      // Keep reference to wrapper for pagination container
      this._wrapper = el.tagName === 'TABLE' ? el.parentElement : el;
    }

    _pageSize = 10;
    _currentPage = 1;
    _totalRows = 0;
    _serverMode = false;
    _paginationOpts = {};

    // --- Configure pagination ---

    /**
     * Set up pagination. Two modes:
     *
     * Client-side (default): all data loaded, paginated in browser
     *   table.paginate({ pageSize: 20 })
     *
     * Server-side: each page fetched from API
     *   table.paginate({
     *     url: '/api/users',
     *     pageSize: 20,
     *     pageParam: 'page',       // default: 'page'
     *     sizeParam: 'limit',      // default: 'limit'
     *     parse: (data) => ({      // adapt any API response format
     *       rows: data.rows,       // array of row arrays or objects
     *       total: data.total,     // total row count (not page count)
     *     }),
     *     headers: false,          // set false to skip auto-headers from objects
     *   })
     */
    paginate(opts = {}) {
      this._pageSize = opts.pageSize || 10;
      this._paginationOpts = opts;

      if (opts.url) {
        this._serverMode = true;
        this._paginationOpts.pageParam = opts.pageParam || 'page';
        this._paginationOpts.sizeParam = opts.sizeParam || 'limit';
        this._paginationOpts.parse = opts.parse || DpDataTable.parsers.default;
      }

      return this;
    }

    // --- Built-in response parsers ---
    static parsers = {
      // { rows: [], total: 500 }
      default: (data) => ({
        rows: data.rows || data.data || data.items || data.results || [],
        total: data.total || data.totalCount || data.count || 0,
      }),
      // { data: [], meta: { total, page, pages } }
      meta: (data) => ({
        rows: data.data || [],
        total: data.meta?.total || data.meta?.totalCount || 0,
      }),
      // { content: [], totalElements, totalPages }
      spring: (data) => ({
        rows: data.content || [],
        total: data.totalElements || 0,
      }),
      // Plain array — total from header or array length
      array: (data, response) => ({
        rows: Array.isArray(data) ? data : [],
        total: parseInt(response?.headers?.get('x-total-count') || response?.headers?.get('x-total') || '0') || data.length,
      }),
    };

    // --- Load page from server ---
    async loadPage(page) {
      if (!this._serverMode || !this._paginationOpts.url) {
        // Client-side: just re-render
        this._currentPage = page;
        this._renderPage();
        return this;
      }

      const opts = this._paginationOpts;
      const sep = opts.url.includes('?') ? '&' : '?';
      const url = `${opts.url}${sep}${opts.pageParam}=${page}&${opts.sizeParam}=${this._pageSize}`;

      const result = await _fetch('GET', url, null, opts);
      const parsed = opts.parse(result.data, result.response);

      // Handle rows as objects or arrays
      let rows = parsed.rows;
      if (rows.length > 0 && !Array.isArray(rows[0])) {
        const keys = Object.keys(rows[0]);
        if (opts.headers !== false && page === 1) this.setHeaders(keys);
        rows = rows.map(row => keys.map(k => String(row[k] ?? '')));
      }

      this._totalRows = parsed.total;
      this._currentPage = page;
      this.setData(rows);
      this._updatePaginationUI();
      this.emit('dp:pagechange', { page, total: this._totalRows, pageCount: this.getPageCount() });

      return this;
    }

    // --- Navigation ---
    getPage() { return this._currentPage; }

    setPage(n) {
      n = Math.max(1, Math.min(n, this.getPageCount()));
      if (this._serverMode) return this.loadPage(n);
      this._currentPage = n;
      this._renderPage();
      return this;
    }

    getPageCount() {
      if (this._serverMode) return Math.ceil(this._totalRows / this._pageSize) || 1;
      return Math.ceil((this._allData || this.getData()).length / this._pageSize) || 1;
    }

    getPageSize() { return this._pageSize; }
    setPageSize(n) { this._pageSize = n; this._currentPage = 1; return this.setPage(1); }
    getTotalRows() { return this._serverMode ? this._totalRows : (this._allData || this.getData()).length; }

    nextPage() { return this.setPage(this._currentPage + 1); }
    prevPage() { return this.setPage(this._currentPage - 1); }
    firstPage() { return this.setPage(1); }
    lastPage() { return this.setPage(this.getPageCount()); }
    onPageChange(fn) { return this.on('dp:pagechange', fn); }

    // --- Client-side pagination ---
    _renderPage() {
      if (!this._allData) this._allData = this.getData();
      const start = (this._currentPage - 1) * this._pageSize;
      const page = this._allData.slice(start, start + this._pageSize);
      // Call parent setData to render the page slice (not our override)
      DpTable.prototype.setData.call(this, page);
      this._updatePaginationUI();
      this.emit('dp:pagechange', { page: this._currentPage, total: this._allData.length, pageCount: this.getPageCount() });
    }

    // --- Update pagination buttons ---
    _updatePaginationUI() {
      // Find the dedicated pagination container inside the wrapper
      const wrapper = this._wrapper || this.el.closest('.dp-datatable') || this.el.parentElement;
      let pagDiv = wrapper?.querySelector('.dp-datatable-pagination');

      // Create pagination container if it doesn't exist
      if (!pagDiv) {
        pagDiv = document.createElement('div');
        pagDiv.className = 'dp-datatable-pagination flex justify-center mt-4';
        wrapper?.appendChild(pagDiv);
      }

      const pageCount = this.getPageCount();
      const current = this._currentPage;
      pagDiv.innerHTML = '';

      // Build join group
      const join = document.createElement('div');
      join.className = 'dp-join join';

      for (let i = 1; i <= Math.min(pageCount, 10); i++) {
        const btn = document.createElement('button');
        btn.className = `dp-btn btn btn-sm join-item${i === current ? ' btn-primary' : ''}`;
        btn.textContent = i;
        btn.addEventListener('click', () => this.setPage(i));
        join.appendChild(btn);
      }

      if (pageCount > 10) {
        const more = document.createElement('button');
        more.className = 'dp-btn btn btn-sm join-item btn-disabled';
        more.textContent = '...';
        join.appendChild(more);
      }

      pagDiv.appendChild(join);
    }

    // --- Override setData to auto-paginate ---
    setData(rows) {
      this._allData = rows;
      this._totalRows = rows.length;
      this._currentPage = 1;
      this._renderPage();
      return this;
    }

    // --- Override loadData to support pagination ---
    async loadData(url, opts = {}) {
      if (opts.pagination || opts.parse) {
        // Server-side pagination mode
        this.paginate({ url, ...opts });
        return this.loadPage(1);
      }

      // Non-paginated: load all data
      const result = await _fetch('GET', url, null, opts);
      const data = result.data;
      if (Array.isArray(data)) {
        if (data.length > 0 && !Array.isArray(data[0])) {
          const headers = Object.keys(data[0]);
          if (opts.headers !== false) this.setHeaders(headers);
          this._allData = data.map(row => headers.map(h => String(row[h] ?? '')));
        } else {
          this._allData = data;
        }
        this._currentPage = 1;
        this._renderPage();
      }
      this.emit('dp:load', data);
      return this;
    }
  }

  class DpNavComposite extends DpContainer {
    getBrand() {
      const btn = this.el.querySelector('.dp-navbar-start .dp-btn');
      return btn?.textContent.trim() || '';
    }
    setBrand(str) {
      const btn = this.el.querySelector('.dp-navbar-start .dp-btn');
      if (btn) btn.textContent = str;
      return this;
    }
    onNavigate(fn) {
      this.el.querySelectorAll('.dp-menu-item, .dp-navbar-center a').forEach((el, i) => {
        el.addEventListener('click', (e) => fn(el.textContent.trim(), i, e));
      });
      return this;
    }
  }

  // ============================================================
  // Component Registry — maps dp- class to API class
  // ============================================================

  const REGISTRY = {
    'btn': DpButton, 'badge': DpBadge, 'link': DpLink, 'kbd': DpKbd,
    'loading': DpLoading, 'progress': DpProgress, 'status': DpStatus,
    'divider': DpDivider, 'skeleton': DpSkeleton,
    'input': DpInput, 'select': DpSelect, 'textarea': DpTextarea,
    'checkbox': DpCheckbox, 'toggle': DpToggle, 'radio': DpRadio,
    'range': DpRange, 'file-input': DpFileInput,
    'card': DpCard, 'alert': DpAlert, 'hero': DpHero,
    'toast': DpToast, 'stack': DpStack, 'join': DpJoin,
    'indicator': DpIndicator, 'diff': DpDiff, 'fieldset': DpFieldset,
    'collapse': DpCollapse, 'modal': DpModal, 'dropdown': DpDropdown,
    'drawer': DpDrawer, 'swap': DpSwap, 'tabs': DpTabs,
    'tooltip': DpTooltip, 'navbar': DpNavbar, 'dock': DpDock,
    'vsplit': DpVsplit, 'hsplit': DpHsplit, 'panel': DpPanel,
    'table': DpTable, 'list': DpList, 'menu': DpMenu,
    'steps': DpSteps, 'timeline': DpTimeline, 'breadcrumbs': DpBreadcrumbs,
    'carousel': DpCarousel, 'rating': DpRating, 'chat': DpChat,
    'countdown': DpCountdown, 'radial-progress': DpRadialProgress,
    'theme-controller': DpThemeController,
    'mockup-browser': DpMockup, 'mockup-code': DpMockup,
    'mockup-window': DpMockup, 'mockup-phone': DpMockup,
    // Composites
    'formfield': DpFormField, 'formcard': DpFormCard,
    'datatable': DpDataTable, 'conversation': DpConversation,
    'modalform': DpModalForm, 'herocta': DpHeroCta,
    'pagelayout': DpPageLayout, 'nav': DpNavComposite,
  };

  // ============================================================
  // Factory: _wrap(el) → appropriate component instance
  // ============================================================

  const _cache = new WeakMap();

  function _wrap(el) {
    if (!el) return null;
    if (_cache.has(el)) return _cache.get(el);

    let Cls = DpComponent;
    for (const cls of el.classList) {
      if (cls.startsWith('dp-')) {
        const name = cls.slice(3);
        if (REGISTRY[name]) { Cls = REGISTRY[name]; break; }
      }
    }

    const comp = new Cls(el);

    // Post-init hooks
    if (comp instanceof DpTable && !(comp instanceof DpDataTable)) {
      comp._initTableEvents();
    }

    _cache.set(el, comp);
    return comp;
  }

  // ============================================================
  // dp() — main factory function
  // ============================================================

  function dp(selector) {
    if (selector instanceof Element) return _wrap(selector);
    if (typeof selector === 'string') {
      const el = document.querySelector(selector);
      return el ? _wrap(el) : null;
    }
    return null;
  }

  dp.findAll = function(selector) {
    return Array.from(document.querySelectorAll(selector)).map(el => _wrap(el));
  };

  dp.create = function(type, opts) {
    // Future: render component and return wrapped instance
    console.warn('dp.create() not yet implemented — render via DaisyPug engine instead');
    return null;
  };

  // Ready system
  const _readyCallbacks = [];
  let _isReady = false;

  dp.on = function(event, fn) {
    if (event === 'ready') {
      if (_isReady) fn();
      else _readyCallbacks.push(fn);
    }
  };

  dp.registry = _cache;
  dp.version = '1.4.0';

  // Expose classes for instanceof checks
  dp.DpComponent = DpComponent;
  dp.DpInput = DpInput;
  dp.DpSelect = DpSelect;
  dp.DpTextarea = DpTextarea;
  dp.DpCheckbox = DpCheckbox;
  dp.DpToggle = DpToggle;
  dp.DpRadio = DpRadio;
  dp.DpRange = DpRange;
  dp.DpFileInput = DpFileInput;
  dp.DpContainer = DpContainer;
  dp.DpToggleable = DpToggleable;
  dp.DpCard = DpCard;
  dp.DpAlert = DpAlert;
  dp.DpModal = DpModal;
  dp.DpDrawer = DpDrawer;
  dp.DpTabs = DpTabs;
  dp.DpTable = DpTable;
  dp.DpList = DpList;
  dp.DpMenu = DpMenu;
  dp.DpSteps = DpSteps;
  dp.REGISTRY = REGISTRY;

  // ============================================================
  // DpForm — form abstraction with typed get/set and API loading
  // ============================================================

  class DpForm {
    constructor(container) {
      this.el = typeof container === 'string' ? document.querySelector(container) : container;
      if (this.el instanceof DpComponent) this.el = this.el.el;
      this.get = new DpFormGetter(this);
      this.set = new DpFormSetter(this);
    }

    // Find input by name, id, or placeholder
    _find(name, type) {
      const selectors = [
        `[name="${name}"]`,
        `#${name}`,
        `[placeholder="${name}"]`,
      ];
      for (const sel of selectors) {
        try {
          const el = this.el.querySelector(sel);
          if (el) return _wrap(el);
        } catch(e) {}
      }
      return null;
    }

    _findByType(name, dpClass) {
      const comp = this._find(name);
      if (comp && comp.el.classList.contains(`dp-${dpClass}`)) return comp;
      // Fallback: search by dp class + name
      const el = this.el.querySelector(`.dp-${dpClass}[name="${name}"]`) ||
                 this.el.querySelector(`.dp-${dpClass}#${name}`);
      return el ? _wrap(el) : null;
    }

    // Get a specific field component
    field(name) { return this._find(name); }

    // Get all field components
    fields() {
      return Array.from(this.el.querySelectorAll(
        '.dp-input, .dp-select, .dp-textarea, .dp-checkbox, .dp-toggle, .dp-radio, .dp-range, .dp-file-input'
      )).map(el => _wrap(el));
    }

    // Get all field names
    fieldNames() {
      return this.fields().map(f => f.el.name || f.el.id || '').filter(Boolean);
    }

    // Bulk get all values as {name: value}
    getData() {
      const data = {};
      this.fields().forEach(f => {
        const name = f.el.name || f.el.id || '';
        if (!name) return;
        if (f instanceof DpCheckbox || f instanceof DpToggle) {
          data[name] = f.isChecked();
        } else if (f instanceof DpRadio) {
          if (f.el.checked) data[name] = f.el.value;
          else if (!(name in data)) data[name] = f.getGroupValue();
        } else if (f instanceof DpRange) {
          data[name] = f.getValue();
        } else if (f instanceof DpFileInput) {
          data[name] = f.getFiles();
        } else {
          data[name] = f.getValue();
        }
      });
      return data;
    }

    // Bulk set values from {name: value}
    setData(obj) {
      Object.entries(obj).forEach(([name, val]) => {
        const f = this._find(name);
        if (!f) return;
        if (f instanceof DpCheckbox || f instanceof DpToggle) {
          f.setChecked(!!val);
        } else if (f instanceof DpRadio) {
          f.setGroupValue(val);
        } else {
          f.setValue(val);
        }
      });
      return this;
    }

    // Clear all fields
    clear() {
      this.fields().forEach(f => {
        if (f instanceof DpCheckbox || f instanceof DpToggle) f.setChecked(false);
        else if (f instanceof DpRadio) f.el.checked = false;
        else if (f.clear) f.clear();
        else f.setValue('');
      });
      return this;
    }

    // Reset to original values (if stored)
    reset() {
      if (this._original) return this.setData(this._original);
      return this.clear();
    }

    // Store current values as "original" for reset
    snapshot() {
      this._original = this.getData();
      return this;
    }

    // Check if form has changed since snapshot
    isDirty() {
      if (!this._original) return false;
      const current = this.getData();
      return JSON.stringify(current) !== JSON.stringify(this._original);
    }

    // Load form data from API
    async load(url, opts) {
      const result = await _fetch('GET', url, null, opts);
      if (result.data && typeof result.data === 'object') {
        this.setData(result.data);
        this.snapshot();
      }
      return this;
    }

    // Save form data to API
    async save(url, method = 'POST', opts) {
      const data = this.getData();
      const result = await _fetch(method, url, data, opts);
      this.snapshot();
      return result;
    }

    // --- Enable / Disable / ReadOnly ---

    disable() {
      this.fields().forEach(f => { f.el.disabled = true; });
      return this;
    }

    enable() {
      this.fields().forEach(f => { f.el.disabled = false; });
      return this;
    }

    readOnly(bool = true) {
      this.fields().forEach(f => { f.el.readOnly = bool; });
      return this;
    }

    // --- Focus ---

    focus(name) {
      const f = this._find(name);
      if (f) f.el.focus();
      return this;
    }

    // --- Field visibility ---

    showField(name) {
      const f = this._find(name);
      if (f) {
        f.el.style.display = '';
        // Also show preceding label
        const lbl = this._findLabel(name);
        if (lbl) lbl.style.display = '';
      }
      return this;
    }

    hideField(name) {
      const f = this._find(name);
      if (f) {
        f.el.style.display = 'none';
        const lbl = this._findLabel(name);
        if (lbl) lbl.style.display = 'none';
      }
      return this;
    }

    _findLabel(name) {
      // Find label associated with a field
      const lbl = this.el.querySelector(`label[for="${name}"]`);
      if (lbl) return lbl;
      // Walk backwards from input to find preceding label
      const f = this._find(name);
      if (f && f.el.previousElementSibling?.tagName === 'LABEL') return f.el.previousElementSibling;
      return null;
    }

    // --- Dynamic fields ---

    addField(name, html) {
      if (typeof html === 'string') {
        this.el.insertAdjacentHTML('beforeend', html);
      }
      return this;
    }

    removeField(name) {
      const f = this._find(name);
      if (f) {
        const lbl = this._findLabel(name);
        if (lbl) lbl.remove();
        f.el.remove();
      }
      return this;
    }

    // --- Serialization ---

    toFormData() {
      const fd = new FormData();
      this.fields().forEach(f => {
        const name = f.el.name || f.el.id || '';
        if (!name) return;
        if (f instanceof DpFileInput) {
          Array.from(f.getFiles()).forEach(file => fd.append(name, file));
        } else if (f instanceof DpCheckbox || f instanceof DpToggle) {
          fd.append(name, f.isChecked() ? 'true' : 'false');
        } else {
          fd.append(name, f.getValue());
        }
      });
      return fd;
    }

    toQueryString() {
      const data = this.getData();
      return Object.entries(data)
        .filter(([k, v]) => v !== null && v !== undefined && !(v instanceof FileList))
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
    }

    fromQueryString(str) {
      const params = new URLSearchParams(str);
      const data = {};
      params.forEach((v, k) => { data[k] = v; });
      return this.setData(data);
    }

    serialize() {
      return JSON.stringify(this.getData());
    }

    deserialize(str) {
      return this.setData(JSON.parse(str));
    }

    // --- Watch / Computed ---

    watch(name, fn) {
      const f = this._find(name);
      if (f) {
        f._on('input', () => fn(f.getValue(), f, this));
        f._on('change', () => fn(f.getValue(), f, this));
      }
      return this;
    }

    computed(name, fn) {
      // Create a derived value that updates when dependencies change
      this._computed = this._computed || {};
      this._computed[name] = fn;
      // Re-run on any field change
      this.fields().forEach(f => {
        f._on('input', () => { this._runComputed(); });
        f._on('change', () => { this._runComputed(); });
      });
      this._runComputed();
      return this;
    }

    _runComputed() {
      if (!this._computed) return;
      const data = this.getData();
      Object.entries(this._computed).forEach(([name, fn]) => {
        const value = fn(data);
        // Update a field or element with this name if it exists
        const target = this._find(name) || this.el.querySelector(`#${name}`) || this.el.querySelector(`[data-computed="${name}"]`);
        if (target) {
          if (target instanceof Element) target.textContent = value;
          else if (target.setValue) target.setValue(value);
        }
      });
    }

    // --- Validation (enhanced) ---

    rules(ruleMap) {
      this._rules = { ...(this._rules || {}), ...ruleMap };
      return this;
    }

    validate() {
      const errors = {};
      let valid = true;

      this.fields().forEach(f => {
        const name = f.el.name || f.el.id || '';
        if (!name) return;
        const val = f.getValue();

        // Built-in: required
        if (f.el.required && !val && val !== 0 && val !== false) {
          errors[name] = 'Required';
          valid = false;
          return;
        }

        // Built-in: email
        if (f.el.type === 'email' && val && !val.includes('@')) {
          errors[name] = 'Invalid email';
          valid = false;
          return;
        }

        // Built-in: minLength
        if (f.el.minLength > 0 && typeof val === 'string' && val.length < f.el.minLength) {
          errors[name] = `Minimum ${f.el.minLength} characters`;
          valid = false;
          return;
        }

        // Built-in: maxLength
        if (f.el.maxLength > 0 && typeof val === 'string' && val.length > f.el.maxLength) {
          errors[name] = `Maximum ${f.el.maxLength} characters`;
          valid = false;
          return;
        }

        // Built-in: pattern
        if (f.el.pattern && val) {
          const re = new RegExp(`^${f.el.pattern}$`);
          if (!re.test(val)) {
            errors[name] = f.el.title || 'Invalid format';
            valid = false;
            return;
          }
        }

        // Custom rules
        if (this._rules && this._rules[name]) {
          const rule = this._rules[name];
          const result = typeof rule === 'function' ? rule(val, this.getData()) : null;
          if (typeof result === 'string') {
            errors[name] = result;
            valid = false;
          } else if (result === false) {
            errors[name] = 'Invalid';
            valid = false;
          }
        }
      });

      return { valid, errors };
    }

    // Show inline error messages on fields
    errors(errorMap) {
      if (!errorMap) {
        const { errors } = this.validate();
        errorMap = errors;
      }
      // Clear existing
      this.clearErrors();
      // Show new errors
      Object.entries(errorMap).forEach(([name, msg]) => {
        const f = this._find(name);
        if (!f) return;
        f.el.classList.add('input-error', 'select-error', 'textarea-error');
        const errEl = document.createElement('p');
        errEl.className = 'text-error text-xs mt-1 dp-field-error';
        errEl.dataset.field = name;
        errEl.textContent = msg;
        f.el.insertAdjacentElement('afterend', errEl);
      });
      return this;
    }

    clearErrors() {
      this.el.querySelectorAll('.dp-field-error').forEach(el => el.remove());
      this.fields().forEach(f => {
        f.el.classList.remove('input-error', 'select-error', 'textarea-error');
      });
      return this;
    }

    // --- Events ---

    // Event: intercept submit button click
    onSubmit(fn) {
      const btn = this.el.querySelector('.dp-btn[type="submit"], .dp-btn:last-of-type, button[type="submit"]');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const { valid, errors } = this.validate();
          fn(this.getData(), valid, errors, this);
        });
      }
      return this;
    }

    // Event: any field changes
    onChange(fn) {
      this.fields().forEach(f => {
        f._on('change', () => fn(this.getData(), f, this));
      });
      return this;
    }

    // Watch for changes and auto-save (debounced)
    autoSave(url, delay = 2000) {
      let timer;
      this.onChange(() => {
        clearTimeout(timer);
        timer = setTimeout(() => this.save(url, 'PUT'), delay);
      });
      return this;
    }
  }

  // Typed getters
  class DpFormGetter {
    constructor(form) { this._form = form; }

    text(name) { return this._form._find(name)?.getValue() || ''; }
    select(name) { return this._form._findByType(name, 'select')?.getValue() || ''; }
    textarea(name) { return this._form._findByType(name, 'textarea')?.getValue() || ''; }
    checkbox(name) {
      const f = this._form._findByType(name, 'checkbox') || this._form._findByType(name, 'toggle');
      return f?.isChecked() || false;
    }
    toggle(name) { return this.checkbox(name); }
    radio(name) {
      const f = this._form._findByType(name, 'radio');
      return f?.getGroupValue() || null;
    }
    range(name) {
      const f = this._form._findByType(name, 'range');
      return f?.getValue() || 0;
    }
    file(name) {
      const f = this._form._findByType(name, 'file-input');
      return f?.getFiles() || null;
    }

    // Get value by name (auto-detect type)
    value(name) { return this._form._find(name)?.getValue(); }
  }

  // Typed setters (all return the form for chaining)
  class DpFormSetter {
    constructor(form) { this._form = form; }

    text(name, val) { this._form._find(name)?.setValue(val); return this._form; }
    select(name, val) { this._form._findByType(name, 'select')?.setValue(val); return this._form; }
    textarea(name, val) { this._form._findByType(name, 'textarea')?.setValue(val); return this._form; }
    checkbox(name, val) {
      const f = this._form._findByType(name, 'checkbox') || this._form._findByType(name, 'toggle');
      f?.setChecked(!!val);
      return this._form;
    }
    toggle(name, val) { return this.checkbox(name, val); }
    radio(name, val) {
      this._form._findByType(name, 'radio')?.setGroupValue(val);
      return this._form;
    }
    range(name, val) { this._form._findByType(name, 'range')?.setValue(val); return this._form; }

    // Set value by name (auto-detect type)
    value(name, val) { this._form._find(name)?.setValue(val); return this._form; }
  }

  // Factory
  dp.form = function(selector) { return new DpForm(selector); };

  // Expose class
  dp.DpForm = DpForm;

  // ============================================================
  // Ajax — thin wrappers around fetch() with JSON handling
  // ============================================================

  const _defaultHeaders = { 'Content-Type': 'application/json' };
  let _baseUrl = '';

  // Configure base URL for all requests
  dp.baseUrl = function(url) { _baseUrl = url.replace(/\/$/, ''); };

  // Set default headers
  dp.headers = function(headers) { Object.assign(_defaultHeaders, headers); };

  async function _fetch(method, url, body, opts = {}) {
    const fullUrl = url.startsWith('http') ? url : _baseUrl + url;
    const config = {
      method,
      headers: { ..._defaultHeaders, ...opts.headers },
    };
    if (body !== undefined && body !== null) {
      config.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    const response = await fetch(fullUrl, config);
    const result = {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      response,
    };
    // Auto-parse JSON, fall back to text
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('json')) {
      result.data = await response.json();
    } else {
      result.data = await response.text();
    }
    if (!response.ok && !opts.noThrow) {
      const err = new Error(`${method} ${url} → ${response.status} ${response.statusText}`);
      err.response = result;
      throw err;
    }
    return result;
  }

  dp.get = function(url, opts) { return _fetch('GET', url, null, opts); };
  dp.post = function(url, body, opts) { return _fetch('POST', url, body, opts); };
  dp.put = function(url, body, opts) { return _fetch('PUT', url, body, opts); };
  dp.patch = function(url, body, opts) { return _fetch('PATCH', url, body, opts); };
  dp.delete = function(url, opts) { return _fetch('DELETE', url, null, opts); };

  // Convenience: fetch JSON data directly (returns data, not wrapper)
  dp.fetchJson = async function(url, opts) {
    const result = await _fetch('GET', url, null, opts);
    return result.data;
  };

  // Component-level ajax methods
  DpComponent.prototype.load = async function(url, opts) {
    const result = await _fetch('GET', url, null, opts);
    if (typeof result.data === 'string') {
      this.el.innerHTML = result.data;
    }
    this.emit('dp:load', result.data);
    return this;
  };

  DpComponent.prototype.submit = async function(url, data, opts) {
    const body = data || this._gatherData();
    const result = await _fetch('POST', url, body, opts);
    this.emit('dp:submit', result.data);
    return result;
  };

  DpComponent.prototype._gatherData = function() {
    // Collect form data from child inputs
    const data = {};
    this.el.querySelectorAll('.dp-input, .dp-select, .dp-textarea, .dp-checkbox, .dp-toggle, .dp-radio, .dp-range').forEach(el => {
      const comp = _wrap(el);
      const name = el.name || el.id || '';
      if (name) data[name] = comp.getValue();
    });
    return data;
  };

  // Table-specific: load rows from API
  DpTable.prototype.loadData = async function(url, opts = {}) {
    const result = await _fetch('GET', url, null, opts);
    const data = result.data;
    if (Array.isArray(data)) {
      if (data.length > 0 && !Array.isArray(data[0])) {
        // Array of objects → set headers + rows
        const headers = Object.keys(data[0]);
        if (opts.headers !== false) this.setHeaders(headers);
        this.setData(data.map(row => headers.map(h => String(row[h] ?? ''))));
      } else {
        this.setData(data);
      }
    }
    this.emit('dp:load', data);
    return this;
  };

  // FormCard: submit form data to API
  DpFormCard.prototype.submitTo = async function(url, opts) {
    const data = this.getData();
    const result = await _fetch('POST', url, data, opts);
    this.emit('dp:submit', result.data);
    return result;
  };

  // ============================================================
  // Auto-discovery
  // ============================================================

  function _discover() {
    document.querySelectorAll('[class*="dp-"]').forEach(el => _wrap(el));
    _isReady = true;
    _readyCallbacks.forEach(fn => fn());
    _readyCallbacks.length = 0;
  }

  // MutationObserver for dynamic elements
  function _observe() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (Array.from(node.classList || []).some(c => c.startsWith('dp-'))) _wrap(node);
            node.querySelectorAll?.('[class*="dp-"]').forEach(el => _wrap(el));
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { _discover(); _observe(); });
  } else {
    _discover();
    _observe();
  }

  // ============================================================
  // Export
  // ============================================================

  global.dp = dp;

})(typeof window !== 'undefined' ? window : this);
