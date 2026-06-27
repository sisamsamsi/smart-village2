import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export const mutasiKeys = {
  all: ['mutasi'] as const,
  byRT: (rtId: string) => ['mutasi', 'rt', rtId] as const,
  detail: (id: string) => ['mutasi', 'detail', id] as const,
};

export const useMutasiList = (year: number) => {
  const { profile, isKetuaRT } = useAuthStore();

  return useQuery({
    queryKey: ['mutasi_list', year],
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
        .in('jenis_mutasi', ['pindah_masuk', 'pindah_keluar'])
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

export const useCreateMutasi = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: {
      jenis_mutasi: 'pindah_masuk' | 'pindah_keluar';
      tanggal_mutasi: string;
      warga_id?: string;
      rt_id?: string;
      asal_daerah?: string;
      tujuan_daerah?: string;
      keterangan?: string;
      
      // Fields if creating a new warga during pindah_masuk
      nama_lengkap?: string;
      nik?: string;
      jenis_kelamin?: 'L' | 'P';
      tanggal_lahir?: string;
      is_new_kk?: boolean;
      rumah_tangga_id?: string;
      no_kk_baru?: string;
      nama_kepala_keluarga_baru?: string;
      dasawisma_id?: string;
    }) => {
      let targetWargaId = payload.warga_id;
      let targetRtId: string | null | undefined = payload.rt_id;
      const targetDasawismaId = payload.dasawisma_id;

      // If no rt_id is provided in payload, but we have warga_id, fetch the warga's rt_id
      if (!targetRtId && targetWargaId) {
        const { data: wargaData } = await supabase
          .from('wargas')
          .select('rt_id')
          .eq('id', targetWargaId)
          .single();
        if (wargaData) {
          targetRtId = wargaData.rt_id;
        }
      }

      // If still no rt_id, fallback to profile's rt_id
      if (!targetRtId) {
        targetRtId = profile?.rt_id;
      }

      // 1. If pindah_masuk and no warga_id is provided, create the warga first
      if (payload.jenis_mutasi === 'pindah_masuk' && !targetWargaId) {
        let rumahTanggaId = payload.rumah_tangga_id;

        // If new KK is requested
        if (payload.is_new_kk && payload.no_kk_baru) {
          const { data: newKk, error: kkError } = await supabase
            .from('rumah_tanggas')
            .insert([{
              no_kk: payload.no_kk_baru,
              nama_kepala_keluarga: payload.nama_kepala_keluarga_baru || payload.nama_lengkap,
              rt_id: targetRtId,
              dasawisma_id: targetDasawismaId
            }])
            .select()
            .single();

          if (kkError) throw kkError;
          rumahTanggaId = newKk.id;
        }

        // Insert new warga
        const { data: newWarga, error: wargaError } = await supabase
          .from('wargas')
          .insert([{
            nama_lengkap: payload.nama_lengkap?.toUpperCase(),
            nik: payload.nik,
            jenis_kelamin: payload.jenis_kelamin,
            tanggal_lahir: payload.tanggal_lahir,
            tempat_lahir: 'Bantul',
            status_dalam_keluarga: payload.is_new_kk ? 'kepala_keluarga' : 'anggota',
            status_perkawinan: 'belum_kawin',
            status_warga: 'aktif',
            rumah_tangga_id: rumahTanggaId,
            rt_id: targetRtId,
            dasawisma_id: targetDasawismaId
          }])
          .select()
          .single();

        if (wargaError) throw wargaError;
        targetWargaId = newWarga.id;
      }

      // 2. Insert into mutasi_penduduk
      const { data, error } = await supabase
        .from('mutasi_penduduk')
        .insert([{
          warga_id: targetWargaId,
          rt_id: targetRtId,
          jenis_mutasi: payload.jenis_mutasi,
          tanggal_mutasi: payload.tanggal_mutasi,
          asal_daerah: payload.asal_daerah,
          tujuan_daerah: payload.tujuan_daerah,
          keterangan: payload.keterangan,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) {
        // Rollback warga insert if mutation insert fails
        if (payload.jenis_mutasi === 'pindah_masuk' && !payload.warga_id && targetWargaId) {
          await supabase.from('wargas').delete().eq('id', targetWargaId);
        }
        throw error;
      }

      // 3. Side effects based on mutation type
      if (payload.jenis_mutasi === 'pindah_keluar' && targetWargaId) {
        await supabase
          .from('wargas')
          .update({ status_warga: 'pindah_keluar' })
          .eq('id', targetWargaId);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mutasi_list'] });
      queryClient.invalidateQueries({ queryKey: ['wargas'] });
      queryClient.invalidateQueries({ queryKey: ['kk_list'] });
    }
  });
};
