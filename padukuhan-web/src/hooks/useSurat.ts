import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export const suratKeys = {
  all: ['surat_pengajuan'] as const,
  list: (filter: any) => ['surat_pengajuan', 'list', filter] as const,
  detail: (id: string) => ['surat_pengajuan', id] as const,
}

export function useSuratList(rtId?: string) {
  return useQuery({
    queryKey: rtId ? suratKeys.list({ rtId }) : suratKeys.all,
    queryFn: async () => {
      let query = supabase
        .from('surat_pengajuan')
        .select(`
          *,
          rts (nomor_rt, nama_ketua),
          wargas (nama_lengkap, nik, jenis_kelamin)
        `)
        .order('created_at', { ascending: false })

      if (rtId) {
        query = query.eq('rt_id', rtId)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export function useUpdateSuratStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, catatan, nomor_surat }: { 
      id: string, 
      status: 'pending' | 'diproses' | 'selesai' | 'ditolak',
      catatan?: string,
      nomor_surat?: string
    }) => {
      const { data, error } = await supabase
        .from('surat_pengajuan_publik')
        .update({ 
          status, 
          catatan_rt: catatan,
          nomor_surat,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suratKeys.all })
    }
  })
}
