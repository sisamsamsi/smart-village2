import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export const useKematianList = (year: number) => {
  const { profile, isKetuaRT } = useAuthStore();

  return useQuery({
    queryKey: ['kematian_list', year],
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
        .eq('jenis_mutasi', 'kematian')
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

export const useCreateKematian = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: {
      warga_id: string;
      tanggal_mutasi: string;
      sebab_meninggal: string;
      keterangan: string;
    }) => {
      // 1. Insert into mutasi_penduduk
      const { data, error } = await supabase
        .from('mutasi_penduduk')
        .insert([{
          warga_id: payload.warga_id,
          rt_id: profile?.rt_id,
          jenis_mutasi: 'kematian',
          tanggal_mutasi: payload.tanggal_mutasi,
          sebab_meninggal: payload.sebab_meninggal,
          keterangan: payload.keterangan,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      // 2. Update status_warga to 'meninggal' in wargas table
      const { data: currentWarga } = await supabase
        .from('wargas')
        .select('status_dalam_keluarga, rumah_tangga_id, nama_lengkap')
        .eq('id', payload.warga_id)
        .single();

      const { error: wargaError } = await supabase
        .from('wargas')
        .update({ status_warga: 'meninggal' })
        .eq('id', payload.warga_id);

      if (wargaError) throw wargaError;

      // 3. If deceased is kepala_keluarga, promote the next family member
      if (currentWarga && currentWarga.status_dalam_keluarga === 'kepala_keluarga' && currentWarga.rumah_tangga_id) {
        const { data: familyMembers } = await supabase
          .from('wargas')
          .select('id, nama_lengkap, jenis_kelamin, status_dalam_keluarga, tanggal_lahir')
          .eq('rumah_tangga_id', currentWarga.rumah_tangga_id)
          .eq('status_warga', 'aktif')
          .neq('id', payload.warga_id);

        if (familyMembers && familyMembers.length > 0) {
          let replacement = familyMembers.find(m => m.status_dalam_keluarga === 'istri');
          
          if (!replacement) {
            const sortedByAge = [...familyMembers].sort((a, b) => {
              if (!a.tanggal_lahir) return 1;
              if (!b.tanggal_lahir) return -1;
              return new Date(a.tanggal_lahir).getTime() - new Date(b.tanggal_lahir).getTime();
            });
            replacement = sortedByAge[0];
          }

          if (replacement) {
            await supabase
              .from('wargas')
              .update({ status_dalam_keluarga: 'kepala_keluarga' })
              .eq('id', replacement.id);

            await supabase
              .from('rumah_tanggas')
              .update({ nama_kepala_keluarga: replacement.nama_lengkap })
              .eq('id', currentWarga.rumah_tangga_id);
          }
        } else {
          await supabase
            .from('rumah_tanggas')
            .update({ status_aktif: false })
            .eq('id', currentWarga.rumah_tangga_id);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kematian_list'] });
      queryClient.invalidateQueries({ queryKey: ['wargas'] });
    }
  });
};
