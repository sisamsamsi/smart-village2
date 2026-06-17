import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export const suratKeys = {
  all: ['surat'] as const,
  list: (filter: any) => ['surat', 'list', filter] as const,
  detail: (id: string) => ['surat', 'detail', id] as const,
  templates: ['surat-templates'] as const,
}

export const useSuratTemplates = () => {
  return useQuery({
    queryKey: suratKeys.templates,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surat_templates')
        .select('*')
        .eq('aktif', true)
      if (error) throw error
      return data
    }
  })
}

export const useSuratList = (filter?: { status?: string }) => {
  const { profile, isKetuaRT } = useAuthStore()

  return useQuery({
    queryKey: suratKeys.list(filter),
    queryFn: async () => {
      let query = supabase
        .from('surat_pengajuan')
        .select(`
          *,
          wargas (nama_lengkap, nik, rts(nomor_rt))
        `)
        .order('created_at', { ascending: false })

      if (isKetuaRT() && profile?.rt_id && !__DEV__) {
        query = query.eq('rt_id', profile.rt_id)
      }

      if (filter?.status) {
        query = query.eq('status', filter.status)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export const useSuratDetail = (id: string) => {
  return useQuery({
    queryKey: suratKeys.detail(id),
    queryFn: async () => {
      console.log('Fetching surat detail for ID:', id);
      const { data, error } = await supabase
        .from('surat_pengajuan')
        .select(`
          *,
          wargas (*, rts:rt_id(nomor_rt)),
          warga:warga_id (*, rts:rt_id(nomor_rt))
        `)
        .eq('id', id)
        .single()
      
      if (error) {
        console.error('Error fetching surat detail:', error);
        throw error;
      }
      return data
    },
    enabled: !!id
  })
}

export const useUpdateSuratStatus = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const { data, error } = await supabase
        .from('surat_pengajuan')
        .update({
          ...payload,
          diproses_oleh: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: suratKeys.all })
      queryClient.invalidateQueries({ queryKey: suratKeys.detail(variables.id) })
    }
  })
}

export const useCreateSurat = () => {
  const queryClient = useQueryClient()
  const { user, profile } = useAuthStore()

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase
        .from('surat_pengajuan')
        .insert([{
          ...payload,
          rt_id: profile?.rt_id,
          created_by: user?.id,
          diajukan_via: 'rt'
        }])
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suratKeys.all })
    }
  })
}
