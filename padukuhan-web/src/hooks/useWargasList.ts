'use client'

import { useQuery } from '@tanstack/react-query'
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
      let q = supabase
        .from('wargas')
        .select('id, nama_lengkap, nik, status_warga, rt_id, rts(nomor_rt)')
        .order('nama_lengkap', { ascending: true })
        .limit(200)

      if (isKetuaRT() && p?.rt_id) {
        q = q.eq('rt_id', p.rt_id)
      } else if (isKader() && p?.dasawisma_id) {
        q = q.eq('dasawisma_id', p.dasawisma_id)
      } else if (!isDukuh()) {
        return []
      }

      const { data, error } = await q
      if (error) throw error
      return data
    },
    enabled: canQuery,
  })
}
