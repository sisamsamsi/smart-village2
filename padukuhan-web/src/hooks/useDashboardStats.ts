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
        supabase.from('wargas').select('id, tanggal_lahir, jenis_kelamin, status_perkawinan, status_kehamilan, status_menyusui').eq('status_warga', 'aktif'),
        supabase.from('rumah_tanggas').select('*', { count: 'exact', head: true }).eq('status_aktif', true),
        supabase.from('surat_pengajuan').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('rts').select('*', { count: 'exact', head: true }),
        supabase.from('mutasi_penduduk').select('id').gte('tanggal_mutasi', startMonth),
      ])

      if (wargaRes.error) throw wargaRes.error
      if (kkRes.error) throw kkRes.error
      if (suratRes.error) throw suratRes.error
      if (rtRes.error) throw rtRes.error

      const wargas = wargaRes.data || []
      const now = new Date()
      
      const stats = {
        totalWarga: wargas.length,
        totalKK: kkRes.count ?? 0,
        totalRT: rtRes.count ?? 0,
        suratPending: suratRes.count ?? 0,
        mutasiBulanIni: mutasiRes.data?.length ?? 0,
        balita: 0,
        lansia: 0,
        wus: 0,
        pus: 0,
        ibuHamil: 0,
        ibuMenyusui: 0
      }

      wargas.forEach(w => {
        if (!w.tanggal_lahir) return
        const birthDate = new Date(w.tanggal_lahir)
        let age = now.getFullYear() - birthDate.getFullYear()
        const m = now.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
          age--
        }

        if (age <= 5) stats.balita++
        if (age >= 60) stats.lansia++
        
        if (w.jenis_kelamin === 'P' && age >= 15 && age <= 49) {
          stats.wus++
          if (w.status_perkawinan === 'kawin') stats.pus++
        }

        if (w.status_kehamilan) stats.ibuHamil++
        if (w.status_menyusui) stats.ibuMenyusui++
      })

      return stats
    },
    staleTime: 2 * 60 * 1000,
  })
}
