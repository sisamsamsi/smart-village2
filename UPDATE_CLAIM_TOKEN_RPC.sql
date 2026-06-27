-- =============================================================
-- UPDATE claim_invitation_token RPC (Mendukung Fleksibilitas Penuh)
-- =============================================================
--
-- Perubahan:
-- Semua kode akses (termasuk 'dukuh', 'ketua_rt', dan 'kader_dasawisma')
-- menjadi REUSABLE (bisa diklaim oleh beberapa email/orang pengurus sekaligus
-- untuk memudahkan pembagian tugas dan sinkronisasi akun).

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
  -- Dapatkan email dari user Supabase yang sedang login
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User tidak terautentikasi atau email tidak ditemukan.';
  END IF;

  -- Cari token berdasarkan kode input
  SELECT * INTO tok_row FROM invitation_tokens 
  WHERE token = token_str;

  IF tok_row.id IS NULL THEN
    RAISE EXCEPTION 'Kode undangan tidak valid.';
  END IF;

  -- Upsert profil pengurus dengan peran dan ruang lingkup token
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
