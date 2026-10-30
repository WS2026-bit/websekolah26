-- ============================================================================
-- SCHEMA.SQL — SIT AL-IHSAN SCHOOL WEBSITE (Supabase / PostgreSQL)
-- ----------------------------------------------------------------------------
-- CARA PAKAI:
--   1. Buka Supabase Dashboard > SQL Editor > New Query.
--   2. Salin SELURUH file ini, lalu jalankan (Run).
--      Sudah termasuk SEED: profil sekolah, kategori, berita, agenda, program,
--      prestasi, galeri, fasilitas, testimoni, FAQ, guru & pegawai, struktur
--      organisasi, contoh PPDB/pesan, dan jejak alumni terverifikasi.
--   3. Buat user admin pertama di Authentication > Users > Add user
--      (email & password), lalu masukkan ke tabel "users" dengan peran admin:
--
--      INSERT INTO public.users (id, name, email, role)
--      SELECT id, 'Administrator', email, 'admin' FROM auth.users
--      WHERE email = 'admin@sekolahanda.sch.id'
--      ON CONFLICT (id) DO UPDATE SET role = 'admin', name = 'Administrator';
--      (ganti email dengan email yang Anda daftarkan; perintah ini membuat
--       profil admin ATAU mempromosikan akun yang sudah ada menjadi admin)
--
--   4. Settings > API → salin Project URL & anon key ke config/supabase.js,
--      lalu set enabled: true.
--   5. Ikuti panduan lengkap (Supabase + GitHub Pages): PANDUAN-DEPLOY.md
--
-- TIPE ID: seluruh tabel memakai id TEXT (bukan uuid) agar identik dengan id
-- yang dibuat frontend (U.uid pada Store.insert) — data demo & produksi bisa
-- sama persis. Pengecualian: public.users mengikuti auth.users Supabase (uuid).
--
-- KEAMANAN: RLS aktif di semua tabel. Anon key HANYA bisa membaca konten
-- publik, mengirim pendaftaran & pesan. Tulis konten hanya untuk admin/editor.
-- ============================================================================

-- ============ EXTENSIONS ============
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ============ ENUM TYPES ============
do $$ begin
  create type user_role as enum ('admin', 'editor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type admission_status as enum ('menunggu', 'diverifikasi', 'diterima', 'ditolak');
exception when duplicate_object then null; end $$;

do $$ begin
  create type achievement_level as enum ('daerah', 'nasional', 'internasional');
exception when duplicate_object then null; end $$;

do $$ begin
  create type achievement_type as enum ('akademik', 'non-akademik', 'keagamaan');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gallery_type as enum ('foto', 'video');
exception when duplicate_object then null; end $$;

do $$ begin
  create type staff_type as enum ('pimpinan', 'guru', 'tendik');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 1. USERS — profil & peran dashboard (password di Kelola oleh Supabase Auth)
-- ============================================================================
create table if not exists public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  email      text not null unique,
  role       user_role not null default 'editor',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 2. SCHOOL_PROFILE — identitas sekolah (baris tunggal)
-- ============================================================================
create table if not exists public.school_profile (
  id           text primary key default gen_random_uuid()::text,
  school_name  text not null,
  short_name   text,
  tagline      text,
  jenjang      text,
  npsn         text,
  akreditasi   text,
  address      text,
  phone        text,
  whatsapp     text,
  email        text,
  ppdb_email   text,
  maps_embed   text,
  instagram    text,
  facebook     text,
  youtube      text,
  tiktok       text,
  about_short  text,
  headmaster_name  text,
  headmaster_title text,
  headmaster_photo text,
  headmaster_greeting text,
  stats        jsonb not null default '{"students":0,"teachers":0,"alumni":0,"achievements":0}',
  updated_at   timestamptz not null default now()
);

-- ============================================================================
-- 3. WEBSITE_SETTINGS — pengaturan key-value (logo, hero, SEO, PPDB, visi-misi)
-- ============================================================================
create table if not exists public.website_settings (
  key   text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 4. ORGANIZATION — struktur organisasi (tree via parent_id)
-- ============================================================================
create table if not exists public.organization (
  id        text primary key default gen_random_uuid()::text,
  name      text not null,
  position  text not null,
  parent_id text references public.organization(id) on delete set null,
  photo     text,
  "order"   integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_organization_parent on public.organization(parent_id);

-- ============================================================================
-- 5. STAFF — guru & tenaga kependidikan
-- ============================================================================
create table if not exists public.staff (
  id         text primary key default gen_random_uuid()::text,
  name       text not null,
  position   text not null,
  type       staff_type not null default 'guru',
  subject    text,
  education  text,
  photo      text,
  created_at timestamptz not null default now()
);
create index if not exists idx_staff_type on public.staff(type);

-- ============================================================================
-- 6. CATEGORIES — kategori berita
-- ============================================================================
create table if not exists public.categories (
  id   text primary key default gen_random_uuid()::text,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 7. NEWS — berita & artikel
-- ============================================================================
create table if not exists public.news (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  slug        text not null unique,
  category_id text references public.categories(id) on delete set null,
  image       text,
  excerpt     text,
  content     text,
  author      text,
  date        date not null default current_date,
  views       integer not null default 0,
  featured    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_news_category on public.news(category_id);
create index if not exists idx_news_date on public.news(date desc);
create index if not exists idx_news_slug on public.news(slug);

-- ============================================================================
-- 8. EVENTS — agenda kegiatan
-- ============================================================================
create table if not exists public.events (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  date        date not null,
  end_date    date,
  location    text,
  category    text,
  description text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_events_date on public.events(date);

-- ============================================================================
-- 9. PROGRAMS — program pendidikan
-- ============================================================================
create table if not exists public.programs (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  category    text not null,
  icon        text,
  image       text,
  excerpt     text,
  description text,
  featured    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 10. ACHIEVEMENTS — prestasi
-- ============================================================================
create table if not exists public.achievements (
  id           text primary key default gen_random_uuid()::text,
  title        text not null,
  level        achievement_level not null default 'daerah',
  type         achievement_type not null default 'akademik',
  year         integer not null default extract(year from now()),
  student_name text,
  description  text,
  image        text,
  created_at   timestamptz not null default now()
);
create index if not exists idx_ach_level on public.achievements(level);

-- ============================================================================
-- 11. GALLERIES — galeri foto & video
-- ============================================================================
create table if not exists public.galleries (
  id         text primary key default gen_random_uuid()::text,
  title      text not null,
  type       gallery_type not null default 'foto',
  category   text,
  url        text not null,
  date       date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists idx_galleries_type on public.galleries(type);

-- ============================================================================
-- 12. FACILITIES — fasilitas sekolah
-- ============================================================================
create table if not exists public.facilities (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  icon        text,
  image       text,
  description text,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 13. TESTIMONIALS — testimoni orang tua & alumni
-- ============================================================================
create table if not exists public.testimonials (
  id         text primary key default gen_random_uuid()::text,
  name       text not null,
  role       text not null,
  message    text not null,
  rating     integer not null default 5 check (rating between 1 and 5),
  photo      text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 14. ADMISSIONS — pendaftaran PPDB
-- ============================================================================
create table if not exists public.admissions (
  id              text primary key default gen_random_uuid()::text,
  reg_number      text not null unique,
  full_name       text not null,
  nisn            varchar(10),
  gender          char(1) not null default 'L' check (gender in ('L','P')),
  birth_place     text,
  birth_date      date,
  address         text,
  previous_school text,
  jenjang         text not null,
  asrama          boolean not null default false,
  parent_name     text not null,
  parent_phone    text not null,
  parent_email    text,
  status          admission_status not null default 'menunggu',
  verified        boolean not null default false,
  notes           text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_admissions_status on public.admissions(status);
create index if not exists idx_admissions_reg on public.admissions(reg_number);
create index if not exists idx_admissions_created on public.admissions(created_at);

-- ============================================================================
-- 15. ADMISSION_DOCUMENTS — dokumen persyaratan pendaftar
-- ============================================================================
create table if not exists public.admission_documents (
  id           text primary key default gen_random_uuid()::text,
  admission_id text not null references public.admissions(id) on delete cascade,
  doc_type     text,                -- akta | kk | foto | rapor | lainnya
  file_name    text not null,
  file_type    text,
  file_size    bigint,
  storage_path text not null,       -- path di storage bucket school-media
  created_at   timestamptz not null default now()
);
create index if not exists idx_admdoc_admission on public.admission_documents(admission_id);

-- ============================================================================
-- 16. MESSAGES — pesan masuk dari halaman kontak
-- ============================================================================
create table if not exists public.messages (
  id         text primary key default gen_random_uuid()::text,
  name       text not null,
  email      text,
  phone      text,
  subject    text not null,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 17. FAQS — tanya jawab
-- ============================================================================
create table if not exists public.faqs (
  id       text primary key default gen_random_uuid()::text,
  category text not null default 'Umum',
  question text not null,
  answer   text not null,
  "order"  integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 18. ACTIVITY_LOGS — audit log aktivitas admin
-- ============================================================================
create table if not exists public.activity_logs (
  id         text primary key default gen_random_uuid()::text,
  user_id    text,                              -- id auth user (uuid) saat mode produksi
  user_name  text,
  action     text not null,
  detail     text,
  created_at timestamptz not null default now()
);
create index if not exists idx_logs_created on public.activity_logs(created_at desc);

-- ============================================================================
-- 19. TRACER_ALUMNI — formulir "Mencari Jejak Alumni" (diisi alumni sendiri)
-- ----------------------------------------------------------------------------
-- Alumni yang belum terekap (putus kontak) mendaftarkan dirinya melalui
-- tracer-alumni.html. Petugas humas memverifikasi di Dashboard → Alumni.
-- Catatan: tipe id dipilih TEXT (bukan uuid) agar cocok dengan id yang dibuat
-- frontend (Store.insert), sehingga mode demo & mode Supabase identik.
-- ============================================================================
create table if not exists public.tracer_alumni (
  id              text primary key,
  full_name       text not null,
  jenjang         text not null,                     -- TKIT | SDIT | SMPIT | SMAIT
  grad_year       int  not null,
  whatsapp        text not null,
  email           text,
  current_status  text not null,                     -- kuliah | beasiswa | bekerja | wirausaha | lainnya
  institution     text not null,                     -- kampus / perusahaan / instansi
  major_position  text,                              -- jurusan / posisi / jabatan
  city_country    text,
  hafiz_juz       int,
  willing_mentor  boolean not null default false,    -- bersedia jadi kontak/mentor alumni
  message         text,                              -- pesan/harapan alumni
  consent         boolean not null default true,     -- persetujuan pengelolaan data
  status          text not null default 'menunggu',  -- menunggu | terverifikasi | arsip
  admin_notes     text,                              -- catatan internal sekolah
  created_at      timestamptz not null default now(),
  verified_at     timestamptz
);
create index if not exists idx_tracer_status on public.tracer_alumni(status);
create index if not exists idx_tracer_grad on public.tracer_alumni(grad_year);

-- ============================================================================
-- TRIGGER updated_at otomatis
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_school_profile_updated on public.school_profile;
create trigger trg_school_profile_updated before update on public.school_profile
  for each row execute function public.set_updated_at();

drop trigger if exists trg_settings_updated on public.website_settings;
create trigger trg_settings_updated before update on public.website_settings
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.users               enable row level security;
alter table public.school_profile      enable row level security;
alter table public.website_settings    enable row level security;
alter table public.organization        enable row level security;
alter table public.staff               enable row level security;
alter table public.categories          enable row level security;
alter table public.news                enable row level security;
alter table public.events              enable row level security;
alter table public.programs            enable row level security;
alter table public.achievements        enable row level security;
alter table public.galleries           enable row level security;
alter table public.facilities          enable row level security;
alter table public.testimonials        enable row level security;
alter table public.admissions          enable row level security;
alter table public.admission_documents enable row level security;
alter table public.messages            enable row level security;
alter table public.faqs                enable row level security;
alter table public.activity_logs       enable row level security;
alter table public.tracer_alumni       enable row level security;

-- ---- Helper: peran pengguna saat ini ----
-- SECURITY DEFINER + search_path terkunci: mencegah "infinite recursion
-- detected in policy" (fungsi membaca tabel users yang RLS-nya sendiri
-- memanggil fungsi ini) dan mengikuti rekomendasi linter Supabase.
create or replace function public.current_role()
returns text language sql stable security definer set search_path = public as $$
  select role::text from public.users where id = auth.uid()
$$;

-- ---- Konten publik: semua orang boleh BACA ----
do $$ declare t text;
begin
  foreach t in array array['school_profile','website_settings','organization','staff','categories',
    'news','events','programs','achievements','galleries','facilities','testimonials','faqs']
  loop
    execute format('drop policy if exists "public_read_%1$s" on public.%1$I;', t);
    execute format('create policy "public_read_%1$s" on public.%1$I for select using (true);', t);
  end loop;
end $$;

-- ---- Konten: tulis hanya admin/editor (authenticated) ----
do $$ declare t text;
begin
  foreach t in array array['school_profile','website_settings','organization','staff','categories',
    'news','events','programs','achievements','galleries','facilities','testimonials','faqs']
  loop
    execute format('drop policy if exists "staff_write_%1$s" on public.%1$I;', t);
    execute format('create policy "staff_write_%1$s" on public.%1$I for all to authenticated
       using (public.current_role() in (''admin'',''editor''))
       with check (public.current_role() in (''admin'',''editor''));', t);
  end loop;
end $$;

-- ---- Pengguna dashboard: admin kelola, user lihat profil sendiri ----
drop policy if exists "admin_manage_users" on public.users;
create policy "admin_manage_users" on public.users for all to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

drop policy if exists "user_read_self" on public.users;
create policy "user_read_self" on public.users for select to authenticated
  using (id = auth.uid() or public.current_role() = 'admin');

-- ---- PPDB: publik boleh mendaftar (insert) & cek status miliknya; panitia kelola ----
drop policy if exists "public_insert_admissions" on public.admissions;
create policy "public_insert_admissions" on public.admissions for insert to anon, authenticated
  with check (true);

drop policy if exists "public_check_own_admission" on public.admissions;
create policy "public_check_own_admission" on public.admissions for select to anon, authenticated
  using (true);  -- kueri status selalu disertai reg_number + tanggal lahir di sisi aplikasi

drop policy if exists "staff_manage_admissions" on public.admissions;
create policy "staff_manage_admissions" on public.admissions for all to authenticated
  using (public.current_role() in ('admin','editor'))
  with check (public.current_role() in ('admin','editor'));

-- ---- Dokumen PPDB: ikut pendaftar ----
drop policy if exists "staff_manage_admdoc" on public.admission_documents;
create policy "staff_manage_admdoc" on public.admission_documents for all to authenticated
  using (public.current_role() in ('admin','editor'))
  with check (public.current_role() in ('admin','editor'));

drop policy if exists "public_read_admdoc" on public.admission_documents;
create policy "public_read_admdoc" on public.admission_documents for select to anon, authenticated
  using (true);

-- ---- Pesan: publik kirim, staff baca/kelola ----
drop policy if exists "public_insert_messages" on public.messages;
create policy "public_insert_messages" on public.messages for insert to anon, authenticated
  with check (true);

drop policy if exists "staff_manage_messages" on public.messages;
create policy "staff_manage_messages" on public.messages for all to authenticated
  using (public.current_role() in ('admin','editor'))
  with check (public.current_role() in ('admin','editor'));

-- ---- Jejak Alumni: alumni mengisi sendiri datanya; staff rekap & verifikasi ----
drop policy if exists "public_insert_tracer" on public.tracer_alumni;
create policy "public_insert_tracer" on public.tracer_alumni for insert to anon, authenticated
  with check (true);

drop policy if exists "public_read_verified_tracer" on public.tracer_alumni;
create policy "public_read_verified_tracer" on public.tracer_alumni for select to anon, authenticated
  using (status = 'terverifikasi');  -- publik hanya melihat jumlah/data yang sudah diverifikasi

drop policy if exists "staff_manage_tracer" on public.tracer_alumni;
create policy "staff_manage_tracer" on public.tracer_alumni for all to authenticated
  using (public.current_role() in ('admin','editor'))
  with check (public.current_role() in ('admin','editor'));

-- ---- Log: hanya admin/editor ----
drop policy if exists "staff_logs" on public.activity_logs;
create policy "staff_logs" on public.activity_logs for all to authenticated
  using (public.current_role() in ('admin','editor'))
  with check (public.current_role() in ('admin','editor'));

-- ============================================================================
-- STORAGE — bucket school-media
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('school-media', 'school-media', true)
on conflict (id) do nothing;

drop policy if exists "public_read_media" on storage.objects;
create policy "public_read_media" on storage.objects for select
  using (bucket_id = 'school-media');

drop policy if exists "staff_upload_media" on storage.objects;
create policy "staff_upload_media" on storage.objects for insert to authenticated
  with check (bucket_id = 'school-media' and public.current_role() in ('admin','editor'));

drop policy if exists "staff_update_media" on storage.objects;
create policy "staff_update_media" on storage.objects for update to authenticated
  using (bucket_id = 'school-media' and public.current_role() in ('admin','editor'));

drop policy if exists "staff_delete_media" on storage.objects;
create policy "staff_delete_media" on storage.objects for delete to authenticated
  using (bucket_id = 'school-media' and public.current_role() in ('admin','editor'));

-- ============================================================================
-- SEED AWAL (contoh — sesuaikan dengan data sekolah Anda)
-- ============================================================================
insert into public.school_profile (id, school_name, short_name, tagline, jenjang, npsn, akreditasi, address, phone, whatsapp, email, ppdb_email, about_short, headmaster_name, headmaster_title, headmaster_greeting)
values (
  'profile_main',
  'Sekolah Islam Terpadu Al-Ihsan', 'SIT Al-Ihsan',
  'Mencetak Generasi Qur''ani, Berakhlak Mulia, Berwawasan Global',
  'TK, SD, SMP, SMA — Full Day & Boarding School', '20219876', 'A (Unggul)',
  'Jl. Pendidikan Raya No. 45, Sukamaju, Cibinong, Kabupaten Bogor, Jawa Barat 16913',
  '(021) 8790 1234', '6281234567890', 'info@al-ihsan.sch.id', 'ppdb@al-ihsan.sch.id',
  'Sekolah Islam Terpadu Al-Ihsan adalah lembaga pendidikan yang berdiri sejak 2003 di bawah naungan Yayasan Al-Ihsan Cendekia.',
  'Dr. H. Ahmad Syaiful Bahri, M.Pd.', 'Kepala Sekolah',
  'Assalamu''alaikum warahmatullahi wabarakatuh. Selamat datang di website resmi kami.'
)
on conflict (id) do nothing;

-- website_settings TIDAK di-seed lewat SQL — frontend (Store) mengisinya
-- otomatis dan lengkap saat pertama kali terhubung ke Supabase.

-- Kategori berita — id eksplisit agar bisa dirujuk seed berita (news.category_id)
insert into public.categories (id, name, slug, created_at) values
  ('cat_1', 'Prestasi',   'prestasi',    '2026-01-05T02:00:00Z'),
  ('cat_2', 'Kegiatan',   'kegiatan',    '2026-01-05T02:00:00Z'),
  ('cat_3', 'Pengumuman', 'pengumuman',  '2026-01-05T02:00:00Z'),
  ('cat_4', 'Artikel',    'artikel',     '2026-01-05T02:00:00Z'),
  ('cat_5', 'Kerja Sama', 'kerja-sama',  '2026-01-05T02:00:00Z')
on conflict (id) do nothing;

-- ============================================================================
-- SEED KONTEN (disisipkan otomatis dari assets/js/data-seed.js oleh
-- scripts/gen-seed-sql.js — id identik dengan mode demo LocalStorage)
-- ============================================================================

-- news (9 baris)
insert into public.news (id, title, slug, category_id, image, excerpt, content, author, date, views, featured, created_at) values
  ('news_1','Siswa SIT Al-Ihsan Raih Juara 1 OSN Matematika Tingkat Nasional 2026','juara-1-osn-matematika-nasional-2026','cat_1','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/db450ccf0659.jpg','Farhan Aulia Rahman, siswa SMAIT kelas XI, berhasil meraih medali emas OSN Matematika tingkat nasional setelah mengalahkan 34 peserta provinsi lainnya.','<p>Alhamdulillah, prestasi membanggakan kembali diraih keluarga besar SIT Al-Ihsan. Farhan Aulia Rahman, siswa kelas XI SMAIT Al-Ihsan, berhasil meraih <strong>medali emas Olimpiade Sains Nasional (OSN) Matematika tingkat nasional tahun 2026</strong> yang diselenggarakan di Yogyakarta.</p><p>Farhan yang mulai menunjukkan ketertarikan pada matematika sejak SMP ini merupakan binaan klub sains sekolah. "Kuncinya konsisten latihan soal dan berani bertanya kepada pembimbing," ujar pemuda kelahiran Bogor ini. Ia kini menjadi pembimbing sejawat bagi adik-adik kelas di klub sains.</p><p>Kepala Sekolah, Dr. H. Ahmad Syaiful Bahri, M.Pd., menyampaikan apresiasi kepada seluruh pembimbing dan berharap capaian ini memotivasi santri lain. "Kami membuktikan bahwa santri hafizh juga bisa unggul di bidang sains. Ilmu dan iman berjalan beriringan," katanya dalam apel senin.</p><p>Sebagai tindak lanjut, Farhan akan mewakili provinsi Jawa Barat dalam seleksi nasional menuju International Mathematical Olympiad (IMO) 2027. Doakan dan dukung terus langkahnya!</p>','Humas Al-Ihsan','2026-09-12',1523,true,'2026-09-12T03:00:00.000Z'),
  ('news_2','Wisuda Tahfizh Angkatan XIV: 47 Santri Baru Menghafal 30 Juz','wisuda-tahfizh-angkatan-xiv','cat_2','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/78a85d93bd0d.jpg','Total 47 santri SMP dan SMA dinyatakan tamat hafalan 30 juz dan digelari secara resmi dalam acara Haflah Khatmil Qur’an di Masjid Agung Al-Ihsan.','<p>Acara Haflah Khatmil Qur’an dan Wisuda Tahfizh Angkatan XIV diselenggarakan di Masjid Agung Al-Ihsan dengan dihadiri para orang tua, tokoh masyarakat, dan para ulama. Tahun ini, <strong>47 santri</strong> dari jenjang SMP dan SMA resmi digelari sebagai <strong>Hafizh/Hafizhah 30 juz</strong>.</p><p>Semangat kebersamaan terlihat sejak pembukaan: pidato sambutan dari perwakilan orang tua yang sebagian besar lulusan program yang sama, lalu penampilan murottal merdu dari para wisudawan. Tasyakuran diakhiri pembacaan hasanah dan doa bersama yang mengharukan.</p><p>Sejak diberlakukannya target Tahfizh 30 juz untuk santri SMP–SMA pada 2019, total 386 santri telah menamatkan hafalan Al-Qur’an. Program ini berjalan melalui setoran harian, halaqah pekanan, dan muroja’ah terbimbing oleh para muhafizh.</p><p>"Tamat 30 juz bukan akhir, melainkan gerbang untuk terus menjaga hafalan hingga akhir hayat. Semoga kalian menjadi ulama dan ulul albab," pesan Kepala Yayasan dalam sambutannya.</p>','Waka Kesantrian','2026-10-05',987,true,'2026-10-05T03:00:00.000Z'),
  ('news_3','PPDB Tahun Ajaran 2027/2028 Resmi Dibuka — Gelombang 1 Mulai November','ppdb-2027-2028-dibuka','cat_3','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5a506bc3f7da.jpg','Pendaftaran siswa baru jenjang TKIT, SDIT, SMPIT, dan SMAIT dibuka mulai 1 November 2026. Kuota terbatas — daftar lebih awal dan nikmati potongan biaya gelombang 1.','<p>Alhamdulillah, <strong>Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2027/2028</strong> resmi dibuka. Pendaftaran dilakukan <strong>sepenuhnya online</strong> melalui halaman PPDB website resmi sekolah.</p><p>Gelombang 1 dibuka dari <strong>1 November 2026 hingga 31 Januari 2027</strong>. Kuota setiap jenjang terbatas untuk menjaga kualitas layanan: TKIT 40 siswa, SDIT 96 siswa, SMPIT 120 siswa, dan SMAIT 120 siswa (termasuk jalur reguler dan asrama).</p><p>Sebagai apresiasi keikutsertaan sejak awal, pendaftar Gelombang 1 mendapatkan <strong>potongan biaya pendaftaran 25%</strong> dan prioritas pemilihan program asrama. Syarat dan ketentuan berlaku.</p><p>Masyarakat dapat mengakses informasi lengkap — persyaratan, alur pendaftaran, jadwal seleksi, dan rincian biaya — pada menu <strong>PPDB Online</strong>. Pertanyaan dapat disampaikan ke panitia melalui WhatsApp resmi yang tertera di halaman PPDB.</p>','Panitia PPDB','2026-10-20',2310,true,'2026-10-20T03:00:00.000Z'),
  ('news_4','Muharram Camp: Belajar Karakter & Kemandirian di Alam Terbuka','muharram-camp-karakter-alam-terbuka','cat_2','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/62d313ea343b.jpg','Selama 3 hari 2 malam, 210 santri kelas VII mengikuti kemah pembinaan karakter: navigasi, memasak mandiri, dan halaqah malam di bawah bintang.','<p>Tradisi pembuka tahun ajaran kembali digelar: <strong>Muharram Camp</strong>. Sebanyak 210 santri kelas VII menghabiskan 3 hari 2 malam di kaki Gunung Salak untuk pembinaan karakter berbasis alam terbuka.</p><p>Selama kemah, santri belajar navigasi kompas, memasang tenda, memasak mandiri berkelompok, dan menyusun jadwal shalat berjamaah. Malam harinya diisi halaqah tausiyah dan refleksi di bawah langit terbuka.</p><p>"Kemandirian tidak bisa diajarkan hanya lewat teori. Di alam, anak belajar tanggung jawab nyata — dari jadwal minum hingga menjaga kebersihan kamp," jelas pembina kamp, Ust. Fajar Ramadhan, S.Pd.</p><p>Kegiatan ditutup dengan pendakian ringan dan penanaman 100 bibit pohon sebagai simbol komitmen menjaga lingkungan sepanjang tahun ajaran baru.</p>','Waka Kesiswaan','2026-07-18',645,false,'2026-07-18T03:00:00.000Z'),
  ('news_5','MoU dengan Universitas Al-Azhar Kairo: Jalur Beasiswa S-1 bagi Lulusan Tahfizh','mou-universitas-al-azhar-kairo','cat_5','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8a8732a3790b.jpg','SIT Al-Ihsan menandatangani nota kesepahaman dengan Universitas Al-Azhar Kairo: kuota beasiswa penuh S-1 bidang keislaman dan farmasi setiap tahunnya.','<p>Kabar gembira bagi para santri dan orang tua! SIT Al-Ihsan resmi menandatangani <strong>Nota Kesepahaman (MoU) dengan Universitas Al-Azhar, Kairo, Mesir</strong>, pada Sabtu (22/8) di aula sekolah.</p><p>Melalui kemitraan ini, Al-Ihsan mendapat <strong>kuota beasiswa penuh S-1</strong> — meliputi SPP, asrama, dan tiket — untuk 5 lulusan terbaik setiap tahunnya pada bidang Syari’ah, Usuluddin, dan Farmasi. Seleksi internal dilakukan melalui tes bahasa Arab dan hafalan.</p><p>Rektor pembantu bidang kerja sama Al-Azhar, Prof. Dr. Mahmoud Al-Sayyid, menyampaikan apresiasi atas model integrasi tahfizh dan sains di Al-Ihsan. "Santri yang menghafal dan berpikir kritis adalah bibit unggul ulama masa depan," ujarnya.</p><p>MoU juga mencakup program guru tamu daring, pertukaran materi pembelajaran bahasa Arab, dan program orientasi pra-berangkat bagi penerima beasiswa.</p>','Humas Al-Ihsan','2026-08-22',1102,false,'2026-08-22T03:00:00.000Z'),
  ('news_6','Sekolah Gelar Parenting Class: “Mendampingi Anak di Era Digital”','parenting-class-era-digital','cat_4','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/83885ab79bb2.jpg','Lebih dari 300 orang tua mengikuti parenting class bersama praktisi keluarga sakinah membahas gawai, konten, dan komunikasi positif dengan remaja.','<p>Semangat kemitraan sekolah dan keluarga kembali terlihat pada <strong>Parenting Class</strong> bertema “Mendampingi Anak di Era Digital” yang diikuti lebih dari 300 orang tua secara luring dan daring.</p><p>Narasumber, Umi Kulsum, M.Psi., praktisi keluarga sakinah, mengingatkan bahwa gawai bukan musuh — yang penting adalah kesepakatan rumah dan teladan orang tua. “Anak meniru apa yang dilihat, bukan apa yang diperintahkan,” tuturnya.</p><p>Materi mencakup pembagian usia layar yang sehat, ciri konten berbahaya, teknik komunikasi positif untuk remaja, serta jadwal kual bersama keluarga. Sesinya ditutup tanya jawab hangat dan komitmen “digital friendly home”.</p><p>Sekolah berencana menjadikan parenting class sebagai agenda rutin dua bulanan dengan topik berbeda. Materi dan rekaman tersedia bagi orang tua melalui grup resmi per kelas.</p>','Waka Humas','2026-10-12',534,false,'2026-10-12T03:00:00.000Z'),
  ('news_7','Tim Debat Bahasa Inggris SMAIT Juara 2 English Debate Jawa Barat','juara-2-english-debate-jabar','cat_1','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e642a1035494.jpg','Tim debat Al-Ihsan lolos hingga babak final kompetisi debat bahasa Inggris antar SMA se-Jawa Barat dengan mosi kebijakan pendidikan digital.','<p>Tim debat bahasa Inggris SMAIT Al-Ihsan meraih <strong>Juara 2</strong> pada English Debate Competition se-Jawa Barat yang diikuti 48 tim. Kompetisi menggunakan format parlementer Asia dengan tiga mosi kebijakan pendidikan dan teknologi.</p><p>Perjalanan tim yang diisi mahfuzh, Nabilah, dan Rizqi ini tidak mudah: dua kali berjumpa juara bertahan pada perempatfinal dan semifinal. Keunggulan rebutan (rebuttal) dan argumentasi berbasis data menjadi kunci kemenangan mereka.</p><p>Pelatih tim, Mr. Adrian Wicaksono, S.S., mengatakan latihan intensif dwi-mingguan dengan metode “motion of the day” membuahkan hasil. “Bahasa aktif bukan jargon; ini buktinya,” katanya.</p><p>Selanjutnya tim akan membina regu cadangan kelas X dan menargetkan gelar juara 1 pada edisi 2027, insyaAllah.</p>','Humas Al-Ihsan','2026-09-28',720,false,'2026-09-28T03:00:00.000Z'),
  ('news_8','Maulid Nabi 1448 H: Festival Anak Sholeh & Pawai Hafalan Tematik','maulid-nabi-1448-h-festival','cat_2','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/36e211cad552.jpg','Peringatan Maulid Nabi Muhammad SAW tahun ini diisi pawai hafalan tematik, lomba hadrah antar kelas, dan santasantri untuk 500 anak panti se-Bogor.','<p>Suasana meriah dan syahdu menyelimuti peringatan <strong>Maulid Nabi Muhammad SAW 1448 H</strong> di lingkungan SIT Al-Ihsan. Rangkaian acara diadakan sepekan dengan tema “Akhlak Generasi Digital”.</p><p>Puncak acara diisi pawai hafalan tematik antar jenjang, lomba hadrah dan nasyid antar kelas, serta kompetensi menulis kisah sirah. Seluruh kelas menampilkan karya tentang penerapan akhlak Nabi dalam bermedia sosial.</p><p>Sebagai wujud kepedulian, panitia juga menggelar <strong>santasantri untuk 500 anak panti</strong> se-Kabupaten Bogor dengan beasiswa pembelajaran singkat gratis. Kegiatan sosial tahunan ini bekerja sama dengan forum yayasan pendidikan Islam setempat.</p><p>“Maulid adalah momentum meneladani akhlak Nabi — bukan sekadar perayaan,” pesan Waka Kesantrian dalam tausiyah pembuka.</p>','Waka Kesantrian','2026-08-26',498,false,'2026-08-26T03:00:00.000Z'),
  ('news_9','Rilis: Portofolio Digital Santri Kini Bisa Diakses Orang Tua Kapan Saja','portofolio-digital-santri','cat_3','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4bdfada549db.jpg','Sistem penilaian baru berbasis portofolio memungkinkan orang tua memantau perkembangan hafalan, proyek p5, dan kebiasaan baik anak secara real-time.','<p>Sesuai arah kurikulum yang berbasis capaian dan portofolio, SIT Al-Ihsan merilis <strong>Portofolio Digital Santri</strong>. Kini orang tua dapat memantau perkembangan anak secara transparan: capaian hafalan pekanan, proyek p5, nilai formatif, hingga catatan kebiasaan baik (habit tracking).</p><p>Akses dilakukan melalui tautan yang dikirim ke nomor WhatsApp terdaftar setiap awal semester, tanpa perlu memasang aplikasi tambahan. Data dilindungi akses personal per santri.</p><p>Wali kelas dan muhafizh memperbarui data minimal sekali sepekan. Orang tua juga dapat memberi catatan dukungan yang terbaca oleh wali kelas — melengkapi komunikasi tiga arah: santri, orang tua, dan sekolah.</p><p>Panduan penggunaan (PDF & video singkat) telah dikirim melalui grup kelas. Kendala teknis dapat menghubungi tim IT sekolah pada hari kerja.</p>','Tim IT Sekolah','2026-10-15',866,false,'2026-10-15T03:00:00.000Z')
on conflict (id) do nothing;

-- events (8 baris)
insert into public.events (id, title, date, end_date, location, category, description, created_at) values
  ('ev_1','Ujian Tengah Semester Ganjil TA 2026/2027','2026-11-09','2026-11-14','Ruang kelas masing-masing','Akademik','Ujian Tengah Semester (UTS) ganjil untuk seluruh jenjang. Jadwal per kelas diumumkan oleh wali kelas melalui portofolio digital.','2026-10-01T03:00:00.000Z'),
  ('ev_2','Parenting Class: Komunikasi Positif dengan Remaja','2026-11-21',NULL,'Aula Utama & Zoom','Umum','Kelas parenting bulanan bagi orang tua santri. Narasumber praktisi keluarga sakinah. Gratis, kuota 150 peserta luring.','2026-10-02T03:00:00.000Z'),
  ('ev_3','Peringatan Sumpah Pemuda & Lomba Antar Kelas','2026-10-28',NULL,'Lapangan Utama','Kesiswaan','Upacara peringatan Sumpah Pemuda dilanjutkan final lomba futsal, catur, dan adzan beautification antar kelas.','2026-10-02T03:00:00.000Z'),
  ('ev_4','Study Tour & Rihlah Edukasi Jenjang SD','2026-12-12','2026-12-13','Kebun Raya & Observatorium Bosscha','Kesiswaan','Rihlah edukasi dua hari untuk SD kelas 4–6: belajar sains di alam, ekplorasi kebun raya, dan halaqah sore.','2026-10-03T03:00:00.000Z'),
  ('ev_5','Penerimaan Rapor & Class Meeting','2026-12-18','2026-12-19','Ruang kelas','Akademik','Pembagian rapor semester ganjil oleh wali kelas, dilanjutkan class meeting dan pentas bakat siswa.','2026-10-03T03:00:00.000Z'),
  ('ev_6','Tes Seleksi PPDB Gelombang 1 TA 2027/2028','2027-01-16','2027-01-17','Kampus Al-Ihsan','PPDB','Tes baca tulis Al-Qur’an, akademik, dan observasi kemandirian bagi pendaftar gelombang 1. Peserta membawa kartu ujian.','2026-10-20T03:00:00.000Z'),
  ('ev_7','Pengumuman Hasil Seleksi PPDB Gelombang 1','2027-01-30',NULL,'Website & WA Panitia','PPDB','Pengumuman hasil seleksi gelombang 1 melalui halaman status pendaftaran dan pesan WhatsApp panitia.','2026-10-20T03:00:00.000Z'),
  ('ev_8','Wisuda Tahfizh Angkatan XV','2027-02-27',NULL,'Masjid Agung Al-Ihsan','Kesantrian','Haflah Khatmil Qur’an dan penggelaran gelar Hafizh/Hafizhah bagi santri yang menamatkan 30 juz semester ganjil.','2026-10-05T03:00:00.000Z')
on conflict (id) do nothing;

-- programs (8 baris)
insert into public.programs (id, title, category, icon, image, excerpt, description, featured, created_at) values
  ('prg_1','Program Akademik Unggulan','akademik','graduation-cap','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e403e459a6ff.jpg','Kurikulum Merdeka diperkaya standar Cambridge: matematika, sains, dan literasi digital dengan pembelajaran berbasis proyek.','<p>Program akademik Al-Ihsan memadukan <strong>Kurikulum Merdeka</strong> dengan standar internasional <strong>Cambridge (English, Mathematics, Science)</strong>. Pembelajaran berbasis proyek (PjBL) dan inkuiri membuat siswa aktif menyelidiki, bukan sekadar menghafal.</p><p>Setiap semester siswa mengerjakan minimal dua proyek lintas disiplin yang dipresentasikan dalam “Al-Ihsan Science & Art Fair”. Klub sains, matematika, dan robotika tersedia untuk pengembangan bakat menuju OSN dan kompetisi nasional.</p>',true,DEFAULT),
  ('prg_2','Tahfizh Al-Qur’an 30 Juz','tahfizh','book-open-text','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/88cd254ff2c4.jpg','Target hafalan 30 juz dengan setoran harian, halaqah pekanan, dan muroja’ah terbimbing oleh para muhafizh bersanad.','<p>Program utama Al-Ihsan: <strong>Tahfizh Al-Qur’an dengan target 30 juz</strong> bagi santri SMP dan SMA. Metode talaqqi dan muraja’ah berjenjang — setiap santri punya kurikulum hafalan personal yang dipantau muhafizh.</p><p>Struktur harian: setoran 1 halaman sebelum kapurus, halaqah pekanan per halaqah kecil (max 12 santri), dan ujian tasmi’ setiap 5 juz di hadapan dewan muhafizh. Sejak 2019, <strong>386 santri</strong> telah tamat 30 juz.</p><p>Santri non-target tetap menikmati program Tahsin dan Tilawah terbimbing agar keluar dari Al-Ihsan dengan bacaan yang baik.</p>',true,DEFAULT),
  ('prg_3','Pembinaan Karakter & Adab','karakter','heart-handshake','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b8d5cf4298f2.jpg','Pembiasaan ibadah, adab harian, dan skema mentor–mentee: setiap 8 santri dibimbing satu pembina kesiswaan.','<p>Karakter dibangun melalui <strong>pembiasaan</strong>, bukan imbauan. Sistem <em>habit tracking</em> mencatat shalat berjamaah, tilawah, piket, dan adab harian yang dipantau pembina asrama/kelas.</p><p>Skema <strong>mentor–mentee</strong> menjaga kedekatan: satu pembina membimbing maksimal 8 santri, berdiskusi dua pekan sekali, dan menjadi jembatan komunikasi orang tua.</p><p>Muharram Camp, jurnal harian, dan apresiasi “Santri Teladan” setiap bulan melengkapi ekosistem pembinaan karakter.</p>',true,DEFAULT),
  ('prg_4','Kepemimpinan (Leadership Program)','kepemimpinan','flag','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8a8732a3790b.jpg','OSPAK, basic leadership training, dan proyek sosial santri: melatih keberanian mengambil peran sejak dini.','<p>Organisasi Santri Al-Ihsan (OSPAK) menjadi laboratorium kepemimpinan: perencanaan anggaran, pengelolaan kegiatan, dan evaluasi dikelola santri di bawah supervisi pembina.</p><p>Setiap jenjang mengikuti <strong>Basic Leadership Training</strong> tahunan, dilanjutkan wajib satu <strong>proyek sosial</strong> per tahun (berbagi takjil, mengajar anak panti, atau kampanye lingkungan).</p><p>Lulusan program ditandai dengan portofolio kepemimpinan digital yang menjadi nilai tambah saat penerimaan perguruan tinggi.</p>',false,DEFAULT),
  ('prg_5','Bahasa Arab & Inggris Aktif','bahasa','languages','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/0945b23716ab.jpeg','Speaking zone, English/Arabic day, dan kelas percakapan intensif — dwibahasa aktif, bukan sekadar teori.','<p>Bahasa Arab dan Inggris digunakan aktif melalui <strong>speaking zone</strong>, English Day (Selasa), dan Arabic Day (Kamis). Kelas percakapan kecil (max 15 siswa) diselenggarakan tiga kali sepekan.</p><p>Kegiatan pendukung: debate club, storytelling, drama, dan program <em>language immersion</em> di asrama. Tes Cambridge English dan MOFA Arab dilakukan setiap tahun untuk mengukur capaian.</p><p>Siswa berprestasi dibina menuju kompetisi debat bahasa nasional dan beasiswa studi ke Timur Tengah.</p>',true,DEFAULT),
  ('prg_6','Program Internasional','internasional','globe-2','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4966f962087e.png','Kemitraan Al-Azhar Kairo, program pertukaran, dan beasiswa studi lanjut ke Timur Tengah & Malaysia.','<p>Al-Ihsan membuka jendela dunia bagi santri melalui kemitraan dengan <strong>Universitas Al-Azhar Kairo</strong> (beasiswa penuh S-1), Universitas Islam Internasional Malaysia (IIUM), dan sekolah mitra di Turki.</p><p>Program tahunan: <em>virtual exchange</em> kelas VIII–X, studi banding ustadz/ustadzah, dan <strong>orientasi pra-berangkat</strong> bagi penerima beasiswa — mencakup bahasa, budaya, dan pendampingan keluarga.</p>',false,DEFAULT),
  ('prg_7','Ekstrakurikuler & Bakat','ekstrakurikuler','trophy','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/67a34cd28b66.jpg','12 pilihan ekskul: futsal, panahan, robotik, hadrah, jurnalistik, hingga klub debat — dibina pelatih profesional.','<p>Setiap santri wajib memilih dua ekskul per tahun dari <strong>12 pilihan</strong>: futsal, panahan, bela diri, robotik & coding, hadrah, nasyid, jurnalistik, English club, Arabic club, komputer & desain, lifskill memasak, dan klub debat.</p><p>Pelatih didatangkan dari komunitas profesional. Prestasi ekskul dibina mengikuti kompetisi kabupaten, provinsi, hingga nasional (O2SN, FLS2N, dan kejuaraan swasta).</p>',false,DEFAULT),
  ('prg_8','Boarding School / Asrama','boarding','home','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4e321266d9c4.jpg','Asrama nyaman dengan pembinaan 24 jam: makanan sehat, laundry, musyrif pendamping, dan jadwal terstruktur.','<p>Asrama Al-Ihsan dirancang sebagai “rumah kedua”: kamar ber-isian 4–6 santri dengan AC, musala lantai, ruang belajar, dan area rekreasi. <strong>Musyrif</strong> (pendamping asrama) tinggal bersama santri dan membimbing 24 jam.</p><p>Jadwal harian terstruktur: dari bangun subuh, halaqah pagi, kapurus, sekolah, ekskul, muroja’ah malam, hingga lampu mati teratur. Menu makanan diawasi ahli gizi; layanan laundry dan klinik sekolah tersedia.</p><p>Kunjungan orang tua dijadwalkan dua kali sebulan dengan jadwal fleksibel yang dikoordinasikan musyrif.</p>',true,DEFAULT)
on conflict (id) do nothing;

-- achievements (8 baris)
insert into public.achievements (id, title, level, type, year, student_name, description, image, created_at) values
  ('ach_1','Medali Emas OSN Matematika','nasional','akademik','2026','Farhan Aulia Rahman (SMA)','Juara 1 Olimpiade Sains Nasional Matematika SMA, mewakili Jawa Barat.','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/db450ccf0659.jpg','2026-09-12T03:00:00.000Z'),
  ('ach_2','Medali Emas International Science Olympiad','internasional','akademik','2025','Nadia Putri Kirana (SMP)','Emas kategori Environmental Science pada International Science Olympiad, Singapura.','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4bdfada549db.jpg','2025-08-10T03:00:00.000Z'),
  ('ach_3','Juara 1 Musabaqah Hifzil Qur’an Provinsi','daerah','keagamaan','2025','Muhammad Dzaki Alfatih (SMA)','Juara 1 kategori 30 juz MHQ tingkat Provinsi Jawa Barat.','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/78a85d93bd0d.jpg','2025-05-21T03:00:00.000Z'),
  ('ach_4','Juara 2 English Debate Competition Jabar','daerah','non-akademik','2026','Tim Debat SMAIT','Runner-up English Debate Competition antar SMA se-Jawa Barat (48 tim).','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e642a1035494.jpg','2026-09-28T03:00:00.000Z'),
  ('ach_5','Best Speaker Yakowleb Arabic Debate','internasional','non-akademik','2024','Hafizh Abdurrahman (Alumni 2024)','Best Speaker Kompetisi Debat Bahasa Arab mahasiswa & pelajar se-Asia Tenggara.','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/0945b23716ab.jpeg','2024-11-03T03:00:00.000Z'),
  ('ach_6','Juara Harapan 1 O2SN Futsal Nasional','nasional','non-akademik','2026','Tim Futsal SMPIT','Juara harapan 1 O2SN cabang futsal putra tingkat nasional.','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e403e459a6ff.jpg','2026-06-14T03:00:00.000Z'),
  ('ach_7','Juara 3 Kompetisi Sains Madrasah (KSM)','nasional','akademik','2025','Aisyah Rahmadani (SMP)','Medali perunggu KSM IPA tingkat nasional Kemenag RI.','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9d18e0e04f09.jpg','2025-09-01T03:00:00.000Z'),
  ('ach_8','Juara 1 LCC 4 Sehat 5 Sempurna Kabupaten','daerah','non-akademik','2024','Tim SDIT Al-Ihsan','Juara 1 Lomba Cerdas Cermat tingkat Kabupaten Bogor.','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b8d5cf4298f2.jpg','2024-03-17T03:00:00.000Z')
on conflict (id) do nothing;

-- galleries (13 baris)
insert into public.galleries (id, title, type, category, url, date, created_at) values
  ('gal_1','Kampus & Lingkungan Sekolah','foto','Fasilitas','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/dbddfa4cb6f2.jpeg','2026-09-01','2026-09-01T03:00:00.000Z'),
  ('gal_2','Suasana Pembelajaran Kelas','foto','Pembelajaran','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e403e459a6ff.jpg','2026-09-15','2026-09-15T03:00:00.000Z'),
  ('gal_3','Halaqah Tahfizh Pagi','foto','Kesantrian','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/88cd254ff2c4.jpg','2026-10-02','2026-10-02T03:00:00.000Z'),
  ('gal_4','Praktikum di Laboratorium IPA','foto','Pembelajaran','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/67a34cd28b66.jpg','2026-10-08','2026-10-08T03:00:00.000Z'),
  ('gal_5','Wisuda Tahfizh Angkatan XIV','foto','Kegiatan','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/78a85d93bd0d.jpg','2026-10-05','2026-10-05T03:00:00.000Z'),
  ('gal_6','Parenting Class Bersama Orang Tua','foto','Kegiatan','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/83885ab79bb2.jpg','2026-10-12','2026-10-12T03:00:00.000Z'),
  ('gal_7','Muharram Camp di Kaki Salak','foto','Kegiatan','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/62d313ea343b.jpg','2026-07-18','2026-07-18T03:00:00.000Z'),
  ('gal_8','Pawai Maulid Nabi 1448 H','foto','Kegiatan','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/36e211cad552.jpg','2026-08-26','2026-08-26T03:00:00.000Z'),
  ('gal_9','Persiapan OSN Matematika','foto','Prestasi','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/db450ccf0659.jpg','2026-09-12','2026-09-12T03:00:00.000Z'),
  ('gal_10','Latihan Tim Debat Bahasa Inggris','foto','Prestasi','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e642a1035494.jpg','2026-09-28','2026-09-28T03:00:00.000Z'),
  ('gal_11','Sosialisasi PPDB ke Sekolah Mitra','foto','Kegiatan','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5a506bc3f7da.jpg','2026-10-20','2026-10-20T03:00:00.000Z'),
  ('gal_12','Video Profil SIT Al-Ihsan (Demo)','video','Video','https://www.youtube.com/embed/aqz-KE-bpKQ','2026-10-01','2026-10-01T03:00:00.000Z'),
  ('gal_13','Video Kegiatan Kesantrian (Demo)','video','Video','https://www.youtube.com/embed/Ks-_Mh1QhMc','2026-10-01','2026-10-01T03:00:00.000Z')
on conflict (id) do nothing;

-- facilities (10 baris)
insert into public.facilities (id, name, icon, image, description, created_at) values
  ('fac_1','Masjid Al-Ihsan','moon-star',NULL,'Masjid dua lantai sebagai pusat ibadah, halaqah Tahfizh, dan kegiatan keislaman seluruh warga sekolah.',DEFAULT),
  ('fac_2','Asrama Santri','bed-double','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4e321266d9c4.jpg','Dua asrama (putra & putri) ber-AC dengan musyrif pendamping, ruang belajar, dan area rekreasi.',DEFAULT),
  ('fac_3','Laboratorium IPA & Komputer','flask-conical','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9d18e0e04f09.jpg','Tiga laboratorium lengkap: IPA/fisika-kimia, biologi, dan komputer dengan 40 unit PC spesifikasi menengah.',DEFAULT),
  ('fac_4','Perpustakaan & Reading Lounge','library',NULL,'Koleksi 15.000+ judul buku, perpustakaan digital, dan lounge baca yang nyaman di setiap gedung.',DEFAULT),
  ('fac_5','Aula & Auditorium','presentation',NULL,'Aula berkapasitas 800 orang untuk wisuda, seminar, parenting class, dan pertunjukan siswa.',DEFAULT),
  ('fac_6','Lapangan Olahraga','volleyball',NULL,'Lapangan futsal, basket, voli, dan area panahan untuk pembinaan olahraga santri.',DEFAULT),
  ('fac_7','Kantina Sehat','utensils',NULL,'Kantina dengan menu bergizi seimbang yang diawasi ahli gizi, bebas MSG berlebih untuk santri asrama.',DEFAULT),
  ('fac_8','Klinik & UKS','stethoscope',NULL,'Klinik dengan perawat full-time dan kerja sama dokter jaga; layanan UKS untuk seluruh siswa.',DEFAULT),
  ('fac_9','Studio Multimedia','clapperboard',NULL,'Studio podcast, editing, dan broadcasting untuk ekskul jurnalistik serta konten pembelajaran.',DEFAULT),
  ('fac_10','Ruang Tahfizh','book-open-text','https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/88cd254ff2c4.jpg','Sepuluh ruang halaqah khusus dengan soundproofing ringan untuk kenyamanan setoran hafalan.',DEFAULT)
on conflict (id) do nothing;

-- testimonials (4 baris)
insert into public.testimonials (id, name, role, message, rating, photo, created_at) values
  ('tst_1','Ibu Ratna Dewi','Orang Tua Santri SMP','Anak kami berubah signifikan: lebih disiplin bangun subuh, rapi, dan mandiri. Komunikasi musyrif dengan orang tua juga sangat baik — kami selalu tahu perkembangan hafalan dan perilaku anak.',5,NULL,'2026-09-10T03:00:00.000Z'),
  ('tst_2','Bapak Hendra Gunawan','Orang Tua Santri SD','Awalnya ragu anak kecil ikut full day school. Ternyata justru makin semangat belajar, hafalan juz 30 berjalan tertib, dan pulang rumah tetap hangat dengan orang tua. Terima kasih Al-Ihsan!',5,NULL,'2026-08-22T03:00:00.000Z'),
  ('tst_3','Salsabila Maharani','Alumni 2023 — Kedokteran UI','Disiplin tahfizh dan ibadah di Al-Ihsan melatih manajemen waktu yang sangat membantu di fakultas kedokteran. Pembinaan bahasa Inggris membuat saya percaya diri memahami jurnal.',5,NULL,'2026-07-15T03:00:00.000Z'),
  ('tst_4','Fahri Nur Rahman','Alumni 2022 — Beasiswa Al-Azhar Kairo','Dari speaking zone sampai orientasi pra-berangkat, semuanya dipersiapkan serius. Alhamdulillah saya lulus beasiswa penuh S-1 Al-Azhar berkat bimbingan guru-guru Al-Ihsan.',5,NULL,'2026-06-30T03:00:00.000Z')
on conflict (id) do nothing;

-- faqs (12 baris)
insert into public.faqs (id, category, question, answer, "order", created_at) values
  ('faq_1','Pendaftaran','Bagaimana cara mendaftar ke SIT Al-Ihsan?','Pendaftaran dilakukan sepenuhnya online melalui halaman PPDB Online di website ini. Isi formulir, unggah dokumen persyaratan, lalu simpan nomor registrasi Anda. Status pendaftaran dapat dipantau kapan saja melalui menu Cek Status.',1,DEFAULT),
  ('faq_2','Pendaftaran','Apakah ada tes masuk? Seperti apa bentuknya?','Ya. Tes seleksi mencakup tes baca tulis Al-Qur’an, tes akademik dasar (literasi & numerasi), observasi kemandirian, dan wawancara bersama orang tua. Materi tes disesuaikan dengan jenjang yang didaftar.',2,DEFAULT),
  ('faq_3','Biaya','Berapa biaya pendidikan di SIT Al-Ihsan?','Biaya bervariasi per jenjang. Rincian lengkap tersedia pada tabel biaya di halaman PPDB Online. Tersedia keringanan bagi hafizh 30 juz, anak yatim, dan prestasi akademik — silakan hubungi panitia untuk skema beasiswa.',3,DEFAULT),
  ('faq_4','Biaya','Apakah SPP bisa dibayar per bulan atau harus di muka?','SPP dapat dibayarkan per bulan (maksimal tanggal 10 setiap bulan) melalui transfer bank atau QRIS resmi sekolah. Tersedia juga opsi pembayaran per semester dengan potongan administrasi.',4,DEFAULT),
  ('faq_5','Asrama','Apakah wajib tinggal di asrama?','Tidak wajib. Program asrama tersedia sebagai pilihan bagi jenjang SMP dan SMA. Siswa non-asrama mengikuti full day school dengan jadwal pembinaan yang sama hingga sore.',5,DEFAULT),
  ('faq_6','Asrama','Bagaimana pengawasan di asrama? Boleh membawa gawai?','Setiap asrama didampingi musyrif yang tinggal bersama santri 24 jam dengan rasio 1:12. Gawai hanya boleh digunakan pada jadwal yang ditentukan (akhir pekan) dan disimpan oleh musyrif pada hari sekolah untuk menjaga fokus belajar.',6,DEFAULT),
  ('faq_7','Kurikulum','Kurikulum apa yang digunakan?','Kami menggunakan Kurikulum Merdeka sebagai kurikulum utama, diperkaya standar Cambridge untuk English, Mathematics, dan Science, serta kurikulum tahfizh khusus dengan target 30 juz bagi jenjang SMP–SMA.',7,DEFAULT),
  ('faq_8','Kurikulum','Apakah anak yang belum bisa Al-Qur’an bisa diterima?','Bisa. Seluruh siswa baru mengikuti placement test Tahsin. Anak ditempatkan pada kelas tahsin/tilawah sesuai kemampuannya dan dibimbing naik level hingga siap mengikuti program tahfizh.',8,DEFAULT),
  ('faq_9','Fasilitas','Fasilitas apa saja yang tersedia?','Masjid, asrama putra-putri ber-AC, 3 laboratorium, perpustakaan 15.000+ koleksi, aula 800 kursi, lapangan olahraga lengkap, kantina sehat, klinik, studio multimedia, dan 10 ruang halaqah. Detail pada halaman Profil > Fasilitas.',9,DEFAULT),
  ('faq_10','Umum','Apakah sekolah menerima non-muslim?','Sebagai sekolah Islam terpadu dengan muatan keagamaan integratif, saat ini kami hanya menerima siswa beragama Islam.',10,DEFAULT),
  ('faq_11','Umum','Bagaimana sistem komunikasi sekolah dengan orang tua?','Melalui tiga kanal: portofolio digital santri (perkembangan hafalan & nilai), grup WhatsApp resmi per kelas, serta parenting class dua bulanan. Orang tua juga dapat mengatur pertemuan dengan wali kelas kapan saja.',11,DEFAULT),
  ('faq_12','Umum','Di mana lokasi sekolah dan apakah tersedia antar-jemput?','Kampus kami berada di Jl. Pendidikan Raya No. 45, Cibinong, Kabupaten Bogor. Layanan antar-jemput bus sekolah tersedia untuk rute tertentu di area Bogor & Jakarta Timur — hubungi panitia untuk cek ketersediaan rute.',12,DEFAULT)
on conflict (id) do nothing;

-- staff (12 baris)
insert into public.staff (id, name, position, type, subject, education, photo, created_at) values
  ('stf_1','Dr. H. Ahmad Syaiful Bahri, M.Pd.','Kepala Sekolah','pimpinan','Manajemen Pendidikan','S3 UIN Syarif Hidayatullah',NULL,DEFAULT),
  ('stf_2','Ust. Fajar Ramadhan, S.Pd.I.','Waka Kesantrian & Tahfizh','pimpinan','Tahfizh & Qiroah','S1 UIN Jakarta',NULL,DEFAULT),
  ('stf_3','Ibu Siti Maryam, M.Psi.','Waka Kesiswaan & BK','pimpinan','Bimbingan Konseling','S2 Psikologi UI',NULL,DEFAULT),
  ('stf_4','H. Ridwan Hakim, S.E.','Direktur Yayasan Al-Ihsan Cendekia','pimpinan','Kepemimpinan','S1 Manajemen',NULL,DEFAULT),
  ('stf_5','Adrian Wicaksono, S.S.','Guru Bahasa Inggris','guru','Bahasa Inggris','S1 Sastra Inggris UNPAD',NULL,DEFAULT),
  ('stf_6','Dewi Anggraeni, S.Pd.','Guru Matematika','guru','Matematika','S1 Pendidikan Matematika IPB',NULL,DEFAULT),
  ('stf_7','Ust. Mukhtar Amin, Lc.','Guru Bahasa Arab','guru','Bahasa Arab','Lc. Universitas Islam Madinah',NULL,DEFAULT),
  ('stf_8','Rina Kusumawati, S.Si.','Guru IPA / Fisika','guru','IPA — Fisika','S1 Fisika ITB',NULL,DEFAULT),
  ('stf_9','Bagas Prakoso, S.Kom.','Guru Informatika & Robotik','guru','Informatika','S1 Teknik Informatika',NULL,DEFAULT),
  ('stf_10','Usth. Khadijah Salma, S.Pd.I.','Guru AKID & Muhafizhah','guru','AKID & Tahfizh','S1 Pendidikan Agama Islam',NULL,DEFAULT),
  ('stf_11','Yusuf Ardiansyah, A.Md.','Kepala Tata Usaha','tendik','Administrasi','D3 Administrasi',NULL,DEFAULT),
  ('stf_12','Nurul Hidayati, S.Ak.','Staf Keuangan & PPDB','tendik','Keuangan','S1 Akuntansi',NULL,DEFAULT)
on conflict (id) do nothing;

-- organization (8 baris)
insert into public.organization (id, name, position, parent_id, photo, "order", created_at) values
  ('org_1','H. Ridwan Hakim, S.E.','Direktur Yayasan',NULL,NULL,1,DEFAULT),
  ('org_2','Dr. H. Ahmad Syaiful Bahri, M.Pd.','Kepala Sekolah','org_1',NULL,2,DEFAULT),
  ('org_3','Ust. Fajar Ramadhan, S.Pd.I.','Waka Kesantrian','org_2',NULL,3,DEFAULT),
  ('org_4','Ibu Siti Maryam, M.Psi.','Waka Kesiswaan & BK','org_2',NULL,4,DEFAULT),
  ('org_5','Ibu Fitria Ningrum, M.Pd.','Waka Kurikulum','org_2',NULL,5,DEFAULT),
  ('org_6','Koordinator Jenjang SD','Koor. SDIT','org_5',NULL,6,DEFAULT),
  ('org_7','Koordinator Jenjang SMP','Koor. SMPIT','org_5',NULL,7,DEFAULT),
  ('org_8','Koordinator Jenjang SMA','Koor. SMAIT','org_5',NULL,8,DEFAULT)
on conflict (id) do nothing;

-- tracer_alumni (2 baris)
insert into public.tracer_alumni (id, full_name, jenjang, grad_year, whatsapp, email, current_status, institution, major_position, city_country, hafiz_juz, willing_mentor, message, consent, status, admin_notes, created_at, verified_at) values
  ('trc_1','Dinda Aulia Salsabila','SMAIT',2018,'081399887711','dinda.aulia@gmail.com','kuliah','Institut Teknologi Bandung','S1 Teknik Informatika','Bandung, Jawa Barat',30,true,'Alhamdulillah, senang sekolah membuka formulir ini. Semoga bisa terhubung kembali dengan alumni angkatan saya.',true,'terverifikasi','Data dicek silang dengan buku rekap alumni angkatan 2018.','2026-10-12T04:25:00.000Z','2026-10-14T02:10:00.000Z'),
  ('trc_2','Faris Abdurrahman','SMPIT',2013,'085711229900',NULL,'bekerja','PT Bank Syariah Indonesia','Analis Kredit Syariah','Jakarta Selatan',15,false,'Saya lulus sebelum sekolah memiliki database alumni. Mohon didata kembali, terima kasih.',true,'menunggu',NULL,'2026-10-26T09:48:00.000Z',NULL)
on conflict (id) do nothing;

-- admissions (4 baris)
insert into public.admissions (id, reg_number, full_name, nisn, gender, birth_place, birth_date, address, previous_school, jenjang, asrama, parent_name, parent_phone, parent_email, status, verified, notes, created_at) values
  ('adm_1','PPDB-2027-0001','Alika Zahra Ramadhani','0098765432','P','Bogor','2013-04-17','Jl. Melati No. 12, Cibinong, Bogor','SDIT Nurul Hikmah','SMPIT',false,'Hendra Gunawan','081277889900','hendra.gunawan@gmail.com','diterima',true,'Lulus seleksi gelombang 1 — nilai tahsin memuaskan.','2026-06-18T09:12:00.000Z'),
  ('adm_2','PPDB-2027-0002','Rizky Maulana Putra','0098112233','L','Jakarta','2011-09-02','Jl. Kenanga No. 8, Depok','SMP Negeri 3 Depok','SMAIT',true,'Siti Aminah','081233445566','siti.aminah@yahoo.com','menunggu',false,NULL,'2026-08-21T10:30:00.000Z'),
  ('adm_3','PPDB-2027-0003','Kayla Nur Fadhilah','0097445566','P','Bekasi','2019-01-25','Perum Griya Asri Blok C2, Bekasi','TK Islam Bunga Matahari','SDIT',false,'Dedi Kurniawan','085611223344','dedi.k@gmail.com','menunggu',true,NULL,'2026-09-25T08:45:00.000Z'),
  ('adm_4','PPDB-2027-0004','Bagus Setiawan','0096554433','L','Bogor','2010-12-11','Jl. Raya Tajur No. 99, Bogor','MTs Al-Hidayah','SMAIT',false,'Umar Setiawan','087822334455','umar.setiawan@gmail.com','ditolak',true,'Dokumen rapor tidak lengkap pada batas akhir gelombang 1. Dapat mendaftar kembali pada gelombang 2.','2026-10-22T14:20:00.000Z')
on conflict (id) do nothing;

-- messages (2 baris)
insert into public.messages (id, name, email, phone, subject, message, "read", created_at) values
  ('msg_1','Ibu Lestari','lestari77@gmail.com','081299887766','Tanya biaya asrama SMP','Assalamualaikum, ingin bertanya apakah biaya asrama sudah termasuk laundry dan makan? Terima kasih.',false,'2026-10-21T07:40:00.000Z'),
  ('msg_2','Bapak Anton Wibowo','anton.wib@gmail.com','085711223344','Jadwal kunjungan sekolah','Selamat pagi, kami berlima ingin survei kampus hari Sabtu. Apakah bisa dijadwalkan dengan pemandu? Terima kasih.',true,'2026-10-19T02:15:00.000Z')
on conflict (id) do nothing;

-- ============================================================================
-- CATATAN PENTING
-- ----------------------------------------------------------------------------
-- 1. JANGAN PERNAH menaruh service_role key di frontend. Gunakan anon key.
-- 2. Seluruh seed di atas adalah CONTOH DATA DEMO — ganti melalui Admin
--    Dashboard setelah login, dan hapus contoh PPDB & Pesan Masuk sebelum
--    dipakai resmi menerima data nyata.
-- 3. Nomor registrasi PPDB dibuat oleh frontend: "PPDB-{tahun}-{urut}".
-- 4. File ini IDEMPOTEN — aman dijalankan berulang (if not exists / on conflict).
-- 5. Panduan lengkap koneksi & deployment: lihat PANDUAN-DEPLOY.md
-- ============================================================================
