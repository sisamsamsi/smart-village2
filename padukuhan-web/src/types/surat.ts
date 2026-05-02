/** Baris surat_pengajuan (selaras schema v1.1) */
export type SuratPengajuanRow = {
  id: string
  rt_id: string
  warga_id: string
  jenis_surat: 'pengantar_rt' | 'domisili'
  keperluan: string | null
  keterangan_tambahan: string | null
  status: 'pending' | 'diproses' | 'selesai' | 'ditolak'
  created_at: string
  diajukan_via?: string | null
}
