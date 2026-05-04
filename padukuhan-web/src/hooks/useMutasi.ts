import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export type MutasiType = 'KELAHIRAN' | 'KEMATIAN' | 'PINDAH_KELUAR' | 'PINDAH_DATANG'

export interface MutasiInsert {
  warga_id?: string
  jenis_mutasi: MutasiType
  tanggal_mutasi: string
  keterangan?: string
  rt_id?: string
  nama_sementara?: string 
  is_satu_kk?: boolean // Opsi untuk pindah seluruh keluarga
}

export function useMutasi() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (data: MutasiInsert) => {
      // Jika mutasi 1 KK, kita perlu list anggota keluarganya
      let wargaIds = [data.warga_id]
      
      if (data.is_satu_kk && data.warga_id) {
        // Ambil rumah_tangga_id dari warga terpilih
        const { data: currentWarga } = await supabase
          .from('wargas')
          .select('rumah_tangga_id')
          .eq('id', data.warga_id)
          .single()
        
        if (currentWarga?.rumah_tangga_id) {
          const { data: familyMembers } = await supabase
            .from('wargas')
            .select('id')
            .eq('rumah_tangga_id', currentWarga.rumah_tangga_id)
          
          if (familyMembers) {
            wargaIds = familyMembers.map(m => m.id)
          }
        }
      }

      // 1. Simpan ke tabel mutasi_penduduk untuk setiap warga
      const mutasiInserts = wargaIds.map(id => ({
        warga_id: id,
        jenis_mutasi: data.jenis_mutasi,
        tanggal_mutasi: data.tanggal_mutasi,
        keterangan: data.keterangan,
        rt_id: data.rt_id
      }))

      const { data: mutasi, error: mutasiError } = await supabase
        .from('mutasi_penduduk')
        .insert(mutasiInserts)
        .select()

      if (mutasiError) throw mutasiError

      // 2. Update status warga
      if (data.jenis_mutasi === 'KEMATIAN' || data.jenis_mutasi === 'PINDAH_KELUAR') {
        const newStatus = data.jenis_mutasi === 'KEMATIAN' ? 'meninggal' : 'pindah'
        const { error: updateError } = await supabase
          .from('wargas')
          .update({ status_warga: newStatus })
          .in('id', wargaIds.filter(Boolean) as string[])

        if (updateError) throw updateError
      }

      return mutasi
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wargas'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['mutasi'] })
    }
  })
}
