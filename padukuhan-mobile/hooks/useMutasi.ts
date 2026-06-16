import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export const mutasiKeys = {
  all: ['mutasi'] as const,
  byRT: (rtId: string) => ['mutasi', 'rt', rtId] as const,
  detail: (id: string) => ['mutasi', 'detail', id] as const,
}

export const useMutasiList = () => {
  const { profile, isKetuaRT } = useAuthStore()
  
  return useQuery({
    queryKey: isKetuaRT() ? mutasiKeys.byRT(profile?.rt_id!) : mutasiKeys.all,
    queryFn: async () => {
      let query = supabase
        .from('mutasi_penduduk')
        .select(`
          *,
          wargas (nama_lengkap, nik, rts(nomor_rt))
        `)
        .order('tanggal_mutasi', { ascending: false })

      if (isKetuaRT() && profile?.rt_id) {
        query = query.eq('rt_id', profile.rt_id)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export const useCreateMutasi = () => {
  const queryClient = useQueryClient()
  const { user, profile } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase
        .from('mutasi_penduduk')
        .insert([{
          ...payload,
          rt_id: profile?.rt_id,
          created_by: user?.id
        }])
        .select()
      
      if (error) throw error

      // Side effects based on mutation type
      if (payload.jenis_mutasi === 'kematian' && payload.warga_id) {
        await supabase.from('wargas').update({ status_warga: 'meninggal' }).eq('id', payload.warga_id)
      } else if (payload.jenis_mutasi === 'pindah_keluar' && payload.warga_id) {
        await supabase.from('wargas').update({ status_warga: 'pindah_keluar' }).eq('id', payload.warga_id)
      } else if (payload.jenis_mutasi === 'kehamilan' && payload.warga_id) {
        const isHamil = payload.status_kehamilan === 'hamil';
        await supabase
          .from('wargas')
          .update({ 
            status_kehamilan: isHamil, 
            status_menyusui: !isHamil 
          })
          .eq('id', payload.warga_id)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mutasiKeys.all })
      queryClient.invalidateQueries({ queryKey: ['wargas'] }) // refresh warga list
    }
  })
}
