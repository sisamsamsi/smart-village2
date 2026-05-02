'use client'

import { useQuery } from '@tanstack/react-query'
import { startOfMonth } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

export function useDashboardStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const startMonth = startOfMonth(new Date()).toISOString().slice(0, 10)

      const [wargaRes, kkRes, suratRes, rtRes, mutasiRes] = await Promise.all([
        supabase.from('wargas').select('*', { count: 'exact', head: true }).eq('status_warga', 'aktif'),
        supabase.from('rumah_tanggas').select('*', { count: 'exact', head: true }).eq('status_aktif', true),
        supabase.from('surat_pengajuan').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('rts').select('*', { count: 'exact', head: true }),
        supabase.from('mutasi_penduduk').select('id').gte('tanggal_mutasi', startMonth),
      ])

      if (wargaRes.error) throw wargaRes.error
      if (kkRes.error) throw kkRes.error
      if (suratRes.error) throw suratRes.error
      if (rtRes.error) throw rtRes.error

      const mutasiBulanIni = mutasiRes.error ? 0 : (mutasiRes.data?.length ?? 0)

      return {
        totalWarga: wargaRes.count ?? 0,
        totalKK: kkRes.count ?? 0,
        totalRT: rtRes.count ?? 0,
        suratPending: suratRes.count ?? 0,
        mutasiBulanIni,
      }
    },
    staleTime: 2 * 60 * 1000,
  })
}
