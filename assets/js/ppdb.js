/* =========================================================
 * PPDB.JS — Sistem Pendaftaran Online
 * Form multi-step, upload dokumen, nomor registrasi otomatis,
 * bukti pendaftaran (cetak), dan cek status pendaftaran.
 * ========================================================= */
'use strict';

const Ppdb = {
  async boot() {
    await Store.init();
    await SiteShell.init({ page: 'ppdb', pageTitle: 'PPDB Online', breadcrumb: [{ label: 'PPDB Online' }] });
    this.s = SiteShell.t();
    this.renderInfo();
    this.initWizard();
    this.initStatusCheck();
    U.refreshIcons();
    U.setupReveals();
  },

  /* ---------- INFORMASI PPDB ---------- */
  renderInfo() {
    const s = this.s, p = s; /* kunci ppdb_* tersimpan langsung pada settings */

    /* Status & gelombang */
    const ta = document.getElementById('ppdb-ta');
    if (ta) ta.textContent = s.ppdb_tahun_ajaran ? 'TA ' + s.ppdb_tahun_ajaran : '';
    const badge = document.getElementById('ppdb-status');
    if (badge) {
      badge.innerHTML = p.open !== false
        ? '<span class="badge badge--success"><span class="status-dot" style="background:currentColor"></span>PENDAFTARAN DIBUKA</span>'
        : '<span class="badge badge--red">PENDAFTARAN DITUTUP</span>';
    }
    const gel = document.getElementById('ppdb-gelombang');
    if (gel) {
      gel.innerHTML = (p.ppdb_gelombang || []).map((g, i) => {
        const now = new Date();
        const aktif = new Date(g.mulai) <= now && now <= new Date(g.selesai);
        return `
        <div class="evd reveal" data-delay="${i}">
          <div class="evd__date" style="${aktif ? 'background:linear-gradient(160deg,var(--gold-600),var(--gold-400));color:#2b2405' : ''}">
            <b>${i + 1}</b><span>Gel.</span>
          </div>
          <div class="evd__body">
            <h4>${U.esc(g.nama)} ${aktif ? '<span class="badge badge--gold" style="margin-left:6px">Sedang Berjalan</span>' : ''}</h4>
            <div class="evd__meta">
              <span><i data-lucide="calendar-range"></i>${U.fmtDate(g.mulai)} \u2013 ${U.fmtDate(g.selesai)}</span>
            </div>
          </div>
        </div>`;
      }).join('');
    }

    /* Persyaratan */
    const req = document.getElementById('ppdb-persyaratan');
    if (req) req.innerHTML = (p.ppdb_persyaratan || []).map(x => `<li>${U.esc(x)}</li>`).join('');

    /* Alur */
    const alur = document.getElementById('ppdb-alur');
    if (alur) {
      alur.innerHTML = (p.ppdb_alur || []).map((a, i) => `
        <div class="tl-item reveal" data-delay="${i % 4}">
          <b>${i + 1}. ${U.esc(a.t)}</b><p>${U.esc(a.d)}</p>
        </div>`).join('');
    }

    /* Jadwal seleksi */
    const jadwal = document.getElementById('ppdb-jadwal');
    if (jadwal) jadwal.innerHTML = (p.ppdb_jadwal || []).map(x => `<li>${U.esc(x)}</li>`).join('');

    /* Biaya */
    const biaya = document.getElementById('ppdb-biaya');
    if (biaya) {
      biaya.innerHTML = (p.ppdb_biaya || []).map(b => `
        <tr>
          <td><strong>${U.esc(b.jenjang)}</strong></td>
          <td>${U.fmtNum(b.ppdb)}</td>
          <td>${U.fmtNum(b.spp)} /bulan</td>
          <td>${U.esc(b.ket)}</td>
        </tr>`).join('');
    }

    /* Kontak panitia */
    const pk = document.getElementById('ppdb-kontak');
    if (pk) {
      pk.innerHTML = `
        <div><i data-lucide="map-pin"></i><span>${U.esc(p.ppdb_kontak || s.address)}</span></div>
        <div><i data-lucide="mail"></i><span>${U.esc(s.ppdb_email || s.email)}</span></div>
        <div><i data-lucide="message-circle"></i><a href="${U.esc(U.waLink(p.ppdb_wa_panitia || s.whatsapp, 'Assalamualaikum Panitia PPDB, saya ingin bertanya'))}" target="_blank" rel="noopener">WhatsApp Panitia PPDB</a></div>`;
    }
  },

  /* ---------- FORM WIZARD ---------- */
  initWizard() {
    const form = document.getElementById('ppdb-form');
    if (!form) return;
    this.step = 1;
    this.docs = {}; // {key: {name,type,size,data}}
    const steps = [...form.querySelectorAll('[data-step]')];
    const dots = [...document.querySelectorAll('.stepper .step')];

    const show = (n) => {
      this.step = n;
      steps.forEach(s => s.style.display = Number(s.dataset.step) === n ? 'block' : 'none');
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === n - 1);
        d.classList.toggle('done', i < n - 1);
      });
      document.getElementById('ppdb-form-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    form.addEventListener('click', async (e) => {
      const next = e.target.closest('[data-next]');
      const prev = e.target.closest('[data-prev]');
      if (next) {
        const ok = this.validateStep(this.step);
        if (!ok) { U.toast('Periksa kembali isian pada langkah ini', 'warning'); return; }
        if (this.step === 2) this.fillSummary();
        show(this.step + 1);
      }
      if (prev) show(this.step - 1);
    });

    /* Radio pill sudah ditangani CSS; radio asrama */
    /* Upload dokumen */
    form.querySelectorAll('input[type="file"][data-doc]').forEach(inp => {
      inp.addEventListener('change', async () => {
        const file = inp.files[0];
        const key = inp.dataset.doc;
        const zone = inp.closest('.dropzone');
        const nameEl = zone.querySelector('.doc-name');
        if (!file) { delete this.docs[key]; nameEl.textContent = ''; return; }
        const isPdf = file.type === 'application/pdf';
        const check = U.validateFile(file, { accept: isPdf ? ['application/pdf'] : ['image/jpeg', 'image/png', 'image/webp'], maxMB: isPdf ? 1 : 2 });
        if (check !== true) { U.toast(check, 'error'); inp.value = ''; nameEl.textContent = ''; return; }
        try {
          const data = isPdf ? await U.readFileAsDataURL(file) : await U.compressImage(file, 1100, .8);
          this.docs[key] = { name: file.name, type: file.type, size: file.size, data };
          nameEl.textContent = '\u2713 ' + file.name + ' (' + Math.round(file.size / 1024) + ' KB)';
          U.toast('Dokumen "' + file.name + '" siap diunggah');
        } catch (err) { U.toast(err.message, 'error'); }
      });
    });

    /* Submit final */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this.step !== 3) return;
      const data = Object.fromEntries(new FormData(form).entries());
      const allFields = [
        { key: 'full_name', label: 'Nama lengkap', required: true, min: 3 },
        { key: 'nisn', label: 'NISN', required: true, rules: [U.validators.regex(/^[0-9]{10}$/, 'NISN harus 10 digit angka')] },
        { key: 'birth_place', label: 'Tempat lahir', required: true },
        { key: 'birth_date', label: 'Tanggal lahir', required: true },
        { key: 'address', label: 'Alamat', required: true, min: 10 },
        { key: 'previous_school', label: 'Asal sekolah', required: true },
        { key: 'jenjang', label: 'Jenjang', required: true },
        { key: 'parent_name', label: 'Nama orang tua/wali', required: true, min: 3 },
        { key: 'parent_phone', label: 'No. HP/WA orang tua', required: true, type: 'tel' },
        { key: 'parent_email', label: 'Email orang tua', required: true, type: 'email' },
      ];
      const { ok, errors } = U.validateForm(allFields, data);
      if (!ok) { show(1); paintErrors(form, errors); U.toast('Periksa kembali data pendaftaran', 'warning'); return; }

      const need = ['akta', 'kk', 'foto'];
      const missing = need.filter(k => !this.docs[k]);
      if (missing.length) {
        show(3);
        U.toast('Dokumen wajib belum lengkap: ' + missing.join(', '), 'error');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.innerHTML = '<i data-lucide="loader-2"></i>Memproses…'; U.refreshIcons(btn);
      try {
        const tahun = (this.s.ppdb_tahun_ajaran || '').split('/')[0] || '2027';
        const reg = await Store.nextRegNumber(tahun);
        const payload = {
          reg_number: reg,
          full_name: data.full_name.trim(),
          nisn: data.nisn.trim(),
          gender: data.gender || 'L',
          birth_place: data.birth_place.trim(),
          birth_date: data.birth_date,
          address: data.address.trim(),
          previous_school: data.previous_school.trim(),
          jenjang: data.jenjang,
          asrama: data.asrama === 'ya',
          parent_name: data.parent_name.trim(),
          parent_phone: data.parent_phone.trim(),
          parent_email: data.parent_email.trim(),
          documents: Object.values(this.docs),
          status: 'menunggu', verified: false, notes: '',
        };
        await Store.insert('admissions', payload);
        this.showReceipt(payload);
        U.logActivity?.('PPDB: Pendaftaran baru', reg + ' — ' + payload.full_name);
      } catch (err) {
        U.toast('Gagal menyimpan pendaftaran: ' + err.message, 'error');
        btn.disabled = false; btn.innerHTML = '<i data-lucide="check-circle-2"></i>Kirim Pendaftaran'; U.refreshIcons(btn);
      }
    });
    show(1);
  },

  validateStep(n) {
    const form = document.getElementById('ppdb-form');
    const current = form.querySelector(`[data-step="${n}"]`);
    const fields = [...current.querySelectorAll('input[name],select[name],textarea[name]')];
    const data = Object.fromEntries(new FormData(form).entries());
    const defs = {
      1: [
        { key: 'full_name', label: 'Nama lengkap', required: true, min: 3 },
        { key: 'nisn', label: 'NISN', required: true, rules: [U.validators.regex(/^[0-9]{10}$/, 'NISN harus 10 digit angka')] },
        { key: 'birth_place', label: 'Tempat lahir', required: true },
        { key: 'birth_date', label: 'Tanggal lahir', required: true },
        { key: 'address', label: 'Alamat', required: true, min: 10 },
        { key: 'previous_school', label: 'Asal sekolah', required: true },
        { key: 'jenjang', label: 'Jenjang', required: true },
      ],
      2: [
        { key: 'parent_name', label: 'Nama orang tua/wali', required: true, min: 3 },
        { key: 'parent_phone', label: 'No. HP/WA orang tua', required: true, type: 'tel' },
        { key: 'parent_email', label: 'Email orang tua', required: true, type: 'email' },
        { key: 'agree', label: 'Pernyataan', required: true },
      ],
      3: [],
    };
    const { ok, errors } = U.validateForm(defs[n] || [], data);
    current.querySelectorAll('.field').forEach(f => {
      const input = f.querySelector('input,select,textarea');
      if (!input) return;
      const bad = !!errors[input.name];
      f.classList.toggle('has-err', bad);
      input.classList.toggle('err', bad);
      if (bad) f.querySelector('.msg').textContent = errors[input.name];
    });
    return ok;
  },

  fillSummary() {
    const form = document.getElementById('ppdb-form');
    const data = Object.fromEntries(new FormData(form).entries());
    const jenjangLabel = { TKIT: 'TKIT', SDIT: 'SDIT', SMPIT: 'SMPIT', SMAIT: 'SMAIT' }[data.jenjang] || data.jenjang;
    document.getElementById('sum-body').innerHTML = `
      <tr><td>Nama Calon Siswa</td><td><strong>${U.esc(data.full_name || '-')}</strong></td></tr>
      <tr><td>NISN</td><td>${U.esc(data.nisn || '-')}</td></tr>
      <tr><td>Jenis Kelamin</td><td>${data.gender === 'P' ? 'Perempuan' : 'Laki-laki'}</td></tr>
      <tr><td>Tempat/Tgl Lahir</td><td>${U.esc(data.birth_place || '-')}, ${U.fmtDate(data.birth_date, 'long')}</td></tr>
      <tr><td>Jenjang Didaftar</td><td>${U.esc(jenjangLabel)} \u00b7 Asrama: ${data.asrama === 'ya' ? 'Ya' : 'Tidak'}</td></tr>
      <tr><td>Asal Sekolah</td><td>${U.esc(data.previous_school || '-')}</td></tr>
      <tr><td>Orang Tua/Wali</td><td>${U.esc(data.parent_name || '-')} \u00b7 ${U.esc(data.parent_phone || '-')}</td></tr>
      <tr><td>Dokumen</td><td>${Object.keys(this.docs).length} berkas terlampir</td></tr>`;
  },

  showReceipt(p) {
    const wrap = document.getElementById('ppdb-form-area');
    wrap.innerHTML = `
      <div class="vm-card" id="receipt" style="max-width:640px;margin-inline:auto">
        <div class="vm-card__icon" style="background:linear-gradient(135deg,var(--success),#3ba870)"><i data-lucide="check-circle-2"></i></div>
        <h3>Alhamdulillah, Pendaftaran Berhasil!</h3>
        <p>Simpan nomor registrasi Anda untuk memantau status seleksi:</p>
        <div style="background:var(--cream-200);border:2px dashed var(--gold-500);border-radius:14px;padding:18px;text-align:center;margin-block:16px">
          <div class="small muted">NOMOR REGISTRASI</div>
          <div style="font-family:var(--font-head);font-size:34px;font-weight:800;color:var(--g-700);letter-spacing:.05em">${U.esc(p.reg_number)}</div>
        </div>
        <div class="table-wrap"><table class="table">
          <tr><td>Nama</td><td><strong>${U.esc(p.full_name)}</strong></td></tr>
          <tr><td>Jenjang</td><td>${U.esc(p.jenjang)}</td></tr>
          <tr><td>Status</td><td><span class="badge badge--warning">Menunggu Verifikasi</span></td></tr>
          <tr><td>Tanggal</td><td>${U.fmtDateTime(p.created_at || new Date().toISOString())}</td></tr>
        </table></div>
        <div class="flex gap-2 mt-3 flex-wrap">
          <button class="btn btn--primary" onclick="window.print()"><i data-lucide="printer"></i>Cetak Bukti</button>
          <a class="btn btn--outline" href="ppdb.html#status"><i data-lucide="search"></i>Cek Status Nanti</a>
        </div>
        <p class="small muted mt-2">Bukti pendaftaran juga telah dicatat di sistem. Panitia akan menghubungi Anda melalui WhatsApp ${U.esc(p.parent_phone)}.</p>
      </div>`;
    U.refreshIcons(wrap);
    wrap.scrollIntoView({ behavior: 'smooth' });
  },

  /* ---------- CEK STATUS ---------- */
  initStatusCheck() {
    const form = document.getElementById('status-form');
    if (!form) return;
    const out = document.getElementById('status-result');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const reg = document.getElementById('st-reg').value.trim();
      const bd = document.getElementById('st-birth').value;
      out.innerHTML = '<p class="muted"><i data-lucide="loader-2" style="width:16px;height:16px;display:inline-block;vertical-align:-3px"></i> Mencari data…</p>';
      U.refreshIcons(out);
      try {
        const { rows } = await Store.list('admissions', { filters: { reg_number: reg }, perPage: 1 });
        const a = rows[0];
        if (!a || String(a.birth_date) !== String(bd)) {
          out.innerHTML = '<div class="empty"><i data-lucide="file-question"></i><b>Data tidak ditemukan</b>Pastikan nomor registrasi dan tanggal lahir sesuai bukti pendaftaran.</div>';
          return;
        }
        const map = {
          menunggu: ['badge--warning', 'Menunggu Verifikasi', 'Berkas Anda sedang diverifikasi panitia (maksimal 2\u00d724 jam kerja).'],
          diverifikasi: ['badge--info', 'Berkas Terverifikasi', 'Dokumen lengkap. Silakan siapkan diri untuk tes seleksi sesuai jadwal.'],
          diterima: ['badge--success', 'LULUS SELEKSI', 'Selamat! Silakan lakukan daftar ulang sesuai jadwal yang diinformasikan panitia.'],
          ditolak: ['badge--red', 'Belum Lolos', a.notes || 'Anda dapat mendaftar kembali pada gelombang berikutnya.'],
        };
        const [cls, label, note] = map[a.status] || map.menunggu;
        out.innerHTML = `
          <div class="vm-card">
            <h3>${U.esc(a.full_name)} \u2014 ${U.esc(a.reg_number)}</h3>
            <p class="small muted">${U.esc(a.jenjang)} \u00b7 Daftar: ${U.fmtDate(a.created_at)}</p>
            <div class="mt-2"><span class="badge ${cls}" style="font-size:14px;padding:8px 18px">${label}</span></div>
            <p class="mt-2">${U.esc(note)}</p>
          </div>`;
      } catch (err) {
        out.innerHTML = `<div class="empty"><b>Gagal memuat</b>${U.esc(err.message)}</div>`;
      }
      U.refreshIcons(out);
    });
  },
};

window.Ppdb = Ppdb;
