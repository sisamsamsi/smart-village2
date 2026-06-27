-- =======================================================
-- SEED DEFAULT INVITATION TOKENS (Satu Data Mandingan)
-- =======================================================

DO $$
DECLARE
  r RECORD;
  d RECORD;
  slug TEXT;
BEGIN
  -- 1. Ubah Check Constraint agar mengizinkan peran 'dukuh'
  ALTER TABLE invitation_tokens DROP CONSTRAINT IF EXISTS invitation_tokens_role_check;
  ALTER TABLE invitation_tokens ADD CONSTRAINT invitation_tokens_role_check CHECK (role IN ('dukuh', 'ketua_rt', 'kader_dasawisma'));

  -- 2. Bersihkan token lama
  DELETE FROM invitation_tokens;

  -- 3. Masukkan Token Dukuh (Super Admin)
  INSERT INTO invitation_tokens (token, role, rt_id, dasawisma_id)
  VALUES ('DKH-MANDINGAN', 'dukuh', NULL, NULL);

  -- 4. Masukkan Token Ketua RT 1 - 7 secara otomatis
  FOR r IN SELECT id, nomor_rt FROM rts ORDER BY nomor_rt LOOP
    INSERT INTO invitation_tokens (token, role, rt_id, dasawisma_id)
    VALUES ('RT' || r.nomor_rt || '-MANDINGAN', 'ketua_rt', r.id, NULL);
  END LOOP;

  -- 5. Masukkan Token Kader Dasawisma secara otomatis
  FOR d IN SELECT id, nama_dasawisma FROM dasawismas ORDER BY nama_dasawisma LOOP
    -- Ubah nama dasawisma (misal "Melati 1") menjadi slug ("MELATI1")
    slug := UPPER(REPLACE(d.nama_dasawisma, ' ', ''));
    INSERT INTO invitation_tokens (token, role, rt_id, dasawisma_id)
    VALUES ('DW-' || slug, 'kader_dasawisma', NULL, d.id);
  END LOOP;
END;
$$;
