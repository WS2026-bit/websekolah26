/* =========================================================
 * ADMIN.JS — Mesin Admin Dashboard (CMS)
 * - Guard & kerangka (sidebar, topbar, tema, logout)
 * - AdminTable: CRUD generik (tambah/lihat/edit/hapus/
 *   cari/filter/pagination/upload gambar/validasi)
 * - Admin.settingsForm & Admin.listEditor untuk pengaturan
 * ========================================================= */
'use strict';

const Admin = {
  session: null,
  settings: null,
  _catCache: {},

  async boot(cfg = {}) {
    await Store.init();
    this.session = Auth.guard(cfg.roles || null);
    if (!this.session) return false;
    this.settings = await Store.getSettings();

    document.getElementById('admin-sidebar').innerHTML = this.sidebarHtml(cfg.active);
    document.getElementById('admin-topbar').innerHTML = this.topbarHtml(cfg.title);
    this.bindShell();
    this.applyBrand();
    this.setTheme(localStorage.getItem('al_ihsan_theme') || 'light');
    U.refreshIcons();
    return true;
  },

  menu() {
    const isAdmin = this.session.role === 'admin';
    const items = [
      { group: 'Utama', links: [
        { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', href: 'dashboard.html' },
      ]},
      { group: 'Konten Website', links: [
        { id: 'berita', label: 'Berita & Artikel', icon: 'newspaper', href: 'berita.html' },
        { id: 'agenda', label: 'Agenda Kegiatan', icon: 'calendar-days', href: 'agenda.html' },
        { id: 'program', label: 'Program Pendidikan', icon: 'sparkles', href: 'program.html' },
        { id: 'prestasi', label: 'Prestasi', icon: 'trophy', href: 'prestasi.html' },
        { id: 'galeri', label: 'Galeri', icon: 'images', href: 'galeri.html' },
      ]},
      { group: 'Data Sekolah', links: [
        { id: 'profil', label: 'Profil & Visi Misi', icon: 'building-2', href: 'profil.html' },
        { id: 'guru', label: 'Guru & Pegawai', icon: 'users', href: 'guru.html' },
      ]},
      { group: 'PPDB', links: [
        { id: 'ppdb', label: 'Pendaftaran Siswa', icon: 'user-plus', href: 'ppdb.html' },
      ]},
      { group: 'Alumni', links: [
        { id: 'tracer', label: 'Jejak Alumni', icon: 'user-search', href: 'tracer.html' },
      ]},
      { group: 'Sistem', links: [
        { id: 'pengaturan', label: 'Pengaturan', icon: 'settings', href: 'pengaturan.html', adminOnly: true },
      ]},
    ];
    return isAdmin ? items : items.map(g => ({ ...g, links: g.links.filter(l => !l.adminOnly) }));
  },

  sidebarHtml(active) {
    const s = this.settings;
    return `
      <div class="sidebar__brand">
        <img src="${U.esc(U.asset(s.logo))}" alt="Logo" onerror="this.onerror=null;this.src=U.placeholder();">
        <div><b>${U.esc(s.short_name)}</b><span>Admin Panel</span></div>
      </div>
      <nav class="sidebar__nav" aria-label="Menu admin">
        ${this.menu().map(g => `
          <div class="side-label">${g.group}</div>
          ${g.links.map(l => `
            <a class="side-link ${l.id === active ? 'active' : ''}" href="${l.href}">
              <i data-lucide="${l.icon}"></i>${l.label}
            </a>`).join('')}
        `).join('')}
      </nav>
      <div class="sidebar__foot">Mode data: <b>${Store.mode === 'supabase' ? 'Supabase' : 'Demo (LocalStorage)'}</b></div>`;
  },

  topbarHtml(title) {
    const u = this.session;
    return `
      <button class="icon-btn burger-admin" id="admin-burger" aria-label="Buka menu"><i data-lucide="menu"></i></button>
      <h1>${U.esc(title || 'Dashboard')}</h1>
      <button class="icon-btn" id="admin-theme" aria-label="Mode gelap/terang"><i data-lucide="moon"></i></button>
      <div class="user-chip">
        <div class="uava">${U.initials(u.name)}</div>
        <div><b>${U.esc(u.name)}</b><span>${U.esc(u.role)}</span></div>
      </div>
      <button class="icon-btn" id="admin-logout" title="Keluar" aria-label="Keluar"><i data-lucide="log-out"></i></button>`;
  },

  bindShell() {
    const sb = document.getElementById('admin-sidebar');
    document.getElementById('admin-burger')?.addEventListener('click', () => sb.classList.toggle('open'));
    document.getElementById('admin-logout')?.addEventListener('click', async () => {
      if (await U.confirm({ title: 'Keluar', message: 'Akhiri sesi dan keluar dari dashboard?', okText: 'Keluar' })) {
        U.logActivity('Logout', this.session.email);
        Auth.logout();
        location.replace('login.html');
      }
    });
    document.getElementById('admin-theme')?.addEventListener('click', () => {
      this.setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024 && sb.classList.contains('open') && !e.target.closest('#admin-sidebar') && !e.target.closest('#admin-burger')) {
        sb.classList.remove('open');
      }
    });
  },

  applyBrand() {
    document.title = `${this.settings.short_name} — Admin`;
    const fav = document.querySelector('link[rel="icon"]');
    if (fav && this.settings.favicon) fav.href = U.asset(this.settings.favicon);
  },

  setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('al_ihsan_theme', theme);
    const b = document.getElementById('admin-theme');
    if (b) b.innerHTML = `<i data-lucide="${theme === 'dark' ? 'sun' : 'moon'}"></i>`;
    U.refreshIcons();
  },

  async catOptions(table = 'categories') {
    if (!this._catCache[table]) {
      const { rows } = await Store.list(table, { orderBy: 'name', orderDir: 'asc' });
      this._catCache[table] = rows;
    }
    return this._catCache[table];
  },

  /* ================== ADMIN TABLE (CRUD ENGINE) ================== */
  /**
   * config: {
   *   table, title, icon,
   *   columns: [{key, label, type:'main|text|date|datetime|badge|image|money|number|bool', sub?, badgeMap?, render?}],
   *   fields:  [{key, label, type:'text|number|money|date|textarea|html|select|image|checkbox',
   *              required, min, max, placeholder, help, options|optionsFrom, accept, maxMB}],
   *   searchKeys, filters: [{key,label,options|optionsFrom}], defaultSort:{key,dir}, perPage
   * }
   */
  table(host, config) {
    return new AdminTable(host, config);
  },
};

class AdminTable {
  constructor(host, config) {
    this.host = typeof host === 'string' ? document.getElementById(host) : host;
    this.cfg = Object.assign({ perPage: 10, defaultSort: { key: 'created_at', dir: 'desc' }, searchKeys: [] }, config);
    this.state = { page: 1, search: '', filters: {} };
    this.render();
  }

  async render() {
    /* Toolbar */
    const filtersHtml = await Promise.all((this.cfg.filters || []).map(async f => {
      let opts = f.options;
      if (f.optionsFrom) opts = (await Admin.catOptions(f.optionsFrom)).map(o => ({ v: o.id, l: o.name }));
      return `<select data-filter="${f.key}" aria-label="${U.esc(f.label)}">
        <option value="">Semua ${U.esc(f.label)}</option>
        ${opts.map(o => `<option value="${U.esc(o.v)}">${U.esc(o.l)}</option>`).join('')}
      </select>`;
    }));

    this.host.innerHTML = `
      <div class="toolbar">
        <div class="search-box">
          <i data-lucide="search"></i>
          <input type="search" placeholder="Cari ${U.esc((this.cfg.title || 'data').toLowerCase())}…" aria-label="Cari data">
        </div>
        ${filtersHtml.join('')}
        <span style="flex:1"></span>
        <button class="btn btn--primary btn--sm" data-add><i data-lucide="plus"></i>Tambah</button>
      </div>
      <div class="atable-wrap"><table class="atable">
        <thead><tr>${this.cfg.columns.map(c => `<th>${U.esc(c.label)}</th>`).join('')}<th style="width:130px">Aksi</th></tr></thead>
        <tbody><tr><td colspan="${this.cfg.columns.length + 1}" style="padding:40px;text-align:center;color:var(--text-muted)">Memuat data…</td></tr></tbody>
      </table></div>
      <div class="table-foot"><span class="info"></span><div class="pager"></div></div>`;

    this.host.querySelector('[data-add]').addEventListener('click', () => this.openForm());
    const search = this.host.querySelector('.search-box input');
    search.addEventListener('input', U.debounce(() => { this.state.search = search.value.trim(); this.state.page = 1; this.load(); }, 300));
    this.host.querySelectorAll('[data-filter]').forEach(sel => {
      sel.addEventListener('change', () => { this.state.filters[sel.dataset.filter] = sel.value; this.state.page = 1; this.load(); });
    });
    this.host.querySelector('tbody').addEventListener('click', (e) => this.onRowAction(e));
    this.host.querySelector('.pager').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-go]'); if (!b || b.disabled) return;
      this.state.page = Number(b.dataset.go); this.load();
    });
    await this.load();
  }

  async load() {
    const res = await Store.list(this.cfg.table, {
      search: this.state.search, searchKeys: this.cfg.searchKeys,
      filters: this.state.filters,
      orderBy: this.cfg.defaultSort.key, orderDir: this.cfg.defaultSort.dir,
      page: this.state.page, perPage: this.cfg.perPage,
    });
    this.rows = res.rows;
    const tbody = this.host.querySelector('tbody');
    if (!res.rows.length) {
      tbody.innerHTML = `<tr><td colspan="${this.cfg.columns.length + 1}" style="padding:44px;text-align:center">
        <div class="empty" style="border:0;background:none"><i data-lucide="inbox"></i><b>Belum ada data</b>Klik "Tambah" untuk menambahkan.</div></td></tr>`;
    } else {
      tbody.innerHTML = res.rows.map(r => `
        <tr>${this.cfg.columns.map(c => `<td>${this.cell(c, r)}</td>`).join('')}
        <td><div class="row-actions">
          ${this.cfg.detail ? `<button class="act-btn v" data-act="view" data-id="${U.esc(r.id)}" title="Lihat" aria-label="Lihat"><i data-lucide="eye"></i></button>` : ''}
          <button class="act-btn e" data-act="edit" data-id="${U.esc(r.id)}" title="Edit" aria-label="Edit"><i data-lucide="pencil"></i></button>
          <button class="act-btn d" data-act="del" data-id="${U.esc(r.id)}" title="Hapus" aria-label="Hapus"><i data-lucide="trash-2"></i></button>
        </div></td></tr>`).join('');
    }
    const from = res.total === 0 ? 0 : (res.page - 1) * (res.perPage || res.total) + 1;
    const to = (res.page - 1) * (res.perPage || res.total) + res.rows.length;
    this.host.querySelector('.info').textContent = `Menampilkan ${from}\u2013${to} dari ${U.fmtNum(res.total)} data`;
    let pg = `<button data-go="${res.page - 1}" ${res.page <= 1 ? 'disabled' : ''} aria-label="Sebelumnya"><i data-lucide="chevron-left" style="width:14px;height:14px"></i></button>`;
    for (let p = 1; p <= res.pages; p++) pg += `<button class="${p === res.page ? 'active' : ''}" data-go="${p}">${p}</button>`;
    pg += `<button data-go="${res.page + 1}" ${res.page >= res.pages ? 'disabled' : ''} aria-label="Berikutnya"><i data-lucide="chevron-right" style="width:14px;height:14px"></i></button>`;
    this.host.querySelector('.pager').innerHTML = pg;
    U.refreshIcons(this.host);
  }

  cell(c, r) {
    if (c.render) return c.render(r);
    const v = r[c.key];
    switch (c.type) {
      case 'main': return `<div><div class="cell-main">${U.esc(v || '-')}</div>${c.sub ? `<div class="cell-sub">${U.esc(r[c.sub] || '')}</div>` : ''}</div>`;
      case 'date': return v ? U.fmtDate(v) : '-';
      case 'datetime': return v ? U.fmtDateTime(v) : '-';
      case 'money': return 'Rp ' + U.fmtNum(v);
      case 'number': return U.fmtNum(v);
      case 'image': return `<img class="row-img" src="${U.esc(v || U.placeholder())}" alt="" loading="lazy">`;
      case 'badge': {
        const map = c.badgeMap || {};
        const cls = map[String(v).toLowerCase()] || 'badge--green';
        return `<span class="badge ${cls}">${U.esc(c.labels ? (c.labels[v] ?? v) : (v || '-'))}</span>`;
      }
      case 'bool': return v ? '<span class="badge badge--success">Ya</span>' : '<span class="badge badge--warning">Tidak</span>';
      default: return U.esc(v == null ? '-' : v);
    }
  }

  onRowAction(e) {
    const btn = e.target.closest('.act-btn'); if (!btn) return;
    const id = btn.dataset.id;
    const row = this.rows.find(x => String(x.id) === String(id));
    if (btn.dataset.act === 'view' && row) this.openForm(row, true);
    if (btn.dataset.act === 'edit' && row) this.openForm(row);
    if (btn.dataset.act === 'del' && row) this.del(row);
  }

  /* ---------- FORM MODAL ---------- */
  async openForm(row = null, readonly = false) {
    const old = document.getElementById('admin-form-modal');
    if (old) old.remove();
    const fieldsHtml = await Promise.all(this.cfg.fields.map(async (f) => {
      const val = row ? row[f.key] : (f.default ?? '');
      const req = f.required ? ' <span class="req">*</span>' : '';
      const msg = '<div class="msg"></div>';
      const help = f.help ? `<div class="help">${U.esc(f.help)}</div>` : '';
      let input = '';
      switch (f.type) {
        case 'textarea':
          input = `<textarea name="${f.key}" rows="4" ${f.required ? 'required' : ''} placeholder="${U.esc(f.placeholder || '')}" ${readonly ? 'disabled' : ''}>${U.esc(val || '')}</textarea>`;
          break;
        case 'html':
          input = `<textarea name="${f.key}" rows="9" ${f.required ? 'required' : ''} placeholder="${U.esc(f.placeholder || 'Gunakan tag <p>, <strong>, dll.')}" ${readonly ? 'disabled' : ''}>${U.esc(val || '')}</textarea><div class="help">Konten HTML — otomatis disanitasi (script diblokir).</div>`;
          break;
        case 'select': {
          let opts = f.options;
          if (f.optionsFrom) opts = (await Admin.catOptions(f.optionsFrom)).map(o => ({ v: o.id, l: o.name }));
          input = `<select name="${f.key}" ${f.required ? 'required' : ''} ${readonly ? 'disabled' : ''}>
            ${f.placeholder ? `<option value="">${U.esc(f.placeholder)}</option>` : ''}
            ${opts.map(o => `<option value="${U.esc(o.v)}" ${String(val) === String(o.v) ? 'selected' : ''}>${U.esc(o.l)}</option>`).join('')}
          </select>`;
          break;
        }
        case 'image':
          input = `
            <div class="img-field">
              <div class="preview" data-prev-box>${val ? `<img src="${U.esc(val)}" alt="Pratinjau" onerror="this.parentNode.textContent='X'">` : '<i data-lucide="image"></i>'}</div>
              <div class="actions">
                <button type="button" class="btn btn--outline btn--sm" data-pick><i data-lucide="upload"></i>Unggah Gambar</button>
                <input type="text" name="${f.key}" value="${U.esc(val || '')}" placeholder="atau tempel URL gambar" ${readonly ? 'disabled' : ''}>
              </div>
            </div>`;
          break;
        case 'checkbox':
          return `<div class="field span-2"><label style="display:flex;gap:10px;align-items:center">
            <input type="checkbox" name="${f.key}" ${val ? 'checked' : ''} ${readonly ? 'disabled' : ''} style="width:18px;height:18px">
            <span>${U.esc(f.label)}</span></label>${help}</div>`;
        case 'number':
          input = `<input type="number" name="${f.key}" value="${U.esc(val ?? '')}" ${f.required ? 'required' : ''} ${readonly ? 'disabled' : ''} placeholder="${U.esc(f.placeholder || '')}">`;
          break;
        case 'money':
          input = `<input type="number" name="${f.key}" value="${U.esc(val ?? '')}" ${f.required ? 'required' : ''} ${readonly ? 'disabled' : ''} placeholder="contoh: 1250000"><div class="help">Dalam Rupiah, tanpa titik.</div>`;
          break;
        case 'date':
          input = `<input type="date" name="${f.key}" value="${U.esc(val || '')}" ${f.required ? 'required' : ''} ${readonly ? 'disabled' : ''}>`;
          break;
        default:
          input = `<input type="text" name="${f.key}" value="${U.esc(val ?? '')}" ${f.required ? 'required' : ''} ${readonly ? 'disabled' : ''} placeholder="${U.esc(f.placeholder || '')}">`;
      }
      return `<div class="field ${['textarea', 'html'].includes(f.type) ? 'span-2' : ''}"><label>${U.esc(f.label)}${req}</label>${input}${msg}${help}</div>`;
    }));

    const ov = document.createElement('div');
    ov.className = 'modal-overlay'; ov.id = 'admin-form-modal';
    ov.innerHTML = `
      <div class="modal modal--lg" role="dialog" aria-modal="true">
        <div class="modal__head">
          <h3>${readonly ? 'Lihat' : row ? 'Edit' : 'Tambah'} \u2014 ${U.esc(this.cfg.title)}</h3>
          <button class="icon-btn" data-close aria-label="Tutup"><i data-lucide="x"></i></button>
        </div>
        <form class="modal__body aform c2" novalidate>${fieldsHtml.join('')}</form>
        <div class="modal__foot">
          <button class="btn btn--ghost" data-close>Batal</button>
          ${readonly ? '' : `<button class="btn btn--primary" data-save><i data-lucide="save"></i>Simpan</button>`}
        </div>
      </div>`;
    document.body.appendChild(ov);
    U.refreshIcons(ov);

    /* Upload gambar */
    ov.querySelectorAll('.img-field').forEach(box => {
      const urlInput = box.querySelector('input[type="text"]');
      const btn = box.querySelector('[data-pick]');
      const fi = document.createElement('input');
      fi.type = 'file'; fi.accept = 'image/jpeg,image/png,image/webp'; fi.hidden = true;
      box.appendChild(fi);
      btn.addEventListener('click', () => fi.click());
      fi.addEventListener('change', async () => {
        const file = fi.files[0]; if (!file) return;
        const ok = U.validateFile(file, { accept: ['image/jpeg', 'image/png', 'image/webp'], maxMB: 2 });
        if (ok !== true) { U.toast(ok, 'error'); return; }
        btn.disabled = true; btn.innerHTML = '<i data-lucide="loader-2"></i>Mengunggah…'; U.refreshIcons(ov);
        try {
          const url = await Store.uploadFile(this.cfg.table, file, { maxMB: 2, compress: true });
          urlInput.value = url;
          box.querySelector('[data-prev-box]').innerHTML = `<img src="${U.esc(url)}" alt="Pratinjau">`;
          U.toast('Gambar siap — klik Simpan untuk menyimpan');
        } catch (err) { U.toast(err.message, 'error'); }
        btn.disabled = false; btn.innerHTML = '<i data-lucide="upload"></i>Unggah Gambar'; U.refreshIcons(ov);
      });
      urlInput.addEventListener('change', () => {
        box.querySelector('[data-prev-box]').innerHTML =
          urlInput.value ? `<img src="${U.esc(urlInput.value)}" alt="Pratinjau" onerror="this.parentNode.innerHTML='X'">` : '<i data-lucide="image"></i>';
      });
    });

    ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('[data-close]')) ov.remove(); });
    ov.querySelector('[data-save]')?.addEventListener('click', () => this.save(ov, row));
    ov.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); ov.querySelector('[data-save]')?.click(); });
  }

  async save(ov, row) {
    const form = ov.querySelector('form');
    const data = Object.fromEntries(new FormData(form).entries());
    /* checkbox → boolean */
    form.querySelectorAll('input[type="checkbox"]').forEach(cb => { data[cb.name] = cb.checked; });
    const defs = this.cfg.fields.map(f => ({
      key: f.key, label: f.label, required: f.required && f.type !== 'checkbox',
      min: f.min, max: f.max, type: f.type === 'money' || f.type === 'number' ? 'number' : (f.type === 'date' ? 'text' : f.type),
    }));
    const { ok, errors } = U.validateForm(defs, data);
    form.querySelectorAll('.field').forEach(fl => {
      const input = fl.querySelector('input,select,textarea'); if (!input) return;
      const bad = !!errors[input.name];
      fl.classList.toggle('has-err', bad);
      input.classList.toggle('err', bad);
      if (bad) fl.querySelector('.msg').textContent = errors[input.name];
    });
    if (!ok) { U.toast('Periksa kembali isian formulir', 'warning'); return; }

    const btn = ov.querySelector('[data-save]');
    btn.disabled = true; btn.innerHTML = '<i data-lucide="loader-2"></i>Menyimpan…'; U.refreshIcons(ov);
    try {
      const payload = { ...data };
      this.cfg.fields.forEach(f => {
        if (f.type === 'html' && payload[f.key]) payload[f.key] = U.sanitizeHTML(payload[f.key]);
        if (f.type === 'number' || f.type === 'money') payload[f.key] = payload[f.key] === '' ? 0 : Number(payload[f.key]);
        if (f.type === 'checkbox' && typeof payload[f.key] !== 'boolean') payload[f.key] = !!payload[f.key];
      });
      if (this.cfg.beforeSave) payload = await this.cfg.beforeSave(payload, row);
      if (row) {
        await Store.update(this.cfg.table, row.id, payload);
        U.logActivity(`Update ${this.cfg.title}`, (payload.title || payload.name || row.title || row.name || row.id));
        U.toast('Perubahan berhasil disimpan');
      } else {
        await Store.insert(this.cfg.table, payload);
        U.logActivity(`Tambah ${this.cfg.title}`, (payload.title || payload.name || ''));
        U.toast('Data berhasil ditambahkan');
      }
      ov.remove();
      await this.load();
    } catch (err) {
      U.toast('Gagal menyimpan: ' + err.message, 'error');
      btn.disabled = false; btn.innerHTML = '<i data-lucide="save"></i>Simpan'; U.refreshIcons(ov);
    }
  }

  async del(row) {
    const label = row.title || row.name || row.full_name || row.id;
    if (!(await U.confirm({ title: 'Hapus Data', message: `Yakin menghapus "${U.truncate(label, 60)}"? Tindakan ini tidak dapat dibatalkan.`, okText: 'Hapus' }))) return;
    try {
      await Store.remove(this.cfg.table, row.id);
      U.logActivity(`Hapus ${this.cfg.title}`, label);
      U.toast('Data berhasil dihapus');
      await this.load();
    } catch (err) { U.toast('Gagal menghapus: ' + err.message, 'error'); }
  }
}

/* =========================================================
 * Helper: form pengaturan (singleton) & editor daftar
 * ========================================================= */
Admin.settingsForm = function (host, cfg = {}, opts = {}) {
  const el = typeof host === 'string' ? document.getElementById(host) : host;
  /* Dukung dua gaya pemanggilan: (host, fieldsArray, opts) atau (host, {fields, values, customSave, ...}) */
  if (Array.isArray(cfg)) cfg = { fields: cfg };
  const fields = cfg.fields || [];
  opts = Object.assign({}, opts, {
    values: cfg.values,
    noSave: cfg.noSave,
    customSave: cfg.customSave,
    extraButtons: cfg.extraButtons,
    afterBuild: cfg.afterBuild,
  });
  const build = async () => {
    const s = opts.values || (await Store.getSettings());
    el.innerHTML = `
      <form class="aform c2" novalidate onsubmit="return false">
        ${fields.map(f => {
          const val = s[f.key];
          const msg = '<div class="msg"></div>';
          if (f.type === 'textarea') return `<div class="field ${f.full ? 'span-2' : ''}"><label>${U.esc(f.label)}</label><textarea name="${f.key}" rows="${f.rows || 4}">${U.esc(val || '')}</textarea>${msg}</div>`;
          if (f.type === 'html') return `<div class="field span-2"><label>${U.esc(f.label)}</label><textarea name="${f.key}" rows="${f.rows || 8}">${U.esc(val || '')}</textarea>${msg}</div>`;
          if (f.type === 'image') return `<div class="field ${f.full ? 'span-2' : ''}"><label>${U.esc(f.label)}</label>
            <div class="img-field"><div class="preview" data-prev-box>${val ? `<img src="${U.esc(val)}" alt="Pratinjau">` : '<i data-lucide="image"></i>'}</div>
            <div class="actions"><button type="button" class="btn btn--outline btn--sm" data-pick="${f.key}"><i data-lucide="upload"></i>Unggah</button>
            <input type="text" name="${f.key}" value="${U.esc(val || '')}" placeholder="atau tempel URL"></div></div>${msg}</div>`;
          if (f.type === 'bool') return `<div class="field"><label style="display:flex;gap:10px;align-items:center"><input type="checkbox" name="${f.key}" ${val !== false && val !== 'false' ? 'checked' : ''} style="width:18px;height:18px"><span>${U.esc(f.label)}</span></label></div>`;
          if (f.type === 'select') return `<div class="field"><label>${U.esc(f.label)}</label><select name="${f.key}">${f.options.map(o => `<option value="${U.esc(o.v)}" ${String(val) === String(o.v) ? 'selected' : ''}>${U.esc(o.l)}</option>`).join('')}</select>${msg}</div>`;
          return `<div class="field"><label>${U.esc(f.label)}</label><input type="${f.type === 'number' ? 'number' : 'text'}" name="${f.key}" value="${U.esc(val ?? '')}" placeholder="${U.esc(f.placeholder || '')}">${msg}</div>`;
        }).join('')}
      </form>
      <div class="flex gap-2 mt-3 flex-wrap">
        ${opts.noSave ? '' : `<button type="button" class="btn btn--primary" data-save-settings><i data-lucide="save"></i>Simpan Perubahan</button>`}
        ${opts.extraButtons || ''}
      </div>`;
    U.refreshIcons(el);

    /* Upload gambar settings */
    el.querySelectorAll('[data-pick]').forEach(btn => {
      const key = btn.dataset.pick;
      const urlInput = el.querySelector(`[name="${key}"]`);
      const fi = document.createElement('input');
      fi.type = 'file'; fi.accept = 'image/jpeg,image/png,image/webp,image/svg+xml'; fi.hidden = true;
      btn.parentElement.appendChild(fi);
      btn.addEventListener('click', () => fi.click());
      fi.addEventListener('change', async () => {
        const file = fi.files[0]; if (!file) return;
        try {
          const url = await Store.uploadFile('settings/' + key, file, { maxMB: 2, compress: file.type !== 'image/svg+xml' });
          urlInput.value = url;
          el.querySelector(`[data-pick="${key}"]`).closest('.img-field').querySelector('[data-prev-box]').innerHTML = `<img src="${U.esc(url)}" alt="Pratinjau">`;
          U.toast('Gambar siap — klik Simpan');
        } catch (err) { U.toast(err.message, 'error'); }
      });
    });

    el.querySelector('[data-save-settings]')?.addEventListener('click', async (e) => {
      const data = Object.fromEntries(new FormData(el.querySelector('.aform')).entries());
      el.querySelectorAll('input[type="checkbox"]').forEach(cb => { data[cb.name] = cb.checked; });
      const btn = e.currentTarget;
      btn.disabled = true; btn.innerHTML = '<i data-lucide="loader-2"></i>Menyimpan…'; U.refreshIcons(el);
      try {
        if (opts.customSave) {
          await opts.customSave(data);
        } else {
          await Store.saveSettings(data);
          U.logActivity('Update Pengaturan', fields.map(f => f.key).slice(0, 4).join(', '));
          U.toast('Pengaturan berhasil disimpan');
        }
        Admin.settings = await Store.getSettings();
      } catch (err) { U.toast('Gagal menyimpan: ' + err.message, 'error'); }
      btn.disabled = false; btn.innerHTML = '<i data-lucide="save"></i>Simpan Perubahan'; U.refreshIcons(el);
    });
    opts.afterBuild?.(el);
  };
  build();
  return { rebuild: build };
};

/* listEditor: mengelola array di settings, mis. misi, persyaratan, biaya */
Admin.listEditor = function (host, itemFields, { addLabel = 'Tambah Baris', values = [] } = {}) {
  const el = typeof host === 'string' ? document.getElementById(host) : host;
  const esc2 = U.esc;
  const rowHtml = (item = {}) => `
    <div class="le-row">
      ${itemFields.map(f => {
        const v = item[f.key] ?? '';
        if (f.type === 'number') return `<input type="number" data-k="${f.key}" value="${esc2(v)}" placeholder="${esc2(f.label)}">`;
        if (f.type === 'select') return `<select data-k="${f.key}">${f.options.map(o => `<option value="${esc2(o.v)}" ${String(v) === String(o.v) ? 'selected' : ''}>${esc2(o.l)}</option>`).join('')}</select>`;
        return `<input type="text" data-k="${f.key}" value="${esc2(v)}" placeholder="${esc2(f.label)}">`;
      }).join('')}
      <button type="button" class="le-del" aria-label="Hapus baris"><i data-lucide="trash-2"></i></button>
    </div>`;
  el.innerHTML = `
    <div class="list-editor">${values.map(v => rowHtml(v)).join('') || '<p class="small muted">Belum ada baris.</p>'}</div>
    <button type="button" class="btn btn--outline btn--sm mt-2" data-add-row><i data-lucide="plus"></i>${addLabel}</button>`;
  const wire = () => {
    el.querySelectorAll('.le-del').forEach(b => b.onclick = () => { b.closest('.le-row').remove(); refreshEmpty(); });
  };
  const refreshEmpty = () => {
    const le = el.querySelector('.list-editor');
    if (!le.querySelector('.le-row')) le.innerHTML = '<p class="small muted">Belum ada baris.</p>';
  };
  el.querySelector('[data-add-row]').onclick = () => {
    const le = el.querySelector('.list-editor');
    if (le.querySelector('p.small')) le.innerHTML = '';
    le.insertAdjacentHTML('beforeend', rowHtml({}));
    wire(); U.refreshIcons(el);
  };
  wire(); U.refreshIcons(el);
  return {
    get: () => [...el.querySelectorAll('.le-row')].map(r => {
      const item = {};
      r.querySelectorAll('[data-k]').forEach(inp => {
        item[inp.dataset.k] = inp.type === 'number' ? (inp.value === '' ? 0 : Number(inp.value)) : inp.value.trim();
      });
      return itemFields.length === 1 ? (item[itemFields[0].key] || '') : item;
    }).filter(x => (typeof x === 'string' ? x : Object.values(x).some(Boolean))),
  };
};

window.Admin = Admin;
