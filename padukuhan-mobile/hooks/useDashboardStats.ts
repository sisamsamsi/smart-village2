import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const [wargaRes, kkRes, laporanRes] = await Promise.all([
        supabase.from('wargas').select('*', { count: 'exact', head: true }).eq('status_warga', 'aktif'),
        supabase.from('rumah_tanggas').select('*', { count: 'exact', head: true }).eq('status_aktif', true),
        supabase.from('laporan_kejadian').select('*', { count: 'exact', head: true }).eq('status', 'baru'),
      ]);

      if (wargaRes.error) throw wargaRes.error;
      if (kkRes.error) throw kkRes.error;

      return {
        totalWarga: wargaRes.count ?? 0,
        totalKK: kkRes.count ?? 0,
        totalLaporan: laporanRes.count ?? 0,
      };
    },
  });
}
