'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'

export function useWargasList() {
  const supabase = createClient()
  const profile = useAuthStore((s) => s.profile)
  const canQuery = useAuthStore(
    (s) => !!s.profile && (s.isDukuh() || s.isKetuaRT() || s.isKader())
  )

  return useQuery({
    queryKey: ['wargas', 'dashboard', profile?.rt_id, profile?.dasawisma_id],
    queryFn: async () => {
      const { profile: p, isDukuh, isKetuaRT, isKader } = useAuthStore.getState()
      
      let allWargas: any[] = []
      let from = 0
      let to = 999
      let hasMore = true

      while (hasMore) {
        let q = supabase
          .from('wargas')
          .select('id, nama_lengkap, nik, status_warga, rt_id, rts(nomor_rt), rumah_tanggas(no_kk)')
          .eq('status_warga', 'aktif')
          .order('nama_lengkap', { ascending: true })
          .range(from, to)

        if (isKetuaRT() && p?.rt_id) {
          q = q.eq('rt_id', p.rt_id)
        } else if (isKader() && p?.dasawisma_id) {
          q = q.eq('dasawisma_id', p.dasawisma_id)
        } else if (!isDukuh()) {
          return []
        }

        const { data, error } = await q
        if (error) throw error
        
        allWargas = [...allWargas, ...(data || [])]
        
        if (!data || data.length < 1000) {
          hasMore = false
        } else {
          from += 1000
          to += 1000
        }
      }

      return allWargas
    },
    enabled: canQuery,
  })
}

export function useTambahWarga() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      let rumahTanggaId = data.rumah_tangga_id

      // Jika user memilih buat KK baru
      if (data.is_new_kk && data.no_kk_baru) {
        const { data: newKk, error: kkError } = await supabase
          .from('rumah_tanggas')
          .insert([{
            no_kk: data.no_kk_baru,
            nama_kepala_keluarga: data.nama_kepala_keluarga_baru || data.nama_lengkap,
            rt_id: data.rt_id
          }])
          .select()
          .single()
        
        if (kkError) throw kkError
        rumahTanggaId = newKk.id
      }

      // Hapus field bantuan sebelum insert ke wargas
      const { is_new_kk, no_kk_baru, nama_kepala_keluarga_baru, ...wargaData } = data
      
      const { error } = await supabase
        .from('wargas')
        .insert([{
          ...wargaData,
          rumah_tangga_id: rumahTanggaId
        }])

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wargas'] })
      queryClient.invalidateQueries({ queryKey: ['kk_list'] })
    }
  })
}

export function useUpdateWarga() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const { error } = await supabase
        .from('wargas')
        .update(data)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wargas'] })
      queryClient.invalidateQueries({ queryKey: ['warga', variables.id] })
    }
  })
}
