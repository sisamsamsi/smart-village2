import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/authStore'

const supabaseService = createClient(
  'https://ouvkmlfbvhtpqqrtcesn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dmttbGZidmh0cHFxcnRjZXNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY4MjczNCwiZXhwIjoyMDkzMjU4NzM0fQ.0B-aU9V4G2NIqvM4-TcFO-FUlSWKuPC3g0Pgp3rUoZM'
)

export const announcementKeys = {
  all: ['announcements'] as const,
  list: (filter: any) => ['announcements', 'list', filter] as const,
  detail: (id: string) => ['announcements', 'detail', id] as const,
}

export const useAnnouncements = (filter?: { activeOnly?: boolean }) => {
  const { profile } = useAuthStore()

  return useQuery({
    queryKey: announcementKeys.list(filter),
    queryFn: async () => {
      let query = supabase
        .from('pengumuman')
        .select(`
          *,
          rts:rt_pembuat(nomor_rt),
          pengumuman_target_rt(rt_id)
        `)
        .order('created_at', { ascending: false })

      if (filter?.activeOnly) {
        query = query.eq('aktif', true)
      }

      const { data, error } = await query
      if (error) throw error

      // If user is dukuh, they see everything
      if (profile?.role === 'dukuh') {
        return data || [];
      }

      // If user has an rt_id (ketua_rt, kader_dasawisma, warga)
      const rtId = profile?.rt_id;
      if (rtId) {
        return (data || []).filter((item: any) => {
          // 1. Created by their own RT
          if (item.rt_pembuat === rtId) return true;
          // 2. Targeted to all RTs
          if (item.target === 'semua') return true;
          // 3. Specifically targeted to their RT
          const targets = item.pengumuman_target_rt || [];
          if (targets.some((t: any) => t.rt_id === rtId)) return true;
          return false;
        });
      }

      return data || [];
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
          rts:rt_pembuat(nomor_rt),
          pengumuman_target_rt(rt_id)
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
      const { target_rt_ids, ...restPayload } = payload

      const { data, error } = await supabaseService
        .from('pengumuman')
        .insert([{
          ...restPayload,
          dibuat_oleh: user?.id,
          rt_pembuat: profile?.rt_id
        }])
        .select()

      if (error) throw error

      const newAnnouncement = data?.[0]

      // If target is 'rt_tertentu' and there are selected RTs, insert into pengumuman_target_rt
      if (newAnnouncement && restPayload.target === 'rt_tertentu' && target_rt_ids && target_rt_ids.length > 0) {
        const targets = target_rt_ids.map((rtId: string) => ({
          pengumuman_id: newAnnouncement.id,
          rt_id: rtId
        }))

        const { error: targetError } = await supabaseService
          .from('pengumuman_target_rt')
          .insert(targets)

        if (targetError) throw targetError
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all })
    }
  })
}

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete targeted RT references first
      await supabaseService.from('pengumuman_target_rt').delete().eq('pengumuman_id', id);

      const { data, error } = await supabaseService
        .from('pengumuman')
        .delete()
        .eq('id', id)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all })
    }
  })
}
