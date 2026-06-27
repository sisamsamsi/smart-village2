-- ============================================================
-- RE-ENABLE RLS ON ALL TABLES (Production Mode)
-- ============================================================
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- Tujuan: Mengaktifkan kembali Row Level Security pada semua 
--         tabel sebelum deploy ke production.
-- ============================================================

-- 1. Tabel utama penduduk
ALTER TABLE public.wargas ENABLE ROW LEVEL SECURITY;

-- 2. Tabel rumah tangga / keluarga
ALTER TABLE public.rumah_tanggas ENABLE ROW LEVEL SECURITY;

-- 3. Tabel RT
ALTER TABLE public.rts ENABLE ROW LEVEL SECURITY;

-- 4. Tabel Dasawisma
ALTER TABLE public.dasawismas ENABLE ROW LEVEL SECURITY;

-- 5. Tabel Mutasi Penduduk (kehamilan, kelahiran, kematian, pindah masuk/keluar)
ALTER TABLE public.mutasi_penduduk ENABLE ROW LEVEL SECURITY;

-- 6. Tabel Pengumuman
ALTER TABLE public.pengumuman ENABLE ROW LEVEL SECURITY;

-- 7. Tabel Surat Pengajuan
ALTER TABLE public.surat_pengajuan ENABLE ROW LEVEL SECURITY;

-- 8. Tabel Template Surat
ALTER TABLE public.surat_templates ENABLE ROW LEVEL SECURITY;

-- 9. Tabel User Profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 10. Tabel PKK Partisipasi
ALTER TABLE public.pkk_partisipasi ENABLE ROW LEVEL SECURITY;

-- 11. Tabel Proposals
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- 12. Tabel Laporan Kejadian
ALTER TABLE public.laporan_kejadian ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Verifikasi: Cek status RLS semua tabel setelah dijalankan
-- ============================================================
SELECT 
  schemaname,
  tablename, 
  rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
