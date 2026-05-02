-- ============================================================
-- SISTEM PADUKUHAN MANDINGAN
-- Supabase PostgreSQL Schema
-- Versi: 1.1
-- Revisi:
--   - Data RT dan Dasawisma diperbarui sesuai data aktual
--   - Tambah RLS policy untuk akses publik PWA
--   - Tambah tabel surat_pengajuan_publik (warga tanpa akun)
--   - Tambah tabel, RLS, dan policy untuk Web & PWA
-- Catatan: Jalankan file ini di Supabase SQL Editor
--          secara berurutan dari atas ke bawah
-- ============================================================

-- ============================================================
-- 0. EKSTENSI & SETUP
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- untuk pencarian nama tanpa aksen


-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

-- Role pengguna sistem
CREATE TYPE user_role AS ENUM (
  'dukuh',
  'ketua_rt',
  'kader_dasawisma',
  'sekretaris',
  'warga'
);

-- Status warga
CREATE TYPE status_warga AS ENUM (
  'aktif',
  'meninggal',
  'pindah_keluar'
);

-- Jenis kelamin
CREATE TYPE jenis_kelamin AS ENUM ('L', 'P');

-- Status perkawinan
CREATE TYPE status_perkawinan AS ENUM (
  'belum_kawin',
  'kawin',
  'cerai_hidup',
  'cerai_mati'
);

-- Hubungan dalam keluarga
CREATE TYPE status_dalam_keluarga AS ENUM (
  'kepala_keluarga',
  'istri',
  'anak',
  'menantu',
  'cucu',
  'orang_tua',
  'mertua',
  'famili_lain',
  'lainnya'
);

-- Sumber air
CREATE TYPE sumber_air AS ENUM ('pdam', 'sumur', 'sungai', 'lainnya');

-- Status surat
CREATE TYPE status_surat AS ENUM (
  'pending',
  'diproses',
  'selesai',
  'ditolak'
);

-- Jenis surat
CREATE TYPE jenis_surat AS ENUM (
  'pengantar_rt',
  'domisili'
);

-- Status proposal program
CREATE TYPE status_proposal AS ENUM (
  'diusulkan',
  'dikaji',
  'disetujui',
  'dilaksanakan',
  'selesai',
  'ditolak'
);

-- Jenis program
CREATE TYPE jenis_program AS ENUM (
  'infrastruktur',
  'sosial',
  'kesehatan',
  'pendidikan',
  'penerangan',
  'lingkungan',
  'ekonomi',
  'lainnya'
);

-- Sumber dana program
CREATE TYPE sumber_dana AS ENUM (
  'dana_desa',
  'swadaya',
  'pemerintah_daerah',
  'pemerintah_pusat',
  'csr',
  'lainnya'
);

-- Status laporan kejadian
CREATE TYPE status_laporan AS ENUM (
  'dilaporkan',
  'ditindaklanjuti',
  'selesai'
);

-- Kategori laporan kejadian
CREATE TYPE kategori_kejadian AS ENUM (
  'kehilangan_barang',
  'kerusakan_fasilitas',
  'gangguan_ketertiban',
  'tindak_kriminal',
  'lainnya'
);

-- Kategori masukan
CREATE TYPE kategori_masukan AS ENUM (
  'pelayanan',
  'infrastruktur',
  'sosial',
  'keamanan',
  'lainnya'
);

-- Status masukan
CREATE TYPE status_masukan AS ENUM (
  'masuk',
  'dibaca',
  'ditindaklanjuti'
);

-- Target pengumuman
CREATE TYPE target_pengumuman AS ENUM (
  'semua',
  'rt_tertentu'
);


-- ============================================================
-- 2. TABEL WILAYAH & PROFIL
-- ============================================================

-- 2.1 Profil Padukuhan (singleton - hanya 1 baris)
CREATE TABLE padukuhan_profil (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_padukuhan   TEXT NOT NULL DEFAULT 'Mandingan',
  nama_kalurahan   TEXT NOT NULL DEFAULT 'Ringinharjo',
  nama_kapanewon   TEXT NOT NULL DEFAULT 'Bantul',
  nama_kabupaten   TEXT NOT NULL DEFAULT 'Bantul',
  nama_provinsi    TEXT NOT NULL DEFAULT 'Daerah Istimewa Yogyakarta',
  nama_dukuh       TEXT,
  nik_dukuh        TEXT,
  no_hp_dukuh      TEXT,
  logo_url         TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Data RT
CREATE TABLE rts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nomor_rt         SMALLINT NOT NULL UNIQUE CHECK (nomor_rt BETWEEN 1 AND 20),
  nama_ketua       TEXT,
  nik_ketua        TEXT,
  no_hp_ketua      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Data Dasawisma
CREATE TABLE dasawismas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rt_id            UUID NOT NULL REFERENCES rts(id) ON DELETE RESTRICT,
  nama_dasawisma   TEXT NOT NULL,  -- contoh: "Melati 14"
  nama_kader       TEXT,
  no_hp_kader      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (rt_id, nama_dasawisma)
);

-- 2.4 Kontak Penting (untuk tombol darurat & informasi publik)
CREATE TABLE kontak_penting (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label            TEXT NOT NULL,  -- contoh: "Babinkamtibmas", "Babinsa", "IGD Puskesmas"
  nama             TEXT,
  no_hp            TEXT NOT NULL,
  no_wa            TEXT,           -- bisa beda dari no_hp
  kategori         TEXT,           -- 'keamanan', 'kesehatan', 'pemerintah'
  urutan           SMALLINT DEFAULT 0,
  aktif            BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 3. USER MANAGEMENT (extends Supabase Auth)
-- ============================================================

-- Profile user yang extend auth.users
-- auth.users dikelola oleh Supabase Auth
CREATE TABLE user_profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap     TEXT NOT NULL,
  role             user_role NOT NULL DEFAULT 'warga',
  rt_id            UUID REFERENCES rts(id),           -- untuk ketua_rt
  dasawisma_id     UUID REFERENCES dasawismas(id),    -- untuk kader_dasawisma
  no_hp            TEXT,
  aktif            BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: otomatis update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 4. MODUL 1 — KEPENDUDUKAN
-- ============================================================

-- 4.1 Rumah Tangga / KK
CREATE TABLE rumah_tanggas (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rt_id                  UUID NOT NULL REFERENCES rts(id) ON DELETE RESTRICT,
  dasawisma_id           UUID REFERENCES dasawismas(id),
  no_kk                  TEXT UNIQUE,
  nama_kepala_keluarga   TEXT NOT NULL,
  alamat_detail          TEXT,
  no_reg                 INTEGER,                  -- nomor urut dari sistem lama

  -- Fasilitas Rumah
  makanan_pokok          TEXT DEFAULT 'beras',     -- 'beras', 'jagung', dll
  memiliki_jamban        BOOLEAN DEFAULT FALSE,
  jumlah_jamban          SMALLINT DEFAULT 0,
  sumber_air             sumber_air DEFAULT 'pdam',
  memiliki_tempat_sampah BOOLEAN DEFAULT FALSE,
  memiliki_spal          BOOLEAN DEFAULT FALSE,    -- Saluran Pembuangan Air Limbah
  menempel_stiker_p4k    BOOLEAN DEFAULT FALSE,
  kriteria_rumah         TEXT DEFAULT 'sehat_layak_huni',
  aktivitas_up2k         BOOLEAN DEFAULT FALSE,
  pemanfaatan_pekarangan BOOLEAN DEFAULT FALSE,
  industri_rumah_tangga  BOOLEAN DEFAULT FALSE,

  status_aktif           BOOLEAN DEFAULT TRUE,
  created_by             UUID REFERENCES auth.users(id),
  updated_by             UUID REFERENCES auth.users(id),
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 Data Warga
CREATE TABLE wargas (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rumah_tangga_id        UUID NOT NULL REFERENCES rumah_tanggas(id) ON DELETE RESTRICT,
  rt_id                  UUID NOT NULL REFERENCES rts(id),    -- denormalisasi untuk query cepat
  dasawisma_id           UUID REFERENCES dasawismas(id),      -- denormalisasi

  -- Identitas
  no_reg                 INTEGER,                             -- nomor urut dari sistem lama
  nik                    TEXT UNIQUE,
  nama_lengkap           TEXT NOT NULL,
  tempat_lahir           TEXT,
  tanggal_lahir          DATE,
  jenis_kelamin          jenis_kelamin NOT NULL,
  agama                  TEXT,                                -- NULL jika belum diisi
  pendidikan             TEXT,                                -- NULL jika belum diisi
  pekerjaan              TEXT,
  jabatan                TEXT,                                -- jabatan di padukuhan jika ada

  -- Status
  status_perkawinan      status_perkawinan,
  status_dalam_keluarga  status_dalam_keluarga,
  status_warga           status_warga DEFAULT 'aktif',

  -- Flag khusus
  berkebutuhan_khusus    BOOLEAN DEFAULT FALSE,
  akseptor_kb            BOOLEAN DEFAULT FALSE,
  aktif_posyandu         BOOLEAN DEFAULT FALSE,
  ikut_bkb               BOOLEAN DEFAULT FALSE,
  ikut_paud              BOOLEAN DEFAULT FALSE,
  ikut_koperasi          BOOLEAN DEFAULT FALSE,
  memiliki_akte          BOOLEAN DEFAULT FALSE,

  -- Audit
  created_by             UUID REFERENCES auth.users(id),
  updated_by             UUID REFERENCES auth.users(id),
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk pencarian cepat
CREATE INDEX idx_wargas_nik ON wargas(nik);
CREATE INDEX idx_wargas_nama ON wargas USING gin(to_tsvector('indonesian', nama_lengkap));
CREATE INDEX idx_wargas_rt ON wargas(rt_id);
CREATE INDEX idx_wargas_dasawisma ON wargas(dasawisma_id);
CREATE INDEX idx_wargas_status ON wargas(status_warga);

-- 4.3 Mutasi Penduduk (log semua perubahan status warga)
CREATE TABLE mutasi_penduduk (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warga_id         UUID REFERENCES wargas(id),       -- NULL jika warga baru (belum ada)
  rt_id            UUID NOT NULL REFERENCES rts(id),
  jenis_mutasi     TEXT NOT NULL CHECK (jenis_mutasi IN (
                     'kelahiran', 'kematian', 'pindah_masuk', 'pindah_keluar', 'kehamilan'
                   )),
  tanggal_mutasi   DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Detail per jenis mutasi
  -- Kelahiran
  nama_bayi        TEXT,
  jenis_kelamin_bayi jenis_kelamin,
  nama_ibu         TEXT,
  nama_ayah        TEXT,
  ada_akte         BOOLEAN,
  tanggal_lahir    DATE,

  -- Kematian
  sebab_meninggal  TEXT,

  -- Pindah masuk / keluar
  asal_daerah      TEXT,
  tujuan_daerah    TEXT,

  -- Kehamilan (dipantau)
  hpht             DATE,          -- Hari Pertama Haid Terakhir
  hpl              DATE,          -- Hari Perkiraan Lahir
  status_kehamilan TEXT,          -- 'hamil', 'melahirkan', 'nifas', 'selesai'
  tanggal_melahirkan DATE,

  keterangan       TEXT,
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mutasi_rt ON mutasi_penduduk(rt_id);
CREATE INDEX idx_mutasi_jenis ON mutasi_penduduk(jenis_mutasi);
CREATE INDEX idx_mutasi_tanggal ON mutasi_penduduk(tanggal_mutasi);


-- ============================================================
-- 5. MODUL 2 — PKK & DASAWISMA
-- ============================================================

-- 5.1 Partisipasi PKK per Warga per Tahun
-- Setiap warga per tahun punya 1 baris di sini
CREATE TABLE pkk_partisipasi (
  id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warga_id                   UUID NOT NULL REFERENCES wargas(id) ON DELETE CASCADE,
  dasawisma_id               UUID NOT NULL REFERENCES dasawismas(id),
  tahun                      SMALLINT NOT NULL,

  -- 8 Program Pokok PKK (Catatan Keluarga Dasawisma)
  penghayatan_pancasila      BOOLEAN DEFAULT FALSE,
  gotong_royong              BOOLEAN DEFAULT FALSE,
  pendidikan_keterampilan    BOOLEAN DEFAULT FALSE,
  pengembangan_koperasi      BOOLEAN DEFAULT FALSE,
  pangan                     BOOLEAN DEFAULT FALSE,
  sandang                    BOOLEAN DEFAULT FALSE,
  kesehatan                  BOOLEAN DEFAULT FALSE,
  perencanaan_sehat          BOOLEAN DEFAULT FALSE,

  -- Kegiatan tambahan (Rekap Padukuhan)
  kerja_bakti                BOOLEAN DEFAULT FALSE,
  rukun_kematian             BOOLEAN DEFAULT FALSE,
  kegiatan_keagamaan         BOOLEAN DEFAULT FALSE,
  jimpitan                   BOOLEAN DEFAULT FALSE,
  arisan                     BOOLEAN DEFAULT FALSE,
  lain_lain                  BOOLEAN DEFAULT FALSE,

  created_by                 UUID REFERENCES auth.users(id),
  updated_by                 UUID REFERENCES auth.users(id),
  created_at                 TIMESTAMPTZ DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (warga_id, tahun)   -- 1 warga hanya 1 record per tahun
);

CREATE INDEX idx_pkk_dasawisma_tahun ON pkk_partisipasi(dasawisma_id, tahun);


-- ============================================================
-- 6. MODUL 3 — ADMINISTRASI & SURAT
-- ============================================================

-- 6.1 Template Surat (dikelola dukuh)
CREATE TABLE surat_templates (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jenis_surat      jenis_surat NOT NULL UNIQUE,
  judul            TEXT NOT NULL,
  isi_template     TEXT NOT NULL,  -- template dengan placeholder {{nama}}, {{nik}}, dll
  kop_rt           TEXT,           -- kop surat untuk pengantar RT
  nama_penandatangan TEXT,
  jabatan_penandatangan TEXT,
  aktif            BOOLEAN DEFAULT TRUE,
  updated_by       UUID REFERENCES auth.users(id),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 6.2 Pengajuan Surat
CREATE TABLE surat_pengajuan (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rt_id            UUID NOT NULL REFERENCES rts(id),
  warga_id         UUID NOT NULL REFERENCES wargas(id),
  jenis_surat      jenis_surat NOT NULL,
  keperluan        TEXT,            -- isi dinamis untuk pengantar RT
  keterangan_tambahan TEXT,
  status           status_surat DEFAULT 'pending',

  -- Nomor surat (digenerate saat approve)
  nomor_surat      TEXT UNIQUE,     -- format: 001/RT-01/V/2025
  tanggal_surat    DATE,

  -- Jalur pengajuan
  diajukan_via     TEXT DEFAULT 'rt',  -- 'pwa' atau 'rt'
  file_url         TEXT,               -- URL PDF yang sudah digenerate

  catatan_rt       TEXT,               -- catatan dari RT saat proses
  ditolak_alasan   TEXT,

  created_by       UUID REFERENCES auth.users(id),   -- NULL jika via PWA
  diproses_oleh    UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_surat_rt ON surat_pengajuan(rt_id);
CREATE INDEX idx_surat_status ON surat_pengajuan(status);
CREATE INDEX idx_surat_warga ON surat_pengajuan(warga_id);

-- 6.3 Counter Nomor Surat per Tahun (untuk auto-increment nomor surat)
CREATE TABLE surat_counter (
  rt_id            UUID NOT NULL REFERENCES rts(id),
  jenis_surat      jenis_surat NOT NULL,
  tahun            SMALLINT NOT NULL,
  counter          INTEGER DEFAULT 0,
  PRIMARY KEY (rt_id, jenis_surat, tahun)
);


-- ============================================================
-- 7. MODUL 4 — PROGRAM & PROPOSAL
-- ============================================================

-- 7.1 Pengumuman Program dari Dukuh (ajakan musyawarah)
CREATE TABLE program_pengumuman (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul            TEXT NOT NULL,
  isi              TEXT NOT NULL,
  tahun_anggaran   SMALLINT,
  batas_pengajuan  DATE,
  aktif            BOOLEAN DEFAULT TRUE,
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 7.2 Proposal Program dari RT
CREATE TABLE proposals (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rt_id             UUID NOT NULL REFERENCES rts(id),
  pengumuman_id     UUID REFERENCES program_pengumuman(id),  -- proposal merespons pengumuman mana

  -- Data Program
  nama_program      TEXT NOT NULL,
  jenis_program     jenis_program NOT NULL,
  deskripsi         TEXT NOT NULL,
  lokasi            TEXT,
  sumber_usulan     TEXT DEFAULT 'warga',  -- 'warga' atau 'inisiatif_rt'

  -- Status & Review Dukuh
  status            status_proposal DEFAULT 'diusulkan',
  sumber_dana       sumber_dana,
  tahun_diusulkan   SMALLINT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  tahun_dilaksanakan SMALLINT,
  catatan_dukuh     TEXT,          -- feedback dari dukuh
  tampil_publik     BOOLEAN DEFAULT FALSE,  -- hanya tampil di PWA jika true

  created_by        UUID REFERENCES auth.users(id),
  diproses_oleh     UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposals_rt ON proposals(rt_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_tahun ON proposals(tahun_diusulkan);


-- ============================================================
-- 8. MODUL 5 — PENGUMUMAN & INFORMASI
-- ============================================================

CREATE TABLE pengumuman (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul            TEXT NOT NULL,
  isi              TEXT NOT NULL,
  foto_url         TEXT,

  -- Pembuat (dukuh atau RT)
  dibuat_oleh      UUID NOT NULL REFERENCES auth.users(id),
  rt_pembuat       UUID REFERENCES rts(id),   -- NULL jika dibuat dukuh

  -- Target penerima
  target           target_pengumuman DEFAULT 'semua',
  -- Jika target = 'rt_tertentu', isi tabel pengumuman_target_rt
  tanggal_berlaku  DATE,           -- NULL = berlaku selamanya

  aktif            BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- RT mana saja yang menjadi target pengumuman
CREATE TABLE pengumuman_target_rt (
  pengumuman_id    UUID NOT NULL REFERENCES pengumuman(id) ON DELETE CASCADE,
  rt_id            UUID NOT NULL REFERENCES rts(id),
  PRIMARY KEY (pengumuman_id, rt_id)
);

-- Galeri foto kegiatan
CREATE TABLE galeri (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul            TEXT NOT NULL,
  deskripsi        TEXT,
  foto_url         TEXT NOT NULL,
  kegiatan_id      UUID,           -- referensi ke kegiatan (nullable)
  dibuat_oleh      UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 9. MODUL 6 — KEGIATAN & AGENDA
-- ============================================================

CREATE TABLE kegiatan (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul            TEXT NOT NULL,
  jenis            TEXT,            -- 'gotong_royong', 'rapat_rt', 'kerja_bakti', dll
  deskripsi        TEXT,
  tanggal          DATE NOT NULL,
  waktu_mulai      TIME,
  waktu_selesai    TIME,
  lokasi           TEXT,

  -- Target
  target           target_pengumuman DEFAULT 'semua',
  rt_id            UUID REFERENCES rts(id),   -- jika khusus RT tertentu

  -- Dokumentasi (diisi setelah kegiatan)
  foto_url         TEXT,
  catatan_hasil    TEXT,
  status           TEXT DEFAULT 'terjadwal',   -- 'terjadwal', 'selesai', 'dibatalkan'

  dibuat_oleh      UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kegiatan_tanggal ON kegiatan(tanggal);
CREATE INDEX idx_kegiatan_rt ON kegiatan(rt_id);


-- ============================================================
-- 10. MODUL 7 — KEAMANAN & KETERTIBAN
-- ============================================================

-- 10.1 Laporan Kejadian
CREATE TABLE laporan_kejadian (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rt_id            UUID NOT NULL REFERENCES rts(id),
  kategori         kategori_kejadian NOT NULL,
  judul            TEXT NOT NULL,
  deskripsi        TEXT NOT NULL,
  lokasi_kejadian  TEXT,
  waktu_kejadian   TIMESTAMPTZ,
  foto_url         TEXT,

  -- Pelapor (wajib teridentifikasi, bukan anonim)
  nama_pelapor     TEXT NOT NULL,
  no_hp_pelapor    TEXT,
  warga_id         UUID REFERENCES wargas(id),  -- jika pelapor warga terdaftar

  -- Penanganan
  status           status_laporan DEFAULT 'dilaporkan',
  catatan_tindak   TEXT,           -- catatan dari RT/dukuh

  created_by       UUID REFERENCES auth.users(id),
  ditindak_oleh    UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_laporan_rt ON laporan_kejadian(rt_id);
CREATE INDEX idx_laporan_status ON laporan_kejadian(status);

-- 10.2 Data Tamu / Pendatang
CREATE TABLE tamu_pendatang (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rt_id            UUID NOT NULL REFERENCES rts(id),
  nama_tamu        TEXT NOT NULL,
  asal_daerah      TEXT,
  keperluan        TEXT,
  tuan_rumah       TEXT NOT NULL,
  warga_id         UUID REFERENCES wargas(id),  -- jika tuan rumah warga terdaftar
  tgl_datang       DATE NOT NULL DEFAULT CURRENT_DATE,
  tgl_pergi        DATE,
  keterangan       TEXT,
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 11. MODUL 9 — MASUKAN, KRITIK & SARAN
-- ============================================================

CREATE TABLE masukan (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Tujuan (RT tertentu atau dukuh)
  tujuan           TEXT NOT NULL CHECK (tujuan IN ('dukuh', 'rt')),
  rt_id            UUID REFERENCES rts(id),    -- diisi jika tujuan = 'rt'

  -- Isi (sepenuhnya anonim, tidak ada identitas tersimpan)
  kategori         kategori_masukan NOT NULL,
  isi              TEXT NOT NULL,
  foto_url         TEXT,            -- opsional

  -- Pengelolaan internal
  status           status_masukan DEFAULT 'masuk',
  catatan_internal TEXT,            -- catatan internal RT/dukuh, tidak terlihat pengirim

  dibaca_oleh      UUID REFERENCES auth.users(id),
  dibaca_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_masukan_tujuan ON masukan(tujuan, rt_id);
CREATE INDEX idx_masukan_status ON masukan(status);


-- ============================================================
-- 12. PENGATURAN SISTEM
-- ============================================================

CREATE TABLE sistem_settings (
  key              TEXT PRIMARY KEY,
  value            TEXT,
  keterangan       TEXT,
  updated_by       UUID REFERENCES auth.users(id),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Settings diisi di bagian 17.5 (seed data)


-- ============================================================
-- 13. TRIGGERS — AUTO UPDATE updated_at
-- ============================================================

CREATE TRIGGER trg_padukuhan_profil   BEFORE UPDATE ON padukuhan_profil   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_rts                BEFORE UPDATE ON rts                FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_dasawismas         BEFORE UPDATE ON dasawismas         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_user_profiles      BEFORE UPDATE ON user_profiles      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_rumah_tanggas      BEFORE UPDATE ON rumah_tanggas      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_wargas             BEFORE UPDATE ON wargas             FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pkk_partisipasi   BEFORE UPDATE ON pkk_partisipasi    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_surat_templates    BEFORE UPDATE ON surat_templates    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_surat_pengajuan    BEFORE UPDATE ON surat_pengajuan    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_proposals          BEFORE UPDATE ON proposals          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pengumuman         BEFORE UPDATE ON pengumuman         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_kegiatan           BEFORE UPDATE ON kegiatan           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_laporan_kejadian   BEFORE UPDATE ON laporan_kejadian   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_masukan            BEFORE UPDATE ON masukan            FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 14. VIEWS — INTEGRASI POSYANDU (READ-ONLY)
-- ============================================================
-- Catatan: Tabel balitas, penimbangans, lansias, pemeriksaan_lansias
--          ada di schema public (project Posyandu yang sama)
--          View ini hanya bisa dibuat setelah schema Posyandu ada

CREATE OR REPLACE VIEW posyandu_ringkasan_rt AS
SELECT
  b.rt::smallint                                              AS nomor_rt,

  -- Balita
  COUNT(DISTINCT b.id)                                        AS jumlah_balita,

  COUNT(DISTINCT CASE
    WHEN (
      EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.tanggal_lahir::date)) * 12 +
      EXTRACT(MONTH FROM AGE(CURRENT_DATE, b.tanggal_lahir::date))
    ) <= 60 THEN b.id END)                                    AS balita_aktif,

  COUNT(DISTINCT CASE
    WHEN p.tanggal >= DATE_TRUNC('month', NOW())
    THEN b.id END)                                            AS ditimbang_bulan_ini,

  COUNT(DISTINCT CASE
    WHEN p.status_tb_u IN ('Sangat Pendek (SP)', 'Pendek (P)')
    THEN b.id END)                                            AS jumlah_stunting,

  COUNT(DISTINCT CASE
    WHEN p.status_gizi_imt_u IN ('Gizi Buruk', 'Gizi Kurang')
    THEN b.id END)                                            AS gizi_kurang,

  -- Lansia
  COUNT(DISTINCT l.id)                                        AS jumlah_lansia,

  COUNT(DISTINCT CASE
    WHEN pl.tanggal_periksa >= DATE_TRUNC('month', NOW())
    AND (
      SPLIT_PART(pl.tekanan_darah, '/', 1)::int >= 140
      OR pl.gula_darah > 200
      OR pl.kolesterol > 200
      OR pl.asam_urat > 7
    ) THEN l.id END)                                          AS lansia_berisiko

FROM balitas b
LEFT JOIN penimbangans p        ON p.balita_id = b.id
LEFT JOIN lansias l             ON l.rt = b.rt
LEFT JOIN pemeriksaan_lansias pl ON pl.lansia_id = l.id
GROUP BY b.rt
ORDER BY b.rt::smallint;


-- ============================================================
-- 15. VIEWS — LAPORAN PKK (untuk generate laporan baku)
-- ============================================================

-- Rekap per Dasawisma (baris = kepala rumah tangga)
CREATE OR REPLACE VIEW v_rekap_dasawisma AS
SELECT
  d.id                                   AS dasawisma_id,
  d.nama_dasawisma,
  rt.nomor_rt,
  rt.id                                  AS rt_id,
  krt.nama_kepala_keluarga               AS nama_krt,
  krt.no_kk,
  pp.tahun,

  -- Jumlah anggota KK
  COUNT(w.id)                            AS jml_anggota,
  COUNT(CASE WHEN w.jenis_kelamin = 'L' THEN 1 END) AS total_l,
  COUNT(CASE WHEN w.jenis_kelamin = 'P' THEN 1 END) AS total_p,

  -- Balita (usia < 5 tahun)
  COUNT(CASE WHEN w.jenis_kelamin = 'L'
    AND EXTRACT(YEAR FROM AGE(w.tanggal_lahir)) < 5
    AND w.status_warga = 'aktif' THEN 1 END)                  AS balita_l,
  COUNT(CASE WHEN w.jenis_kelamin = 'P'
    AND EXTRACT(YEAR FROM AGE(w.tanggal_lahir)) < 5
    AND w.status_warga = 'aktif' THEN 1 END)                  AS balita_p,

  -- Fasilitas (dari data KK)
  MAX(CASE WHEN krt.kriteria_rumah = 'sehat_layak_huni' THEN 1 ELSE 0 END) AS sehat_layak,
  MAX(CASE WHEN krt.memiliki_tempat_sampah THEN 1 ELSE 0 END) AS ada_tempat_sampah,
  MAX(CASE WHEN krt.memiliki_spal THEN 1 ELSE 0 END)          AS ada_spal,
  MAX(CASE WHEN krt.memiliki_jamban THEN 1 ELSE 0 END)        AS ada_jamban,
  MAX(CASE WHEN krt.menempel_stiker_p4k THEN 1 ELSE 0 END)    AS stiker_p4k,
  MAX(CASE WHEN krt.sumber_air = 'pdam' THEN 1 ELSE 0 END)    AS sumber_pdam,
  MAX(CASE WHEN krt.sumber_air = 'sumur' THEN 1 ELSE 0 END)   AS sumber_sumur,

  -- Kegiatan PKK (partisipasi)
  MAX(CASE WHEN pp.penghayatan_pancasila THEN 1 ELSE 0 END)   AS ikut_pancasila,
  MAX(CASE WHEN pp.gotong_royong THEN 1 ELSE 0 END)           AS ikut_gotong_royong,
  MAX(CASE WHEN pp.pendidikan_keterampilan THEN 1 ELSE 0 END) AS ikut_pendidikan,
  MAX(CASE WHEN pp.pengembangan_koperasi THEN 1 ELSE 0 END)   AS ikut_koperasi,
  MAX(CASE WHEN pp.pangan THEN 1 ELSE 0 END)                  AS ikut_pangan,
  MAX(CASE WHEN pp.sandang THEN 1 ELSE 0 END)                 AS ikut_sandang,
  MAX(CASE WHEN pp.kesehatan THEN 1 ELSE 0 END)               AS ikut_kesehatan,
  MAX(CASE WHEN pp.perencanaan_sehat THEN 1 ELSE 0 END)       AS ikut_perencanaan,
  MAX(CASE WHEN pp.kerja_bakti THEN 1 ELSE 0 END)             AS ikut_kerja_bakti

FROM dasawismas d
JOIN rts rt               ON rt.id = d.rt_id
JOIN rumah_tanggas krt    ON krt.dasawisma_id = d.id
JOIN wargas w             ON w.rumah_tangga_id = krt.id
LEFT JOIN pkk_partisipasi pp ON pp.warga_id = w.id
GROUP BY d.id, d.nama_dasawisma, rt.nomor_rt, rt.id,
         krt.nama_kepala_keluarga, krt.no_kk, krt.id, pp.tahun;

-- Rekap per RT (baris = dasawisma → naik ke padukuhan)
CREATE OR REPLACE VIEW v_rekap_rt AS
SELECT
  rt.id                                  AS rt_id,
  rt.nomor_rt,
  pp.tahun,
  COUNT(DISTINCT d.id)                   AS jml_dasawisma,
  COUNT(DISTINCT krt.id)                 AS jml_kk,
  COUNT(w.id)                            AS total_warga,
  COUNT(CASE WHEN w.jenis_kelamin = 'L' THEN 1 END) AS total_l,
  COUNT(CASE WHEN w.jenis_kelamin = 'P' THEN 1 END) AS total_p,
  COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(w.tanggal_lahir)) < 5 THEN 1 END) AS jml_balita,
  COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(w.tanggal_lahir)) >= 60 THEN 1 END) AS jml_lansia,
  COUNT(CASE WHEN w.berkebutuhan_khusus THEN 1 END) AS jml_berkebutuhan_khusus,
  COUNT(DISTINCT krt.id) FILTER (WHERE krt.kriteria_rumah = 'sehat_layak_huni') AS rumah_sehat,
  SUM(CASE WHEN krt.memiliki_jamban THEN 1 ELSE 0 END) AS ada_jamban,
  SUM(CASE WHEN krt.memiliki_spal THEN 1 ELSE 0 END)   AS ada_spal,
  SUM(CASE WHEN krt.sumber_air = 'pdam' THEN 1 ELSE 0 END) AS sumber_pdam

FROM rts rt
JOIN dasawismas d         ON d.rt_id = rt.id
JOIN rumah_tanggas krt    ON krt.rt_id = rt.id
JOIN wargas w             ON w.rt_id = rt.id AND w.status_warga = 'aktif'
LEFT JOIN pkk_partisipasi pp ON pp.warga_id = w.id
GROUP BY rt.id, rt.nomor_rt, pp.tahun;

-- Rekap Padukuhan (baris = RT)
CREATE OR REPLACE VIEW v_rekap_padukuhan AS
SELECT
  rt.nomor_rt,
  pp.tahun,
  COUNT(DISTINCT d.id)                   AS jml_dasawisma,
  COUNT(DISTINCT krt.id)                 AS jml_kk,
  COUNT(w.id)                            AS total_warga,
  COUNT(CASE WHEN w.jenis_kelamin = 'L' THEN 1 END) AS total_l,
  COUNT(CASE WHEN w.jenis_kelamin = 'P' THEN 1 END) AS total_p,
  COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(w.tanggal_lahir)) < 5
        AND w.jenis_kelamin = 'L' THEN 1 END)                 AS balita_l,
  COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(w.tanggal_lahir)) < 5
        AND w.jenis_kelamin = 'P' THEN 1 END)                 AS balita_p,
  COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(w.tanggal_lahir)) >= 60 THEN 1 END) AS jml_lansia,
  COUNT(CASE WHEN w.berkebutuhan_khusus THEN 1 END)           AS jml_buta,
  COUNT(DISTINCT krt.id) FILTER (WHERE krt.kriteria_rumah = 'sehat_layak_huni') AS rumah_sehat,
  SUM(CASE WHEN krt.memiliki_tempat_sampah THEN 1 ELSE 0 END) AS ada_tempat_sampah,
  SUM(CASE WHEN krt.memiliki_spal THEN 1 ELSE 0 END)          AS ada_spal,
  SUM(CASE WHEN krt.memiliki_jamban THEN 1 ELSE 0 END)        AS ada_jamban,
  SUM(CASE WHEN krt.menempel_stiker_p4k THEN 1 ELSE 0 END)    AS stiker_p4k,
  SUM(CASE WHEN krt.sumber_air = 'pdam' THEN 1 ELSE 0 END)    AS sumber_pdam,
  SUM(CASE WHEN krt.sumber_air = 'sumur' THEN 1 ELSE 0 END)   AS sumber_sumur,
  SUM(CASE WHEN krt.aktivitas_up2k THEN 1 ELSE 0 END)         AS up2k,
  SUM(CASE WHEN pp.kerja_bakti THEN 1 ELSE 0 END)             AS kerja_bakti

FROM rts rt
JOIN dasawismas d         ON d.rt_id = rt.id
JOIN rumah_tanggas krt    ON krt.rt_id = rt.id
JOIN wargas w             ON w.rt_id = rt.id AND w.status_warga = 'aktif'
LEFT JOIN pkk_partisipasi pp ON pp.warga_id = w.id
GROUP BY rt.nomor_rt, pp.tahun
ORDER BY rt.nomor_rt;


-- ============================================================
-- 16. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Aktifkan RLS di semua tabel utama
ALTER TABLE padukuhan_profil    ENABLE ROW LEVEL SECURITY;
ALTER TABLE rts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE dasawismas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE rumah_tanggas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE wargas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutasi_penduduk     ENABLE ROW LEVEL SECURITY;
ALTER TABLE pkk_partisipasi     ENABLE ROW LEVEL SECURITY;
ALTER TABLE surat_pengajuan     ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman          ENABLE ROW LEVEL SECURITY;
ALTER TABLE kegiatan            ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan_kejadian    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tamu_pendatang      ENABLE ROW LEVEL SECURITY;
ALTER TABLE masukan             ENABLE ROW LEVEL SECURITY;

-- Helper function: ambil role user yang sedang login
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: ambil RT ID user yang sedang login
CREATE OR REPLACE FUNCTION get_user_rt_id()
RETURNS UUID AS $$
  SELECT rt_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: ambil dasawisma ID user yang sedang login
CREATE OR REPLACE FUNCTION get_user_dasawisma_id()
RETURNS UUID AS $$
  SELECT dasawisma_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ---- RLS POLICIES ----

-- PADUKUHAN PROFIL: semua yang login bisa baca, hanya dukuh yang edit
CREATE POLICY "profil_read_all"   ON padukuhan_profil FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "profil_edit_dukuh" ON padukuhan_profil FOR UPDATE USING (get_user_role() = 'dukuh');

-- RTS: semua bisa baca
CREATE POLICY "rts_read_all"   ON rts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "rts_edit_dukuh" ON rts FOR ALL USING (get_user_role() = 'dukuh');

-- DASAWISMA: semua bisa baca
CREATE POLICY "dasawisma_read_all"   ON dasawismas FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "dasawisma_edit_dukuh" ON dasawismas FOR ALL USING (get_user_role() = 'dukuh');

-- USER PROFILES: user hanya bisa lihat profilnya sendiri, dukuh lihat semua
CREATE POLICY "user_profiles_self"  ON user_profiles FOR SELECT
  USING (id = auth.uid() OR get_user_role() = 'dukuh');
CREATE POLICY "user_profiles_update_self" ON user_profiles FOR UPDATE
  USING (id = auth.uid());
CREATE POLICY "user_profiles_manage_dukuh" ON user_profiles FOR ALL
  USING (get_user_role() = 'dukuh');

-- RUMAH TANGGAS:
-- Dukuh: akses semua
-- Ketua RT: hanya RT-nya
-- Kader Dasawisma: hanya dasawisma-nya
CREATE POLICY "rt_read_dukuh" ON rumah_tanggas FOR SELECT
  USING (get_user_role() = 'dukuh');
CREATE POLICY "rt_read_ketua_rt" ON rumah_tanggas FOR SELECT
  USING (get_user_role() = 'ketua_rt' AND rt_id = get_user_rt_id());
CREATE POLICY "rt_read_kader" ON rumah_tanggas FOR SELECT
  USING (get_user_role() = 'kader_dasawisma' AND dasawisma_id = get_user_dasawisma_id());
CREATE POLICY "rt_write_dukuh" ON rumah_tanggas FOR ALL
  USING (get_user_role() = 'dukuh');
CREATE POLICY "rt_write_ketua_rt" ON rumah_tanggas FOR INSERT
  WITH CHECK (get_user_role() = 'ketua_rt' AND rt_id = get_user_rt_id());
CREATE POLICY "rt_update_ketua_rt" ON rumah_tanggas FOR UPDATE
  USING (get_user_role() = 'ketua_rt' AND rt_id = get_user_rt_id());

-- WARGAS: sama pola dengan rumah_tanggas
CREATE POLICY "warga_read_dukuh" ON wargas FOR SELECT
  USING (get_user_role() = 'dukuh');
CREATE POLICY "warga_read_ketua_rt" ON wargas FOR SELECT
  USING (get_user_role() = 'ketua_rt' AND rt_id = get_user_rt_id());
CREATE POLICY "warga_read_kader" ON wargas FOR SELECT
  USING (get_user_role() = 'kader_dasawisma' AND dasawisma_id = get_user_dasawisma_id());
CREATE POLICY "warga_write_dukuh" ON wargas FOR ALL
  USING (get_user_role() = 'dukuh');
CREATE POLICY "warga_write_ketua_rt" ON wargas FOR INSERT
  WITH CHECK (get_user_role() = 'ketua_rt' AND rt_id = get_user_rt_id());
CREATE POLICY "warga_update_kader" ON wargas FOR UPDATE
  USING (
    get_user_role() = 'kader_dasawisma'
    AND dasawisma_id = get_user_dasawisma_id()
  );

-- PKK PARTISIPASI:
-- Kader hanya akses dasawisma-nya
-- Ketua RT hanya akses RT-nya
-- Dukuh akses semua
CREATE POLICY "pkk_read_dukuh" ON pkk_partisipasi FOR SELECT
  USING (get_user_role() = 'dukuh');
CREATE POLICY "pkk_read_ketua_rt" ON pkk_partisipasi FOR SELECT
  USING (get_user_role() = 'ketua_rt' AND dasawisma_id IN (
    SELECT id FROM dasawismas WHERE rt_id = get_user_rt_id()
  ));
CREATE POLICY "pkk_manage_kader" ON pkk_partisipasi FOR ALL
  USING (get_user_role() = 'kader_dasawisma' AND dasawisma_id = get_user_dasawisma_id());

-- SURAT PENGAJUAN:
-- Ketua RT hanya lihat pengajuan dari RT-nya
-- Dukuh lihat semua
CREATE POLICY "surat_read_dukuh" ON surat_pengajuan FOR SELECT
  USING (get_user_role() = 'dukuh');
CREATE POLICY "surat_manage_rt" ON surat_pengajuan FOR ALL
  USING (get_user_role() = 'ketua_rt' AND rt_id = get_user_rt_id());

-- PROPOSALS:
-- RT hanya lihat proposal-nya sendiri
-- Dukuh lihat dan edit semua
CREATE POLICY "proposal_read_dukuh" ON proposals FOR SELECT
  USING (get_user_role() = 'dukuh');
CREATE POLICY "proposal_manage_rt" ON proposals FOR ALL
  USING (get_user_role() = 'ketua_rt' AND rt_id = get_user_rt_id());
CREATE POLICY "proposal_update_dukuh" ON proposals FOR UPDATE
  USING (get_user_role() = 'dukuh');

-- PENGUMUMAN:
-- Dukuh: buat & lihat semua
-- Ketua RT: buat & lihat untuk RT-nya sendiri saja
CREATE POLICY "pengumuman_read_dukuh" ON pengumuman FOR SELECT
  USING (get_user_role() = 'dukuh');
CREATE POLICY "pengumuman_read_rt" ON pengumuman FOR SELECT
  USING (
    get_user_role() = 'ketua_rt'
    AND (
      target = 'semua'
      OR rt_pembuat = get_user_rt_id()
      OR id IN (
        SELECT pengumuman_id FROM pengumuman_target_rt
        WHERE rt_id = get_user_rt_id()
      )
    )
  );
CREATE POLICY "pengumuman_write_dukuh" ON pengumuman FOR ALL
  USING (get_user_role() = 'dukuh');
CREATE POLICY "pengumuman_write_rt" ON pengumuman FOR INSERT
  WITH CHECK (
    get_user_role() = 'ketua_rt'
    AND rt_pembuat = get_user_rt_id()
  );

-- LAPORAN KEJADIAN:
-- RT hanya lihat laporan di wilayahnya
-- Dukuh lihat semua
CREATE POLICY "laporan_read_dukuh" ON laporan_kejadian FOR SELECT
  USING (get_user_role() = 'dukuh');
CREATE POLICY "laporan_manage_rt" ON laporan_kejadian FOR ALL
  USING (get_user_role() = 'ketua_rt' AND rt_id = get_user_rt_id());

-- MASUKAN:
-- RT hanya lihat masukan yang ditujukan ke RT-nya
-- Dukuh lihat semua masukan
CREATE POLICY "masukan_read_dukuh" ON masukan FOR SELECT
  USING (get_user_role() = 'dukuh');
CREATE POLICY "masukan_read_rt" ON masukan FOR SELECT
  USING (get_user_role() = 'ketua_rt' AND rt_id = get_user_rt_id());
-- INSERT masukan boleh tanpa auth (anonim via PWA)
CREATE POLICY "masukan_insert_public" ON masukan FOR INSERT
  WITH CHECK (TRUE);


-- ============================================================
-- 17. DATA AWAL (SEED)
-- ============================================================

-- 17.1 Insert Profil Padukuhan
INSERT INTO padukuhan_profil (
  nama_padukuhan, nama_kalurahan, nama_kapanewon, nama_kabupaten
) VALUES (
  'Mandingan', 'Ringinharjo', 'Bantul', 'Bantul'
);

-- 17.2 Insert 7 RT Padukuhan Mandingan (data aktual)
INSERT INTO rts (nomor_rt, nama_ketua) VALUES
  (1, 'Sunarto'),
  (2, 'Agung Nugroho'),
  (3, 'Didit Suryana'),
  (4, 'Diki'),
  (5, 'Kelik Sugiharto'),
  (6, 'Puji Sukanto'),
  (7, 'Purwanto');

-- 17.3 Insert 20 Dasawisma (data aktual, tersebar di 7 RT)
-- RT 001 - Sunarto: 3 dasawisma
INSERT INTO dasawismas (rt_id, nama_dasawisma)
SELECT id, nama FROM rts,
  (VALUES ('Melati 1'), ('Melati 2'), ('Melati 3')) AS d(nama)
WHERE nomor_rt = 1;

-- RT 002 - Agung Nugroho: 3 dasawisma
INSERT INTO dasawismas (rt_id, nama_dasawisma)
SELECT id, nama FROM rts,
  (VALUES ('Anggrek 1'), ('Anggrek 2'), ('Anggrek 3')) AS d(nama)
WHERE nomor_rt = 2;

-- RT 003 - Didit Suryana: 4 dasawisma
INSERT INTO dasawismas (rt_id, nama_dasawisma)
SELECT id, nama FROM rts,
  (VALUES ('Mawar 1'), ('Mawar 2'), ('Mawar 3'), ('Mawar 4')) AS d(nama)
WHERE nomor_rt = 3;

-- RT 004 - Diki: 2 dasawisma
INSERT INTO dasawismas (rt_id, nama_dasawisma)
SELECT id, nama FROM rts,
  (VALUES ('Melati 9'), ('Melati 10')) AS d(nama)
WHERE nomor_rt = 4;

-- RT 005 - Kelik Sugiharto: 2 dasawisma
INSERT INTO dasawismas (rt_id, nama_dasawisma)
SELECT id, nama FROM rts,
  (VALUES ('Melati 11'), ('Melati 12')) AS d(nama)
WHERE nomor_rt = 5;

-- RT 006 - Puji Sukanto: 4 dasawisma
INSERT INTO dasawismas (rt_id, nama_dasawisma)
SELECT id, nama FROM rts,
  (VALUES ('Melati 14'), ('Melati 15'), ('Melati 16'), ('Melati 17')) AS d(nama)
WHERE nomor_rt = 6;

-- RT 007 - Purwanto: 2 dasawisma
INSERT INTO dasawismas (rt_id, nama_dasawisma)
SELECT id, nama FROM rts,
  (VALUES ('Melati 18'), ('Melati 19')) AS d(nama)
WHERE nomor_rt = 7;

-- 17.4 Insert Kontak Penting Default
INSERT INTO kontak_penting (label, kategori, no_hp, urutan) VALUES
  ('Babinkamtibmas', 'keamanan', '-', 1),
  ('Babinsa',        'keamanan', '-', 2),
  ('IGD Puskesmas Bantul', 'kesehatan', '-', 3),
  ('Dukuh Mandingan', 'pemerintah', '-', 4);
-- Nomor HP diisi dukuh via pengaturan sistem di aplikasi

-- 17.5 Insert Settings Sistem Default
INSERT INTO sistem_settings (key, value, keterangan) VALUES
  ('nama_sistem',
   'Sistem Padukuhan Mandingan',
   'Nama sistem yang tampil di aplikasi'),
  ('format_nomor_surat_pengantar',
   '{counter}/RT-{rt}/{bulan_romawi}/{tahun}',
   'Format penomoran surat pengantar RT'),
  ('format_nomor_surat_domisili',
   '{counter}/MAND/{bulan_romawi}/{tahun}',
   'Format penomoran surat domisili'),
  ('pwa_opsi_identifikasi',
   'link_rt',
   'Cara warga diidentifikasi di PWA: link_rt atau pilih_rt'),
  ('versi_schema',
   '1.1',
   'Versi schema database yang sedang berjalan');


-- ============================================================
-- 18. TABEL TAMBAHAN — PENGAJUAN SURAT PUBLIK (PWA)
-- ============================================================
-- Untuk warga yang ajukan surat via PWA tanpa login
-- RT verifikasi manual apakah NIK valid

CREATE TABLE surat_pengajuan_publik (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rt_id            UUID NOT NULL REFERENCES rts(id),
  jenis_surat      jenis_surat NOT NULL,
  keperluan        TEXT,

  -- Data warga diisi sendiri (belum terlink otomatis ke tabel wargas)
  nama_pemohon     TEXT NOT NULL,
  nik_pemohon      TEXT NOT NULL,
  no_hp_pemohon    TEXT NOT NULL,  -- wajib agar RT bisa konfirmasi

  -- RT verifikasi & tautkan ke data warga
  warga_id         UUID REFERENCES wargas(id),   -- diisi RT setelah verifikasi NIK
  status           status_surat DEFAULT 'pending',
  catatan_rt       TEXT,
  ditolak_alasan   TEXT,

  -- Setelah approve, file PDF disimpan di sini
  nomor_surat      TEXT,
  file_url         TEXT,

  diproses_oleh    UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_surat_publik_rt     ON surat_pengajuan_publik(rt_id);
CREATE INDEX idx_surat_publik_status ON surat_pengajuan_publik(status);
CREATE INDEX idx_surat_publik_nik    ON surat_pengajuan_publik(nik_pemohon);

CREATE TRIGGER trg_surat_publik
  BEFORE UPDATE ON surat_pengajuan_publik
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE surat_pengajuan_publik ENABLE ROW LEVEL SECURITY;

-- Warga tanpa akun bisa INSERT
CREATE POLICY "surat_publik_insert_anon" ON surat_pengajuan_publik
  FOR INSERT WITH CHECK (TRUE);

-- RT hanya lihat pengajuan di wilayahnya
CREATE POLICY "surat_publik_read_rt" ON surat_pengajuan_publik
  FOR SELECT USING (
    get_user_role() IN ('ketua_rt', 'dukuh')
    AND (
      get_user_role() = 'dukuh'
      OR rt_id = get_user_rt_id()
    )
  );

-- RT update status (approve/tolak)
CREATE POLICY "surat_publik_update_rt" ON surat_pengajuan_publik
  FOR UPDATE USING (
    get_user_role() IN ('ketua_rt', 'dukuh')
    AND (
      get_user_role() = 'dukuh'
      OR rt_id = get_user_rt_id()
    )
  );


-- ============================================================
-- 19. RLS TAMBAHAN — AKSES PUBLIK PWA (TANPA LOGIN)
-- ============================================================
-- Policy untuk data yang bisa dibaca warga tanpa akun
-- via PWA (portal publik padukuhan)

-- Profil padukuhan: publik bisa baca
CREATE POLICY "profil_read_public" ON padukuhan_profil
  FOR SELECT USING (TRUE);

-- Kontak penting: publik bisa baca
ALTER TABLE kontak_penting ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kontak_read_public" ON kontak_penting
  FOR SELECT USING (aktif = TRUE);
CREATE POLICY "kontak_manage_dukuh" ON kontak_penting
  FOR ALL USING (get_user_role() = 'dukuh');

-- Pengumuman: publik bisa baca yang aktif
-- Filter per RT ditangani di aplikasi (bukan di RLS)
-- karena warga tidak punya auth.uid()
CREATE POLICY "pengumuman_read_public" ON pengumuman
  FOR SELECT USING (aktif = TRUE);

-- Kegiatan: publik bisa baca yang tidak dibatalkan
CREATE POLICY "kegiatan_read_public" ON kegiatan
  FOR SELECT USING (status != 'dibatalkan');

-- Proposal: publik hanya lihat yang sudah ditandai tampil_publik
CREATE POLICY "proposal_read_public" ON proposals
  FOR SELECT USING (
    tampil_publik = TRUE
    AND status IN ('disetujui', 'dilaksanakan', 'selesai')
  );

-- Galeri: publik bisa lihat semua
ALTER TABLE galeri ENABLE ROW LEVEL SECURITY;
CREATE POLICY "galeri_read_public" ON galeri
  FOR SELECT USING (TRUE);
CREATE POLICY "galeri_write_auth" ON galeri
  FOR ALL USING (get_user_role() IN ('dukuh', 'ketua_rt'));

-- Laporan kejadian: INSERT boleh tanpa auth (warga via PWA)
-- SELECT hanya untuk RT/dukuh yang sudah ada di policy sebelumnya
CREATE POLICY "laporan_insert_public" ON laporan_kejadian
  FOR INSERT WITH CHECK (TRUE);

-- Masukan: INSERT sudah diset di section 16 (WITH CHECK TRUE)
-- Tidak perlu ditambah lagi


-- ============================================================
-- 20. CATATAN MIGRASI DARI SQLITE
-- ============================================================

-- Script migrasi terpisah (migration_script.py) akan menjalankan:
--
-- 1. Baca semua data dari SQLite lama
-- 2. Map ke tabel baru:
--    SQLite.keluarga     → rumah_tanggas
--    SQLite.anggota      → wargas
--    SQLite.dasawisma    → verifikasi nama ke tabel dasawismas
--    SQLite.kegiatan_pkk → pkk_partisipasi
--
-- 3. Kolom yang perlu perhatian saat migrasi:
--    - agama & pendidikan     : diisi NULL jika kosong (tidak diisi paksa)
--    - no_reg                 : simpan apa adanya sebagai referensi nomor lama
--    - jenis_kelamin          : 'Laki-laki'/'Perempuan' → 'L'/'P'
--    - status_perkawinan      : normalisasi ke enum
--    - status_dalam_keluarga  : normalisasi ke enum
--    - tanggal lahir          : parse DD/MM/YYYY → DATE
--    - sumber_air             : 'PDAM' → 'pdam', 'Sumur' → 'sumur'
--
-- 4. Urutan insert (penting — jangan dibalik):
--    rts (sudah ada dari seed)            →
--    dasawismas (update nama_kader)       →
--    rumah_tanggas                        →
--    wargas                               →
--    pkk_partisipasi (jika ada di SQLite)
--
-- 5. Mapping Dasawisma dari SQLite ke data aktual:
--    SQLite mungkin pakai nama berbeda → cocokkan ke:
--    RT 001: Melati 1, 2, 3
--    RT 002: Anggrek 1, 2, 3
--    RT 003: Mawar 1, 2, 3, 4
--    RT 004: Melati 9, 10
--    RT 005: Melati 11, 12
--    RT 006: Melati 14, 15, 16, 17
--    RT 007: Melati 18, 19
--
-- 6. Validasi setelah migrasi:
--    SELECT COUNT(*) FROM wargas;                     -- harus ±1250
--    SELECT COUNT(*) FROM rumah_tanggas;              -- harus ±424
--    SELECT COUNT(DISTINCT rt_id) FROM wargas;        -- harus 7
--    SELECT COUNT(*) FROM dasawismas;                 -- harus 20
--    SELECT nomor_rt, COUNT(*) FROM wargas
--      JOIN rts ON rts.id = wargas.rt_id
--      GROUP BY nomor_rt ORDER BY nomor_rt;           -- cek distribusi per RT


-- ============================================================
-- SELESAI
-- ============================================================
-- Versi schema  : 1.1
-- Total tabel   : 22 tabel
--   (21 sebelumnya + surat_pengajuan_publik)
-- Total view    : 5 view
--   (posyandu_ringkasan_rt, v_rekap_dasawisma,
--    v_rekap_rt, v_rekap_padukuhan)
-- Total enum    : 16 enum
-- Total trigger : 16 trigger (auto updated_at)
--
-- Data Aktual Padukuhan Mandingan:
--   7 RT  | 20 Dasawisma | ±424 KK | ±1.250 Warga
--
-- Platform yang didukung:
--   Mobile (Expo) — Dukuh, Ketua RT, Kader PKK
--   Web (Next.js) — Dukuh (dashboard & laporan lengkap)
--   PWA           — Warga publik (tanpa login)
-- ============================================================
