import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useWargaDetail(id: string) {
  return useQuery({
    queryKey: ['warga', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wargas')
        .select(`
          *,
          rts:rt_id(nomor_rt),
          rumah_tanggas:rumah_tangga_id(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateWarga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('wargas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['warga', data.id] });
      queryClient.invalidateQueries({ queryKey: ['wargas'] });
    },
  });
}
export function useRTs() {
  return useQuery({
    queryKey: ['rts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rts')
        .select('id, nomor_rt')
        .order('nomor_rt', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useKKs() {
  return useQuery({
    queryKey: ['kk_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rumah_tanggas')
        .select('id, no_kk, nama_kepala_keluarga')
        .order('no_kk', { ascending: true });

      if (error) throw error;
      return data;
    }
  });
}

export function useTambahWarga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      let rumahTanggaId = data.rumah_tangga_id;

      // Logika KK Baru
      if (data.is_new_kk && data.no_kk_baru) {
        const { data: newKk, error: kkError } = await supabase
          .from('rumah_tanggas')
          .insert([{
            no_kk: data.no_kk_baru,
            nama_kepala_keluarga: data.nama_kepala_keluarga_baru || data.nama_lengkap,
            rt_id: data.rt_id
          }])
          .select()
          .single();
        
        if (kkError) throw kkError;
        rumahTanggaId = newKk.id;
      }

      const { is_new_kk, no_kk_baru, nama_kepala_keluarga_baru, ...wargaData } = data;
      
      const { error } = await supabase
        .from('wargas')
        .insert([{
          ...wargaData,
          rumah_tangga_id: rumahTanggaId
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wargas'] });
      queryClient.invalidateQueries({ queryKey: ['kk_list'] });
    }
  });
}
