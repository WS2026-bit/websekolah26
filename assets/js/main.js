/* =========================================================
 * MAIN.JS — Pengendali seluruh halaman publik
 * ========================================================= */
'use strict';

const Pages = {
  async boot(config) {
    await Store.init();
    await SiteShell.init(config);
    const fn = this[config.page];
    if (typeof fn === 'function') await fn.call(this);
    U.refreshIcons();
    U.setupReveals();
  },

  /* ================== KOMPONEN BERSAMA ================== */
  catName(id) { return (this._cats || []).find(c => c.id === id)?.name || 'Berita'; },

  async preloadCats() {
    const { rows } = await Store.list('categories', { orderBy: 'name', orderDir: 'asc' });
    this._cats = rows;
  },

  programCard(p, delay = 0) {
    return `
      <article class="pcard reveal" data-delay="${delay}">
        <div class="pcard__img">
          <img src="${U.esc(p.image || U.placeholder())}" alt="${U.esc(p.title)}" loading="lazy">
          <div class="pcard__icon"><i data-lucide="${U.esc(p.icon || 'sparkles')}"></i></div>
        </div>
        <div class="pcard__body">
          <span class="pcard__cat">${U.esc(this.programCatLabel(p.category))}</span>
          <h3 class="pcard__title">${U.esc(p.title)}</h3>
          <p class="pcard__excerpt">${U.esc(p.excerpt)}</p>
          <a href="program.html?prog=${U.esc(p.id)}" class="pcard__link">Selengkapnya <i data-lucide="arrow-right"></i></a>
        </div>
      </article>`;
  },

  programCatLabel(c) {
    return ({ akademik: 'Akademik', tahfizh: 'Tahfizh Al-Qur\u2019an', karakter: 'Karakter', kepemimpinan: 'Kepemimpinan',
      bahasa: 'Bahasa', internasional: 'Internasional', ekstrakurikuler: 'Ekstrakurikuler', boarding: 'Boarding' })[c] || 'Program';
  },

  newsCard(n, delay = 0) {
    const d = new Date(n.date);
    return `
      <article class="ncard reveal" data-delay="${delay}">
        <a class="ncard__img" href="detail-berita.html?slug=${U.esc(n.slug)}" aria-label="${U.esc(n.title)}">
          <img src="${U.esc(n.image || U.placeholder())}" alt="${U.esc(n.title)}" loading="lazy">
          <span class="ncard__date"><b>${isNaN(d) ? '-' : d.getDate()}</b><span>${isNaN(d) ? '' : U.monthName(d.getMonth()).slice(0, 3)}</span></span>
        </a>
        <div class="ncard__body">
          <div class="ncard__meta"><span class="cat">${U.esc(this.catName(n.category_id))}</span><span>\u00b7</span><span>${U.esc(n.author || 'Humas')}</span></div>
          <h3 class="ncard__title"><a href="detail-berita.html?slug=${U.esc(n.slug)}">${U.esc(n.title)}</a></h3>
          <p class="ncard__excerpt">${U.esc(U.truncate(n.excerpt, 110))}</p>
          <div class="ncard__foot">
            <span class="flex items-center gap-2"><i data-lucide="calendar-days"></i>${U.fmtDate(n.date)}</span>
            <a href="detail-berita.html?slug=${U.esc(n.slug)}">Baca <i data-lucide="arrow-right"></i></a>
          </div>
        </div>
      </article>`;
  },

  eventItem(e) {
    const d = new Date(e.date);
    return `
      <div class="evd">
        <div class="evd__date"><b>${isNaN(d) ? '-' : d.getDate()}</b><span>${isNaN(d) ? '' : U.monthName(d.getMonth()).slice(0, 3)}</span></div>
        <div class="evd__body">
          <h4>${U.esc(e.title)}</h4>
          <p class="small">${U.esc(U.truncate(e.description, 130))}</p>
          <div class="evd__meta">
            ${e.end_date && e.end_date !== e.date ? `<span><i data-lucide="calendar-range"></i>${U.fmtDate(e.date)} \u2013 ${U.fmtDate(e.end_date)}</span>` : `<span><i data-lucide="calendar-days"></i>${U.fmtDate(e.date, 'long')}</span>`}
            ${e.location ? `<span><i data-lucide="map-pin"></i>${U.esc(e.location)}</span>` : ''}
            ${e.category ? `<span><i data-lucide="tag"></i>${U.esc(e.category)}</span>` : ''}
          </div>
        </div>
      </div>`;
  },

  testimonialCard(t) {
    const stars = Array.from({ length: t.rating || 5 }, () => '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>').join('');
    const ava = t.photo
      ? `<img src="${U.esc(t.photo)}" alt="${U.esc(t.name)}" onerror="this.remove()">`
      : U.initials(t.name);
    return `
      <figure class="tcard-r">
        <div class="qmark"><svg viewBox="0 0 24 24"><path d="M10 8H6a4 4 0 0 0-4 4v6h6v-6H5.5A2.5 2.5 0 0 1 8 9.5V8h2zm12 0h-4a4 4 0 0 0-4 4v6h6v-6h-2.5A2.5 2.5 0 0 1 20 9.5V8h2z"/></svg></div>
        <div class="stars" aria-label="Rating ${t.rating || 5} dari 5">${stars}</div>
        <p>\u201c${U.esc(t.message)}\u201d</p>
        <figcaption class="tcard-r__who">
          <div class="tcard-r__ava">${ava}</div>
          <div><b>${U.esc(t.name)}</b><span>${U.esc(t.role)}</span></div>
        </figcaption>
      </figure>`;
  },

  /* ================== BERANDA ================== */
  async beranda() {
    const s = SiteShell.t();
    /* Hero */
    const hero = document.getElementById('hero');
    if (hero) {
      hero.querySelector('.hero__bg').innerHTML = `<img src="${U.esc(s.hero_image)}" alt="Kampus ${U.esc(s.school_name)}">`;
      hero.querySelector('.hero__badge').innerHTML = `<i data-lucide="award"></i>${U.esc(s.hero_badge)}`;
      hero.querySelector('h1').innerHTML = U.esc(s.hero_title).replace(/(Ilmu & Iman)/, '<em>$1</em>');
      hero.querySelector('.hero__lead').textContent = s.hero_subtitle;
    }

    /* Profil singkat */
    const about = document.getElementById('about-short');
    if (about) {
      document.getElementById('about-short-text').textContent = s.about_short;
      document.getElementById('about-short-img').src = window.IMG.kampus2;
    }

    /* Sambutan kepala sekolah di beranda */
    this.renderGreeting();

    /* Statistik */
    const statsHost = document.getElementById('stats-band');
    if (statsHost) {
      const st = s.stats || {};
      const items = [
        { n: st.students || 0, l: 'Siswa Aktif', i: 'users' },
        { n: st.teachers || 0, l: 'Guru & Staf', i: 'user-check' },
        { n: st.alumni || 0, l: 'Alumni', i: 'graduation-cap' },
        { n: st.achievements || 0, l: 'Prestasi Diraih', i: 'trophy' },
      ];
      statsHost.querySelector('.grid').innerHTML = items.map(x => `
        <div class="stat"><b data-count="${x.n}">0</b><span><i data-lucide="${x.i}"></i>${x.l}</span></div>`).join('');
      const io = new IntersectionObserver((ents) => {
        ents.forEach(en => {
          if (!en.isIntersecting) return;
          const b = en.target;
          U.animateCounter(b, Number(b.dataset.count) || 0);
          io.unobserve(b);
        });
      }, { threshold: .4 });
      statsHost.querySelectorAll('b[data-count]').forEach(b => io.observe(b));
    }

    /* Program unggulan */
    const { rows: programs } = await Store.list('programs', { orderBy: 'featured', orderDir: 'desc' });
    const featured = programs.filter(p => p.featured).slice(0, 3);
    const pgHost = document.getElementById('home-programs');
    if (pgHost) pgHost.innerHTML = (featured.length ? featured : programs.slice(0, 3)).map((p, i) => this.programCard(p, i)).join('');

    /* Prestasi terbaru */
    const { rows: achievements } = await Store.list('achievements', { orderBy: 'created_at', orderDir: 'desc' });
    const achHost = document.getElementById('home-achievements');
    if (achHost) {
      achHost.innerHTML = achievements.slice(0, 3).map((a, i) => `
        <div class="ach reveal" data-delay="${i}">
          <div class="ach__medal"><i data-lucide="${a.level === 'internasional' ? 'globe-2' : a.level === 'nasional' ? 'medal' : 'award'}"></i></div>
          <div class="ach__body">
            <div class="ach__meta">
              <span class="badge badge--gold">${U.esc(a.level)}</span><span class="badge badge--green">${U.esc(a.year)}</span>
            </div>
            <h4>${U.esc(a.title)}</h4>
            <p class="muted small">${U.esc(a.student_name)}</p>
          </div>
        </div>`).join('');
    }

    /* Berita terbaru */
    await this.preloadCats();
    const { rows: news } = await Store.list('news', { orderBy: 'date', orderDir: 'desc' });
    const nHost = document.getElementById('home-news');
    if (nHost) nHost.innerHTML = news.slice(0, 3).map((n, i) => this.newsCard(n, i)).join('');

    /* Agenda */
    const { rows: events } = await Store.list('events', { orderBy: 'date', orderDir: 'asc' });
    const upcoming = events.filter(e => new Date(e.date) >= new Date(new Date().toDateString())).slice(0, 4);
    const evHost = document.getElementById('home-events');
    if (evHost) evHost.innerHTML = (upcoming.length ? upcoming : events.slice(0, 4)).map(e => this.eventItem(e)).join('');

    /* Testimoni */
    const { rows: testimonials } = await Store.list('testimonials');
    const tHost = document.getElementById('home-testimonials');
    if (tHost) tHost.innerHTML = testimonials.map(t => this.testimonialCard(t)).join('');

    /* Galeri */
    const { rows: galleries } = await Store.list('galleries', { orderBy: 'date', orderDir: 'desc' });
    const gHost = document.getElementById('home-gallery');
    if (gHost) {
      gHost.innerHTML = galleries.filter(g => g.type === 'foto').slice(0, 8).map((g, i) => `
        <div class="gitem ${i === 0 ? 'gitem--wide' : ''} reveal" data-delay="${i % 4}">
          <img src="${U.esc(g.url)}" alt="${U.esc(g.title)}" loading="lazy">
          <div class="gitem__cap">${U.esc(g.title)}</div>
        </div>`).join('');
    }

    /* Sebaran alumni (bukti mutu lulusan) */
    this.renderAlumni();
    hero__scroll_fix();
  },

  /* ================== SEBARAN ALUMNI (beranda & profil) ==================
   * Data dari settings: alumni_lanjut_pct, alumni_ptn_pct, alumni_luar_pct,
   * alumni_hafiz_pct, alumni_universities[], alumni_career[], alumni_note.
   * Dikelola via Dashboard → Pengaturan → tab Alumni.
   * ======================================================================= */
  renderAlumni() {
    const host = document.getElementById('alumni-panel');
    if (!host) return;
    const s = SiteShell.t();
    const unis = (s.alumni_universities || []).filter(u => u.name);
    const max = Math.max(1, ...unis.map(u => Number(u.count) || 0));
    const career = (s.alumni_career || []).filter(c => c.label);
    const stats = [
      { v: Number(s.alumni_lanjut_pct) || 0, l: 'Lanjut ke Perguruan Tinggi', i: 'graduation-cap' },
      { v: Number(s.alumni_ptn_pct) || 0, l: 'Diterima PTN Favorit', i: 'landmark' },
      { v: Number(s.alumni_luar_pct) || 0, l: 'Kampus Luar Negeri', i: 'plane' },
      { v: Number(s.alumni_hafiz_pct) || 0, l: 'Lulusan Hafizh / Tahfizh', i: 'book-open-check' },
    ];

    host.innerHTML = `
      <div class="alumni">
        <div class="alstats">
          ${stats.map((x, i) => `
          <div class="alstat reveal" data-delay="${i % 4}">
            <span class="alstat__icon"><i data-lucide="${x.i}"></i></span>
            <b data-pct="${x.v}">0%</b>
            <span class="alstat__label">${U.esc(x.l)}</span>
            <span class="alstat__bar"><i data-w="${x.v}"></i></span>
          </div>`).join('')}
        </div>
        <div class="aluni reveal" data-delay="1">
          <h3><i data-lucide="map-pin"></i>Kampus Tujuan Lulusan</h3>
          ${unis.length ? unis.map(u => `
          <div class="aluni__row">
            <span class="aluni__name">
              <span class="badge ${u.type === 'luar' ? 'badge--gold' : 'badge--green'}">${u.type === 'luar' ? 'Luar Negeri' : 'Dalam Negeri'}</span>
              ${U.esc(u.name)}
            </span>
            <span class="aluni__n">${Number(u.count) || 0} <small>alumni</small></span>
            <span class="aluni__bar"><i style="width:${Math.round(((Number(u.count) || 0) / max) * 100)}%"></i></span>
          </div>`).join('') : '<p class="small muted">Belum ada data kampus tujuan.</p>'}
        </div>
      </div>
      ${career.length ? `
      <div class="alcareer reveal">
        <span class="alcareer__title"><i data-lucide="pie-chart"></i>Distribusi Karier Alumni</span>
        ${career.map(c => `<span class="alcareer__chip"><i data-lucide="${U.esc(c.icon || 'circle')}" style="width:15px;height:15px"></i>${U.esc(c.label)} <b>${Number(c.pct) || 0}%</b></span>`).join('')}
      </div>` : ''}
      ${s.alumni_note ? `<p class="alumni-note small muted">${U.esc(s.alumni_note)}</p>` : ''}

      <!-- CTA Mencari Jejak Alumni: alumni yang belum terekap mendaftarkan dirinya -->
      <div class="alumni-cta reveal">
        <div class="alumni-cta__text">
          <h3><i data-lucide="user-search"></i>Kamu alumni Al-Ihsan yang belum terdata?</h3>
          <p>Bantu sekolah melengkapi rekap resmi alumni — isi formulir <b>Mencari Jejak Alumni</b>, tim humas akan memverifikasinya.
          <b data-tracer-count>…</b> alumni telah mendaftar ulang melalui website ini.</p>
        </div>
        <a href="tracer-alumni.html" class="btn btn--gold"><i data-lucide="pen-line"></i>Isi Formulir Jejak Alumni</a>
      </div>`;

    U.refreshIcons(host);

    /* Animasi angka persen & bar statistik saat elemen terlihat */
    if (!('IntersectionObserver' in window)) {
      host.querySelectorAll('b[data-pct]').forEach(b => { b.textContent = b.dataset.pct + '%'; });
      host.querySelectorAll('.alstat__bar i').forEach(b => { b.style.width = b.dataset.w + '%'; });
      return;
    }
    const io = new IntersectionObserver((ents) => {
      ents.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.querySelectorAll('b[data-pct]').forEach(b => {
          const target = Number(b.dataset.pct) || 0;
          const t0 = performance.now(), dur = 1200;
          const step = (now) => {
            const p = Math.min(1, (now - t0) / dur);
            b.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + '%';
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
        en.target.querySelectorAll('.alstat__bar i').forEach(b => { b.style.width = (Number(b.dataset.w) || 0) + '%'; });
        io.unobserve(en.target);
      });
    }, { threshold: .3 });
    host.querySelectorAll('.alstat').forEach(el => io.observe(el));

    /* Hitung alumni yang mendaftar ulang via formulir Jejak Alumni (status terverifikasi) */
    Store.count('tracer_alumni', { status: 'terverifikasi' })
      .then(n => {
        const el = host.querySelector('[data-tracer-count]');
        if (el) el.textContent = U.fmtNum(n);
      })
      .catch(() => {});
  },

  /* Sambutan kepala sekolah (dipakai beranda & profil) */
  renderGreeting() {
    const s = SiteShell.t();
    const greet = document.getElementById('greeting');
    if (!greet) return;
    greet.querySelector('.greet__photo').innerHTML = s.headmaster_photo
      ? `<img src="${U.esc(s.headmaster_photo)}" alt="Foto ${U.esc(s.headmaster_name)}">`
      : `<div class="avatar-big">${U.initials(s.headmaster_name)}</div>`;
    greet.querySelector('.greet__quote').innerHTML = U.sanitizeHTML(s.headmaster_greeting);
    greet.querySelector('.greet__sign').innerHTML = `<b>${U.esc(s.headmaster_name)}</b><span>${U.esc(s.headmaster_title)} \u2014 ${U.esc(s.school_name)}</span>`;
  },

  /* ================== PROFIL ================== */
  async profil() {
    const s = SiteShell.t();

    /* Sambutan kepala sekolah */
    this.renderGreeting();

    /* Visi misi */
    const vm = document.getElementById('visi-misi');
    if (vm) {
      vm.querySelector('.vm-vision').innerHTML = `<blockquote>\u201c${U.esc(s.vision)}\u201d</blockquote>`;
      vm.querySelector('.vm-mission').innerHTML = `<ul class="mlist">${(s.missions || []).map(m => `<li>${U.esc(m)}</li>`).join('')}</ul>`;
    }

    /* Tujuan & nilai */
    const goals = document.getElementById('goals');
    if (goals) goals.innerHTML = `<ul class="mlist">${(s.goals || []).map(g => `<li>${U.esc(g)}</li>`).join('')}</ul>`;
    const vals = document.getElementById('values');
    if (vals) {
      const icons = ['moon-star', 'shield-check', 'book-open-text', 'heart-handshake', 'flag'];
      vals.innerHTML = (s.values || []).map((v, i) => `
        <div class="vcard reveal" data-delay="${i % 4}">
          <h4><i data-lucide="${icons[i % icons.length]}"></i>${U.esc(v.name)}</h4>
          <p>${U.esc(v.desc)}</p>
        </div>`).join('');
    }

    /* Sejarah & milestone */
    const hist = document.getElementById('history');
    if (hist) {
      hist.querySelector('.history-text').innerHTML = U.esc(s.history).split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
    }
    const tl = document.getElementById('history-timeline');
    if (tl) {
      tl.innerHTML = (s.milestones || []).map(m => `
        <div class="tl-item"><b>${U.esc(m.year)}</b><p>${U.esc(m.text)}</p></div>`).join('');
    }

    /* Struktur organisasi (tree) */
    const { rows: org } = await Store.list('organization', { orderBy: 'order', orderDir: 'asc' });
    const orgHost = document.getElementById('org-chart');
    if (orgHost) {
      const childrenOf = (pid) => org.filter(o => o.parent_id === pid);
      const nodeHtml = (o) => `<div class="org__node"><b>${U.esc(o.name)}</b><span>${U.esc(o.position)}</span></div>`;
      const build = (pid, level = 0) => {
        const kids = childrenOf(pid);
        if (!kids.length) return '';
        if (level === 0) return `<div class="org__connector"></div><div class="org__level">${kids.map(k => nodeHtml(k) + build(k.id, level + 1)).join('')}</div>`;
        return `<div class="org__connector"></div><div class="org__level">${kids.map(k => nodeHtml(k) + build(k.id, level + 1)).join('')}</div>`;
      };
      const roots = org.filter(o => !o.parent_id);
      orgHost.innerHTML = `<div class="org">${roots.map(r => `<div class="org__node root"><b>${U.esc(r.name)}</b><span>${U.esc(r.position)}</span></div>` + build(r.id, 0)).join('')}</div>`;
    }

    /* Guru & tendik */
    const { rows: staff } = await Store.list('staff');
    const leaders = staff.filter(x => x.type === 'pimpinan');
    const gurus = staff.filter(x => x.type === 'guru');
    const tendik = staff.filter(x => x.type === 'tendik');
    const staffCard = (x) => `
      <div class="tcard reveal">
        <div class="tcard__photo">${x.photo ? `<img src="${U.esc(x.photo)}" alt="${U.esc(x.name)}" onerror="this.remove()">` : U.initials(x.name)}</div>
        <h4>${U.esc(x.name)}</h4>
        <div class="pos">${U.esc(x.position)}</div>
        <div class="edu">${U.esc(x.education || '')}</div>
      </div>`;
    document.getElementById('staff-pimpinan').innerHTML = leaders.map(staffCard).join('') || '<div class="empty">Belum ada data</div>';
    document.getElementById('staff-guru').innerHTML = gurus.concat(tendik).map(staffCard).join('') || '<div class="empty">Belum ada data</div>';

    /* Fasilitas */
    const { rows: facilities } = await Store.list('facilities');
    const fHost = document.getElementById('facilities');
    if (fHost) fHost.innerHTML = facilities.map((f, i) => `
      <div class="fcard reveal" data-delay="${i % 4}">
        <div class="fcard__icon"><i data-lucide="${U.esc(f.icon || 'building')}"></i></div>
        <div><h4>${U.esc(f.name)}</h4><p>${U.esc(f.description)}</p></div>
      </div>`).join('');

    /* Sebaran alumni (bukti mutu lulusan) */
    this.renderAlumni();
  },

  /* ================== PROGRAM ================== */
  async program() {
    const { rows: programs } = await Store.list('programs', { orderBy: 'featured', orderDir: 'desc' });
    const cats = [...new Set(programs.map(p => p.category))];
    const chips = document.getElementById('program-filters');
    const grid = document.getElementById('program-grid');
    let active = 'all';

    const render = () => {
      const list = active === 'all' ? programs : programs.filter(p => p.category === active);
      grid.innerHTML = list.length
        ? list.map((p, i) => this.programCard(p, i % 4)).join('')
        : '<div class="empty" style="grid-column:1/-1"><i data-lucide="search-x"></i><b>Tidak ada program</b>Coba pilih kategori lain.</div>';
      U.refreshIcons(grid); U.setupReveals(grid);
    };
    chips.innerHTML = `<button class="chip active" data-cat="all">Semua Program</button>` +
      cats.map(c => `<button class="chip" data-cat="${U.esc(c)}">${U.esc(this.programCatLabel(c))}</button>`).join('');
    chips.addEventListener('click', (e) => {
      const b = e.target.closest('.chip'); if (!b) return;
      chips.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
      b.classList.add('active'); active = b.dataset.cat; render();
    });

    /* Detail via modal (?prog=) */
    const id = U.getParam('prog');
    const p = programs.find(x => x.id === id);
    if (p) this.openProgramModal(p);
    grid.addEventListener('click', (e) => {
      const a = e.target.closest('.pcard__link'); if (!a) return;
      e.preventDefault();
      const target = programs.find(x => x.id === a.getAttribute('href').split('=')[1]);
      if (target) this.openProgramModal(target);
    });
    render();
  },

  openProgramModal(p) {
    document.getElementById('modal-program')?.remove();
    const ov = document.createElement('div');
    ov.className = 'modal-overlay'; ov.id = 'modal-program';
    ov.innerHTML = `
      <div class="modal modal--lg" role="dialog" aria-modal="true" aria-label="${U.esc(p.title)}">
        <div class="modal__head"><h3>${U.esc(p.title)}</h3><button class="icon-btn" data-close aria-label="Tutup"><i data-lucide="x"></i></button></div>
        <div class="modal__body">
          <img src="${U.esc(p.image || U.placeholder())}" alt="${U.esc(p.title)}" style="border-radius:14px;margin-bottom:18px;aspect-ratio:16/8;object-fit:cover;width:100%">
          <span class="badge badge--gold mb-2">${U.esc(this.programCatLabel(p.category))}</span>
          <div class="article">${U.sanitizeHTML(p.description || '')}</div>
        </div>
        <div class="modal__foot">
          <a class="btn btn--primary" href="ppdb.html"><i data-lucide="pen-line"></i>Daftar Sekarang</a>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('[data-close]')) ov.remove(); });
    U.refreshIcons(ov);
  },

  /* ================== AKADEMIK ================== */
  async akademik() {
    const { rows: events } = await Store.list('events', { orderBy: 'date', orderDir: 'asc' });
    const cal = events.filter(e => ['Akademik', 'Kesiswaan'].includes(e.category) && new Date(e.date) >= new Date(new Date().toDateString())).slice(0, 6);
    const host = document.getElementById('akademik-calendar');
    if (host) host.innerHTML = cal.length ? cal.map(e => this.eventItem(e)).join('')
      : '<div class="empty"><i data-lucide="calendar-x"></i><b>Belum ada agenda terdekat</b>Jadwal akan diperbarui oleh sekolah.</div>';
  },

  /* ================== PRESTASI ================== */
  async prestasi() {
    const { rows: achievements } = await Store.list('achievements', { orderBy: 'year', orderDir: 'desc' });
    const chipLevel = document.getElementById('ach-level');
    const grid = document.getElementById('ach-grid');
    let level = 'all', type = 'all';

    const render = () => {
      const list = achievements.filter(a => (level === 'all' || a.level === level) && (type === 'all' || a.type === type));
      grid.innerHTML = list.length ? list.map((a, i) => `
        <div class="ach reveal" data-delay="${i % 4}">
          <div class="ach__medal"><i data-lucide="${a.level === 'internasional' ? 'globe-2' : a.level === 'nasional' ? 'medal' : 'award'}"></i></div>
          <div class="ach__body">
            <div class="ach__meta">
              <span class="badge ${a.level === 'internasional' ? 'badge--gold' : a.level === 'nasional' ? 'badge--green' : 'badge--info'}">${U.esc(a.level)}</span>
              <span class="badge badge--warning">${U.esc(a.type)}</span><span class="badge badge--success">${U.esc(a.year)}</span>
            </div>
            <h4>${U.esc(a.title)}</h4>
            <p class="muted small" style="font-weight:700;color:var(--g-600)">${U.esc(a.student_name)}</p>
            <p>${U.esc(a.description)}</p>
          </div>
        </div>`).join('')
        : '<div class="empty" style="grid-column:1/-1"><i data-lucide="trophy"></i><b>Belum ada prestasi</b>pada filter ini.</div>';
      U.refreshIcons(grid); U.setupReveals(grid);
    };

    chipLevel.addEventListener('click', (e) => {
      const b = e.target.closest('.chip'); if (!b) return;
      chipLevel.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
      b.classList.add('active'); level = b.dataset.level; render();
    });
    document.getElementById('ach-type').addEventListener('change', (e) => { type = e.target.value; render(); });
    render();
  },

  /* ================== BERITA ================== */
  async berita() {
    await this.preloadCats();
    const state = { search: '', cat: 'all', page: 1, perPage: 6 };
    const grid = document.getElementById('news-grid');
    const pag = document.getElementById('news-pagination');
    const info = document.getElementById('news-info');

    /* Isi chip kategori */
    document.getElementById('news-cats').innerHTML =
      `<button class="chip active" data-cat="all">Semua</button>` +
      this._cats.map(c => `<button class="chip" data-cat="${U.esc(c.id)}">${U.esc(c.name)}</button>`).join('');

    const render = async () => {
      const res = await Store.list('news', {
        search: state.search, searchKeys: ['title', 'excerpt'],
        filters: state.cat === 'all' ? {} : { category_id: state.cat },
        orderBy: 'date', orderDir: 'desc',
        page: state.page, perPage: state.perPage,
      });
      grid.innerHTML = res.rows.length ? res.rows.map((n, i) => this.newsCard(n, i % 3)).join('')
        : '<div class="empty" style="grid-column:1/-1"><i data-lucide="newspaper"></i><b>Berita tidak ditemukan</b>Coba kata kunci atau kategori lain.</div>';
      info.textContent = `Menampilkan ${res.rows.length} dari ${res.total} berita`;
      /* Pagination */
      let html = `<button ${res.page <= 1 ? 'disabled' : ''} data-go="${res.page - 1}" aria-label="Sebelumnya"><i data-lucide="chevron-left"></i></button>`;
      for (let p = 1; p <= res.pages; p++) html += `<button class="${p === res.page ? 'active' : ''}" data-go="${p}">${p}</button>`;
      html += `<button ${res.page >= res.pages ? 'disabled' : ''} data-go="${res.page + 1}" aria-label="Berikutnya"><i data-lucide="chevron-right"></i></button>`;
      pag.innerHTML = html;
      U.refreshIcons(grid); U.refreshIcons(pag); U.setupReveals(grid);
    };

    document.getElementById('news-search').addEventListener('input', U.debounce((e) => {
      state.search = e.target.value.trim(); state.page = 1; render();
    }, 300));
    document.getElementById('news-cats').addEventListener('click', (e) => {
      const b = e.target.closest('.chip'); if (!b) return;
      document.querySelectorAll('#news-cats .chip').forEach(x => x.classList.remove('active'));
      b.classList.add('active'); state.cat = b.dataset.cat; state.page = 1; render();
    });
    pag.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-go]'); if (!b || b.disabled) return;
      state.page = Number(b.dataset.go); render();
      window.scrollTo({ top: document.getElementById('berita-list').offsetTop - 90, behavior: 'smooth' });
    });
    render();
  },

  /* ================== DETAIL BERITA ================== */
  async 'detail-berita'() {
    await this.preloadCats();
    const slug = U.getParam('slug');
    const { rows: all } = await Store.list('news', { orderBy: 'date', orderDir: 'desc' });
    const n = all.find(x => x.slug === slug) || all.find(x => x.id === slug);
    const host = document.getElementById('article-wrap');

    if (!n) {
      host.innerHTML = '<div class="empty"><i data-lucide="file-question"></i><b>Artikel tidak ditemukan</b><a class="btn btn--primary btn--sm mt-2" href="berita.html">Kembali ke Berita</a></div>';
      return;
    }
    SiteShell.config.pageTitle = n.title;
    document.title = `${n.title} \u2014 ${SiteShell.t().short_name}`;

    /* Tambah view */
    Store.update('news', n.id, { views: (n.views || 0) + 1 }).catch(() => {});

    host.innerHTML = `
      <article class="article">
        <div class="ncard__meta mb-2">
          <span class="cat">${U.esc(this.catName(n.category_id))}</span><span>\u00b7</span>
          <span><i data-lucide="calendar-days" style="width:14px;height:14px;display:inline-block;vertical-align:-2px"></i> ${U.fmtDate(n.date, 'long')}</span><span>\u00b7</span>
          <span>${U.esc(n.author || 'Humas')}</span><span>\u00b7</span>
          <span>${U.fmtNum((n.views || 0) + 1)} dibaca</span>
        </div>
        <h1 style="font-size:clamp(24px,4vw,36px);margin-bottom:18px">${U.esc(n.title)}</h1>
        <img src="${U.esc(n.image || U.placeholder())}" alt="${U.esc(n.title)}" style="width:100%;aspect-ratio:16/8;object-fit:cover">
        <p class="muted" style="font-size:17px;font-style:italic;border-left:4px solid var(--gold-500);padding-left:16px;margin-block:22px">${U.esc(n.excerpt)}</p>
        ${U.sanitizeHTML(n.content)}
      </article>`;

    /* Bagikan */
    const url = location.href; const text = n.title;
    document.getElementById('share-row').innerHTML = `
      <span>Bagikan:</span>
      <a href="${U.esc(U.waLink(SiteShell.t().whatsapp, text + ' \u2014 ' + url))}" target="_blank" rel="noopener" aria-label="WhatsApp"><i data-lucide="message-circle"></i></a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener" aria-label="Facebook"><i data-lucide="facebook"></i></a>
      <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}" target="_blank" rel="noopener" aria-label="X"><i data-lucide="twitter"></i></a>
      <button id="copy-link" aria-label="Salin tautan"><i data-lucide="link-2"></i></button>`;
    document.getElementById('copy-link').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(url); U.toast('Tautan berhasil disalin'); }
      catch (e) { U.toast('Gagal menyalin tautan', 'error'); }
    });

    /* Terkait */
    const rel = all.filter(x => x.id !== n.id && x.category_id === n.category_id).slice(0, 3);
    const relAlt = all.filter(x => x.id !== n.id && x.category_id !== n.category_id).slice(0, 3 - rel.length);
    document.getElementById('related-news').innerHTML = (rel.length ? rel : relAlt).map(x => this.newsCard(x)).join('');
    U.refreshIcons(host);
  },

  /* ================== GALERI ================== */
  async galeri() {
    const { rows: galleries } = await Store.list('galleries', { orderBy: 'date', orderDir: 'desc' });
    const grid = document.getElementById('gallery-grid');
    const chips = document.getElementById('gallery-filters');
    const cats = [...new Set(galleries.map(g => g.category))];
    let type = 'all', cat = 'all';
    let items = [];

    const render = () => {
      items = galleries.filter(g => (type === 'all' || g.type === type) && (cat === 'all' || g.category === cat));
      grid.innerHTML = items.length ? items.map((g, i) => `
        <div class="gitem ${i % 7 === 0 ? 'gitem--wide' : ''} reveal" data-delay="${i % 4}" data-idx="${i}" tabindex="0" role="button" aria-label="Lihat ${U.esc(g.title)}">
          ${g.type === 'video' ? '<span class="gitem__type"><i data-lucide="play"></i></span>' : ''}
          ${g.type === 'video'
            ? `<img src="https://i.ytimg.com/vi/${U.esc(g.url.split('/embed/')[1] || '')}/hqdefault.jpg" alt="${U.esc(g.title)}" loading="lazy" onerror="this.src=U.placeholder()">`
            : `<img src="${U.esc(g.url)}" alt="${U.esc(g.title)}" loading="lazy">`}
          <div class="gitem__cap">${U.esc(g.title)}</div>
        </div>`).join('')
        : '<div class="empty" style="grid-column:1/-1"><i data-lucide="images"></i><b>Tidak ada dokumentasi</b>pada filter ini.</div>';
      U.refreshIcons(grid); U.setupReveals(grid);
    };

    const chipHtml = `<button class="chip active" data-type="all" data-cat="all">Semua</button>
      <button class="chip" data-type="foto" data-cat="all">Foto</button>
      <button class="chip" data-type="video" data-cat="all">Video</button>
      <span style="width:1px;background:var(--border);margin:4px 6px"></span>` +
      cats.map(c => `<button class="chip" data-type="all" data-cat="${U.esc(c)}">${U.esc(c)}</button>`).join('');
    chips.innerHTML = chipHtml;
    chips.addEventListener('click', (e) => {
      const b = e.target.closest('.chip'); if (!b) return;
      chips.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      type = b.dataset.type; cat = b.dataset.cat; render();
    });

    /* Lightbox */
    const lb = document.getElementById('lightbox');
    const openLb = (idx) => {
      const g = items[idx]; if (!g) return;
      lb.querySelector('.lightbox__media').innerHTML = g.type === 'video'
        ? `<iframe src="${U.esc(g.url)}" title="${U.esc(g.title)}" allowfullscreen loading="lazy"></iframe>`
        : `<img src="${U.esc(g.url)}" alt="${U.esc(g.title)}">`;
      lb.querySelector('.lightbox__cap').textContent = `${g.title} \u2014 ${U.fmtDate(g.date)}`;
      lb.classList.add('open');
      lb.dataset.idx = idx;
      document.body.style.overflow = 'hidden';
    };
    const closeLb = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
    grid.addEventListener('click', (e) => { const it = e.target.closest('.gitem'); if (it) openLb(Number(it.dataset.idx)); });
    grid.addEventListener('keydown', (e) => { const it = e.target.closest('.gitem'); if (it && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openLb(Number(it.dataset.idx)); } });
    lb.querySelector('.lightbox__close').addEventListener('click', closeLb);
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
    lb.querySelector('[data-prev]').addEventListener('click', () => openLb((Number(lb.dataset.idx) - 1 + items.length) % items.length));
    lb.querySelector('[data-next]').addEventListener('click', () => openLb((Number(lb.dataset.idx) + 1) % items.length));
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') openLb((Number(lb.dataset.idx) - 1 + items.length) % items.length);
      if (e.key === 'ArrowRight') openLb((Number(lb.dataset.idx) + 1) % items.length);
    });
    render();
  },

  /* ================== TRACER ALUMNI (Mencari Jejak Alumni) ==================
   * Alumni yang belum terekap mengisi datanya sendiri; data berstatus
   * 'menunggu' dan diverifikasi petugas di Dashboard → Alumni → Jejak Alumni.
   * ========================================================================== */
  async tracer() {
    const s = SiteShell.t();
    const form = document.getElementById('tracer-form');

    /* Tahun lulus: dari tahun berjalan mundur sampai 2005 (tahun SDIT pertama) */
    const yearSel = form.querySelector('[name="grad_year"]');
    const yNow = new Date().getFullYear();
    for (let y = yNow; y >= 2005; y--) yearSel.insertAdjacentHTML('beforeend', `<option value="${y}">${y}</option>`);

    /* Kontak humas pada kartu bantuan */
    const contact = document.getElementById('tracer-contact');
    if (contact) {
      contact.innerHTML = `<a href="${U.esc(U.waLink(s.whatsapp, 'Assalamualaikum, saya alumni Al-Ihsan, mau bantuan isi formulir Jejak Alumni'))}" target="_blank" rel="noopener" style="color:var(--g-600);font-weight:700">WhatsApp Humas</a>`;
    }

    /* Ringkasan rekap alumni */
    const [nVerified, nMentor, nWait] = await Promise.all([
      Store.count('tracer_alumni', { status: 'terverifikasi' }),
      Store.count('tracer_alumni', { willing_mentor: true, status: 'terverifikasi' }),
      Store.count('tracer_alumni', { status: 'menunggu' }),
    ]);
    const totalAlumni = (s.stats && Number(s.stats.alumni)) || 0;
    const statsHost = document.getElementById('tracer-stats');
    if (statsHost) {
      statsHost.innerHTML = `
        <div class="tstat"><i data-lucide="graduation-cap"></i><div><b>${U.fmtNum(totalAlumni)}</b><span>Total alumni tercatat sekolah</span></div></div>
        <div class="tstat"><i data-lucide="user-check"></i><div><b>${U.fmtNum(nVerified)}</b><span>Alumni mendaftar ulang via website (terverifikasi)</span></div></div>
        <div class="tstat"><i data-lucide="handshake"></i><div><b>${U.fmtNum(nMentor)}</b><span>Bersedia menjadi mentor alumni</span></div></div>`;
      if (nWait > 0) statsHost.innerHTML += `
        <div class="tstat"><i data-lucide="hourglass"></i><div><b>${U.fmtNum(nWait)}</b><span>Sedang menunggu verifikasi humas</span></div></div>`;
      U.refreshIcons(statsHost);
    }

    /* Kirim formulir */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      data.willing_mentor = form.querySelector('[name="willing_mentor"]').checked;
      data.consent = form.querySelector('[name="consent"]').checked;

      /* Honeypot anti-spam: bot yang mengisi kolom tersembunyi dianggap gagal diam-diam */
      if (String(data.website || '').trim() !== '') { form.reset(); U.toast('Terima kasih.'); return; }
      delete data.website;

      const fields = [
        { key: 'full_name', label: 'Nama Lengkap', required: true, min: 3 },
        { key: 'jenjang', label: 'Jenjang', required: true },
        { key: 'grad_year', label: 'Tahun Lulus', required: true, rules: [v => v && Number(v) >= 2005 && Number(v) <= yNow || 'Pilih tahun lulus yang valid'] },
        { key: 'whatsapp', label: 'No. WhatsApp', required: true, type: 'tel' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'current_status', label: 'Status Saat Ini', required: true },
        { key: 'institution', label: 'Instansi', required: true, min: 2 },
      ];
      const { ok, errors } = U.validateForm(fields, data);
      if (!data.consent) errors.consent = 'Persetujuan wajib dicentang';
      paintErrors(form, errors);
      if (!ok || !data.consent) { U.toast('Periksa kembali isian formulir', 'warning'); return; }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.innerHTML = '<i data-lucide="loader-2"></i>Mengirim…'; U.refreshIcons(btn);
      try {
        await Store.insert('tracer_alumni', {
          full_name: String(data.full_name).trim(),
          jenjang: data.jenjang,
          grad_year: Number(data.grad_year),
          whatsapp: String(data.whatsapp).trim(),
          email: String(data.email || '').trim(),
          current_status: data.current_status,
          institution: String(data.institution).trim(),
          major_position: String(data.major_position || '').trim(),
          city_country: String(data.city_country || '').trim(),
          hafiz_juz: data.hafiz_juz === '' ? null : Number(data.hafiz_juz),
          willing_mentor: data.willing_mentor,
          message: String(data.message || '').trim(),
          consent: true,
          status: 'menunggu',
        });
        U.logActivity('Jejak Alumni (publik)', data.full_name);
        form.reset();
        U.toast('Data terkirim! Menunggu verifikasi tim humas. Barakallah.');
        const okEl = form.querySelector('.form-success');
        okEl.style.display = 'flex';
        okEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => okEl.style.display = 'none', 8000);
      } catch (err) {
        U.toast('Gagal mengirim data: ' + err.message, 'error');
      } finally {
        btn.disabled = false; btn.innerHTML = '<i data-lucide="send"></i>Kirim Data Alumni'; U.refreshIcons(btn);
      }
    });
  },

  async kontak() {
    const s = SiteShell.t();
    document.getElementById('contact-info').innerHTML = `
      <div class="fcard"><div class="fcard__icon"><i data-lucide="map-pin"></i></div><div><h4>Alamat</h4><p>${U.esc(s.address)}</p></div></div>
      <div class="fcard"><div class="fcard__icon"><i data-lucide="phone"></i></div><div><h4>Telepon & WhatsApp</h4><p>${U.esc(s.phone)} \u00b7 <a href="${U.esc(U.waLink(s.whatsapp))}" target="_blank" rel="noopener" style="color:var(--g-600);font-weight:700">Chat WhatsApp</a></p></div></div>
      <div class="fcard"><div class="fcard__icon"><i data-lucide="mail"></i></div><div><h4>Email</h4><p>${U.esc(s.email)} \u00b7 PPDB: ${U.esc(s.ppdb_email || s.email)}</p></div></div>
      <div class="fcard"><div class="fcard__icon"><i data-lucide="clock"></i></div><div><h4>Jam Layanan</h4><p>Senin\u2013Sabtu, 07.00\u201316.00 WIB</p></div></div>`;

    const mapHost = document.getElementById('contact-map');
    if (mapHost) mapHost.innerHTML = `<iframe src="${U.esc(s.maps_embed)}" width="100%" height="420" style="border:0;border-radius:18px" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" title="Peta lokasi ${U.esc(s.school_name)}"></iframe>`;

    /* Form pesan */
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const fields = [
        { key: 'name', label: 'Nama', required: true, min: 3 },
        { key: 'email', label: 'Email', required: true, type: 'email' },
        { key: 'phone', label: 'No. HP/WA', type: 'tel' },
        { key: 'subject', label: 'Subjek', required: true },
        { key: 'message', label: 'Pesan', required: true, min: 10 },
      ];
      const { ok, errors } = U.validateForm(fields, data);
      paintErrors(form, errors);
      if (!ok) { U.toast('Periksa kembali isian formulir', 'warning'); return; }
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.innerHTML = '<i data-lucide="loader-2"></i>Mengirim…'; U.refreshIcons(btn);
      try {
        await Store.insert('messages', { ...data, read: false });
        form.reset();
        U.toast('Pesan terkirim! Kami akan membalas secepatnya. Barakallah.');
        form.querySelector('.form-success').style.display = 'flex';
        setTimeout(() => form.querySelector('.form-success').style.display = 'none', 6000);
      } catch (err) {
        U.toast('Gagal mengirim pesan: ' + err.message, 'error');
      } finally {
        btn.disabled = false; btn.innerHTML = '<i data-lucide="send"></i>Kirim Pesan'; U.refreshIcons(btn);
      }
    });
  },

  /* ================== FAQ ================== */
  async faq() {
    const { rows: faqs } = await Store.list('faqs', { orderBy: 'order', orderDir: 'asc' });
    const host = document.getElementById('faq-list');
    const render = (list) => {
      host.innerHTML = list.length ? list.map(f => `
        <div class="acc">
          <button class="acc__q" aria-expanded="false">
            <span><span class="badge badge--gold" style="margin-right:10px">${U.esc(f.category)}</span>${U.esc(f.question)}</span>
            <i data-lucide="plus"></i>
          </button>
          <div class="acc__a"><div class="acc__a-inner">${U.esc(f.answer)}</div></div>
        </div>`).join('')
        : '<div class="empty"><i data-lucide="search-x"></i><b>Tidak ditemukan</b>Coba kata kunci lain.</div>';
      U.refreshIcons(host);
    };
    host.addEventListener('click', (e) => {
      const q = e.target.closest('.acc__q'); if (!q) return;
      const acc = q.parentElement;
      const open = acc.classList.toggle('open');
      q.setAttribute('aria-expanded', open);
      acc.querySelector('.acc__a').style.maxHeight = open ? acc.querySelector('.acc__a-inner').scrollHeight + 'px' : '0';
    });
    document.getElementById('faq-search').addEventListener('input', U.debounce((e) => {
      const q = e.target.value.trim().toLowerCase();
      render(q ? faqs.filter(f => (f.question + ' ' + f.answer).toLowerCase().includes(q)) : faqs);
    }, 250));
    render(faqs);
  },
};

/* Utilitas penanda error form (dipakai lintas halaman) */
function paintErrors(form, errors) {
  form.querySelectorAll('.field').forEach(f => {
    const input = f.querySelector('input,select,textarea');
    if (!input) return;
    const key = input.name;
    f.classList.toggle('has-err', !!errors[key]);
    input.classList.toggle('err', !!errors[key]);
    if (errors[key]) f.querySelector('.msg').textContent = errors[key];
  });
}
function hero__scroll_fix() { /* dipanggil agar ikon scroll hero ter-render */ U.refreshIcons(); }

window.Pages = Pages;
window.paintErrors = paintErrors;
