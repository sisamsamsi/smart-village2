import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export const useKelahiranList = (year: number) => {
  const { profile, isKetuaRT } = useAuthStore();

  return useQuery({
    queryKey: ['kelahiran_list', year],
    queryFn: async () => {
      let query = supabase
        .from('mutasi_penduduk')
        .select(`
          *,
          wargas (
            id, 
            nama_lengkap, 
            nik, 
            tanggal_lahir,
            rts (nomor_rt),
            rumah_tanggas (no_kk, alamat_detail)
          )
        `)
        .eq('jenis_mutasi', 'kelahiran')
        .gte('tanggal_mutasi', `${year}-01-01`)
        .lte('tanggal_mutasi', `${year}-12-31`)
        .order('tanggal_mutasi', { ascending: false });

      if (isKetuaRT() && profile?.rt_id && !__DEV__) {
        query = query.eq('rt_id', profile.rt_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateKelahiran = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: {
      nama_bayi: string;
      nik_bayi: string;
      jenis_kelamin_bayi: 'L' | 'P';
      tanggal_lahir_bayi: string;
      bb_lahir: number;
      tb_lahir: number;
      nama_ibu: string;
      nama_ayah: string;
      rumah_tangga_id: string;
      rt_id: string;
    }) => {
      // 1. Insert baby into wargas table first
      const { data: newWarga, error: wargaError } = await supabase
        .from('wargas')
        .insert([{
          nama_lengkap: payload.nama_bayi.toUpperCase(),
          nik: payload.nik_bayi,
          jenis_kelamin: payload.jenis_kelamin_bayi,
          tanggal_lahir: payload.tanggal_lahir_bayi,
          tempat_lahir: 'Bantul',
          status_dalam_keluarga: 'anak',
          status_perkawinan: 'belum_kawin',
          status_warga: 'aktif',
          rumah_tangga_id: payload.rumah_tangga_id,
          rt_id: payload.rt_id,
          memiliki_akte: true
        }])
        .select()
        .single();

      if (wargaError) throw wargaError;

      // 2. Insert into mutasi_penduduk
      const metadata = JSON.stringify({
        bb_lahir: payload.bb_lahir,
        tb_lahir: payload.tb_lahir,
      });

      const { data: mutasiData, error: mutasiError } = await supabase
        .from('mutasi_penduduk')
        .insert([{
          warga_id: newWarga.id,
          rt_id: payload.rt_id,
          jenis_mutasi: 'kelahiran',
          tanggal_mutasi: payload.tanggal_lahir_bayi,
          nama_bayi: payload.nama_bayi,
          jenis_kelamin_bayi: payload.jenis_kelamin_bayi,
          nama_ibu: payload.nama_ibu,
          nama_ayah: payload.nama_ayah,
          keterangan: metadata,
          created_by: user?.id
        }])
        .select()
        .single();

      if (mutasiError) {
        // Rollback warga insert if mutation fails
        await supabase.from('wargas').delete().eq('id', newWarga.id);
        throw mutasiError;
      }

      // 3. Update status_kehamilan to false and status_menyusui to true on mother
      // Find mother ID if she is in the wargas table
      const { data: motherData } = await supabase
        .from('wargas')
        .select('id')
        .eq('nama_lengkap', payload.nama_ibu.toUpperCase())
        .eq('jenis_kelamin', 'P')
        .limit(1);

      if (motherData && motherData.length > 0) {
        await supabase
          .from('wargas')
          .update({ status_kehamilan: false, status_menyusui: true })
          .eq('id', motherData[0].id);
      }

      return mutasiData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kelahiran_list'] });
      queryClient.invalidateQueries({ queryKey: ['wargas'] });
      queryClient.invalidateQueries({ queryKey: ['active_kehamilan_list'] });
    }
  });
};
