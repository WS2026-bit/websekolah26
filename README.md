# 🎓 Website Sekolah — SIT Al-Ihsan

Website sekolah **profesional, modern, elegan, responsive, dan terintegrasi** dengan admin dashboard (CMS) serta sistem PPDB online. Dibangun murni dengan **HTML5 + CSS3 + JavaScript ES6+** tanpa framework build, siap di-deploy ke **Vercel / Netlify / GitHub Pages / hosting biasa**.

> ⚠️ Identitas sekolah (nama, logo, kontak, dsb.) pada proyek ini adalah **data demo**. Seluruhnya dapat diganti melalui **Admin Dashboard → Pengaturan** tanpa menyentuh kode.

---

## ✨ Fitur

### Halaman Publik (11)
| Halaman | Isi |
|---|---|
| `index.html` | Hero, profil singkat, sambutan kepala sekolah, visi-misi, program unggulan, statistik animasi, prestasi, berita, agenda, testimoni, galeri, CTA PPDB |
| `profil.html` | Sejarah + timeline, visi-misi-tujuan, nilai organisasi, struktur organisasi (bagan), pimpinan & guru, fasilitas |
| `program.html` | 8 program (akademik, tahfizh, karakter, kepemimpinan, bahasa, internasional, ekskul, boarding) + filter + modal detail |
| `akademik.html` | Kurikulum, jadwal harian, kalender akademik, metode, sistem penilaian |
| `prestasi.html` | Filter tingkat (daerah/nasional/internasional) & jenis |
| `berita.html` | Pencarian, filter kategori, pagination |
| `detail-berita.html` | Artikel lengkap, penghitung view, tombol bagikan (WA/FB/X/copy), berita terkait |
| `galeri.html` | Foto & video, filter kategori, **lightbox** dengan navigasi keyboard |
| `ppdb.html` | Info PPDB, gelombang, persyaratan, alur, jadwal, biaya, **form multi-step**, upload dokumen, nomor registrasi otomatis, bukti cetak, **cek status** |
| `kontak.html` | Info kontak, Google Maps, form pesan (masuk ke dashboard) |
| `faq.html` | Accordion + pencarian, dikelola dari dashboard |
| `tracer-alumni.html` | **Mencari Jejak Alumni** — alumni yang putus kontak mendaftarkan dirinya sendiri; data diverifikasi humas lalu masuk rekap resmi |

### Admin Dashboard / CMS (12 halaman, login & peran)
- **Dashboard**: statistik + grafik Chart.js (tren pendaftar, status PPDB), pendaftar & pesan terbaru
- **Berita** (+ kategori), **Agenda**, **Program**, **Prestasi**, **Galeri**, **Guru & Pegawai**, **Struktur Organisasi**, **Fasilitas**, **Testimoni**, **FAQ**
- **Profil & Visi Misi**: sambutan, misi/tujuan/nilai/milestone editor
- **PPDB**: verifikasi berkas, ubah status, catatan panitia, lihat dokumen, hubungi wali via WA, **ekspor CSV (Excel)** & cetak
- **Jejak Alumni**: rekap kiriman formulir tracer, **verifikasi satu klik**, filter status/jenjang/status kini, chat WA ke alumni, catatan internal, **ekspor CSV**
- **Pengaturan**: identitas & kontak, info PPDB (gelombang/biaya/alur), logo & banner, SEO & Google Analytics, **pengguna (admin/editor)**, **pesan masuk**, **log aktivitas**

Setiap modul CRUD mendukung: **tambah, lihat, edit, hapus, pencarian, filter, pagination, upload gambar (dengan kompresi), validasi input**.

### Lainnya
- 🌙 **Dark mode** (tersimpan per perangkat)
- 📱 **Mobile-first** + drawer navigasi
- 💬 **Floating WhatsApp** + tombol share
- ⏳ Loading animation, breadcrumb, animasi reveal
- 🔒 Sanitasi konten HTML, validasi file (tipe & ukuran), hash password, RBAC, audit log
- 🔍 SEO: meta/OG dinamis, JSON-LD `EducationalOrganization`, `sitemap.xml`, `robots.txt`

---

## 🚀 Cara Menjalankan (Mode Demo — tanpa server/database)

1. Ekstrak folder `school-website`.
2. Buka `index.html` di browser (Chrome/Edge/Firefox).
   - Atau lebih baik jalankan server lokal: `python3 -m http.server 8080` lalu akses `http://localhost:8080`.

**Akun admin demo:**

| Peran | Email | Password |
|---|---|---|
| Administrator | `admin@al-ihsan.sch.id` | `admin123` |
| Editor | `editor@al-ihsan.sch.id` | `editor123` |

> Mode demo menyimpan data di **LocalStorage** browser. Fitur lengkap, namun data hanya ada di perangkat tersebut.

---

## 🗄️ Mode Produksi — Supabase

> 📖 **Panduan lengkap bergambar langkah demi langkah (Supabase + GitHub Pages): buka [`PANDUAN-DEPLOY.md`](PANDUAN-DEPLOY.md).** Ringkasan:

1. Buat project di [supabase.com](https://supabase.com) (region Singapore).
2. **SQL Editor** → jalankan seluruh isi `database/schema.sql`. Sekali jalan terbuat: 20 tabel + RLS + storage bucket + **data awal lengkap** (berita, agenda, program, prestasi, galeri, fasilitas, testimoni, FAQ, guru, struktur organisasi, contoh PPDB/pesan, jejak alumni) — persis seperti mode demo.
3. **Authentication → Users → Add user** — buat user admin, lalu jalankan:
   ```sql
   INSERT INTO public.users (id, name, email, role)
   SELECT id, 'Administrator', email, 'admin' FROM auth.users
   WHERE email = 'email-admin@anda.sch.id'
   ON CONFLICT (id) DO NOTHING;
   ```
4. **Settings → API** → salin **Project URL** dan **anon/publishable key**.
5. Edit `config/supabase.js`:
   ```js
   enabled: true,
   url: 'https://xxxx.supabase.co',
   anonKey: 'eyJ...',
   ```
6. Selesai — dashboard menandai **Mode data: Supabase**; seluruh halaman & dashboard kini memakai PostgreSQL + Storage + Auth. Data tersimpan otomatis, aman (RLS), dan dapat diakses dari perangkat mana pun. **Jangan pernah** memakai `service_role` key di frontend.

---

## 📁 Struktur Proyek

```
school-website/
├── index.html  profil.html  program.html  akademik.html
├── prestasi.html  berita.html  detail-berita.html  galeri.html
├── ppdb.html  kontak.html  faq.html  tracer-alumni.html
├── admin/
│   ├── login.html  dashboard.html  profil.html  berita.html
│   ├── galeri.html  agenda.html  program.html  prestasi.html
│   ├── guru.html  ppdb.html  tracer.html  pengaturan.html
├── assets/
│   ├── css/   (style.css, admin.css)
│   ├── js/    (utils, data-seed, store, components, main, ppdb, admin)
│   ├── images/(logo.svg, favicon.svg, placeholder.svg)
│   └── icons/
├── config/supabase.js
├── database/schema.sql
├── sitemap.xml  robots.txt
├── PANDUAN-DEPLOY.md
└── README.md
```

### Arsitektur Data
`Store` (assets/js/store.js) adalah **satu-satunya** lapisan data:
- mode `demo` → LocalStorage, mode `supabase` → Supabase REST.
- UI tidak perlu diubah saat berpindah mode.
- `Auth` menangani login (hash SHA-256 pada mode demo, Supabase Auth pada produksi) + guard peran.

---

## ☁️ Deployment

> 📖 Panduan lengkap (dengan metode tanpa install aplikasi & pemecahan masalah): **[`PANDUAN-DEPLOY.md`](PANDUAN-DEPLOY.md)**.

**GitHub Pages (gratis)** —
1. Buat repository baru di GitHub, unggah **seluruh ISI folder** proyek (bukan foldernya) — bisa drag & drop lewat browser.
2. Repo → **Settings → Pages** → Source: *Deploy from a branch*, Branch: **main** / **/(root)** → Save.
3. Situs live di `https://username.github.io/nama-repo/` (tunggu 1–3 menit).
4. Isi kredensial Supabase (bagian di atas) **sebelum** unggah — atau edit `config/supabase.js` langsung di GitHub (ikon pensil) setelahnya.

**Vercel / Netlify** — drag & drop folder proyek, atau hubungkan repo:
- Build command: *(kosongkan)*
- Output directory: `./` (root proyek)

**Hosting cPanel** — unggah seluruh isi folder ke `public_html`.

Setelah online, perbarui domain pada `sitemap.xml`, `robots.txt`, dan OG URL.

---

## 🔐 Keamanan

- Semua render konten melewati escape HTML (`U.esc`); konten artikel disanitasi (`U.sanitizeHTML`).
- Upload divalidasi (tipe: JPG/PNG/WebP/PDF; ukuran maks 2 MB; gambar dikompres otomatis).
- Password demo disimpan sebagai hash SHA-256 (tidak pernah plaintext); produksi memakai Supabase Auth.
- RLS di semua tabel; anon hanya bisa membaca konten publik + mengirim PPDB/pesan.
- Audit log aktivitas admin tersedia di Pengaturan → Log Aktivitas.

---

## 🛠️ Kustomisasi Cepat

1. **Identitas sekolah** → Admin → Pengaturan → Identitas & Kontak.
2. **Warna & font** → `assets/css/style.css` bagian `:root` (variabel `--g-*`, `--gold-*`, `--cream-*`; font Playfair Display + Plus Jakarta Sans via Google Fonts).
3. **Foto** → ganti melalui dashboard (otomatis terkompres) atau ganti URL pada seed.
4. **Domain** → perbarui `sitemap.xml` & `robots.txt`.

---

## 🧪 Uji Fungsi Utama

1. Beranda terisi data demo; ganti mode gelap/terang; buka di layar sempit (responsif).
2. PPDB → isi 3 langkah → dapat nomor registrasi → cek status dengan nomor + tanggal lahir.
3. Kontak → kirim pesan → muncul di Admin → Pengaturan → Pesan Masuk.
4. Login admin → dashboard grafik → kelola berita (tambah/edit/hapus/cari/pagination).
5. Admin PPDB → verifikasi & ubah status pendaftar → ekspor CSV.

---

Dibuat dengan ❤️ untuk pendidikan Indonesia. Silakan dikembangkan lebih lanjut.
