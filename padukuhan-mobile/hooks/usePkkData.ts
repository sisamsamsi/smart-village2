import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useDasawismaList() {
  return useQuery({
    queryKey: ['dasawismas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dasawismas')
        .select(`
          id,
          nama_dasawisma,
          rt_id,
          rts:rt_id (nomor_rt),
          rumah_tanggas (
            wargas (id)
          )
        `)
        .order('nama_dasawisma')

      if (error) throw error
      
      return (data || []).map(dw => ({
        ...dw,
        warga_count: (dw.rumah_tanggas as any[])?.reduce((acc, rt) => acc + (rt.wargas?.length || 0), 0) || 0
      }))
    },
  })
}

export function useDasawismaWarga(dasawismaId?: string) {
  return useQuery({
    queryKey: ['dasawisma_warga', dasawismaId],
    queryFn: async () => {
      if (!dasawismaId) return []
      const { data, error } = await supabase
        .from('wargas')
        .select(`
          id,
          nama_lengkap,
          nik,
          jenis_kelamin,
          tanggal_lahir,
          status_perkawinan,
          rumah_tangga_id,
          status_kehamilan,
          status_menyusui,
          ikut_bkb,
          ikut_paud,
          aktif_posyandu,
          akseptor_kb,
          berkebutuhan_khusus,
          ikut_koperasi,
          memiliki_akte,
          rumah_tanggas!inner (dasawisma_id)
        `)
        .eq('rumah_tanggas.dasawisma_id', dasawismaId)
        .order('nama_lengkap')

      if (error) throw error
      return data
    },
    enabled: !!dasawismaId
  })
}

export function usePkkPartisipasi(dasawismaId?: string, tahun: number = new Date().getFullYear()) {
  return useQuery({
    queryKey: ['pkk_partisipasi', dasawismaId, tahun],
    queryFn: async () => {
      if (!dasawismaId) return []

      const { data, error } = await supabase
        .from('pkk_partisipasi')
        .select(`
          *,
          wargas:warga_id (nama_lengkap, nik)
        `)
        .eq('dasawisma_id', dasawismaId)
        .lte('tahun', tahun)
        .order('tahun', { ascending: false })

      if (error) throw error

      // Client-side grouping: only keep the most recent record per warga
      const latestMap: Record<string, any> = {};
      data?.forEach(record => {
        if (!latestMap[record.warga_id]) {
          latestMap[record.warga_id] = record;
        }
      });

      return Object.values(latestMap);
    },
    enabled: !!dasawismaId,
  })
}

export function useUpdatePkkPartisipasi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ wargaId, dasawismaId, tahun, data }: { wargaId: string, dasawismaId: string, tahun: number, data: any }) => {
      const { error } = await supabase
        .from('pkk_partisipasi')
        .upsert({
          warga_id: wargaId,
          dasawisma_id: dasawismaId,
          tahun: tahun,
          ...data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'warga_id,tahun'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pkk_partisipasi'] });
    }
  });
}

export function useUpdateWargaPkkParams() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ wargaId, data }: { wargaId: string, data: any }) => {
      const { error } = await supabase
        .from('wargas')
        .update(data)
        .eq('id', wargaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dasawisma_warga'] });
    }
  });
}
