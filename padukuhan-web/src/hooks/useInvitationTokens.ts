'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useInvitationTokens() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['invitation_tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitation_tokens')
        .select(`
          *,
          rts (nomor_rt),
          dasawismas (nama_dasawisma)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })
}

export function useCreateInvitationToken() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (payload: {
      token: string
      role: 'ketua_rt' | 'kader_dasawisma'
      rt_id?: string | null
      dasawisma_id?: string | null
      expires_at?: string | null
    }) => {
      const { data, error } = await supabase
        .from('invitation_tokens')
        .insert({
          token: payload.token,
          role: payload.role,
          rt_id: payload.rt_id || null,
          dasawisma_id: payload.dasawisma_id || null,
          expires_at: payload.expires_at || null
        })
        .select()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitation_tokens'] })
    }
  })
}

export function useDeleteInvitationToken() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('invitation_tokens')
        .delete()
        .eq('id', id)
        .select()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitation_tokens'] })
    }
  })
}
