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

export function useRtList() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['rts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rts').select('*').order('nomor_rt')
      if (error) throw error
      return data
    }
  })
}

export function useKkList() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['kk_list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rumah_tanggas').select('id, no_kk, nama_kepala_keluarga').order('no_kk')
      if (error) throw error
      return data
    }
  })
}
