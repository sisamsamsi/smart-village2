-- 1. Tambah kolom indikator individu untuk PKK di tabel wargas
ALTER TABLE wargas 
ADD COLUMN IF NOT EXISTS status_kehamilan BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status_menyusui BOOLEAN DEFAULT FALSE;

-- 2. Tambah kolom indikator kelompok (3 Buta) di tabel rumah_tanggas
ALTER TABLE rumah_tanggas
ADD COLUMN IF NOT EXISTS jumlah_buta INTEGER DEFAULT 0;
