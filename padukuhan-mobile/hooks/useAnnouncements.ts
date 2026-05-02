import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export const announcementKeys = {
  all: ['announcements'] as const,
  list: (filter: any) => ['announcements', 'list', filter] as const,
  detail: (id: string) => ['announcements', 'detail', id] as const,
}

export const useAnnouncements = (filter?: { activeOnly?: boolean }) => {
  return useQuery({
    queryKey: announcementKeys.list(filter),
    queryFn: async () => {
      let query = supabase
        .from('pengumuman')
        .select(`
          *,
          rts:rt_pembuat(nomor_rt)
        `)
        .order('created_at', { ascending: false })

      if (filter?.activeOnly) {
        query = query.eq('aktif', true)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export const useAnnouncementDetail = (id: string) => {
  return useQuery({
    queryKey: announcementKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pengumuman')
        .select(`
          *,
          rts:rt_pembuat(nomor_rt)
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id
  })
}

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient()
  const { user, profile } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase
        .from('pengumuman')
        .insert([{
          ...payload,
          dibuat_oleh: user?.id,
          rt_pembuat: profile?.rt_id
        }])
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all })
    }
  })
}
