CREATE TABLE IF NOT EXISTS surat_counter (
  rt_id        UUID NOT NULL REFERENCES rts(id),
  jenis_surat  jenis_surat NOT NULL,
  tahun        INTEGER NOT NULL,
  counter      INTEGER DEFAULT 0,
  PRIMARY KEY (rt_id, jenis_surat, tahun)
);

CREATE OR REPLACE FUNCTION increment_surat_counter(
  p_rt_id UUID,
  p_jenis jenis_surat,
  p_tahun INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_counter INTEGER;
BEGIN
  INSERT INTO surat_counter (rt_id, jenis_surat, tahun, counter)
  VALUES (p_rt_id, p_jenis, p_tahun, 1)
  ON CONFLICT (rt_id, jenis_surat, tahun)
  DO UPDATE SET counter = surat_counter.counter + 1
  RETURNING counter INTO v_counter;
  
  RETURN v_counter;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
