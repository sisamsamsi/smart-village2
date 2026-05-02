'use client'

import { useQuery } from '@tanstack/react-query'
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
          wargas (count)
        `)
        .order('nama_dasawisma')

      if (error) throw error
      return data
    },
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
