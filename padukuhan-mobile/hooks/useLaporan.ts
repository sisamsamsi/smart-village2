import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useLaporanList() {
  return useQuery({
    queryKey: ['laporan_kejadian_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laporan_kejadian')
        .select('*, rts(nomor_rt)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateLaporanStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'baru' | 'proses' | 'selesai' }) => {
      const { error } = await supabase
        .from('laporan_kejadian')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan_kejadian_list'] });
      queryClient.invalidateQueries({ queryKey: ['latest_laporan_kejadian_dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}
