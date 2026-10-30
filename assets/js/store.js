/* =========================================================
 * STORE.JS — Lapisan data terpadu (Data Access Layer)
 * ---------------------------------------------------------
 * - Mode DEMO   : semua data di LocalStorage browser.
 * - Mode SUPABASE : seluruh CRUD lewat Supabase (anon key + RLS).
 * Semua halaman (public & admin) HANYA berbicara dengan
 * Store/Auth — sehingga pindah mode tidak menyentuh UI.
 * ========================================================= */
'use strict';

const DB_KEY = 'al_ihsan_db_v1';
const SESSION_KEY = 'al_ihsan_session';

const Store = {
  mode: 'demo',
  client: null,      // supabase-js client (mode produksi)
  _db: null,         // cache lokal (mode demo)

  /* ---------- INISIALISASI ---------- */
  async init() {
    const cfg = window.SUPABASE_CONFIG || {};
    if (cfg.enabled && cfg.url && cfg.anonKey && !/PROJECT-ANDA|ISI-ANON/.test(cfg.anonKey + cfg.url)) {
      try {
        await this._loadSupabaseJs();
        this.client = supabase.createClient(cfg.url, cfg.anonKey);
        this.mode = 'supabase';
        await this._seedSupabaseIfNeeded();
        return this.mode;
      } catch (e) {
        console.warn('[Store] Supabase tidak tersedia, fallback ke LocalStorage:', e.message);
        this.mode = 'demo';
      }
    }
    this.mode = 'demo';
    this._loadLocal();
    await this._seedLocalIfNeeded();
    return this.mode;
  },

  _loadSupabaseJs() {
    return new Promise((resolve, reject) => {
      if (window.supabase && window.supabase.createClient) return resolve();
      const s = document.createElement('script');
      s.src = window.SUPABASE_JS_CDN;
      s.onload = resolve;
      s.onerror = () => reject(new Error('CDN supabase-js gagal dimuat'));
      document.head.appendChild(s);
    });
  },

  /* ---------- MODE DEMO (LocalStorage) ---------- */
  _loadLocal() {
    try { this._db = JSON.parse(localStorage.getItem(DB_KEY)) || null; }
    catch (e) { this._db = null; }
  },

  _saveLocal() {
    try { localStorage.setItem(DB_KEY, JSON.stringify(this._db)); return true; }
    catch (e) {
      U.toast('Penyimpanan browser penuh. Hapus gambar besar atau sebagian data.', 'error');
      return false;
    }
  },

  _seedLocalIfNeeded() {
    if (this._db) return;
    const seed = JSON.parse(JSON.stringify(window.SEED || {}));
    seed.activity_logs = seed.activity_logs || [];
    this._db = seed;
    this._saveLocal();
  },

  resetDemo() {
    localStorage.removeItem(DB_KEY);
    this._db = null;
    this._loadLocal();
    this._seedLocalIfNeeded();
    U.toast('Data demo berhasil di-reset', 'info');
  },

  /* ---------- MODE SUPABASE ---------- */
  async _seedSupabaseIfNeeded() {
    const { count, error } = await this.client.from('website_settings').select('key', { count: 'exact', head: true });
    if (error) throw new Error('Tabel belum tersedia: ' + error.message);
    if (count > 0) return;
    // Seed settings (kunci-nilai) — konten lain diseed via SQL
    const rows = [];
    Object.entries(window.SEED.settings).forEach(([key, value]) => {
      rows.push({ key, value: JSON.stringify(value) });
    });
    await this.client.from('website_settings').insert(rows);
  },

  /* ---------- CRUD GENERIK ---------- */

  /**
   * list(table, options)
   * options: { search, searchKeys, filters:{}, orderBy, orderDir, page, perPage }
   * return: { rows, total, page, perPage, pages }
   */
  async list(table, opt = {}) {
    if (this.mode === 'supabase') {
      let q = this.client.from(table).select('*', { count: 'exact' });
      if (opt.filters) Object.entries(opt.filters).forEach(([k, v]) => { if (v !== '' && v != null) q = q.eq(k, v); });
      if (opt.search && (opt.searchKeys || []).length) {
        const or = opt.searchKeys.map(k => `${k}.ilike.%${opt.search}%`).join(',');
        q = q.or(or);
      }
      if (opt.orderBy) q = q.order(opt.orderBy, { ascending: (opt.orderDir || 'desc') === 'asc', nullsFirst: false });
      const perPage = opt.perPage || 0;
      if (perPage) {
        const page = opt.page || 1;
        q = q.range((page - 1) * perPage, page * perPage - 1);
      }
      const { data, error, count } = await q;
      if (error) throw new Error(error.message);
      const total = count || (data || []).length;
      return { rows: data || [], total, page: opt.page || 1, perPage, pages: perPage ? Math.max(1, Math.ceil(total / perPage)) : 1 };
    }

    // DEMO
    let rows = (this._db[table] || []).slice();
    if (opt.filters) {
      Object.entries(opt.filters).forEach(([k, v]) => {
        if (v !== '' && v != null && v !== 'all') rows = rows.filter(r => String(r[k]) === String(v));
      });
    }
    if (opt.search && (opt.searchKeys || []).length) {
      const s = String(opt.search).toLowerCase();
      rows = rows.filter(r => opt.searchKeys.some(k => String(r[k] || '').toLowerCase().includes(s)));
    }
    if (opt.orderBy) {
      const dir = (opt.orderDir || 'desc') === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        const va = a[opt.orderBy], vb = b[opt.orderBy];
        if (va === vb) return 0;
        if (va == null) return 1; if (vb == null) return -1;
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
        return String(va).localeCompare(String(vb), 'id', { numeric: true }) * dir;
      });
    }
    const total = rows.length;
    const perPage = opt.perPage || 0;
    const page = opt.page || 1;
    if (perPage) rows = rows.slice((page - 1) * perPage, page * perPage);
    return { rows, total, page, perPage, pages: perPage ? Math.max(1, Math.ceil(total / perPage)) : 1 };
  },

  async get(table, id) {
    if (this.mode === 'supabase') {
      const { data, error } = await this.client.from(table).select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    }
    return (this._db[table] || []).find(r => String(r.id) === String(id)) || null;
  },

  async findOne(table, where = {}) {
    if (this.mode === 'supabase') {
      let q = this.client.from(table).select('*');
      Object.entries(where).forEach(([k, v]) => { q = q.eq(k, v); });
      const { data, error } = await q.limit(1).maybeSingle();
      if (error) throw new Error(error.message);
      return data || null;
    }
    return (this._db[table] || []).find(r => Object.entries(where).every(([k, v]) => String(r[k]) === String(v))) || null;
  },

  async insert(table, obj) {
    obj = Object.assign({}, obj);
    if (!obj.id) obj.id = U.uid(table.slice(0, 3));
    if (!obj.created_at) obj.created_at = new Date().toISOString();

    if (this.mode === 'supabase') {
      // SENGAJA TANPA .select(): dengan RLS, INSERT ... RETURNING mewajibkan
      // baris baru juga lolos policy SELECT. Policy publik memang membatasi
      // baca (mis. tracer_alumni hanya 'terverifikasi', messages tanpa baca
      // publik) sehingga .select() membuat kiriman anonim gagal dengan error
      // "new row violates row-level security policy". id & created_at dibuat
      // di sisi klien, jadi baris hasil dari server tidak diperlukan.
      const { error } = await this.client.from(table).insert(obj);
      if (error) throw new Error(error.message);
      return obj;
    }
    this._db[table] = this._db[table] || [];
    this._db[table].unshift(obj);
    this._saveLocal();
    return obj;
  },

  async update(table, id, patch) {
    if (this.mode === 'supabase') {
      const { data, error } = await this.client.from(table).update(patch).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    const arr = this._db[table] || [];
    const idx = arr.findIndex(r => String(r.id) === String(id));
    if (idx >= 0) { arr[idx] = Object.assign({}, arr[idx], patch); this._saveLocal(); return arr[idx]; }
    return null;
  },

  async remove(table, id) {
    if (this.mode === 'supabase') {
      const { error } = await this.client.from(table).delete().eq('id', id);
      if (error) throw new Error(error.message);
      return true;
    }
    this._db[table] = (this._db[table] || []).filter(r => String(r.id) !== String(id));
    this._saveLocal();
    return true;
  },

  async count(table, filters = {}) {
    const res = await this.list(table, { filters, perPage: 0 });
    return res.total;
  },

  /* ---------- SETTINGS (singleton) ---------- */
  async getSettings() {
    if (this.mode === 'supabase') {
      const { data, error } = await this.client.from('website_settings').select('key,value');
      if (error) throw new Error(error.message);
      const obj = {};
      (data || []).forEach(r => {
        try { obj[r.key] = JSON.parse(r.value); } catch (e) { obj[r.key] = r.value; }
      });
      return Object.assign({}, window.SEED.settings, obj);
    }
    /* Gabungkan default SEED agar kunci pengaturan baru (mis. alumni) tetap muncul
       pada browser yang datanya dibuat sebelum kunci tersebut ditambahkan. */
    return Object.assign({}, window.SEED.settings, this._db ? this._db.settings : {});
  },

  async saveSettings(patch) {
    if (this.mode === 'supabase') {
      const rows = Object.entries(patch).map(([key, value]) => ({ key, value: JSON.stringify(value) }));
      const { error } = await this.client.from('website_settings').upsert(rows, { onConflict: 'key' });
      if (error) throw new Error(error.message);
      return true;
    }
    this._db.settings = Object.assign({}, this._db.settings, patch, { updated_at: new Date().toISOString() });
    return this._saveLocal();
  },

  /* ---------- UPLOAD BERKAS ---------- */
  /* demo: dataURL ke dalam record. supabase: Storage bucket → URL publik */
  async uploadFile(bucketPath, file, { maxMB = 2, compress = false } = {}) {
    const check = U.validateFile(file, { maxMB, accept: compress
      ? ['image/jpeg', 'image/png', 'image/webp']
      : ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] });
    if (check !== true) throw new Error(check);
    if (this.mode === 'supabase') {
      const cfg = window.SUPABASE_CONFIG;
      const path = bucketPath + '/' + Date.now() + '_' + file.name.replace(/[^\w.\-]/g, '_');
      const { error } = await this.client.storage.from(cfg.storageBucket).upload(path, file, { upsert: true });
      if (error) throw new Error(error.message);
      const { data } = this.client.storage.from(cfg.storageBucket).getPublicUrl(path);
      return data.publicUrl;
    }
    if (compress) return U.compressImage(file);
    return U.readFileAsDataURL(file);
  },

  /* ---------- DOKUMEN PPDB (pendaftar publik) ---------- */
  /* Berkas diunggah DULU ke Storage folder admissions/ — kalau gagal, tidak ada
     baris DB yang tertulis (pendaftar bisa ulang tanpa data dobel). Metadata ke
     tabel admission_documents baru ditulis SETELAH baris admissions terbentuk. */
  async uploadAdmissionFiles(regNumber, docs) {
    if (this.mode !== 'supabase' || !this.client) return null;
    const cfg = window.SUPABASE_CONFIG;
    const bucket = cfg.storageBucket || 'school-media';
    const rows = [];
    for (const [docType, d] of Object.entries(docs || {})) {
      if (!d || !d.data) continue;
      const blob = await (await fetch(d.data)).blob();  // dataURL -> Blob
      const ext = (String(d.name || '').split('.').pop() || 'bin').toLowerCase().slice(0, 5);
      const path = `admissions/${regNumber}/${docType}-${Date.now()}-${U.uid('doc')}.${ext}`;
      const { error } = await this.client.storage.from(bucket).upload(path, blob, {
        contentType: d.type || 'application/octet-stream',
      });
      if (error) throw new Error('Unggah dokumen "' + docType + '" gagal: ' + error.message);
      rows.push({
        id: U.uid('doc'),
        admission_id: null,   // diisi oleh attachAdmissionDocs()
        doc_type: docType,
        file_name: d.name || docType,
        file_type: d.type || null,
        file_size: d.size || null,
        storage_path: path,
        created_at: new Date().toISOString(),
      });
    }
    return rows;
  },

  async attachAdmissionDocs(rows, admissionId) {
    if (!rows || !rows.length || this.mode !== 'supabase' || !this.client) return;
    for (const r of rows) {
      r.admission_id = admissionId;
      const { error } = await this.client.from('admission_documents').insert(r);
      if (error) throw new Error('Simpan metadata dokumen gagal: ' + error.message);
    }
  },

  /* ---------- REG NUMBER PPDB ---------- */
  async nextRegNumber(tahunAjaran = '2027') {
    const { rows } = await this.list('admissions', { perPage: 0 });
    const n = rows.length + 1;
    return 'PPDB-' + tahunAjaran + '-' + String(n).padStart(4, '0');
  },
};

/* =========================================================
 * AUTH — autentikasi & kontrol akses
 * demo: users lokal (password hash) | supabase: Supabase Auth
 * ========================================================= */
const Auth = {
  current() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); }
    catch (e) { return null; }
  },

  async login(email, password) {
    email = String(email || '').trim().toLowerCase();
    if (!email || !password) throw new Error('Email dan password wajib diisi');

    if (Store.mode === 'supabase') {
      const { data, error } = await Store.client.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      const prof = await Store.findOne('users', { email });
      const session = {
        userId: data.user.id, email,
        name: prof?.name || data.user.email, role: prof?.role || 'editor',
        provider: 'supabase', ts: Date.now(),
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    }

    // DEMO — bandingkan hash, JANGAN plaintext
    const user = await Store.findOne('users', { email });
    if (!user) throw new Error('Akun tidak ditemukan');
    const hash = await U.sha256(password);
    if (hash !== user.password) throw new Error('Password salah');
    const session = { userId: user.id, email: user.email, name: user.name, role: user.role, provider: 'demo', ts: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  logout() {
    if (Store.mode === 'supabase' && Store.client) Store.client.auth.signOut().catch(() => {});
    sessionStorage.removeItem(SESSION_KEY);
  },

  isAdmin() { return Auth.current()?.role === 'admin'; },
  can(role) { const r = Auth.current()?.role; return r === 'admin' || r === role; },

  /* Guard untuk halaman admin. roles: null=login saja, ['admin']=admin saja */
  guard(roles = null) {
    const s = Auth.current();
    if (!s) { location.replace('login.html'); return null; }
    if (roles && !roles.includes(s.role)) {
      U.toast('Anda tidak memiliki akses ke modul tersebut.', 'error');
      location.replace('dashboard.html');
      return null;
    }
    return s;
  },
};

window.Store = Store;
window.Auth = Auth;
