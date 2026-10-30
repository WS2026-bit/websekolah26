/* =========================================================
 * UTIL.JS — Kumpulan helper inti
 * Keamanan: escape HTML, validasi input, validasi file.
 * ========================================================= */
'use strict';

const U = {
  /* ---------- ID & STRING ---------- */
  uid(prefix = 'id') {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  slug(str = '') {
    return String(str).toLowerCase()
      .replace(/[^\w\s-]/g, '').trim()
      .replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 90);
  },

  truncate(str = '', n = 120) {
    const s = String(str).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return s.length > n ? s.slice(0, n).trimEnd() + '…' : s;
  },

  initials(name = '') {
    return String(name).replace(/[^A-Za-z\s]/g, '').trim().split(/\s+/)
      .slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || 'SI';
  },

  esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },

  /* Sanitasi sederhana untuk konten HTML panjang (berita/artikel):
     buka tag script/style/iframe event handler diizinkan? TIDAK —
     script, style, event handler selalu dibuang. iframe hanya youtube. */
  sanitizeHTML(html = '') {
    let s = String(html);
    s = s.replace(/<\s*(script|style|object|embed|form|input|link|meta)[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
    s = s.replace(/<\s*(script|style|object|embed|form|input|link|meta)[^>]*\/?\s*>/gi, '');
    s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    s = s.replace(/javascript\s*:/gi, '');
    // iframe hanya diizinkan untuk youtube
    s = s.replace(/<iframe[^>]*src=["']([^"']*)["'][^>]*>[\s\S]*?<\/iframe>/gi, (m, src) => {
      return /youtube(-nocookie)?\.com\/embed\//i.test(src) ? m : '';
    });
    return s;
  },

  /* ---------- FORMAT ---------- */
  fmtNum(n) {
    return new Intl.NumberFormat('id-ID').format(Number(n) || 0);
  },

  fmtDate(iso, style = 'medium') {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d)) return '-';
    const opt = style === 'long'
      ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      : style === 'short'
        ? { day: '2-digit', month: '2-digit', year: 'numeric' }
        : { day: 'numeric', month: 'long', year: 'numeric' };
    return d.toLocaleDateString('id-ID', opt);
  },

  fmtDateTime(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d)) return '-';
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  },

  monthName(idx) {
    return ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
      'Agustus', 'September', 'Oktober', 'November', 'Desember'][idx] || '';
  },

  waLink(phone, text = '') {
    const p = String(phone).replace(/[^0-9]/g, '').replace(/^0/, '62');
    return 'https://wa.me/' + p + (text ? '?text=' + encodeURIComponent(text) : '');
  },

  getParam(name) {
    return new URLSearchParams(location.search).get(name) || '';
  },

  debounce(fn, ms = 300) {
    let t; return function (...a) { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); };
  },

  /* ---------- VALIDASI FORM ---------- */
  validators: {
    required: v => (v !== undefined && v !== null && String(v).trim() !== '') || 'Wajib diisi',
    email: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()) || 'Format email tidak valid',
    phone: v => !v || /^(\+?62|0)[2-9][0-9\-().\s]{6,18}$/.test(String(v).trim()) || 'Nomor telepon/WA tidak valid (contoh: 081234567890)',
    number: v => v === '' || v === null || !isNaN(Number(v)) || 'Harus berupa angka',
    minLen: n => v => !v || String(v).length >= n || `Minimal ${n} karakter`,
    maxLen: n => v => !v || String(v).length <= n || `Maksimal ${n} karakter`,
    url: v => !v || /^https?:\/\/.+\..+/.test(String(v).trim()) || 'URL tidak valid (harus diawali http/https)',
    regex: (re, msg) => v => !v || re.test(String(v).trim()) || (msg || 'Format tidak valid'),
  },

  /* fields: [{key, label, required, type, min, max, rules:[]}] */
  validateForm(fields, data) {
    const errors = {};
    for (const f of fields) {
      const val = data[f.key];
      const checks = [];
      if (f.required) checks.push(U.validators.required);
      if (f.type === 'email') checks.push(U.validators.email);
      if (f.type === 'tel') checks.push(U.validators.phone);
      if (f.type === 'number' || f.type === 'money') checks.push(U.validators.number);
      if (f.type === 'url') checks.push(U.validators.url);
      if (f.min) checks.push(U.validators.minLen(f.min));
      if (f.max) checks.push(U.validators.maxLen(f.max));
      (f.rules || []).forEach(r => checks.push(r));
      for (const c of checks) {
        const res = c(val);
        if (res !== true) { errors[f.key] = res; break; }
      }
    }
    return { ok: Object.keys(errors).length === 0, errors };
  },

  /* ---------- FILE & GAMBAR ---------- */
  validateFile(file, { accept = ['image/jpeg', 'image/png', 'image/webp'], maxMB = 2 } = {}) {
    if (!file) return 'Tidak ada file';
    if (!accept.includes(file.type)) return 'Tipe file tidak diizinkan (' + accept.map(a => a.split('/')[1]).join(', ') + ')';
    if (file.size > maxMB * 1024 * 1024) return `Ukuran file maksimal ${maxMB} MB`;
    return true;
  },

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(new Error('Gagal membaca file'));
      r.readAsDataURL(file);
    });
  },

  /* Kompres gambar menjadi dataURL JPEG agar hemat storage demo */
  async compressImage(file, maxW = 1280, quality = 0.82) {
    const dataUrl = await U.readFileAsDataURL(file);
    if (file.type === 'image/svg+xml') return dataUrl;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * scale);
        cv.height = Math.round(img.height * scale);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        try { resolve(cv.toDataURL('image/jpeg', quality)); }
        catch (e) { resolve(dataUrl); }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  },

  /* ---------- EKSPOR ---------- */
  csvDownload(filename, rows) {
    if (!rows || !rows.length) { U.toast('Tidak ada data untuk diekspor', 'warning'); return; }
    const esc2 = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const csv = rows.map(r => r.map(esc2).join(';')).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    U.toast('Data berhasil diekspor: ' + filename);
  },

  /* ---------- KEAMANAN PASSWORD (mode demo) ---------- */
  async sha256(text) {
    if (window.crypto && crypto.subtle && window.isSecureContext !== false) {
      try {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(text)));
        return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) { /* fallback di bawah */ }
    }
    // Fallback FNV-1a 32-bit (hanya untuk demo file:// tanpa secure context)
    let h = 0x811c9dc5;
    const s = String(text);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
    return 'fnv_' + h.toString(16);
  },

  /* ---------- TOAST NOTIFIKASI ---------- */
  toast(msg, type = 'success') {
    let wrap = document.getElementById('toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'toast-wrap';
      wrap.setAttribute('role', 'status');
      wrap.setAttribute('aria-live', 'polite');
      document.body.appendChild(wrap);
    }
    const icons = { success: 'check-circle-2', error: 'x-circle', warning: 'alert-triangle', info: 'info' };
    const el = document.createElement('div');
    el.className = 'toast toast--' + type;
    el.innerHTML = `<i data-lucide="${icons[type] || 'info'}"></i><span>${U.esc(msg)}</span>`;
    wrap.appendChild(el);
    if (window.lucide) lucide.createIcons({ root: el });
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 350); }, 3800);
  },

  /* ---------- FALLBACK GAMBAR & JALUR ASET ---------- */
  asset(p) {
    if (!p) return U.asset('assets/images/placeholder.svg');
    if (/^(https?:|data:|blob:|\/\/)/.test(p)) return p;
    const deep = window.location.pathname.includes('/admin/');
    return (deep ? '../' : '') + String(p).replace(/^\.\//, '');
  },

  placeholder() { return U.asset('assets/images/placeholder.svg'); },

  imgError(img) {
    if (img.dataset.fbk) return;
    img.dataset.fbk = '1';
    img.src = U.placeholder();
  },

  installImgFallback() {
    document.addEventListener('error', (e) => {
      const t = e.target;
      if (t && t.tagName === 'IMG') U.imgError(t);
    }, true);
  },

  /* ---------- MODAL KONFIRMASI ---------- */
  confirm({ title = 'Konfirmasi', message = 'Lanjutkan tindakan ini?', okText = 'Ya, Lanjutkan', danger = true } = {}) {
    return new Promise((resolve) => {
      const old = document.getElementById('confirm-modal');
      if (old) old.remove();
      const ov = document.createElement('div');
      ov.className = 'modal-overlay';
      ov.id = 'confirm-modal';
      ov.innerHTML = `
        <div class="modal modal--sm" role="dialog" aria-modal="true" aria-label="${U.esc(title)}">
          <div class="modal__head"><h3>${U.esc(title)}</h3></div>
          <div class="modal__body"><p>${U.esc(message)}</p></div>
          <div class="modal__foot">
            <button type="button" class="btn btn--ghost" data-act="no">Batal</button>
            <button type="button" class="btn ${danger ? 'btn--danger' : 'btn--primary'}" data-act="yes">${U.esc(okText)}</button>
          </div>
        </div>`;
      document.body.appendChild(ov);
      ov.addEventListener('click', (e) => {
        if (e.target === ov || e.target.closest('[data-act="no"]')) { ov.remove(); resolve(false); }
        if (e.target.closest('[data-act="yes"]')) { ov.remove(); resolve(true); }
      });
    });
  },

  /* ---------- AUDIT LOG ---------- */
  async logActivity(action, detail = '') {
    try {
      await Store.insert('activity_logs', {
        user: (window.Auth && Auth.current() && Auth.current().name) || 'Publik',
        action, detail,
      });
    } catch (e) { /* logging tidak boleh mengganggu alur utama */ }
  },

  /* ---------- LAIN-LAIN ---------- */
  animateCounter(el, target, dur = 1400) {
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = U.fmtNum(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  setupReveals(root = document) {
    const els = root.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  },

  refreshIcons(root = document) { if (window.lucide) lucide.createIcons({ root }); },
};

U.installImgFallback();
window.U = U;
