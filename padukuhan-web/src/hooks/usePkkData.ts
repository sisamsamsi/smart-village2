'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useDasawismaList() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dasawismas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dasawismas')
        .select(`
          id,
          nama_dasawisma,
          rt_id,
          rts (nomor_rt),
          rumah_tanggas (
            wargas (count)
          )
        `)
        .order('nama_dasawisma')

      if (error) throw error
      
      // Flatten the count from nested rumah_tanggas
      return data.map(dw => ({
        ...dw,
        warga_count: (dw.rumah_tanggas as any[])?.reduce((acc, rt) => acc + (rt.wargas?.[0]?.count || 0), 0) || 0
      }))
    },
  })
}

export function useDasawismaWarga(dasawismaId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dasawisma_warga', dasawismaId],
    queryFn: async () => {
      if (!dasawismaId) return []
      const { data, error } = await supabase
        .from('wargas')
        .select(`
          id,
          nama_lengkap,
          nik,
          rumah_tanggas!inner (dasawisma_id)
        `)
        .eq('rumah_tanggas.dasawisma_id', dasawismaId)
        .order('nama_lengkap')

      if (error) throw error
      return data
    },
    enabled: !!dasawismaId
  })
}

export function usePkkPartisipasi(dasawismaId?: string, tahun: number = new Date().getFullYear()) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['pkk_partisipasi', dasawismaId, tahun],
    queryFn: async () => {
      if (!dasawismaId) return []

      const { data, error } = await supabase
        .from('pkk_partisipasi')
        .select(`
          *,
          wargas (nama_lengkap, nik)
        `)
        .eq('dasawisma_id', dasawismaId)
        .eq('tahun', tahun)

      if (error) throw error
      return data
    },
    enabled: !!dasawismaId,
  })
}

export function useUpdatePkkPartisipasi() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (payload: {
      warga_id: string
      dasawisma_id: string
      tahun: number
      field: string
      value: boolean
    }) => {
      // Kita gunakan upsert: jika data tahun & warga tersebut belum ada, buat baru.
      const { data, error } = await supabase
        .from('pkk_partisipasi')
        .upsert({
          warga_id: payload.warga_id,
          dasawisma_id: payload.dasawisma_id,
          tahun: payload.tahun,
          [payload.field]: payload.value
        }, { 
          onConflict: 'warga_id,tahun' // Pastikan constraint ini ada di DB
        })
        .select()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pkk_partisipasi', variables.dasawisma_id, variables.tahun] })
    }
  })
}
