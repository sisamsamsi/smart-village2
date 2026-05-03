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
