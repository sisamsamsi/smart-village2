-- =============================================================
-- UPDATE claim_invitation_token RPC (Mendukung Fleksibilitas)
-- =============================================================
--
-- Perubahan:
-- 1. Kode untuk 'dukuh' tetap single-use (sekali pakai).
-- 2. Kode untuk 'ketua_rt' dan 'kader_dasawisma' menjadi REUSABLE
--    (bisa diklaim oleh beberapa email/orang pengurus sekaligus
--    agar memudahkan pembagian tugas pendataan data warga).

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

  -- Jika peran adalah 'dukuh', pastikan kode belum pernah digunakan
  IF tok_row.role = 'dukuh' AND tok_row.is_used = TRUE THEN
    RAISE EXCEPTION 'Kode undangan Dukuh hanya bisa diklaim oleh 1 pengguna dan saat ini sudah terpakai.';
  END IF;

  -- Jika perannya dukuh, tandai is_used = TRUE agar tidak bisa dipakai email lain
  IF tok_row.role = 'dukuh' THEN
    UPDATE invitation_tokens 
    SET is_used = TRUE 
    WHERE id = tok_row.id;
  END IF;

  -- Untuk ketua_rt dan kader_dasawisma, token dibiarkan tetap is_used = FALSE
  -- sehingga pengurus lain tetap bisa masuk menggunakan kode yang sama.

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
