import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export const programKeys = {
  all: ['proposals'] as const,
  list: (filter: any) => ['proposals', 'list', filter] as const,
  detail: (id: string) => ['proposals', 'detail', id] as const,
  rts: ['rts'] as const,
}

export const useRts = () => {
  return useQuery({
    queryKey: programKeys.rts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rts')
        .select('*')
        .order('nomor_rt')
      if (error) throw error
      return data
    }
  })
}

export const useProposals = (filter?: { status?: string; rtId?: string }) => {
  const profile = useAuthStore((s) => s.profile)
  const isKetuaRT = useAuthStore((s) => s.isKetuaRT)

  return useQuery({
    queryKey: programKeys.list(filter),
    queryFn: async () => {
      let query = supabase
        .from('proposals')
        .select(`
          *,
          rts (nomor_rt)
        `)
        .order('created_at', { ascending: false })

      if (filter?.status) {
        query = query.eq('status', filter.status)
      }

      // If RT, only show their proposals
      if (isKetuaRT() && profile?.rt_id) {
        query = query.eq('rt_id', profile.rt_id)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export const useProposal = (id: string) => {
  return useQuery({
    queryKey: programKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          rts (nomor_rt)
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export const useCreateProposal = () => {
  const queryClient = useQueryClient()
  const { user, profile } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase
        .from('proposals')
        .insert([{
          ...payload,
          rt_id: payload.rt_id || profile?.rt_id,
          created_by: user?.id
        }])
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.all })
    },
  })
}

export const useUpdateProposalStatus = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const { data, error } = await supabase
        .from('proposals')
        .update({
          ...payload,
          diproses_oleh: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: programKeys.all })
      queryClient.invalidateQueries({ queryKey: programKeys.detail(variables.id) })
    },
  })
}
