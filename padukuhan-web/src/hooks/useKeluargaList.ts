'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useKeluargaList() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['rumah_tanggas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rumah_tanggas')
        .select(`
          id,
          no_kk,
          nama_kepala_keluarga,
          alamat_detail,
          rt_id,
          status_aktif,
          rts (nomor_rt),
          dasawismas (nama_dasawisma),
          wargas (id)
        `)
        .eq('status_aktif', true)
        .eq('wargas.status_warga', 'aktif')
        .order('nama_kepala_keluarga', { ascending: true })

      if (error) throw error

      return data.map(rt => ({
        ...rt,
        warga_count: rt.wargas ? rt.wargas.length : 0
      }))
    }
  })
}

export function useKeluargaDetail(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['rumah_tangga', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rumah_tanggas')
        .select(`
          *,
          rts (nomor_rt),
          dasawismas (nama_dasawisma),
          wargas (*)
        `)
        .eq('id', id)
        .eq('wargas.status_warga', 'aktif')
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id
  })
}

export function useUpdateKeluargaFasilitas() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('rumah_tanggas')
        .update(data)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rumah_tanggas'] })
      queryClient.invalidateQueries({ queryKey: ['rumah_tangga', variables.id] })
    }
  })
}
