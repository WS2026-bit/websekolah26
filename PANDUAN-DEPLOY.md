# 📡 PANDUAN DEPLOY — Supabase + GitHub Pages

Panduan lengkap menghubungkan website SIT Al-Ihsan ke **database online (Supabase)** agar data tersimpan otomatis, aman, dan bisa diakses dari berbagai perangkat — lalu mempublikasikannya gratis melalui **GitHub Pages**.

> 👤 Ditujukan untuk: operator/petugas humas sekolah, **tanpa perlu keahlian coding**.
> ⏱️ Total waktu: ± 45–60 menit. 💰 Biaya: **Rp0** (paket gratis Supabase & GitHub).

---

## 🧭 Cara kerjanya (gambaran besar)

```
 HP / Laptop / Komputer kantor (pengunjung & admin)
              │  browser
              ▼
 GitHub Pages  ──►  menyajikan FILE WEBSITE (HTML/CSS/JS, statis, gratis)
              │
              ▼
 Supabase     ──►  DATABASE online (PostgreSQL) + login admin + penyimpanan file
                   • setiap berita/PPDB/pesan/alumni yang diinput → LANGSUNG tersimpan
                   • dibuka dari perangkat mana pun → datanya SAMA
```

| Sebelum (Mode Demo) | Sesudah (Mode Supabase) |
|---|---|
| Data hanya di 1 browser | Data di server online |
| Ganti perangkat = data hilang | Semua perangkat melihat data yang sama |
| Bisa hilang jika cache dibersihkan | Tersimpan permanen + bisa di-backup |

---

# BAGIAN A — Koneksikan ke Supabase (± 30 menit)

## A1. Buat akun & project Supabase

1. Buka **[supabase.com](https://supabase.com)** → klik **Start your project** → daftar (bisa pakai akun GitHub/Google).
2. Klik **New project**:
   - **Name**: `website-sekolah` (bebas)
   - **Database Password**: buat password kuat → **CATAT di tempat aman** (akan diminta saat maintenance database).
   - **Region**: `Singapore (Southeast Asia)` — paling dekat & cepat untuk Indonesia.
3. Klik **Create new project** → tunggu ± 2 menit sampai project siap.

## A2. Buat tabel database (jalankan schema.sql)

1. Di menu kiri Supabase, pilih **SQL Editor** → klik **New query**.
2. Buka file `database/schema.sql` dari folder website ini (pakai Notepad/VS Code) → **salin SELURUH isinya** → tempel ke kotak query.
3. Klik **Run** (atau tekan `Ctrl+Enter`).
4. Sukses ditandai pesan `Success. No rows returned`. Yang terbuat otomatis:
   - ✅ **20 tabel** (berita, agenda, program, prestasi, galeri, guru, PPDB, pesan, jejak alumni, dll.)
   - ✅ **RLS (Row Level Security)** — pengaman tiap tabel
   - ✅ **Bucket storage** `school-media` untuk gambar & dokumen
   - ✅ **Data awal (seed)**: profil sekolah, 9 berita, 8 agenda, 8 program, 8 prestasi, 13 galeri, 10 fasilitas, 4 testimoni, 12 FAQ, 12 guru/pegawai, struktur organisasi, contoh PPDB/pesan, alumni terverifikasi — **website langsung terisi, persis seperti mode demo**.
5. Cek menu **Table Editor** — tabel-tabel sudah berisi data awal.

> File ini **idempoten** (aman dijalankan ulang; data tidak terduplikasi).

## A3. Buat akun admin pertama

Akun demo (`admin@al-ihsan.sch.id`) **tidak berlaku** di mode Supabase — login produksi memakai **Supabase Auth**.

1. Menu **Authentication → Users → Add user → Create new user**.
   - Email: email sekolah Anda, contoh `admin@sekolahanda.sch.id`
   - Password: buat yang kuat
   - ✅ centang **Auto Confirm User**
2. Buka **SQL Editor → New query**, jalankan (ganti email sesuai A3 langkah 1):

   ```sql
   INSERT INTO public.users (id, name, email, role)
   SELECT id, 'Administrator', email, 'admin' FROM auth.users
   WHERE email = 'admin@sekolahanda.sch.id'
   ON CONFLICT (id) DO UPDATE SET role = 'admin', name = 'Administrator';
   ```

   > Perintah ini sekaligus **membuat** profil admin (kalau belum ada) **atau mempromosikan** akun yang sudah ada menjadi `admin`. Aman dijalankan berulang.
   > Cek email yang terdaftar: **Authentication → Users**, atau `SELECT email FROM auth.users;`

3. (Opsional) buat akun kedua peran `editor` — login yang sama, cukup ganti `'admin'` → `'editor'` dan gunakan email lain.

### A3-b. Status masih "editor"? Perbaikan sekali jadi (tanpa ketik email)

Jalankan **3 perintah ini bersamaan** di **SQL Editor** → Run. Tidak perlu mengganti email apa pun — Supabase membaca sendiri semua akun Auth yang ada:

```sql
-- 1) Lihat akun Auth & perannya saat ini
SELECT au.email AS email_auth, u.role AS peran_sekarang
FROM auth.users au LEFT JOIN public.users u ON u.id = au.id;

-- 2) Promosikan SEMUA akun Auth yang ada sekarang menjadi admin
INSERT INTO public.users (id, name, email, role)
SELECT id, 'Administrator', lower(email), 'admin' FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin', email = excluded.email;

-- 3) Bersihkan baris yatim (id tidak dikenal Supabase Auth)
DELETE FROM public.users WHERE id NOT IN (SELECT id FROM auth.users);
```

Hasil langkah 1–2 idealnya: `email_auth` = email Anda, `peran_sekarang` = `admin`.
⚠️ Langkah 2 menjadikan **semua** akun Auth yang ada sebagai admin — jalankan hanya saat setup awal. Setelah website berjalan, kelola peran lewat Dashboard (login admin lain) atau per-email.

Terakhir: di dashboard klik **Logout → Login kembali** (peran terbaca saat login), atau tekan `Ctrl+Shift+R`.

> ❗ **Masih "editor" setelah langkah di atas?** Pastikan Anda menjalankan `schema.sql` **terbaru** (versi lama bisa memicu kendala kebijakan RLS pada tabel `users`), lalu ulangi A3-b.

## A4. Ambil kredensial project

Buka **Settings (⚙️) → API**, salin 2 nilai ini:

| Yang diambil | Letaknya | Contoh bentuk |
|---|---|---|
| **Project URL** | Project URL | `https://abcdefghijk.supabase.co` |
| **anon / public key** | Project API Keys → `anon` `public` | `eyJhbGciOi...` (panjang) |

> 🔑 **Kenapa anon key aman dipasang di browser?** Karena tulis-baca dikunci oleh **RLS** (A2): pengunjung anonim hanya bisa **membaca konten publik** dan **mengirim** PPDB/pesan/jejak alumni. Mengubah/menghapus konten hanya bisa setelah **login admin/editor**.
> ⛔ **JANGAN PERNAH** memakai key `service_role` di website — key itu adalah kunci induk tanpa pengaman.

## A5. Aktifkan mode Supabase di website

Buka file **`config/supabase.js`**, ubah 3 baris di bagian atas:

```js
const SUPABASE_CONFIG = {
  enabled: true,                                   // ← false jadi true
  url: 'https://abcdefghijk.supabase.co',          // ← Project URL (A4)
  anonKey: 'eyJhbGciOi....',                       // ← anon public key (A4)
  storageBucket: 'school-media',
};
```

Simpan file.

## A6. Verifikasi koneksi

1. Buka `index.html` di browser → pastikan beranda tampil normal dengan data awal.
2. Buka **admin → login** dengan akun yang dibuat di **A3**.
3. Lihat **pojok bawah sidebar**: harus tertulis **`Mode data: Supabase`**.
   — Masih tertulis `Demo (LocalStorage)`? → cek kembali A5 (enabled: true, key tidak ada tulisan `ISI-ANON-KEY`), lalu refresh dengan `Ctrl+Shift+R`.
4. Di **Dashboard** muncul pita hijau **"Mode Produksi — Supabase"**. Selesai — kini setiap input tersimpan ke database online. ✅

---

# BAGIAN B — Publikasikan ke GitHub Pages (± 20 menit)

> Prasyarat: **A5 sudah selesai** (agar versi yang di-online memakai Supabase).

## B1. Buat repository & unggah file (tanpa install aplikasi)

1. Login ke **[github.com](https://github.com)** (daftar gratis bila belum punya).
2. Klik **+** (kanan atas) → **New repository**:
   - Repository name: `website-sekolah` (bebas)
   - Visibility: **Public** (wajib agar GitHub Pages gratis)
   - ✅ *Add a README file* boleh dicentang
   - Klik **Create repository**
3. Di halaman repo, klik **uploading an existing file** (tautan biru).
4. Buka folder website, **pilih SEMUA ISI DI DALAMNYA** (seluruh file `.html`, folder `assets`, `admin`, `config`, `database`, `sitemap.xml`, `robots.txt`, `README.md`, `PANDUAN-DEPLOY.md`).
   > ⚠️ Unggah **ISI folder**, bukan foldernya — supaya `index.html` berada di root repo. Jika nanti `https://username.github.io/repo/` menampilkan 404/teks polos, hampir pasti sebabnya file `index.html` tidak di root.
   > ℹ️ Upload lewat web maksimal ±100 file sekali unggah — proyek ini ±49 file, aman. Jika pernah melebihi, gunakan Metode 2 (B5).
5. Tunggu proses unggah selesai → tulis ringkasan (mis. `Unggah website sekolah`) → klik **Commit changes**.

## B2. Aktifkan GitHub Pages

1. Di repo, masuk **Settings → Pages** (menu kiri).
2. Bagian **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main** dan folder **/(root)** → klik **Save**
3. Tunggu 1–3 menit → refresh halaman → muncul kotak hijau:

   `Your site is live at https://USERNAME.github.io/website-sekolah/`

4. Klik alamat tersebut → website sekolah Anda **online** 🎉 — kini bisa dibuka dari HP/laptop/komputer mana pun.

## B3. Lupa mengisi Supabase sebelum upload?

Tidak perlu unggah ulang semua: di GitHub buka **`config/supabase.js`** → klik ikon **pensil (Edit)** → ubah `enabled`, `url`, `anonKey` → **Commit changes** → GitHub Pages otomatis membangun ulang (± 1 menit).

## B4. Perbarui alamat website (SEO, opsional tapi disarankan)

Ganti alamat contoh di 2 file dengan alamat asli Anda (mis. `https://username.github.io/website-sekolah/`):

- `sitemap.xml` → ganti `https://www-al-ihsan.example.com/...`
- `robots.txt` → ganti baris `Sitemap: ...`

Cara: buka file di GitHub → ikon pensil → edit → Commit.

## B5. Metode alternatif — lewat Git di komputer (opsional)

Untuk yang terbiasa terminal / file lebih dari 100:

```bash
cd folder-website          # folder yang berisi index.html
git init
git add .
git commit -m "Website sekolah"
git branch -M main
git remote add origin https://github.com/USERNAME/website-sekolah.git
git push -u origin main
```

Lalu lanjut ke **B2**.

## B6. Domain sendiri (opsional)

Punya domain seperti `www.sekolahanda.sch.id`?

1. Di penyedia domain, tambahkan record DNS **CNAME**: `www` → `USERNAME.github.io.`
2. GitHub repo → **Settings → Pages** → bagian **Custom domain** → isi `www.sekolahanda.sch.id` → Save.
3. Tunggu DNS propagate (15 menit–24 jam) → aktifkan **Enforce HTTPS**.
4. Perbarui juga alamat di `sitemap.xml` & `robots.txt` sesuai domain baru.

---

# BAGIAN C — Uji multi-perangkat (checklist akhir)

Lakukan 5 menit setelah semuanya online:

| # | Uji | Di mana | Hasil yang benar |
|---|---|---|---|
| 1 | Buka website | HP (pakai data seluler) | Beranda tampil, gambar muncul |
| 2 | Kirim PPDB / pesan kontak / Jejak Alumni | HP | Muncul "pendaftaran berhasil" + nomor registrasi |
| 3 | Login admin | Laptop/PC | Pojok sidebar: `Mode data: Supabase` |
| 4 | Cek data uji dari langkah 2 | Laptop | Ada di Admin → PPDB / Pengaturan → Pesan Masuk / Jejak Alumni |
| 5 | Edit satu berita | Laptop | Perubahan terlihat juga saat situs dibuka di HP |

Kalau 5-5-nya lolos → database benar-benar online, tersimpan otomatis, dan lintas perangkat. ✅

---

# BAGIAN D — Keamanan & backup

**Yang sudah terpasang otomatis (RLS):**

| Peran | Boleh |
|---|---|
| Pengunjung (anon) | Baca konten publik; kirim PPDB, pesan, jejak alumni |
| Editor | Kelola konten (berita, galeri, dll.) |
| Admin | Semua + pengaturan + kelola pengguna |

- Login admin memakai **Supabase Auth** (password ter-hash di server, ada limit percobaan).
- `anonKey` di frontend aman karena RLS — **`service_role` key tidak boleh pernah** diletakkan di file website.

**Kebiasaan baik:**

1. **Backup rutin** — tiap modul admin punya tombol **Ekspor CSV** (PPDB, Jejak Alumni). Unduh minimal sebulan sekali.
2. **Backup penuh** — Supabase Dashboard → **Database → Backups**.
3. Ganti password admin berkala; kelola akun di **Authentication → Users**.
4. Pemakaian paket gratis: database 500 MB, storage file 1 GB, bandwidth — sangat cukup untuk website sekolah; pantau di **Reports**.

---

# BAGIAN E — Mengelola website setelah online

| Ingin mengubah | Caranya | Perlu upload ulang? |
|---|---|---|
| Berita, agenda, galeri, guru, PPDB, dst. | Admin Dashboard (dari HP/laptop mana pun) | ❌ Tidak |
| Logo, kontak, biaya PPDB, visi-misi | Admin → Pengaturan | ❌ Tidak |
| Warna/tampilan/kode | Edit file di GitHub (ikon pensil) → Commit | ✅ otomatis rebuild |

**Menghapus data demo sebelum resmi:** contoh PPDB & Pesan Masuk dari seed sebaiknya dihapus saat sekolah mulai menerima data nyata — buka Admin → PPDB / Pengaturan → Pesan Masuk → hapus satu per satu.

---

# BAGIAN F — Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| Sidebar masih "Demo (LocalStorage)" | `enabled` masih `false`, atau key masih placeholder | Periksa `config/supabase.js` (A5), hard-refresh `Ctrl+Shift+R` |
| Dashboard: "Tabel belum tersedia" | `schema.sql` belum dijalankan / project Supabase paused | Jalankan A2; kalau paused → **Restore project** |
| Login admin gagal di produksi | User Auth belum dibuat / belum di-link ke `public.users` | Ulangi A3 (email harus sama persis) |
| Login sukses tapi sidebar tertulis "editor" | Baris `public.users` belum terhubung ke akun Auth (email tidak persis sama / id beda), atau belum login ulang | Jalankan **A3-b** (perbaikan sekali jadi, tanpa ketik email) → **logout → login lagi**; cek dengan `SELECT email, role FROM public.users;` |
| `https://user.github.io/repo/` 404 | `index.html` tidak di root repo, atau Pages belum di-Save | Pastikan upload **isi folder** (B1 langkah 4); cek B2 |
| Halaman tampil tanpa warna/gambar | File terunggah bersarang (`website/index.html`, bukan `index.html`) | Pindahkan isi ke root repo (drag & drop di GitHub web) |
| Perubahan tidak muncul | Cache browser / Pages masih build | `Ctrl+Shift+R`; tunggu ±1–3 menit |
| Upload gambar gagal | File > 2 MB / bukan JPG-PNG-WebP-PDF | Kompres dulu; batas memang 2 MB |
| Supabase "project paused" | Paket gratis berhenti setelah 7 hari tanpa aktivitas | Tekan **Restore** di dashboard Supabase; aktifkan dengan buka website secara rutin |
| SQL error `23502 … null value in column "created_at"` saat Run schema | Memakai versi `schema.sql` lama (data seed mengisi `created_at` dengan NULL) | Gunakan `database/schema.sql` **terbaru** dari paket ini, salin ulang **seluruh** isinya, klik **Run** sekali lagi — aman karena skrip idempoten dan transaksi yang gagal otomatis di-roll back |
| Kirim Jejak Alumni / Pesan Kontak gagal: `new row violates row-level security policy` | Memakai `assets/js/store.js` **lama** — insert memakai `.select()` sehingga baris baru (status `menunggu`) ditolak policy SELECT publik | Unggah ulang `assets/js/store.js` **terbaru** ke repo → tunggu deployment → `Ctrl+Shift+R`. Kalau masih gagal, jalankan blok SQL darurat di bawah tabel ini |
| Ganti password DB Supabase | — | Jangan diubah sembarangan; berdampak koneksi. Kalau terlanjur: Settings → Database → Reset database password tidak mempengaruhi anon key |

**SQL darurat — pastikan policy kirim publik & helper peran terpasang** (idempoten, aman diulang; hanya jika error RLS masih muncul setelah JS terbaru terunggah):

```sql
create or replace function public.current_role()
returns text language sql stable security definer set search_path = public as $$
  select role::text from public.users where id = auth.uid()
$$;

drop policy if exists "public_insert_tracer" on public.tracer_alumni;
create policy "public_insert_tracer" on public.tracer_alumni
  for insert to anon, authenticated with check (true);

drop policy if exists "public_insert_messages" on public.messages;
create policy "public_insert_messages" on public.messages
  for insert to anon, authenticated with check (true);

drop policy if exists "public_insert_admissions" on public.admissions;
create policy "public_insert_admissions" on public.admissions
  for insert to anon, authenticated with check (true);
```

---

## ✅ Ringkasan super singkat

1. **Supabase**: buat project → jalankan `database/schema.sql` → buat user admin (Auth + SQL) → salin URL & anon key → isi ke `config/supabase.js`, `enabled: true`.
2. **GitHub Pages**: buat repo → unggah **isi** folder website → Settings → Pages → Deploy from branch `main` /(root) → situs live.
3. **Uji**: kirim PPDB dari HP → muncul di dashboard laptop. 🎉

Panduan ini bagian dari proyek *Website Sekolah SIT Al-Ihsan* — lihat juga `README.md` untuk fitur lengkap.
