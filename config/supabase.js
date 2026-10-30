/* =========================================================
 * KONFIGURASI SUPABASE — SIT AL-IHSAN
 * ---------------------------------------------------------
 * Website ini berjalan dalam 2 mode:
 *
 * 1) MODE DEMO (default)
 *    - enabled: false
 *    - Seluruh data disimpan di LocalStorage browser.
 *    - Cocok untuk preview, demo ke yayasan, dan pengembangan
 *      tanpa backend.
 *
 * 2) MODE PRODUKSI (Supabase)
 *    - enabled: true
 *    - Isi url & anonKey dari project Supabase Anda
 *      (Dashboard Supabase > Settings > API).
 *    - Jalankan database/schema.sql di SQL Editor Supabase
 *      sebelum mengaktifkan mode ini.
 *
 * KEAMANAN:
 * - HANYA gunakan ANON/PUBLISHABLE key di frontend. Untuk
 *   apa pun di dunia ini, jangan pernah menaruh service_role
 *   key di file frontend karena dapat dibaca siapa saja.
 * - Keamanan data dijamin melalui Row Level Security (RLS)
 *   yang sudah didefinisikan pada database/schema.sql.
 *
 * 📖 PANDUAN LENGKAP langkah demi langkah (Supabase + deploy
 *    GitHub Pages): lihat PANDUAN-DEPLOY.md di folder utama.
 * ========================================================= */

const SUPABASE_CONFIG = {
  /* Aktifkan true setelah schema.sql dijalankan & kredensial diisi */
  enabled: true,

  /* Contoh: https://xxxxxxxxxxxx.supabase.co */
  url: 'https://sjoaficvbuknmgoawnkt.supabase.co',

  /* Anon / publishable key (BUKAN service_role) */
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqb2FmaWN2YnVrbm1nb2F3bmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMzgwNTgsImV4cCI6MjEwODkxNDA1OH0.CGMNph96uCLK2dh3nwVb-MFNGIgnE95_8X38nnMF4bo',

  /* Nama storage bucket untuk gambar & dokumen PPDB */
  storageBucket: 'school-media',
};

/* URL CDN supabase-js v2 — dimuat otomatis hanya jika enabled */
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.SUPABASE_JS_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
