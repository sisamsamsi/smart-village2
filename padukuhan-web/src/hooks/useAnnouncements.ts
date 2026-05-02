import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'

const supabase = createClient()

export const announcementKeys = {
  all: ['announcements'] as const,
  list: (filter: any) => ['announcements', 'list', filter] as const,
  detail: (id: string) => ['announcements', 'detail', id] as const,
}

export const useAnnouncements = (filter?: { target?: string; activeOnly?: boolean }) => {
  const profile = useAuthStore((s) => s.profile)
  const isKetuaRT = useAuthStore((s) => s.isKetuaRT)

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

      // If RT, show 'semua' or specifically targeted to their RT
      // Note: Full targeting logic might need a join or separate query
      // but for now let's get all and filter by target in UI if needed
      // OR use a complex query:
      /*
      if (isKetuaRT()) {
        query = query.or(`target.eq.semua,target.eq.rt_tertentu`)
      }
      */

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export const useAnnouncement = (id: string) => {
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
    enabled: !!id,
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
    },
  })
}

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const { data, error } = await supabase
        .from('pengumuman')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all })
      queryClient.invalidateQueries({ queryKey: announcementKeys.detail(variables.id) })
    },
  })
}

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pengumuman')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all })
    },
  })
}
