-- ==========================================
-- SETUP RLS POLICIES & INVITATION SCHEMAS
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL: invitation_tokens (Kode Undangan Pengurus)
CREATE TABLE IF NOT EXISTS invitation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ketua_rt', 'kader_dasawisma')),
  rt_id UUID REFERENCES rts(id) ON DELETE CASCADE,
  dasawisma_id UUID REFERENCES dasawismas(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Tambahkan kolom email ke user_profiles jika belum ada
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- 2. FUNGSI PEMBANTU (Helper Functions)
-- Fungsi untuk mengecek peran pengguna saat ini
CREATE OR REPLACE FUNCTION auth_has_role(required_role text)
RETURNS boolean SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role::text = required_role
  );
$$ LANGUAGE sql;

-- Fungsi untuk mendapatkan rt_id pengurus saat ini
CREATE OR REPLACE FUNCTION auth_get_rt_id()
RETURNS uuid SECURITY DEFINER AS $$
  SELECT rt_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql;

-- Fungsi untuk mendapatkan dasawisma_id pengurus saat ini
CREATE OR REPLACE FUNCTION auth_get_dasawisma_id()
RETURNS uuid SECURITY DEFINER AS $$
  SELECT dasawisma_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql;


-- 3. AKTIFKAN RLS (Row-Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wargas ENABLE ROW LEVEL SECURITY;
ALTER TABLE rumah_tanggas ENABLE ROW LEVEL SECURITY;
ALTER TABLE surat_pengajuan ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman_target_rt ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_tokens ENABLE ROW LEVEL SECURITY;


-- 4. KEBIJAKAN KEAMANAN (Policies)

-- A. USER PROFILES
DROP POLICY IF EXISTS "profiles_select_policy" ON user_profiles;
CREATE POLICY "profiles_select_policy" ON user_profiles
FOR SELECT USING (
  id = auth.uid() OR auth_has_role('dukuh')
);

DROP POLICY IF EXISTS "profiles_insert_self_policy" ON user_profiles;
CREATE POLICY "profiles_insert_self_policy" ON user_profiles
FOR INSERT WITH CHECK (
  id = auth.uid()
);

DROP POLICY IF EXISTS "profiles_all_dukuh_policy" ON user_profiles;
CREATE POLICY "profiles_all_dukuh_policy" ON user_profiles
FOR ALL USING (
  auth_has_role('dukuh')
);

-- B. WARGAS (Data Kependudukan Warga)
DROP POLICY IF EXISTS "wargas_select_policy" ON wargas;
CREATE POLICY "wargas_select_policy" ON wargas
FOR SELECT USING (
  auth_has_role('dukuh') OR 
  (auth_has_role('ketua_rt') AND rt_id = auth_get_rt_id()) OR
  (auth_has_role('kader_dasawisma') AND rumah_tangga_id IN (
    SELECT id FROM rumah_tanggas WHERE dasawisma_id = auth_get_dasawisma_id()
  ))
);

DROP POLICY IF EXISTS "wargas_write_policy" ON wargas;
CREATE POLICY "wargas_write_policy" ON wargas
FOR ALL USING (
  auth_has_role('dukuh') OR 
  (auth_has_role('ketua_rt') AND rt_id = auth_get_rt_id()) OR
  (auth_has_role('kader_dasawisma') AND rumah_tangga_id IN (
    SELECT id FROM rumah_tanggas WHERE dasawisma_id = auth_get_dasawisma_id()
  ))
);

-- C. RUMAH TANGGAS
DROP POLICY IF EXISTS "rtg_select_policy" ON rumah_tanggas;
CREATE POLICY "rtg_select_policy" ON rumah_tanggas
FOR SELECT USING (
  auth_has_role('dukuh') OR 
  (auth_has_role('ketua_rt') AND rt_id = auth_get_rt_id()) OR
  (auth_has_role('kader_dasawisma') AND dasawisma_id = auth_get_dasawisma_id())
);

DROP POLICY IF EXISTS "rtg_write_policy" ON rumah_tanggas;
CREATE POLICY "rtg_write_policy" ON rumah_tanggas
FOR ALL USING (
  auth_has_role('dukuh') OR 
  (auth_has_role('ketua_rt') AND rt_id = auth_get_rt_id()) OR
  (auth_has_role('kader_dasawisma') AND dasawisma_id = auth_get_dasawisma_id())
);

-- D. SURAT PENGAJUAN
DROP POLICY IF EXISTS "surat_select_policy" ON surat_pengajuan;
CREATE POLICY "surat_select_policy" ON surat_pengajuan
FOR SELECT USING (
  auth_has_role('dukuh') OR 
  (auth_has_role('ketua_rt') AND rt_id = auth_get_rt_id())
);

DROP POLICY IF EXISTS "surat_write_policy" ON surat_pengajuan;
CREATE POLICY "surat_write_policy" ON surat_pengajuan
FOR ALL USING (
  auth_has_role('dukuh') OR 
  (auth_has_role('ketua_rt') AND rt_id = auth_get_rt_id())
);

-- E. PROPOSALS (Usulan Program Kegiatan)
DROP POLICY IF EXISTS "proposals_select_policy" ON proposals;
CREATE POLICY "proposals_select_policy" ON proposals
FOR SELECT USING (
  true -- Semua pengurus terdaftar boleh membaca usulan program pembangunan
);

DROP POLICY IF EXISTS "proposals_write_policy" ON proposals;
CREATE POLICY "proposals_write_policy" ON proposals
FOR ALL USING (
  auth_has_role('dukuh') OR 
  (auth_has_role('ketua_rt') AND rt_id = auth_get_rt_id()) OR
  auth_has_role('kader_dasawisma')
);

-- F. PENGUMUMAN
DROP POLICY IF EXISTS "announcements_select_policy" ON pengumuman;
CREATE POLICY "announcements_select_policy" ON pengumuman
FOR SELECT USING (
  true -- Semua pengurus boleh membaca pengumuman
);

DROP POLICY IF EXISTS "announcements_write_policy" ON pengumuman;
CREATE POLICY "announcements_write_policy" ON pengumuman
FOR ALL USING (
  auth_has_role('dukuh') OR 
  (auth_has_role('ketua_rt') AND rt_pembuat = auth_get_rt_id())
);

-- G. PENGUMUMAN TARGET RT
DROP POLICY IF EXISTS "target_rt_select_policy" ON pengumuman_target_rt;
CREATE POLICY "target_rt_select_policy" ON pengumuman_target_rt
FOR SELECT USING (
  true
);

DROP POLICY IF EXISTS "target_rt_write_policy" ON pengumuman_target_rt;
CREATE POLICY "target_rt_write_policy" ON pengumuman_target_rt
FOR ALL USING (
  auth_has_role('dukuh') OR 
  auth_has_role('ketua_rt')
);

-- H. INVITATION TOKENS
DROP POLICY IF EXISTS "invitation_select_policy" ON invitation_tokens;
CREATE POLICY "invitation_select_policy" ON invitation_tokens
FOR SELECT USING (
  true -- Bebas diakses sebelum login untuk verifikasi token undangan
);

DROP POLICY IF EXISTS "invitation_write_policy" ON invitation_tokens;
CREATE POLICY "invitation_write_policy" ON invitation_tokens
FOR ALL USING (
  auth_has_role('dukuh')
);

-- ==========================================
-- 5. RPC FUNCTION: claim_invitation_token
-- ==========================================
CREATE OR REPLACE FUNCTION claim_invitation_token(
  token_str TEXT,
  full_name TEXT,
  phone TEXT
)
RETURNS BOOLEAN SECURITY DEFINER AS $$
DECLARE
  tok_row RECORD;
  user_email TEXT;
BEGIN
  -- Get the email of the currently authenticated Supabase user
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User tidak terautentikasi atau email tidak ditemukan.';
  END IF;

  -- Temukan token yang valid dan belum digunakan
  SELECT * INTO tok_row FROM invitation_tokens 
  WHERE token = token_str AND is_used = FALSE;

  IF tok_row.id IS NULL THEN
    RAISE EXCEPTION 'Kode undangan tidak valid atau sudah pernah digunakan.';
  END IF;

  -- 1. Tandai token sudah digunakan
  UPDATE invitation_tokens 
  SET is_used = TRUE 
  WHERE id = tok_row.id;

  -- 2. Upsert profil pengurus dengan peran dan ruang lingkup token
  INSERT INTO user_profiles (id, email, role, rt_id, dasawisma_id, nama_lengkap, no_hp, created_at)
  VALUES (
    auth.uid(),
    user_email,
    tok_row.role::user_role,
    tok_row.rt_id,
    tok_row.dasawisma_id,
    full_name,
    phone,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = user_email,
    role = tok_row.role::user_role,
    rt_id = tok_row.rt_id,
    dasawisma_id = tok_row.dasawisma_id,
    nama_lengkap = full_name,
    no_hp = phone;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
