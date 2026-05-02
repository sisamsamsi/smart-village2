/** Selaras enum `user_role` di DATABASE_SCHEMA.sql */
export type UserRole = 'dukuh' | 'ketua_rt' | 'kader_dasawisma' | 'sekretaris' | 'warga'

export interface UserProfile {
  id: string
  nama_lengkap?: string | null
  role?: UserRole | string | null
  rt_id?: string | null
  dasawisma_id?: string | null
  warga_id?: string | null
  rts?: { nomor_rt: number } | null
}
