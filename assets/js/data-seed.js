/* =========================================================
 * DATA-SEED.JS — Data awal (demo) SIT Al-Ihsan
 * Seluruh konten di bawah dapat dikelola melalui Admin
 * Dashboard. Ganti identitas sekolah di menu Pengaturan.
 * ========================================================= */
'use strict';

/* Hash password demo (SHA-256). Password plaintext TIDAK disimpan.
   admin@al-ihsan.sch.id → admin123 | editor@al-ihsan.sch.id → editor123 */
const SEED_PASSWORD_HASH = {
  'admin@al-ihsan.sch.id': '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'editor@al-ihsan.sch.id': 'ef5e5a1fb95055e0e56cccf98a41e784a132c14e7f6e1ba244302f0e72b29baf',
};

const IMG = {
  hero: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/dbddfa4cb6f2.jpeg',
  kampus2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/983dd8d2e7bf.jpg',
  kampus3: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cf8bd31286f1.png',
  kelas: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e403e459a6ff.jpg',
  kelas2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/83885ab79bb2.jpg',
  kelas3: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8a8732a3790b.jpg',
  kelas4: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b8d5cf4298f2.jpg',
  kelas5: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/0945b23716ab.jpeg',
  quran: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/88cd254ff2c4.jpg',
  quran2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/78a85d93bd0d.jpg',
  quran3: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4e321266d9c4.jpg',
  quran4: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/62d313ea343b.jpg',
  quran5: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/36e211cad552.jpg',
  lab: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/db450ccf0659.jpg',
  lab2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4bdfada549db.jpg',
  lab3: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9d18e0e04f09.jpg',
  lab4: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/67a34cd28b66.jpg',
  lab5: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e642a1035494.jpg',
  ppdb: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5a506bc3f7da.jpg',
  internasional: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4966f962087e.png',
};

window.SEED = {
  /* ============ PENGATURAN WEBSITE (singleton) ============ */
  settings: {
    school_name: 'Sekolah Islam Terpadu Al-Ihsan',
    short_name: 'SIT Al-Ihsan',
    tagline: "Mencetak Generasi Qur'ani, Berakhlak Mulia, Berwawasan Global",
    jenjang: 'TK, SD, SMP, SMA — Full Day & Boarding School',
    npsn: '20219876',
    akreditasi: 'A (Unggul)',

    address: 'Jl. Pendidikan Raya No. 45, Sukamaju, Cibinong, Kabupaten Bogor, Jawa Barat 16913',
    phone: '(021) 8790 1234',
    whatsapp: '6281234567890',
    email: 'info@al-ihsan.sch.id',
    ppdb_email: 'ppdb@al-ihsan.sch.id',
    maps_embed: 'https://www.google.com/maps?q=-6.470844,106.851724&hl=id&z=15&output=embed',

    instagram: 'https://instagram.com/sitalihsan',
    facebook: 'https://facebook.com/sitalihsan',
    youtube: 'https://youtube.com/@sitalihsan',
    tiktok: 'https://tiktok.com/@sitalihsan',

    logo: 'assets/images/logo.svg',
    favicon: 'assets/images/favicon.svg',
    hero_image: IMG.hero,
    hero_badge: 'Terakreditasi A (Unggul) — Boarding School Terpadu',
    hero_title: 'Tumbuh Bersama Ilmu & Iman',
    hero_subtitle: 'Lingkungan pendidikan Islam terpadu yang menggabungkan kurikulum nasional, Tahfizh Al-Qur\u2019an 30 juz, penguasaan bahasa Arab\u2013Inggris, dan pembinaan kepemimpinan untuk masa depan anak Anda.',

    about_short: 'Sekolah Islam Terpadu Al-Ihsan adalah lembaga pendidikan yang berdiri sejak 2003 di bawah naungan Yayasan Al-Ihsan Cendekia. Kami memadukan Kurikulum Merdeka, penguatan Tahfizh Al-Qur\u2019an, dan lingkungan asrama yang aman untuk membentuk generasi yang taat beribadah, berprestasi akademik, serta siap menghadapi tantangan global.',

    headmaster_name: 'Dr. H. Ahmad Syaiful Bahri, M.Pd.',
    headmaster_title: 'Kepala Sekolah',
    headmaster_photo: '',
    headmaster_greeting: '<p>Assalamu\u2019alaikum warahmatullahi wabarakatuh. Puji syukur ke hadirat Allah SWT, atas rahmat dan karunia-Nya Sekolah Islam Terpadu Al-Ihsan terus berkembang menjadi lembaga pendidikan yang dipercaya oleh ribuan keluarga.</p><p>Pendidikan bukan sekadar transfer ilmu, melainkan proses menumbuhkan adab, keimanan, dan karakter sebelum ilmu. Oleh karena itu, kami menempatkan pembinaan akhlak dan kebiasaan baik sebagai fondasi utama, lalu membangun keunggulan akademik dan keterampilan abad ke-21 di atas fondasi tersebut.</p><p>Bersama tenaga pendidik yang berdedikasi, fasilitas yang lengkap, dan ekosistem asrama yang kondusif, kami berkomitmen menghadirkan layanan pendidikan terbaik untuk mencetak generasi Qur\u2019ani yang berakhlak mulia, mandiri, dan berwawasan global.</p><p>Selamat datang di website resmi kami. Semoga informasi yang tersaji membantu keluarga Anda dalam memilih pendidikan terbaik.</p><p><strong>Wassalamu\u2019alaikum warahmatullahi wabarakatuh.</strong></p>',

    vision: 'Menjadi lembaga pendidikan Islam terpadu yang melahirkan generasi Qur\u2019ani, berakhlak mulia, unggul dalam ilmu pengetahuan dan teknologi, serta berwawasan global pada tahun 2035.',
    missions: [
      'Menyelenggarakan pembelajaran aktif, kreatif, dan menyenangkan berbasis Kurikulum Merdeka yang diperkuat nilai-nilai Al-Qur\u2019an dan Sunnah.',
      'Mengembangkan program Tahfizh Al-Qur\u2019an terstruktur dengan target hafalan 30 juz bagi santri SMP dan SMA.',
      'Membina akhlak, kemandirian, dan jiwa kepemimpinan santri melalui keteladanan, kebiasaan baik, dan pembinaan karakter berbasis boarding school.',
      'Meningkatkan kompetensi bahasa Arab dan bahasa Inggris sebagai bahasa aktif dalam pembelajaran dan interaksi sehari-hari.',
      'Menghadirkan tenaga pendidik profesional, berintegritas, dan berkelanjutan dalam pengembangan kompetensi.',
      'Membangun kemitraan strategis dengan perguruan tinggi dalam dan luar negeri bagi kelanjutan studi santri.',
    ],
    goals: [
      'Lulusan menghafal minimal 15\u201330 juz Al-Qur\u2019an dengan tajwid yang baik.',
      'Lulusan diterima di perguruan tinggi favorit dalam dan luar negeri.',
      'Terbentuknya pribadi berakhlak mulia, disiplin, dan mandiri.',
      'Penguasaan bahasa Arab dan Inggris secara aktif (lisan dan tulisan).',
      'Tumbuhnya jiwa kepemimpinan, kewirausahaan, dan kepedulian sosial.',
    ],
    values: [
      { name: 'Iman & Taqwa', desc: 'Menjadikan keimanan dan ketakwaan sebagai kompas seluruh kegiatan belajar dan pelayanan sekolah.' },
      { name: 'Integritas', desc: 'Jujur, amanah, dan konsisten antara ucapan dan perbuatan, baik saat dilihat maupun tidak.' },
      { name: 'Cinta Ilmu', desc: 'Rasa ingin tahu tinggi, budaya membaca, dan semangat belajar sepanjang hayat.' },
      { name: 'Kepedulian', desc: 'Peduli sesama, ramah lingkungan, dan aktif berkontribusi untuk masyarakat.' },
      { name: 'Jiwa Kepemimpinan', desc: 'Berani mengambil peran, bertanggung jawab, dan menginspirasi lingkungan sekitar.' },
    ],
    history: 'Sekolah Islam Terpadu Al-Ihsan bermula dari sebuah halaqah kecil di rumah pendiri, H. Muhammad Ridwan Hakim, S.E., pada tahun 2003. Kecintaannya terhadap generasi Qur\u2019ani mendorong berdirinya TK Islam Al-Ihsan pada 2005, disusul SDIT Al-Ihsan pada 2006 dengan 68 siswa angkatan pertama.\n\nPermintaan masyarakat yang terus meningkat membuat lembaga ini berkembang pesat. SMPIT dibuka pada 2010, dan SMAIT pada 2013 bersamaan dengan peresmian gedung asrama yang menjadikan Al-Ihsan sebagai boarding school terpadu penuh. Pada 2016 seluruh jenjang meraih akreditasi A, dan pada 2019 sekolah memulai program dwibahasa aktif Arab\u2013Inggris.\n\nKini, dengan lebih dari 1.200 santri, 85 tenaga pendidik, dan ribuan alumni yang tersebar di perguruan tinggi ternama dalam maupun luar negeri, Al-Ihsan terus berbenah untuk menjadi rujukan sekolah Islam terpadu berkualitas internasional.',
    milestones: [
      { year: '2003', text: 'Berdirinya halaqah Tahfizh Al-Qur\u2019an di bawah naungan Yayasan Al-Ihsan Cendekia.' },
      { year: '2005', text: 'TK Islam Al-Ihsan resmi beroperasi sebagai jenjang pertama.' },
      { year: '2006', text: 'SDIT Al-Ihsan dibuka dengan 68 siswa angkatan pertama.' },
      { year: '2010', text: 'SMPIT Al-Ihsan berdiri; gedung pembelajaran baru diresmikan.' },
      { year: '2013', text: 'SMAIT Al-Ihsan dibuka bersama peresmian asrama \u2014 Al-Ihsan menjadi boarding school terpadu.' },
      { year: '2016', text: 'Seluruh jenjang meraih akreditasi A (Unggul).' },
      { year: '2019', text: 'Program dwibahasa aktif Arab\u2013Inggris dan kelas internasional dimulai.' },
      { year: '2024', text: 'Meraih predikat Sekolah Penggerak dan 3.000+ alumni.' },
    ],
    stats: { students: 1250, teachers: 85, alumni: 3400, achievements: 120 },

    /* —— SEBARAN ALUMNI (bukti mutu lulusan) — kelola via Dashboard → Pengaturan → Alumni —— */
    alumni_lanjut_pct: 92,
    alumni_ptn_pct: 68,
    alumni_luar_pct: 14,
    alumni_hafiz_pct: 81,
    alumni_note: 'Data pemantauan alumni angkatan 2009\u20132025, diperbarui per Juli 2026 melalui tracer study dan keterhubungan alumni.',
    alumni_universities: [
      { name: 'Universitas Indonesia (UI)', count: 86, type: 'dalam' },
      { name: 'Institut Teknologi Bandung (ITB)', count: 71, type: 'dalam' },
      { name: 'Universitas Gadjah Mada (UGM)', count: 94, type: 'dalam' },
      { name: 'Institut Pertanian Bogor (IPB)', count: 58, type: 'dalam' },
      { name: 'UIN Syarif Hidayatullah Jakarta', count: 112, type: 'dalam' },
      { name: 'Universitas Al-Azhar, Kairo', count: 39, type: 'luar' },
      { name: 'Universitas Islam Madinah', count: 34, type: 'luar' },
      { name: 'International Islamic Univ. Malaysia', count: 12, type: 'luar' },
    ],
    alumni_career: [
      { label: 'Melanjutkan Studi', pct: 78, icon: 'graduation-cap' },
      { label: 'Bekerja / ASN & BUMN', pct: 12, icon: 'briefcase' },
      { label: 'Wirausaha', pct: 6, icon: 'store' },
      { label: 'Pengajar & Pengampu Masjid', pct: 4, icon: 'heart-handshake' },
    ],

    seo_title: 'SIT Al-Ihsan — Sekolah Islam Terpadu & Boarding School Terakreditasi A',
    seo_description: 'Sekolah Islam Terpadu Al-Ihsan: TK, SD, SMP, SMA dengan program Tahfizh 30 juz, kurikulum Merdeka + Cambridge, bahasa Arab-Inggris aktif, dan asrama nyaman. PPDB dibuka!',
    seo_keywords: 'sekolah islam terpadu, boarding school bogor, tahfizh quran, SMPIT, SMAIT, ppdb 2027',
    ga_id: '',

    ppdb_open: true,
    ppdb_tahun_ajaran: '2027/2028',
    ppdb_gelombang: [
      { nama: 'Gelombang 1', mulai: '2026-11-01', selesai: '2027-01-31' },
      { nama: 'Gelombang 2', mulai: '2027-02-01', selesai: '2027-04-30' },
      { nama: 'Gelombang 3', mulai: '2027-05-01', selesai: '2027-06-15' },
    ],
    ppdb_persyaratan: [
      'Mengisi formulir pendaftaran online di website ini.',
      'Usia sesuai jenjang pada tanggal 1 Juli 2027 (SD: 6\u20137 tahun; SMP: \u226413 tahun; SMA: \u226416 tahun).',
      'Foto salinan Akta Kelahiran dan Kartu Keluarga (PDF/JPG).',
      'Pas foto berwarna 3\u00d74 latar biru (2 lembar, JPG).',
      'Fotokopi rapor semester terakhir dan ijazah/SKL bagi pendaftar SMP & SMA.',
      'Surat keterangan sehat dari fasilitas kesehatan (diunggah setelah lulus tes).',
      'Mengikuti tes seleksi: baca tulis Al-Qur\u2019an, akademik, dan wawancara bersama orang tua.',
    ],
    ppdb_alur: [
      { t: 'Registrasi Online', d: 'Isi formulir pendaftaran dan unggah dokumen persyaratan di halaman PPDB website.' },
      { t: 'Verifikasi Berkas', d: 'Panitia memverifikasi kelengkapan dokumen maksimal 2\u00d724 jam kerja (status dapat dipantau online).' },
      { t: 'Kartu Ujian', d: 'Kartu tes seleksi diterbitkan otomatis melalui dashboard status pendaftaran.' },
      { t: 'Tes Seleksi', d: 'Tes baca tulis Al-Qur\u2019an, akademik dasar, dan observasi kemandirian.' },
      { t: 'Wawancara', d: 'Wawancara calon siswa dan orang tua/wali bersama psikolog dan pimpinan sekolah.' },
      { t: 'Pengumuman', d: 'Hasil seleksi diumumkan melalui halaman status pendaftaran dan WA panitia.' },
      { t: 'Daftar Ulang', d: 'Pembayaran biaya masuk dan pengesahan pada jadwal yang ditentukan.' },
    ],
    ppdb_jadwal: [
      'Gelombang 1: Tes diadakan setiap Sabtu pekan ke-3 (Januari 2027), pukul 07.30\u201313.00 WIB.',
      'Gelombang 2: Tes diadakan setiap Sabtu pekan ke-2 (Maret\u2013April 2027).',
      'Wawancara dilakukan sehari setelah tes akademik, secara online/offline sesuai pilihan.',
    ],
    ppdb_biaya: [
      { jenjang: 'TKIT', ppdb: 4500000, spp: 850000, ket: 'Termasuk seragam 1 set & buku' },
      { jenjang: 'SDIT', ppdb: 6500000, spp: 1250000, ket: 'Termasuk seragam, buku, & program Tahfizh' },
      { jenjang: 'SMPIT', ppdb: 8500000, spp: 1650000, ket: 'Termasuk seragam, buku, & program Tahfizh' },
      { jenjang: 'SMAIT', ppdb: 9500000, spp: 1850000, ket: 'Termasuk seragam, buku, & bimbingan studi lanjut' },
      { jenjang: 'Asrama (opsional, SMP/SMA)', ppdb: 3500000, spp: 2500000, ket: 'Termasuk makan 3\u00d7, laundry, & pembinaan 24 jam' },
    ],
    ppdb_kontak: 'Panitia PPDB SIT Al-Ihsan \u2014 Gedung A Lantai 1, Jl. Pendidikan Raya No. 45 Cibinong, Bogor',
    ppdb_wa_panitia: '6281234567890',

    updated_at: '2026-10-30T03:00:00.000Z',
  },

  /* ============ KATEGORI BERITA ============ */
  categories: [
    { id: 'cat_1', name: 'Prestasi', slug: 'prestasi', created_at: '2026-01-05T02:00:00.000Z' },
    { id: 'cat_2', name: 'Kegiatan', slug: 'kegiatan', created_at: '2026-01-05T02:00:00.000Z' },
    { id: 'cat_3', name: 'Pengumuman', slug: 'pengumuman', created_at: '2026-01-05T02:00:00.000Z' },
    { id: 'cat_4', name: 'Artikel', slug: 'artikel', created_at: '2026-01-05T02:00:00.000Z' },
    { id: 'cat_5', name: 'Kerja Sama', slug: 'kerja-sama', created_at: '2026-01-05T02:00:00.000Z' },
  ],

  /* ============ BERITA & ARTIKEL ============ */
  news: [
    {
      id: 'news_1', title: 'Siswa SIT Al-Ihsan Raih Juara 1 OSN Matematika Tingkat Nasional 2026',
      slug: 'juara-1-osn-matematika-nasional-2026', category_id: 'cat_1',
      image: IMG.lab, author: 'Humas Al-Ihsan',
      date: '2026-09-12', views: 1523, featured: true,
      excerpt: 'Farhan Aulia Rahman, siswa SMAIT kelas XI, berhasil meraih medali emas OSN Matematika tingkat nasional setelah mengalahkan 34 peserta provinsi lainnya.',
      content: '<p>Alhamdulillah, prestasi membanggakan kembali diraih keluarga besar SIT Al-Ihsan. Farhan Aulia Rahman, siswa kelas XI SMAIT Al-Ihsan, berhasil meraih <strong>medali emas Olimpiade Sains Nasional (OSN) Matematika tingkat nasional tahun 2026</strong> yang diselenggarakan di Yogyakarta.</p><p>Farhan yang mulai menunjukkan ketertarikan pada matematika sejak SMP ini merupakan binaan klub sains sekolah. "Kuncinya konsisten latihan soal dan berani bertanya kepada pembimbing," ujar pemuda kelahiran Bogor ini. Ia kini menjadi pembimbing sejawat bagi adik-adik kelas di klub sains.</p><p>Kepala Sekolah, Dr. H. Ahmad Syaiful Bahri, M.Pd., menyampaikan apresiasi kepada seluruh pembimbing dan berharap capaian ini memotivasi santri lain. "Kami membuktikan bahwa santri hafizh juga bisa unggul di bidang sains. Ilmu dan iman berjalan beriringan," katanya dalam apel senin.</p><p>Sebagai tindak lanjut, Farhan akan mewakili provinsi Jawa Barat dalam seleksi nasional menuju International Mathematical Olympiad (IMO) 2027. Doakan dan dukung terus langkahnya!</p>',
      created_at: '2026-09-12T03:00:00.000Z',
    },
    {
      id: 'news_2', title: 'Wisuda Tahfizh Angkatan XIV: 47 Santri Baru Menghafal 30 Juz',
      slug: 'wisuda-tahfizh-angkatan-xiv', category_id: 'cat_2',
      image: IMG.quran2, author: 'Waka Kesantrian',
      date: '2026-10-05', views: 987, featured: true,
      excerpt: 'Total 47 santri SMP dan SMA dinyatakan tamat hafalan 30 juz dan digelari secara resmi dalam acara Haflah Khatmil Qur\u2019an di Masjid Agung Al-Ihsan.',
      content: '<p>Acara Haflah Khatmil Qur\u2019an dan Wisuda Tahfizh Angkatan XIV diselenggarakan di Masjid Agung Al-Ihsan dengan dihadiri para orang tua, tokoh masyarakat, dan para ulama. Tahun ini, <strong>47 santri</strong> dari jenjang SMP dan SMA resmi digelari sebagai <strong>Hafizh/Hafizhah 30 juz</strong>.</p><p>Semangat kebersamaan terlihat sejak pembukaan: pidato sambutan dari perwakilan orang tua yang sebagian besar lulusan program yang sama, lalu penampilan murottal merdu dari para wisudawan. Tasyakuran diakhiri pembacaan hasanah dan doa bersama yang mengharukan.</p><p>Sejak diberlakukannya target Tahfizh 30 juz untuk santri SMP\u2013SMA pada 2019, total 386 santri telah menamatkan hafalan Al-Qur\u2019an. Program ini berjalan melalui setoran harian, halaqah pekanan, dan muroja\u2019ah terbimbing oleh para muhafizh.</p><p>"Tamat 30 juz bukan akhir, melainkan gerbang untuk terus menjaga hafalan hingga akhir hayat. Semoga kalian menjadi ulama dan ulul albab," pesan Kepala Yayasan dalam sambutannya.</p>',
      created_at: '2026-10-05T03:00:00.000Z',
    },
    {
      id: 'news_3', title: 'PPDB Tahun Ajaran 2027/2028 Resmi Dibuka \u2014 Gelombang 1 Mulai November',
      slug: 'ppdb-2027-2028-dibuka', category_id: 'cat_3',
      image: IMG.ppdb, author: 'Panitia PPDB',
      date: '2026-10-20', views: 2310, featured: true,
      excerpt: 'Pendaftaran siswa baru jenjang TKIT, SDIT, SMPIT, dan SMAIT dibuka mulai 1 November 2026. Kuota terbatas \u2014 daftar lebih awal dan nikmati potongan biaya gelombang 1.',
      content: '<p>Alhamdulillah, <strong>Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2027/2028</strong> resmi dibuka. Pendaftaran dilakukan <strong>sepenuhnya online</strong> melalui halaman PPDB website resmi sekolah.</p><p>Gelombang 1 dibuka dari <strong>1 November 2026 hingga 31 Januari 2027</strong>. Kuota setiap jenjang terbatas untuk menjaga kualitas layanan: TKIT 40 siswa, SDIT 96 siswa, SMPIT 120 siswa, dan SMAIT 120 siswa (termasuk jalur reguler dan asrama).</p><p>Sebagai apresiasi keikutsertaan sejak awal, pendaftar Gelombang 1 mendapatkan <strong>potongan biaya pendaftaran 25%</strong> dan prioritas pemilihan program asrama. Syarat dan ketentuan berlaku.</p><p>Masyarakat dapat mengakses informasi lengkap \u2014 persyaratan, alur pendaftaran, jadwal seleksi, dan rincian biaya \u2014 pada menu <strong>PPDB Online</strong>. Pertanyaan dapat disampaikan ke panitia melalui WhatsApp resmi yang tertera di halaman PPDB.</p>',
      created_at: '2026-10-20T03:00:00.000Z',
    },
    {
      id: 'news_4', title: 'Muharram Camp: Belajar Karakter & Kemandirian di Alam Terbuka',
      slug: 'muharram-camp-karakter-alam-terbuka', category_id: 'cat_2',
      image: IMG.quran4, author: 'Waka Kesiswaan',
      date: '2026-07-18', views: 645, featured: false,
      excerpt: 'Selama 3 hari 2 malam, 210 santri kelas VII mengikuti kemah pembinaan karakter: navigasi, memasak mandiri, dan halaqah malam di bawah bintang.',
      content: '<p>Tradisi pembuka tahun ajaran kembali digelar: <strong>Muharram Camp</strong>. Sebanyak 210 santri kelas VII menghabiskan 3 hari 2 malam di kaki Gunung Salak untuk pembinaan karakter berbasis alam terbuka.</p><p>Selama kemah, santri belajar navigasi kompas, memasang tenda, memasak mandiri berkelompok, dan menyusun jadwal shalat berjamaah. Malam harinya diisi halaqah tausiyah dan refleksi di bawah langit terbuka.</p><p>"Kemandirian tidak bisa diajarkan hanya lewat teori. Di alam, anak belajar tanggung jawab nyata \u2014 dari jadwal minum hingga menjaga kebersihan kamp," jelas pembina kamp, Ust. Fajar Ramadhan, S.Pd.</p><p>Kegiatan ditutup dengan pendakian ringan dan penanaman 100 bibit pohon sebagai simbol komitmen menjaga lingkungan sepanjang tahun ajaran baru.</p>',
      created_at: '2026-07-18T03:00:00.000Z',
    },
    {
      id: 'news_5', title: 'MoU dengan Universitas Al-Azhar Kairo: Jalur Beasiswa S-1 bagi Lulusan Tahfizh',
      slug: 'mou-universitas-al-azhar-kairo', category_id: 'cat_5',
      image: IMG.kelas3, author: 'Humas Al-Ihsan',
      date: '2026-08-22', views: 1102, featured: false,
      excerpt: 'SIT Al-Ihsan menandatangani nota kesepahaman dengan Universitas Al-Azhar Kairo: kuota beasiswa penuh S-1 bidang keislaman dan farmasi setiap tahunnya.',
      content: '<p>Kabar gembira bagi para santri dan orang tua! SIT Al-Ihsan resmi menandatangani <strong>Nota Kesepahaman (MoU) dengan Universitas Al-Azhar, Kairo, Mesir</strong>, pada Sabtu (22/8) di aula sekolah.</p><p>Melalui kemitraan ini, Al-Ihsan mendapat <strong>kuota beasiswa penuh S-1</strong> \u2014 meliputi SPP, asrama, dan tiket \u2014 untuk 5 lulusan terbaik setiap tahunnya pada bidang Syari\u2019ah, Usuluddin, dan Farmasi. Seleksi internal dilakukan melalui tes bahasa Arab dan hafalan.</p><p>Rektor pembantu bidang kerja sama Al-Azhar, Prof. Dr. Mahmoud Al-Sayyid, menyampaikan apresiasi atas model integrasi tahfizh dan sains di Al-Ihsan. "Santri yang menghafal dan berpikir kritis adalah bibit unggul ulama masa depan," ujarnya.</p><p>MoU juga mencakup program guru tamu daring, pertukaran materi pembelajaran bahasa Arab, dan program orientasi pra-berangkat bagi penerima beasiswa.</p>',
      created_at: '2026-08-22T03:00:00.000Z',
    },
    {
      id: 'news_6', title: 'Sekolah Gelar Parenting Class: \u201cMendampingi Anak di Era Digital\u201d',
      slug: 'parenting-class-era-digital', category_id: 'cat_4',
      image: IMG.kelas2, author: 'Waka Humas',
      date: '2026-10-12', views: 534, featured: false,
      excerpt: 'Lebih dari 300 orang tua mengikuti parenting class bersama praktisi keluarga sakinah membahas gawai, konten, dan komunikasi positif dengan remaja.',
      content: '<p>Semangat kemitraan sekolah dan keluarga kembali terlihat pada <strong>Parenting Class</strong> bertema \u201cMendampingi Anak di Era Digital\u201d yang diikuti lebih dari 300 orang tua secara luring dan daring.</p><p>Narasumber, Umi Kulsum, M.Psi., praktisi keluarga sakinah, mengingatkan bahwa gawai bukan musuh \u2014 yang penting adalah kesepakatan rumah dan teladan orang tua. \u201cAnak meniru apa yang dilihat, bukan apa yang diperintahkan,\u201d tuturnya.</p><p>Materi mencakup pembagian usia layar yang sehat, ciri konten berbahaya, teknik komunikasi positif untuk remaja, serta jadwal kual bersama keluarga. Sesinya ditutup tanya jawab hangat dan komitmen \u201cdigital friendly home\u201d.</p><p>Sekolah berencana menjadikan parenting class sebagai agenda rutin dua bulanan dengan topik berbeda. Materi dan rekaman tersedia bagi orang tua melalui grup resmi per kelas.</p>',
      created_at: '2026-10-12T03:00:00.000Z',
    },
    {
      id: 'news_7', title: 'Tim Debat Bahasa Inggris SMAIT Juara 2 English Debate Jawa Barat',
      slug: 'juara-2-english-debate-jabar', category_id: 'cat_1',
      image: IMG.lab5, author: 'Humas Al-Ihsan',
      date: '2026-09-28', views: 720, featured: false,
      excerpt: 'Tim debat Al-Ihsan lolos hingga babak final kompetisi debat bahasa Inggris antar SMA se-Jawa Barat dengan mosi kebijakan pendidikan digital.',
      content: '<p>Tim debat bahasa Inggris SMAIT Al-Ihsan meraih <strong>Juara 2</strong> pada English Debate Competition se-Jawa Barat yang diikuti 48 tim. Kompetisi menggunakan format parlementer Asia dengan tiga mosi kebijakan pendidikan dan teknologi.</p><p>Perjalanan tim yang diisi mahfuzh, Nabilah, dan Rizqi ini tidak mudah: dua kali berjumpa juara bertahan pada perempatfinal dan semifinal. Keunggulan rebutan (rebuttal) dan argumentasi berbasis data menjadi kunci kemenangan mereka.</p><p>Pelatih tim, Mr. Adrian Wicaksono, S.S., mengatakan latihan intensif dwi-mingguan dengan metode \u201cmotion of the day\u201d membuahkan hasil. \u201cBahasa aktif bukan jargon; ini buktinya,\u201d katanya.</p><p>Selanjutnya tim akan membina regu cadangan kelas X dan menargetkan gelar juara 1 pada edisi 2027, insyaAllah.</p>',
      created_at: '2026-09-28T03:00:00.000Z',
    },
    {
      id: 'news_8', title: 'Maulid Nabi 1448 H: Festival Anak Sholeh & Pawai Hafalan Tematik',
      slug: 'maulid-nabi-1448-h-festival', category_id: 'cat_2',
      image: IMG.quran5, author: 'Waka Kesantrian',
      date: '2026-08-26', views: 498, featured: false,
      excerpt: 'Peringatan Maulid Nabi Muhammad SAW tahun ini diisi pawai hafalan tematik, lomba hadrah antar kelas, dan santasantri untuk 500 anak panti se-Bogor.',
      content: '<p>Suasana meriah dan syahdu menyelimuti peringatan <strong>Maulid Nabi Muhammad SAW 1448 H</strong> di lingkungan SIT Al-Ihsan. Rangkaian acara diadakan sepekan dengan tema \u201cAkhlak Generasi Digital\u201d.</p><p>Puncak acara diisi pawai hafalan tematik antar jenjang, lomba hadrah dan nasyid antar kelas, serta kompetensi menulis kisah sirah. Seluruh kelas menampilkan karya tentang penerapan akhlak Nabi dalam bermedia sosial.</p><p>Sebagai wujud kepedulian, panitia juga menggelar <strong>santasantri untuk 500 anak panti</strong> se-Kabupaten Bogor dengan beasiswa pembelajaran singkat gratis. Kegiatan sosial tahunan ini bekerja sama dengan forum yayasan pendidikan Islam setempat.</p><p>\u201cMaulid adalah momentum meneladani akhlak Nabi \u2014 bukan sekadar perayaan,\u201d pesan Waka Kesantrian dalam tausiyah pembuka.</p>',
      created_at: '2026-08-26T03:00:00.000Z',
    },
    {
      id: 'news_9', title: 'Rilis: Portofolio Digital Santri Kini Bisa Diakses Orang Tua Kapan Saja',
      slug: 'portofolio-digital-santri', category_id: 'cat_3',
      image: IMG.lab2, author: 'Tim IT Sekolah',
      date: '2026-10-15', views: 866, featured: false,
      excerpt: 'Sistem penilaian baru berbasis portofolio memungkinkan orang tua memantau perkembangan hafalan, proyek p5, dan kebiasaan baik anak secara real-time.',
      content: '<p>Sesuai arah kurikulum yang berbasis capaian dan portofolio, SIT Al-Ihsan merilis <strong>Portofolio Digital Santri</strong>. Kini orang tua dapat memantau perkembangan anak secara transparan: capaian hafalan pekanan, proyek p5, nilai formatif, hingga catatan kebiasaan baik (habit tracking).</p><p>Akses dilakukan melalui tautan yang dikirim ke nomor WhatsApp terdaftar setiap awal semester, tanpa perlu memasang aplikasi tambahan. Data dilindungi akses personal per santri.</p><p>Wali kelas dan muhafizh memperbarui data minimal sekali sepekan. Orang tua juga dapat memberi catatan dukungan yang terbaca oleh wali kelas \u2014 melengkapi komunikasi tiga arah: santri, orang tua, dan sekolah.</p><p>Panduan penggunaan (PDF & video singkat) telah dikirim melalui grup kelas. Kendala teknis dapat menghubungi tim IT sekolah pada hari kerja.</p>',
      created_at: '2026-10-15T03:00:00.000Z',
    },
  ],

  /* ============ AGENDA / EVENTS ============ */
  events: [
    { id: 'ev_1', title: 'Ujian Tengah Semester Ganjil TA 2026/2027', date: '2026-11-09', end_date: '2026-11-14', location: 'Ruang kelas masing-masing', category: 'Akademik', description: 'Ujian Tengah Semester (UTS) ganjil untuk seluruh jenjang. Jadwal per kelas diumumkan oleh wali kelas melalui portofolio digital.', created_at: '2026-10-01T03:00:00.000Z' },
    { id: 'ev_2', title: 'Parenting Class: Komunikasi Positif dengan Remaja', date: '2026-11-21', end_date: '', location: 'Aula Utama & Zoom', category: 'Umum', description: 'Kelas parenting bulanan bagi orang tua santri. Narasumber praktisi keluarga sakinah. Gratis, kuota 150 peserta luring.', created_at: '2026-10-02T03:00:00.000Z' },
    { id: 'ev_3', title: 'Peringatan Sumpah Pemuda & Lomba Antar Kelas', date: '2026-10-28', end_date: '', location: 'Lapangan Utama', category: 'Kesiswaan', description: 'Upacara peringatan Sumpah Pemuda dilanjutkan final lomba futsal, catur, dan adzan beautification antar kelas.', created_at: '2026-10-02T03:00:00.000Z' },
    { id: 'ev_4', title: 'Study Tour & Rihlah Edukasi Jenjang SD', date: '2026-12-12', end_date: '2026-12-13', location: 'Kebun Raya & Observatorium Bosscha', category: 'Kesiswaan', description: 'Rihlah edukasi dua hari untuk SD kelas 4\u20136: belajar sains di alam, ekplorasi kebun raya, dan halaqah sore.', created_at: '2026-10-03T03:00:00.000Z' },
    { id: 'ev_5', title: 'Penerimaan Rapor & Class Meeting', date: '2026-12-18', end_date: '2026-12-19', location: 'Ruang kelas', category: 'Akademik', description: 'Pembagian rapor semester ganjil oleh wali kelas, dilanjutkan class meeting dan pentas bakat siswa.', created_at: '2026-10-03T03:00:00.000Z' },
    { id: 'ev_6', title: 'Tes Seleksi PPDB Gelombang 1 TA 2027/2028', date: '2027-01-16', end_date: '2027-01-17', location: 'Kampus Al-Ihsan', category: 'PPDB', description: 'Tes baca tulis Al-Qur\u2019an, akademik, dan observasi kemandirian bagi pendaftar gelombang 1. Peserta membawa kartu ujian.', created_at: '2026-10-20T03:00:00.000Z' },
    { id: 'ev_7', title: 'Pengumuman Hasil Seleksi PPDB Gelombang 1', date: '2027-01-30', end_date: '', location: 'Website & WA Panitia', category: 'PPDB', description: 'Pengumuman hasil seleksi gelombang 1 melalui halaman status pendaftaran dan pesan WhatsApp panitia.', created_at: '2026-10-20T03:00:00.000Z' },
    { id: 'ev_8', title: 'Wisuda Tahfizh Angkatan XV', date: '2027-02-27', end_date: '', location: 'Masjid Agung Al-Ihsan', category: 'Kesantrian', description: 'Haflah Khatmil Qur\u2019an dan penggelaran gelar Hafizh/Hafizhah bagi santri yang menamatkan 30 juz semester ganjil.', created_at: '2026-10-05T03:00:00.000Z' },
  ],

  /* ============ PROGRAM PENDIDIKAN ============ */
  programs: [
    {
      id: 'prg_1', title: 'Program Akademik Unggulan', category: 'akademik', icon: 'graduation-cap',
      image: IMG.kelas, featured: true,
      excerpt: 'Kurikulum Merdeka diperkaya standar Cambridge: matematika, sains, dan literasi digital dengan pembelajaran berbasis proyek.',
      description: '<p>Program akademik Al-Ihsan memadukan <strong>Kurikulum Merdeka</strong> dengan standar internasional <strong>Cambridge (English, Mathematics, Science)</strong>. Pembelajaran berbasis proyek (PjBL) dan inkuiri membuat siswa aktif menyelidiki, bukan sekadar menghafal.</p><p>Setiap semester siswa mengerjakan minimal dua proyek lintas disiplin yang dipresentasikan dalam \u201cAl-Ihsan Science & Art Fair\u201d. Klub sains, matematika, dan robotika tersedia untuk pengembangan bakat menuju OSN dan kompetisi nasional.</p>',
    },
    {
      id: 'prg_2', title: 'Tahfizh Al-Qur\u2019an 30 Juz', category: 'tahfizh', icon: 'book-open-text',
      image: IMG.quran, featured: true,
      excerpt: 'Target hafalan 30 juz dengan setoran harian, halaqah pekanan, dan muroja\u2019ah terbimbing oleh para muhafizh bersanad.',
      description: '<p>Program utama Al-Ihsan: <strong>Tahfizh Al-Qur\u2019an dengan target 30 juz</strong> bagi santri SMP dan SMA. Metode talaqqi dan muraja\u2019ah berjenjang \u2014 setiap santri punya kurikulum hafalan personal yang dipantau muhafizh.</p><p>Struktur harian: setoran 1 halaman sebelum kapurus, halaqah pekanan per halaqah kecil (max 12 santri), dan ujian tasmi\u2019 setiap 5 juz di hadapan dewan muhafizh. Sejak 2019, <strong>386 santri</strong> telah tamat 30 juz.</p><p>Santri non-target tetap menikmati program Tahsin dan Tilawah terbimbing agar keluar dari Al-Ihsan dengan bacaan yang baik.</p>',
    },
    {
      id: 'prg_3', title: 'Pembinaan Karakter & Adab', category: 'karakter', icon: 'heart-handshake',
      image: IMG.kelas4, featured: true,
      excerpt: 'Pembiasaan ibadah, adab harian, dan skema mentor\u2013mentee: setiap 8 santri dibimbing satu pembina kesiswaan.',
      description: '<p>Karakter dibangun melalui <strong>pembiasaan</strong>, bukan imbauan. Sistem <em>habit tracking</em> mencatat shalat berjamaah, tilawah, piket, dan adab harian yang dipantau pembina asrama/kelas.</p><p>Skema <strong>mentor\u2013mentee</strong> menjaga kedekatan: satu pembina membimbing maksimal 8 santri, berdiskusi dua pekan sekali, dan menjadi jembatan komunikasi orang tua.</p><p>Muharram Camp, jurnal harian, dan apresiasi \u201cSantri Teladan\u201d setiap bulan melengkapi ekosistem pembinaan karakter.</p>',
    },
    {
      id: 'prg_4', title: 'Kepemimpinan (Leadership Program)', category: 'kepemimpinan', icon: 'flag',
      image: IMG.kelas3, featured: false,
      excerpt: 'OSPAK, basic leadership training, dan proyek sosial santri: melatih keberanian mengambil peran sejak dini.',
      description: '<p>Organisasi Santri Al-Ihsan (OSPAK) menjadi laboratorium kepemimpinan: perencanaan anggaran, pengelolaan kegiatan, dan evaluasi dikelola santri di bawah supervisi pembina.</p><p>Setiap jenjang mengikuti <strong>Basic Leadership Training</strong> tahunan, dilanjutkan wajib satu <strong>proyek sosial</strong> per tahun (berbagi takjil, mengajar anak panti, atau kampanye lingkungan).</p><p>Lulusan program ditandai dengan portofolio kepemimpinan digital yang menjadi nilai tambah saat penerimaan perguruan tinggi.</p>',
    },
    {
      id: 'prg_5', title: 'Bahasa Arab & Inggris Aktif', category: 'bahasa', icon: 'languages',
      image: IMG.kelas5, featured: true,
      excerpt: 'Speaking zone, English/Arabic day, dan kelas percakapan intensif \u2014 dwibahasa aktif, bukan sekadar teori.',
      description: '<p>Bahasa Arab dan Inggris digunakan aktif melalui <strong>speaking zone</strong>, English Day (Selasa), dan Arabic Day (Kamis). Kelas percakapan kecil (max 15 siswa) diselenggarakan tiga kali sepekan.</p><p>Kegiatan pendukung: debate club, storytelling, drama, dan program <em>language immersion</em> di asrama. Tes Cambridge English dan MOFA Arab dilakukan setiap tahun untuk mengukur capaian.</p><p>Siswa berprestasi dibina menuju kompetisi debat bahasa nasional dan beasiswa studi ke Timur Tengah.</p>',
    },
    {
      id: 'prg_6', title: 'Program Internasional', category: 'internasional', icon: 'globe-2',
      image: IMG.internasional, featured: false,
      excerpt: 'Kemitraan Al-Azhar Kairo, program pertukaran, dan beasiswa studi lanjut ke Timur Tengah & Malaysia.',
      description: '<p>Al-Ihsan membuka jendela dunia bagi santri melalui kemitraan dengan <strong>Universitas Al-Azhar Kairo</strong> (beasiswa penuh S-1), Universitas Islam Internasional Malaysia (IIUM), dan sekolah mitra di Turki.</p><p>Program tahunan: <em>virtual exchange</em> kelas VIII\u2013X, studi banding ustadz/ustadzah, dan <strong>orientasi pra-berangkat</strong> bagi penerima beasiswa \u2014 mencakup bahasa, budaya, dan pendampingan keluarga.</p>',
    },
    {
      id: 'prg_7', title: 'Ekstrakurikuler & Bakat', category: 'ekstrakurikuler', icon: 'trophy',
      image: IMG.lab4, featured: false,
      excerpt: '12 pilihan ekskul: futsal, panahan, robotik, hadrah, jurnalistik, hingga klub debat \u2014 dibina pelatih profesional.',
      description: '<p>Setiap santri wajib memilih dua ekskul per tahun dari <strong>12 pilihan</strong>: futsal, panahan, bela diri, robotik & coding, hadrah, nasyid, jurnalistik, English club, Arabic club, komputer & desain, lifskill memasak, dan klub debat.</p><p>Pelatih didatangkan dari komunitas profesional. Prestasi ekskul dibina mengikuti kompetisi kabupaten, provinsi, hingga nasional (O2SN, FLS2N, dan kejuaraan swasta).</p>',
    },
    {
      id: 'prg_8', title: 'Boarding School / Asrama', category: 'boarding', icon: 'home',
      image: IMG.quran3, featured: true,
      excerpt: 'Asrama nyaman dengan pembinaan 24 jam: makanan sehat, laundry, musyrif pendamping, dan jadwal terstruktur.',
      description: '<p>Asrama Al-Ihsan dirancang sebagai \u201crumah kedua\u201d: kamar ber-isian 4\u20136 santri dengan AC, musala lantai, ruang belajar, dan area rekreasi. <strong>Musyrif</strong> (pendamping asrama) tinggal bersama santri dan membimbing 24 jam.</p><p>Jadwal harian terstruktur: dari bangun subuh, halaqah pagi, kapurus, sekolah, ekskul, muroja\u2019ah malam, hingga lampu mati teratur. Menu makanan diawasi ahli gizi; layanan laundry dan klinik sekolah tersedia.</p><p>Kunjungan orang tua dijadwalkan dua kali sebulan dengan jadwal fleksibel yang dikoordinasikan musyrif.</p>',
    },
  ],

  /* ============ PRESTASI ============ */
  achievements: [
    { id: 'ach_1', title: 'Medali Emas OSN Matematika', level: 'nasional', type: 'akademik', year: '2026', student_name: 'Farhan Aulia Rahman (SMA)', description: 'Juara 1 Olimpiade Sains Nasional Matematika SMA, mewakili Jawa Barat.', image: IMG.lab, created_at: '2026-09-12T03:00:00.000Z' },
    { id: 'ach_2', title: 'Medali Emas International Science Olympiad', level: 'internasional', type: 'akademik', year: '2025', student_name: 'Nadia Putri Kirana (SMP)', description: 'Emas kategori Environmental Science pada International Science Olympiad, Singapura.', image: IMG.lab2, created_at: '2025-08-10T03:00:00.000Z' },
    { id: 'ach_3', title: 'Juara 1 Musabaqah Hifzil Qur\u2019an Provinsi', level: 'daerah', type: 'keagamaan', year: '2025', student_name: 'Muhammad Dzaki Alfatih (SMA)', description: 'Juara 1 kategori 30 juz MHQ tingkat Provinsi Jawa Barat.', image: IMG.quran2, created_at: '2025-05-21T03:00:00.000Z' },
    { id: 'ach_4', title: 'Juara 2 English Debate Competition Jabar', level: 'daerah', type: 'non-akademik', year: '2026', student_name: 'Tim Debat SMAIT', description: 'Runner-up English Debate Competition antar SMA se-Jawa Barat (48 tim).', image: IMG.lab5, created_at: '2026-09-28T03:00:00.000Z' },
    { id: 'ach_5', title: 'Best Speaker Yakowleb Arabic Debate', level: 'internasional', type: 'non-akademik', year: '2024', student_name: 'Hafizh Abdurrahman (Alumni 2024)', description: 'Best Speaker Kompetisi Debat Bahasa Arab mahasiswa & pelajar se-Asia Tenggara.', image: IMG.kelas5, created_at: '2024-11-03T03:00:00.000Z' },
    { id: 'ach_6', title: 'Juara Harapan 1 O2SN Futsal Nasional', level: 'nasional', type: 'non-akademik', year: '2026', student_name: 'Tim Futsal SMPIT', description: 'Juara harapan 1 O2SN cabang futsal putra tingkat nasional.', image: IMG.kelas, created_at: '2026-06-14T03:00:00.000Z' },
    { id: 'ach_7', title: 'Juara 3 Kompetisi Sains Madrasah (KSM)', level: 'nasional', type: 'akademik', year: '2025', student_name: 'Aisyah Rahmadani (SMP)', description: 'Medali perunggu KSM IPA tingkat nasional Kemenag RI.', image: IMG.lab3, created_at: '2025-09-01T03:00:00.000Z' },
    { id: 'ach_8', title: 'Juara 1 LCC 4 Sehat 5 Sempurna Kabupaten', level: 'daerah', type: 'non-akademik', year: '2024', student_name: 'Tim SDIT Al-Ihsan', description: 'Juara 1 Lomba Cerdas Cermat tingkat Kabupaten Bogor.', image: IMG.kelas4, created_at: '2024-03-17T03:00:00.000Z' },
  ],

  /* ============ GALERI ============ */
  galleries: [
    { id: 'gal_1', title: 'Kampus & Lingkungan Sekolah', type: 'foto', category: 'Fasilitas', url: IMG.hero, date: '2026-09-01', created_at: '2026-09-01T03:00:00.000Z' },
    { id: 'gal_2', title: 'Suasana Pembelajaran Kelas', type: 'foto', category: 'Pembelajaran', url: IMG.kelas, date: '2026-09-15', created_at: '2026-09-15T03:00:00.000Z' },
    { id: 'gal_3', title: 'Halaqah Tahfizh Pagi', type: 'foto', category: 'Kesantrian', url: IMG.quran, date: '2026-10-02', created_at: '2026-10-02T03:00:00.000Z' },
    { id: 'gal_4', title: 'Praktikum di Laboratorium IPA', type: 'foto', category: 'Pembelajaran', url: IMG.lab4, date: '2026-10-08', created_at: '2026-10-08T03:00:00.000Z' },
    { id: 'gal_5', title: 'Wisuda Tahfizh Angkatan XIV', type: 'foto', category: 'Kegiatan', url: IMG.quran2, date: '2026-10-05', created_at: '2026-10-05T03:00:00.000Z' },
    { id: 'gal_6', title: 'Parenting Class Bersama Orang Tua', type: 'foto', category: 'Kegiatan', url: IMG.kelas2, date: '2026-10-12', created_at: '2026-10-12T03:00:00.000Z' },
    { id: 'gal_7', title: 'Muharram Camp di Kaki Salak', type: 'foto', category: 'Kegiatan', url: IMG.quran4, date: '2026-07-18', created_at: '2026-07-18T03:00:00.000Z' },
    { id: 'gal_8', title: 'Pawai Maulid Nabi 1448 H', type: 'foto', category: 'Kegiatan', url: IMG.quran5, date: '2026-08-26', created_at: '2026-08-26T03:00:00.000Z' },
    { id: 'gal_9', title: 'Persiapan OSN Matematika', type: 'foto', category: 'Prestasi', url: IMG.lab, date: '2026-09-12', created_at: '2026-09-12T03:00:00.000Z' },
    { id: 'gal_10', title: 'Latihan Tim Debat Bahasa Inggris', type: 'foto', category: 'Prestasi', url: IMG.lab5, date: '2026-09-28', created_at: '2026-09-28T03:00:00.000Z' },
    { id: 'gal_11', title: 'Sosialisasi PPDB ke Sekolah Mitra', type: 'foto', category: 'Kegiatan', url: IMG.ppdb, date: '2026-10-20', created_at: '2026-10-20T03:00:00.000Z' },
    { id: 'gal_12', title: 'Video Profil SIT Al-Ihsan (Demo)', type: 'video', category: 'Video', url: 'https://www.youtube.com/embed/aqz-KE-bpKQ', date: '2026-10-01', created_at: '2026-10-01T03:00:00.000Z' },
    { id: 'gal_13', title: 'Video Kegiatan Kesantrian (Demo)', type: 'video', category: 'Video', url: 'https://www.youtube.com/embed/Ks-_Mh1QhMc', date: '2026-10-01', created_at: '2026-10-01T03:00:00.000Z' },
  ],

  /* ============ FASILITAS ============ */
  facilities: [
    { id: 'fac_1', name: 'Masjid Al-Ihsan', icon: 'moon-star', description: 'Masjid dua lantai sebagai pusat ibadah, halaqah Tahfizh, dan kegiatan keislaman seluruh warga sekolah.', image: '' },
    { id: 'fac_2', name: 'Asrama Santri', icon: 'bed-double', description: 'Dua asrama (putra & putri) ber-AC dengan musyrif pendamping, ruang belajar, dan area rekreasi.', image: IMG.quran3 },
    { id: 'fac_3', name: 'Laboratorium IPA & Komputer', icon: 'flask-conical', description: 'Tiga laboratorium lengkap: IPA/fisika-kimia, biologi, dan komputer dengan 40 unit PC spesifikasi menengah.', image: IMG.lab3 },
    { id: 'fac_4', name: 'Perpustakaan & Reading Lounge', icon: 'library', description: 'Koleksi 15.000+ judul buku, perpustakaan digital, dan lounge baca yang nyaman di setiap gedung.', image: '' },
    { id: 'fac_5', name: 'Aula & Auditorium', icon: 'presentation', description: 'Aula berkapasitas 800 orang untuk wisuda, seminar, parenting class, dan pertunjukan siswa.', image: '' },
    { id: 'fac_6', name: 'Lapangan Olahraga', icon: 'volleyball', description: 'Lapangan futsal, basket, voli, dan area panahan untuk pembinaan olahraga santri.', image: '' },
    { id: 'fac_7', name: 'Kantina Sehat', icon: 'utensils', description: 'Kantina dengan menu bergizi seimbang yang diawasi ahli gizi, bebas MSG berlebih untuk santri asrama.', image: '' },
    { id: 'fac_8', name: 'Klinik & UKS', icon: 'stethoscope', description: 'Klinik dengan perawat full-time dan kerja sama dokter jaga; layanan UKS untuk seluruh siswa.', image: '' },
    { id: 'fac_9', name: 'Studio Multimedia', icon: 'clapperboard', description: 'Studio podcast, editing, dan broadcasting untuk ekskul jurnalistik serta konten pembelajaran.', image: '' },
    { id: 'fac_10', name: 'Ruang Tahfizh', icon: 'book-open-text', description: 'Sepuluh ruang halaqah khusus dengan soundproofing ringan untuk kenyamanan setoran hafalan.', image: IMG.quran },
  ],

  /* ============ TESTIMONI ============ */
  testimonials: [
    { id: 'tst_1', name: 'Ibu Ratna Dewi', role: 'Orang Tua Santri SMP', message: 'Anak kami berubah signifikan: lebih disiplin bangun subuh, rapi, dan mandiri. Komunikasi musyrif dengan orang tua juga sangat baik \u2014 kami selalu tahu perkembangan hafalan dan perilaku anak.', rating: 5, photo: '', created_at: '2026-09-10T03:00:00.000Z' },
    { id: 'tst_2', name: 'Bapak Hendra Gunawan', role: 'Orang Tua Santri SD', message: 'Awalnya ragu anak kecil ikut full day school. Ternyata justru makin semangat belajar, hafalan juz 30 berjalan tertib, dan pulang rumah tetap hangat dengan orang tua. Terima kasih Al-Ihsan!', rating: 5, photo: '', created_at: '2026-08-22T03:00:00.000Z' },
    { id: 'tst_3', name: 'Salsabila Maharani', role: 'Alumni 2023 \u2014 Kedokteran UI', message: 'Disiplin tahfizh dan ibadah di Al-Ihsan melatih manajemen waktu yang sangat membantu di fakultas kedokteran. Pembinaan bahasa Inggris membuat saya percaya diri memahami jurnal.', rating: 5, photo: '', created_at: '2026-07-15T03:00:00.000Z' },
    { id: 'tst_4', name: 'Fahri Nur Rahman', role: 'Alumni 2022 \u2014 Beasiswa Al-Azhar Kairo', message: 'Dari speaking zone sampai orientasi pra-berangkat, semuanya dipersiapkan serius. Alhamdulillah saya lulus beasiswa penuh S-1 Al-Azhar berkat bimbingan guru-guru Al-Ihsan.', rating: 5, photo: '', created_at: '2026-06-30T03:00:00.000Z' },
  ],

  /* ============ GURU & TENAGA KEPENDIDIKAN ============ */
  staff: [
    { id: 'stf_1', name: 'Dr. H. Ahmad Syaiful Bahri, M.Pd.', position: 'Kepala Sekolah', type: 'pimpinan', subject: 'Manajemen Pendidikan', education: 'S3 UIN Syarif Hidayatullah', photo: '' },
    { id: 'stf_2', name: 'Ust. Fajar Ramadhan, S.Pd.I.', position: 'Waka Kesantrian & Tahfizh', type: 'pimpinan', subject: 'Tahfizh & Qiroah', education: 'S1 UIN Jakarta', photo: '' },
    { id: 'stf_3', name: 'Ibu Siti Maryam, M.Psi.', position: 'Waka Kesiswaan & BK', type: 'pimpinan', subject: 'Bimbingan Konseling', education: 'S2 Psikologi UI', photo: '' },
    { id: 'stf_4', name: 'H. Ridwan Hakim, S.E.', position: 'Direktur Yayasan Al-Ihsan Cendekia', type: 'pimpinan', subject: 'Kepemimpinan', education: 'S1 Manajemen', photo: '' },
    { id: 'stf_5', name: 'Adrian Wicaksono, S.S.', position: 'Guru Bahasa Inggris', type: 'guru', subject: 'Bahasa Inggris', education: 'S1 Sastra Inggris UNPAD', photo: '' },
    { id: 'stf_6', name: 'Dewi Anggraeni, S.Pd.', position: 'Guru Matematika', type: 'guru', subject: 'Matematika', education: 'S1 Pendidikan Matematika IPB', photo: '' },
    { id: 'stf_7', name: 'Ust. Mukhtar Amin, Lc.', position: 'Guru Bahasa Arab', type: 'guru', subject: 'Bahasa Arab', education: 'Lc. Universitas Islam Madinah', photo: '' },
    { id: 'stf_8', name: 'Rina Kusumawati, S.Si.', position: 'Guru IPA / Fisika', type: 'guru', subject: 'IPA \u2014 Fisika', education: 'S1 Fisika ITB', photo: '' },
    { id: 'stf_9', name: 'Bagas Prakoso, S.Kom.', position: 'Guru Informatika & Robotik', type: 'guru', subject: 'Informatika', education: 'S1 Teknik Informatika', photo: '' },
    { id: 'stf_10', name: 'Usth. Khadijah Salma, S.Pd.I.', position: 'Guru AKID & Muhafizhah', type: 'guru', subject: 'AKID & Tahfizh', education: 'S1 Pendidikan Agama Islam', photo: '' },
    { id: 'stf_11', name: 'Yusuf Ardiansyah, A.Md.', position: 'Kepala Tata Usaha', type: 'tendik', subject: 'Administrasi', education: 'D3 Administrasi', photo: '' },
    { id: 'stf_12', name: 'Nurul Hidayati, S.Ak.', position: 'Staf Keuangan & PPDB', type: 'tendik', subject: 'Keuangan', education: 'S1 Akuntansi', photo: '' },
  ],

  /* ============ STRUKTUR ORGANISASI (tree via parent_id) ============ */
  organization: [
    { id: 'org_1', name: 'H. Ridwan Hakim, S.E.', position: 'Direktur Yayasan', parent_id: '', photo: '', order: 1 },
    { id: 'org_2', name: 'Dr. H. Ahmad Syaiful Bahri, M.Pd.', position: 'Kepala Sekolah', parent_id: 'org_1', photo: '', order: 2 },
    { id: 'org_3', name: 'Ust. Fajar Ramadhan, S.Pd.I.', position: 'Waka Kesantrian', parent_id: 'org_2', photo: '', order: 3 },
    { id: 'org_4', name: 'Ibu Siti Maryam, M.Psi.', position: 'Waka Kesiswaan & BK', parent_id: 'org_2', photo: '', order: 4 },
    { id: 'org_5', name: 'Ibu Fitria Ningrum, M.Pd.', position: 'Waka Kurikulum', parent_id: 'org_2', photo: '', order: 5 },
    { id: 'org_6', name: 'Koordinator Jenjang SD', position: 'Koor. SDIT', parent_id: 'org_5', photo: '', order: 6 },
    { id: 'org_7', name: 'Koordinator Jenjang SMP', position: 'Koor. SMPIT', parent_id: 'org_5', photo: '', order: 7 },
    { id: 'org_8', name: 'Koordinator Jenjang SMA', position: 'Koor. SMAIT', parent_id: 'org_5', photo: '', order: 8 },
  ],

  /* ============ FAQ ============ */
  faqs: [
    { id: 'faq_1', category: 'Pendaftaran', question: 'Bagaimana cara mendaftar ke SIT Al-Ihsan?', answer: 'Pendaftaran dilakukan sepenuhnya online melalui halaman PPDB Online di website ini. Isi formulir, unggah dokumen persyaratan, lalu simpan nomor registrasi Anda. Status pendaftaran dapat dipantau kapan saja melalui menu Cek Status.', order: 1 },
    { id: 'faq_2', category: 'Pendaftaran', question: 'Apakah ada tes masuk? Seperti apa bentuknya?', answer: 'Ya. Tes seleksi mencakup tes baca tulis Al-Qur\u2019an, tes akademik dasar (literasi & numerasi), observasi kemandirian, dan wawancara bersama orang tua. Materi tes disesuaikan dengan jenjang yang didaftar.', order: 2 },
    { id: 'faq_3', category: 'Biaya', question: 'Berapa biaya pendidikan di SIT Al-Ihsan?', answer: 'Biaya bervariasi per jenjang. Rincian lengkap tersedia pada tabel biaya di halaman PPDB Online. Tersedia keringanan bagi hafizh 30 juz, anak yatim, dan prestasi akademik \u2014 silakan hubungi panitia untuk skema beasiswa.', order: 3 },
    { id: 'faq_4', category: 'Biaya', question: 'Apakah SPP bisa dibayar per bulan atau harus di muka?', answer: 'SPP dapat dibayarkan per bulan (maksimal tanggal 10 setiap bulan) melalui transfer bank atau QRIS resmi sekolah. Tersedia juga opsi pembayaran per semester dengan potongan administrasi.', order: 4 },
    { id: 'faq_5', category: 'Asrama', question: 'Apakah wajib tinggal di asrama?', answer: 'Tidak wajib. Program asrama tersedia sebagai pilihan bagi jenjang SMP dan SMA. Siswa non-asrama mengikuti full day school dengan jadwal pembinaan yang sama hingga sore.', order: 5 },
    { id: 'faq_6', category: 'Asrama', question: 'Bagaimana pengawasan di asrama? Boleh membawa gawai?', answer: 'Setiap asrama didampingi musyrif yang tinggal bersama santri 24 jam dengan rasio 1:12. Gawai hanya boleh digunakan pada jadwal yang ditentukan (akhir pekan) dan disimpan oleh musyrif pada hari sekolah untuk menjaga fokus belajar.', order: 6 },
    { id: 'faq_7', category: 'Kurikulum', question: 'Kurikulum apa yang digunakan?', answer: 'Kami menggunakan Kurikulum Merdeka sebagai kurikulum utama, diperkaya standar Cambridge untuk English, Mathematics, dan Science, serta kurikulum tahfizh khusus dengan target 30 juz bagi jenjang SMP\u2013SMA.', order: 7 },
    { id: 'faq_8', category: 'Kurikulum', question: 'Apakah anak yang belum bisa Al-Qur\u2019an bisa diterima?', answer: 'Bisa. Seluruh siswa baru mengikuti placement test Tahsin. Anak ditempatkan pada kelas tahsin/tilawah sesuai kemampuannya dan dibimbing naik level hingga siap mengikuti program tahfizh.', order: 8 },
    { id: 'faq_9', category: 'Fasilitas', question: 'Fasilitas apa saja yang tersedia?', answer: 'Masjid, asrama putra-putri ber-AC, 3 laboratorium, perpustakaan 15.000+ koleksi, aula 800 kursi, lapangan olahraga lengkap, kantina sehat, klinik, studio multimedia, dan 10 ruang halaqah. Detail pada halaman Profil > Fasilitas.', order: 9 },
    { id: 'faq_10', category: 'Umum', question: 'Apakah sekolah menerima non-muslim?', answer: 'Sebagai sekolah Islam terpadu dengan muatan keagamaan integratif, saat ini kami hanya menerima siswa beragama Islam.', order: 10 },
    { id: 'faq_11', category: 'Umum', question: 'Bagaimana sistem komunikasi sekolah dengan orang tua?', answer: 'Melalui tiga kanal: portofolio digital santri (perkembangan hafalan & nilai), grup WhatsApp resmi per kelas, serta parenting class dua bulanan. Orang tua juga dapat mengatur pertemuan dengan wali kelas kapan saja.', order: 11 },
    { id: 'faq_12', category: 'Umum', question: 'Di mana lokasi sekolah dan apakah tersedia antar-jemput?', answer: 'Kampus kami berada di Jl. Pendidikan Raya No. 45, Cibinong, Kabupaten Bogor. Layanan antar-jemput bus sekolah tersedia untuk rute tertentu di area Bogor & Jakarta Timur \u2014 hubungi panitia untuk cek ketersediaan rute.', order: 12 },
  ],

  /* ============ PENGGUNA (demo; produksi: Supabase Auth) ============ */
  users: [
    { id: 'user_1', name: 'Administrator', email: 'admin@al-ihsan.sch.id', role: 'admin', password: SEED_PASSWORD_HASH['admin@al-ihsan.sch.id'], created_at: '2026-01-01T00:00:00.000Z' },
    { id: 'user_2', name: 'Editor Konten', email: 'editor@al-ihsan.sch.id', role: 'editor', password: SEED_PASSWORD_HASH['editor@al-ihsan.sch.id'], created_at: '2026-01-01T00:00:00.000Z' },
  ],

  /* ============ PPDB (contoh data panitia) ============ */
  admissions: [
    {
      id: 'adm_1', reg_number: 'PPDB-2027-0001', full_name: 'Alika Zahra Ramadhani', nisn: '0098765432',
      gender: 'P', birth_place: 'Bogor', birth_date: '2013-04-17', address: 'Jl. Melati No. 12, Cibinong, Bogor',
      previous_school: 'SDIT Nurul Hikmah', jenjang: 'SMPIT', asrama: false,
      parent_name: 'Hendra Gunawan', parent_phone: '081277889900', parent_email: 'hendra.gunawan@gmail.com',
      documents: [{ name: 'akta.jpg', type: 'image/jpeg', size: 182000, data: 'SEED_PLACEHOLDER' }],
      status: 'diterima', notes: 'Lulus seleksi gelombang 1 \u2014 nilai tahsin memuaskan.', verified: true,
      created_at: '2026-06-18T09:12:00.000Z',
    },
    {
      id: 'adm_2', reg_number: 'PPDB-2027-0002', full_name: 'Rizky Maulana Putra', nisn: '0098112233',
      gender: 'L', birth_place: 'Jakarta', birth_date: '2011-09-02', address: 'Jl. Kenanga No. 8, Depok',
      previous_school: 'SMP Negeri 3 Depok', jenjang: 'SMAIT', asrama: true,
      parent_name: 'Siti Aminah', parent_phone: '081233445566', parent_email: 'siti.aminah@yahoo.com',
      documents: [{ name: 'akta.jpg', type: 'image/jpeg', size: 191000, data: 'SEED_PLACEHOLDER' }],
      status: 'menunggu', notes: '', verified: false,
      created_at: '2026-08-21T10:30:00.000Z',
    },
    {
      id: 'adm_3', reg_number: 'PPDB-2027-0003', full_name: 'Kayla Nur Fadhilah', nisn: '0097445566',
      gender: 'P', birth_place: 'Bekasi', birth_date: '2019-01-25', address: 'Perum Griya Asri Blok C2, Bekasi',
      previous_school: 'TK Islam Bunga Matahari', jenjang: 'SDIT', asrama: false,
      parent_name: 'Dedi Kurniawan', parent_phone: '085611223344', parent_email: 'dedi.k@gmail.com',
      documents: [{ name: 'akta.jpg', type: 'image/jpeg', size: 175000, data: 'SEED_PLACEHOLDER' }],
      status: 'menunggu', notes: '', verified: true,
      created_at: '2026-09-25T08:45:00.000Z',
    },
    {
      id: 'adm_4', reg_number: 'PPDB-2027-0004', full_name: 'Bagus Setiawan', nisn: '0096554433',
      gender: 'L', birth_place: 'Bogor', birth_date: '2010-12-11', address: 'Jl. Raya Tajur No. 99, Bogor',
      previous_school: 'MTs Al-Hidayah', jenjang: 'SMAIT', asrama: false,
      parent_name: 'Umar Setiawan', parent_phone: '087822334455', parent_email: 'umar.setiawan@gmail.com',
      documents: [{ name: 'skl.pdf', type: 'application/pdf', size: 210000, data: 'SEED_PLACEHOLDER' }],
      status: 'ditolak', notes: 'Dokumen rapor tidak lengkap pada batas akhir gelombang 1. Dapat mendaftar kembali pada gelombang 2.', verified: true,
      created_at: '2026-10-22T14:20:00.000Z',
    },
  ],

  /* ============ TRACER ALUMNI — "Mencari Jejak Alumni" (diisi alumni sendiri) ============ */
  /* Data masuk dari formulir publik tracer-alumni.html, direkap & diverifikasi di
     Dashboard → Alumni → Jejak Alumni. Status: menunggu | terverifikasi | arsip */
  tracer_alumni: [
    {
      id: 'trc_1', full_name: 'Dinda Aulia Salsabila', jenjang: 'SMAIT', grad_year: 2018,
      whatsapp: '081399887711', email: 'dinda.aulia@gmail.com',
      current_status: 'kuliah', institution: 'Institut Teknologi Bandung',
      major_position: 'S1 Teknik Informatika', city_country: 'Bandung, Jawa Barat',
      hafiz_juz: 30, willing_mentor: true,
      message: 'Alhamdulillah, senang sekolah membuka formulir ini. Semoga bisa terhubung kembali dengan alumni angkatan saya.',
      consent: true, status: 'terverifikasi', admin_notes: 'Data dicek silang dengan buku rekap alumni angkatan 2018.',
      created_at: '2026-10-12T04:25:00.000Z', verified_at: '2026-10-14T02:10:00.000Z',
    },
    {
      id: 'trc_2', full_name: 'Faris Abdurrahman', jenjang: 'SMPIT', grad_year: 2013,
      whatsapp: '085711229900', email: '',
      current_status: 'bekerja', institution: 'PT Bank Syariah Indonesia',
      major_position: 'Analis Kredit Syariah', city_country: 'Jakarta Selatan',
      hafiz_juz: 15, willing_mentor: false,
      message: 'Saya lulus sebelum sekolah memiliki database alumni. Mohon didata kembali, terima kasih.',
      consent: true, status: 'menunggu', admin_notes: '',
      created_at: '2026-10-26T09:48:00.000Z', verified_at: '',
    },
  ],

  /* ============ PESAN MASUK ============ */
  messages: [
    { id: 'msg_1', name: 'Ibu Lestari', email: 'lestari77@gmail.com', phone: '081299887766', subject: 'Tanya biaya asrama SMP', message: 'Assalamualaikum, ingin bertanya apakah biaya asrama sudah termasuk laundry dan makan? Terima kasih.', read: false, created_at: '2026-10-21T07:40:00.000Z' },
    { id: 'msg_2', name: 'Bapak Anton Wibowo', email: 'anton.wib@gmail.com', phone: '085711223344', subject: 'Jadwal kunjungan sekolah', message: 'Selamat pagi, kami berlima ingin survei kampus hari Sabtu. Apakah bisa dijadwalkan dengan pemandu? Terima kasih.', read: true, created_at: '2026-10-19T02:15:00.000Z' },
  ],

  /* ============ LOG AKTIVITAS ============ */
  activity_logs: [],
};

window.SEED_PASSWORD_HASH = SEED_PASSWORD_HASH;
window.IMG = IMG;
