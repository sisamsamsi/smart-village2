import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const now = new Date();
      
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(now.getFullYear() - 5);
      const fiveYearsAgoStr = fiveYearsAgo.toISOString().split('T')[0];

      const sixtyYearsAgo = new Date();
      sixtyYearsAgo.setFullYear(now.getFullYear() - 60);
      const sixtyYearsAgoStr = sixtyYearsAgo.toISOString().split('T')[0];

      const fifteenYearsAgo = new Date();
      fifteenYearsAgo.setFullYear(now.getFullYear() - 15);
      const fifteenYearsAgoStr = fifteenYearsAgo.toISOString().split('T')[0];

      const fortyNineYearsAgo = new Date();
      fortyNineYearsAgo.setFullYear(now.getFullYear() - 49);
      const fortyNineYearsAgoStr = fortyNineYearsAgo.toISOString().split('T')[0];

      const [
        wargaRes,
        kkRes,
        laporanRes,
        balitaRes,
        lansiaRes,
        wusRes,
        pusRes,
        bumilRes,
        busuiRes
      ] = await Promise.all([
        supabase.from('wargas').select('id', { count: 'exact', head: true }).eq('status_warga', 'aktif'),
        supabase.from('rumah_tanggas').select('id', { count: 'exact', head: true }).eq('status_aktif', true),
        supabase.from('surat_pengajuan').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('wargas').select('id', { count: 'exact', head: true }).eq('status_warga', 'aktif').gte('tanggal_lahir', fiveYearsAgoStr),
        supabase.from('wargas').select('id', { count: 'exact', head: true }).eq('status_warga', 'aktif').lte('tanggal_lahir', sixtyYearsAgoStr),
        supabase.from('wargas').select('id', { count: 'exact', head: true }).eq('status_warga', 'aktif').eq('jenis_kelamin', 'P').gte('tanggal_lahir', fortyNineYearsAgoStr).lte('tanggal_lahir', fifteenYearsAgoStr),
        supabase.from('wargas').select('id', { count: 'exact', head: true }).eq('status_warga', 'aktif').eq('jenis_kelamin', 'P').eq('status_perkawinan', 'kawin').gte('tanggal_lahir', fortyNineYearsAgoStr).lte('tanggal_lahir', fifteenYearsAgoStr),
        supabase.from('wargas').select('id', { count: 'exact', head: true }).eq('status_warga', 'aktif').eq('status_kehamilan', true),
        supabase.from('wargas').select('id', { count: 'exact', head: true }).eq('status_warga', 'aktif').eq('status_menyusui', true),
      ]);

      if (wargaRes.error) throw wargaRes.error;
      if (kkRes.error) throw kkRes.error;

      return {
        totalWarga: wargaRes.count ?? 0,
        totalKK: kkRes.count ?? 0,
        totalLaporan: laporanRes.count ?? 0,
        balita: balitaRes.count ?? 0,
        lansia: lansiaRes.count ?? 0,
        wus: wusRes.count ?? 0,
        pus: pusRes.count ?? 0,
        ibuHamil: bumilRes.count ?? 0,
        ibuMenyusui: busuiRes.count ?? 0
      };
    },
  });
}
