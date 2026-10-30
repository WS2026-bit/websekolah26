/* =========================================================
 * COMPONENTS.JS — Kerangka halaman publik
 * Header, navigasi, footer, breadcrumb, WhatsApp float,
 * tombol ke atas, dark mode, JSON-LD & loading screen.
 * ========================================================= */
'use strict';

const SiteShell = {
  settings: null,

  async init(config = {}) {
    this.config = Object.assign({ page: 'beranda', title: '', breadcrumb: [] }, config);
    this.settings = await Store.getSettings();
    this.renderLoader();
    this.renderHeader();
    this.renderBreadcrumb();
    this.renderFooter();
    this.renderFloating();
    this.applySEO();
    this.bindGlobal();
    this.setTheme(localStorage.getItem('al_ihsan_theme') || 'light');
    requestAnimationFrame(() => document.getElementById('app-loader')?.classList.add('done'));
  },

  t() { return this.settings; },

  /**
   * Sesi login aktif (jika ada).
   * Dibaca langsung dari sessionStorage agar ringan — tidak perlu menunggu Store.init().
   * return: { userId, email, name, role, ... } | null
   */
  session() {
    try { return JSON.parse(sessionStorage.getItem('al_ihsan_session')) || null; }
    catch (e) { return null; }
  },

  /** Keluar dari sesi (dipakai tombol logout di drawer) */
  logout() {
    if (window.Auth) Auth.logout();
    else sessionStorage.removeItem('al_ihsan_session');
  },

  /* ---------- LOADER ---------- */
  renderLoader() {
    if (document.getElementById('app-loader')) return;
    const el = document.createElement('div');
    el.className = 'app-loader';
    el.id = 'app-loader';
    el.innerHTML = `<div class="ring">${U.initials(this.t().short_name)}</div><span>Memuat…</span>`;
    document.body.prepend(el);
  },

  /* ---------- HEADER ---------- */
  renderHeader() {
    const s = this.t();
    const ses = this.session(); // null = belum login
    const loginHref = 'admin/login.html';
    const dashHref = 'admin/dashboard.html';
    const host = document.getElementById('site-header');
    if (!host) return;
    host.innerHTML = `
      <div class="topbar">
        <div class="container">
          <div class="topbar__left">
            <a href="tel:${U.esc(s.phone)}"><i data-lucide="phone"></i><span>${U.esc(s.phone)}</span></a>
            <a href="mailto:${U.esc(s.email)}" class="hide-sm"><i data-lucide="mail"></i><span>${U.esc(s.email)}</span></a>
          </div>
          <div class="topbar__right">
            <div class="topbar__social">
              ${s.instagram ? `<a href="${U.esc(s.instagram)}" target="_blank" rel="noopener" aria-label="Instagram"><i data-lucide="instagram"></i></a>` : ''}
              ${s.facebook ? `<a href="${U.esc(s.facebook)}" target="_blank" rel="noopener" aria-label="Facebook"><i data-lucide="facebook"></i></a>` : ''}
              ${s.youtube ? `<a href="${U.esc(s.youtube)}" target="_blank" rel="noopener" aria-label="YouTube"><i data-lucide="youtube"></i></a>` : ''}
            </div>
            <a href="${U.esc(U.waLink(s.whatsapp, 'Assalamualaikum, saya ingin bertanya tentang ' + s.short_name))}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i><span>WhatsApp</span></a>
          </div>
        </div>
      </div>
      <div class="header" id="header-bar">
        <div class="container navbar">
          <a class="brand" href="index.html" aria-label="${U.esc(s.school_name)}">
            <img src="${U.esc(U.asset(s.logo))}" alt="Logo ${U.esc(s.school_name)}" onerror="this.onerror=null;this.src=U.placeholder();">
            <span class="brand__text">
              <span class="brand__name brand__name--full">${U.esc(s.school_name)}</span>
              <span class="brand__name brand__name--short">${U.esc(s.short_name)}</span>
              <span class="brand__tag">${U.esc(String(s.jenjang || '').split('\u2014')[0].trim())}</span>
            </span>
          </a>
          <nav class="nav" aria-label="Navigasi utama">
            <ul class="nav__list">
              ${this.navItems().map(i => `<li><a class="nav__link ${i.page === this.config.page ? 'active' : ''}" href="${i.href}">${i.label}</a></li>`).join('')}
            </ul>
          </nav>
          <div class="nav-actions">
            <button class="icon-btn" id="theme-toggle" aria-label="Ganti mode gelap/terang"><i data-lucide="moon"></i></button>
            ${/* SATU-SATUNYA titik login: ikon di layar kecil, teks penuh di desktop (>=1200px) */ses
              ? `<a href="${dashHref}" class="nav-login nav-login--in" title="Dashboard — ${U.esc(ses.name)} (${U.esc(ses.role)})" aria-label="Buka Dashboard"><i data-lucide="layout-dashboard"></i><span class="nl-text">Dashboard</span></a>`
              : `<a href="${loginHref}" class="nav-login" title="Login Admin" aria-label="Login Admin"><i data-lucide="log-in"></i><span class="nl-text">Login</span></a>`}
            <a href="ppdb.html" class="btn btn--gold btn--sm nav-cta">Daftar PPDB</a>
            <button class="icon-btn burger" id="burger" aria-label="Buka menu" aria-expanded="false"><i data-lucide="menu"></i></button>
          </div>
        </div>
      </div>`;

    /* Drawer mobile */
    const dr = document.createElement('div');
    dr.className = 'drawer'; dr.id = 'mobile-drawer';
    dr.innerHTML = `
      <div class="drawer__overlay" data-close></div>
      <aside class="drawer__panel" role="dialog" aria-label="Menu navigasi">
        <div class="drawer__head">
          <a class="brand" href="index.html">
            <img src="${U.esc(U.asset(s.logo))}" alt="Logo" onerror="this.onerror=null;this.src=U.placeholder();">
            <span class="brand__text"><span class="brand__name" style="font-size:15px">${U.esc(s.short_name)}</span></span>
          </a>
          <button class="icon-btn" data-close aria-label="Tutup menu"><i data-lucide="x"></i></button>
        </div>
        <ul class="drawer__nav">
          ${this.navItems().map(i => `<li><a href="${i.href}" class="${i.page === this.config.page ? 'active' : ''}"><i data-lucide="${i.icon}"></i>${i.label}</a></li>`).join('')}
        </ul>
        <div class="drawer__foot">
          <a href="ppdb.html" class="btn btn--gold btn--block"><i data-lucide="pen-line"></i>Pendaftaran Online</a>
          ${ses ? `<button type="button" class="btn btn--outline btn--block" id="drawer-logout"><i data-lucide="log-out"></i>Keluar (${U.esc(ses.name)})</button>` : ''}
          <a href="${U.esc(U.waLink(s.whatsapp))}" target="_blank" rel="noopener" class="btn btn--outline btn--block"><i data-lucide="message-circle"></i>Hubungi Kami</a>
        </div>
      </aside>`;
    document.body.appendChild(dr);

    /* Logout dari drawer publik */
    dr.querySelector('#drawer-logout')?.addEventListener('click', () => {
      this.logout();
      U.toast('Anda telah keluar dari dashboard.', 'info');
      setTimeout(() => location.reload(), 500);
    });

    const burger = document.getElementById('burger');
    burger?.addEventListener('click', () => { dr.classList.add('open'); burger.setAttribute('aria-expanded', 'true'); });
    dr.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => { dr.classList.remove('open'); burger?.setAttribute('aria-expanded', 'false'); }));
    U.refreshIcons(host);
    U.refreshIcons(dr);
  },

  navItems() {
    return [
      { page: 'beranda', label: 'Beranda', href: 'index.html', icon: 'home' },
      { page: 'profil', label: 'Profil', href: 'profil.html', icon: 'building-2' },
      { page: 'program', label: 'Program', href: 'program.html', icon: 'sparkles' },
      { page: 'akademik', label: 'Akademik', href: 'akademik.html', icon: 'book-open' },
      { page: 'prestasi', label: 'Prestasi', href: 'prestasi.html', icon: 'trophy' },
      { page: 'berita', label: 'Berita', href: 'berita.html', icon: 'newspaper' },
      { page: 'galeri', label: 'Galeri', href: 'galeri.html', icon: 'images' },
      { page: 'ppdb', label: 'PPDB', href: 'ppdb.html', icon: 'user-plus' },
      { page: 'kontak', label: 'Kontak', href: 'kontak.html', icon: 'map-pin' },
      { page: 'faq', label: 'FAQ', href: 'faq.html', icon: 'circle-help' },
    ];
  },

  /* ---------- BREADCRUMB ---------- */
  renderBreadcrumb() {
    const host = document.getElementById('page-breadcrumb');
    if (!host) return;
    const c = this.config.breadcrumb || [];
    host.innerHTML = `<nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html"><i data-lucide="home"></i>Beranda</a>
      ${c.map((b, idx) => {
        const last = idx === c.length - 1;
        return `<i data-lucide="chevron-right"></i>${last
          ? `<span class="current">${U.esc(b.label)}</span>`
          : (b.href ? `<a href="${U.esc(b.href)}">${U.esc(b.label)}</a>` : `<span>${U.esc(b.label)}</span>`)}`;
      }).join('')}
    </nav>`;
    U.refreshIcons(host);
  },

  /* ---------- FOOTER ---------- */
  renderFooter() {
    const s = this.t();
    const host = document.getElementById('site-footer');
    if (!host) return;
    host.className = 'footer';
    host.innerHTML = `
      <div class="footer__main">
        <div class="container">
          <div class="grid grid--4">
            <div>
              <div class="footer__about">
                <img src="${U.esc(U.asset(s.logo))}" alt="Logo ${U.esc(s.school_name)}" onerror="this.onerror=null;this.src=U.placeholder();">
                <div><b>${U.esc(s.school_name)}</b><span>${U.esc(s.tagline)}</span></div>
              </div>
              <p>${U.esc(U.truncate(s.about_short, 170))}</p>
              <div class="footer__soc">
                ${s.instagram ? `<a href="${U.esc(s.instagram)}" target="_blank" rel="noopener" aria-label="Instagram"><i data-lucide="instagram"></i></a>` : ''}
                ${s.facebook ? `<a href="${U.esc(s.facebook)}" target="_blank" rel="noopener" aria-label="Facebook"><i data-lucide="facebook"></i></a>` : ''}
                ${s.youtube ? `<a href="${U.esc(s.youtube)}" target="_blank" rel="noopener" aria-label="YouTube"><i data-lucide="youtube"></i></a>` : ''}
                ${s.tiktok ? `<a href="${U.esc(s.tiktok)}" target="_blank" rel="noopener" aria-label="TikTok"><i data-lucide="music-2"></i></a>` : ''}
              </div>
            </div>
            <div>
              <h4>Halaman</h4>
              <ul>
                <li><a href="profil.html"><i data-lucide="chevron-right"></i>Profil Sekolah</a></li>
                <li><a href="program.html"><i data-lucide="chevron-right"></i>Program Pendidikan</a></li>
                <li><a href="akademik.html"><i data-lucide="chevron-right"></i>Akademik</a></li>
                <li><a href="prestasi.html"><i data-lucide="chevron-right"></i>Prestasi</a></li>
                <li><a href="berita.html"><i data-lucide="chevron-right"></i>Berita</a></li>
                <li><a href="galeri.html"><i data-lucide="chevron-right"></i>Galeri</a></li>
                <li><a href="tracer-alumni.html"><i data-lucide="chevron-right"></i>Mencari Jejak Alumni</a></li>
              </ul>
            </div>
            <div>
              <h4>PPDB &amp; Bantuan</h4>
              <ul>
                <li><a href="ppdb.html"><i data-lucide="chevron-right"></i>PPDB Online ${U.esc(s.ppdb_tahun_ajaran || '')}</a></li>
                <li><a href="ppdb.html#biaya"><i data-lucide="chevron-right"></i>Biaya Pendidikan</a></li>
                <li><a href="ppdb.html#status"><i data-lucide="chevron-right"></i>Cek Status Pendaftaran</a></li>
                <li><a href="faq.html"><i data-lucide="chevron-right"></i>Tanya Jawab (FAQ)</a></li>
                <li><a href="kontak.html"><i data-lucide="chevron-right"></i>Hubungi Kami</a></li>
              </ul>
            </div>
            <div>
              <h4>Kontak</h4>
              <ul class="footer__contact">
                <li><i data-lucide="map-pin"></i><span>${U.esc(s.address)}</span></li>
                <li><i data-lucide="phone"></i><span>${U.esc(s.phone)}</span></li>
                <li><i data-lucide="mail"></i><span>${U.esc(s.email)}</span></li>
                <li><i data-lucide="clock"></i><span>Senin\u2013Sabtu, 07.00\u201316.00 WIB</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <div class="container">
          <span>\u00a9 ${new Date().getFullYear()} ${U.esc(s.school_name)}. Seluruh hak cipta dilindungi.</span>
          <span>NPSN ${U.esc(s.npsn)} \u00b7 Akreditasi ${U.esc(s.akreditasi)}</span>
        </div>
      </div>`;
    U.refreshIcons(host);
  },

  /* ---------- FLOATING: WA & TO-TOP ---------- */
  renderFloating() {
    const s = this.t();
    if (!document.getElementById('wa-float')) {
      const wa = document.createElement('a');
      wa.id = 'wa-float';
      wa.className = 'wa-float';
      wa.href = U.waLink(s.whatsapp, 'Assalamualaikum, saya ingin bertanya tentang ' + s.school_name);
      wa.target = '_blank'; wa.rel = 'noopener';
      wa.setAttribute('aria-label', 'Hubungi kami via WhatsApp');
      wa.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;
      document.body.appendChild(wa);
    }
    if (!document.getElementById('to-top')) {
      const tt = document.createElement('button');
      tt.id = 'to-top'; tt.className = 'to-top';
      tt.setAttribute('aria-label', 'Kembali ke atas');
      tt.innerHTML = '<i data-lucide="arrow-up"></i>';
      tt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
      document.body.appendChild(tt);
      window.addEventListener('scroll', () => tt.classList.toggle('show', window.scrollY > 500), { passive: true });
    }
  },

  /* ---------- SEO ---------- */
  applySEO() {
    const s = this.t();
    document.title = this.config.pageTitle
      ? `${this.config.pageTitle} \u2014 ${s.short_name}`
      : (s.seo_title || `${s.school_name} \u2014 ${s.tagline}`);
    this.setMeta('description', s.seo_description || s.tagline);
    this.setMeta('keywords', s.seo_keywords || '');
    this.setOG('og:title', document.title);
    this.setOG('og:description', s.seo_description || s.tagline);
    this.setOG('og:type', 'website');
    this.setOG('og:image', s.hero_image || '');
    this.setOG('og:site_name', s.school_name);
    this.setOG('og:locale', 'id_ID');

    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: s.school_name,
      alternateName: s.short_name,
      description: s.seo_description,
      slogan: s.tagline,
      email: s.email,
      telephone: s.phone,
      address: { '@type': 'PostalAddress', streetAddress: s.address, addressCountry: 'ID' },
      sameAs: [s.instagram, s.facebook, s.youtube, s.tiktok].filter(Boolean),
      logo: s.logo,
    });
    document.head.appendChild(ld);

    if (s.ga_id) {
      const g = document.createElement('script');
      g.async = true;
      g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(s.ga_id);
      document.head.appendChild(g);
      const w = document.createElement('script');
      w.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.ga_id}');`;
      document.head.appendChild(w);
    }
  },

  setMeta(name, content) {
    if (!content) return;
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
    el.content = content;
  },
  setOG(prop, content) {
    if (!content) return;
    let el = document.querySelector(`meta[property="${prop}"]`);
    if (!el) { el = document.createElement('meta'); el.property = prop; document.head.appendChild(el); }
    el.content = content;
  },

  /* ---------- GLOBAL ---------- */
  bindGlobal() {
    const bar = document.getElementById('header-bar');
    if (bar) window.addEventListener('scroll', () => bar.classList.toggle('scrolled', window.scrollY > 8), { passive: true });

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      this.setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  },

  setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('al_ihsan_theme', theme);
    document.querySelectorAll('#theme-toggle').forEach(b => {
      b.innerHTML = `<i data-lucide="${theme === 'dark' ? 'sun' : 'moon'}"></i>`;
    });
    U.refreshIcons();
  },
};

window.SiteShell = SiteShell;
