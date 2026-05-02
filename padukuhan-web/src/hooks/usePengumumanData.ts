'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function usePengumumanList(rtId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['pengumuman', rtId],
    queryFn: async () => {
      let query = supabase
        .from('pengumuman')
        .select(`
          *,
          rts (nomor_rt)
        `)
        .eq('aktif', true)
        .order('created_at', { ascending: false })

      // Logic:
      // 1. Jika rtId ada (RT Login), ambil yang target='semua' ATAU yang target='rt_tertentu' dan ada di pengumuman_target_rt
      // Namun RLS sudah menangani ini di database. 
      // Kita cukup query dan biarkan RLS memfilter.
      
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}
