-- Allow anyone to insert into surat_pengajuan (for PWA)
DROP POLICY IF EXISTS "surat_insert_public" ON surat_pengajuan;
CREATE POLICY "surat_insert_public" ON surat_pengajuan FOR INSERT WITH CHECK (TRUE);

-- Allow anyone to read surat_pengajuan (for tracking status)
-- Ideally this should be more restrictive, but for now we filter in the client by NIK
DROP POLICY IF EXISTS "surat_read_public" ON surat_pengajuan;
CREATE POLICY "surat_read_public" ON surat_pengajuan FOR SELECT USING (TRUE);
