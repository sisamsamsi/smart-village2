'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useKegiatanList() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['kegiatan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kegiatan')
        .select('*')
        .order('tanggal', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useLaporanKejadian() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['laporan_kejadian'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laporan_kejadian')
        .select('*, rts(nomor_rt)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useMasukanWarga() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['masukan_warga'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('masukan_warga')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
