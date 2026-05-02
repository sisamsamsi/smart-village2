'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useProgramPengumuman() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['program_pengumuman'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_pengumuman')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })
}

export function useProposals(rtId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['proposals', rtId],
    queryFn: async () => {
      let query = supabase
        .from('proposals')
        .select(`
          *,
          rts (nomor_rt)
        `)
        .order('created_at', { ascending: false })

      if (rtId) {
        query = query.eq('rt_id', rtId)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}
