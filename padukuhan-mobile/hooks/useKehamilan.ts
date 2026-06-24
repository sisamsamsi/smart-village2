import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export const useKehamilanList = (year: number) => {
  const { profile, isKetuaRT } = useAuthStore();

  return useQuery({
    queryKey: ['kehamilan_list', year],
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
        .eq('jenis_mutasi', 'kehamilan')
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

export const useActiveKehamilanList = () => {
  const { profile, isKetuaRT } = useAuthStore();

  return useQuery({
    queryKey: ['active_kehamilan_list'],
    queryFn: async () => {
      let query = supabase
        .from('wargas')
        .select(`
          id,
          nama_lengkap,
          nik,
          tanggal_lahir,
          status_kehamilan,
          rts (nomor_rt),
          rumah_tanggas (no_kk, alamat_detail)
        `)
        .eq('status_warga', 'aktif')
        .eq('status_kehamilan', true);

      if (isKetuaRT() && profile?.rt_id && !__DEV__) {
        query = query.eq('rt_id', profile.rt_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateKehamilan = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: {
      warga_id: string;
      tanggal_mutasi: string;
      hpht: string;
      hpl: string;
      keterangan: string; // JSON string containing BB, TB, etc.
    }) => {
      // 1. Insert into mutasi_penduduk
      const { data, error } = await supabase
        .from('mutasi_penduduk')
        .insert([{
          warga_id: payload.warga_id,
          rt_id: profile?.rt_id,
          jenis_mutasi: 'kehamilan',
          tanggal_mutasi: payload.tanggal_mutasi,
          status_kehamilan: 'hamil',
          hpht: payload.hpht,
          hpl: payload.hpl,
          keterangan: payload.keterangan,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      // 2. Update status_kehamilan in wargas table
      const { error: wargaError } = await supabase
        .from('wargas')
        .update({ status_kehamilan: true, status_menyusui: false })
        .eq('id', payload.warga_id);

      if (wargaError) throw wargaError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kehamilan_list'] });
      queryClient.invalidateQueries({ queryKey: ['active_kehamilan_list'] });
      queryClient.invalidateQueries({ queryKey: ['wargas'] });
    }
  });
};

export const useGugurKehamilan = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: {
      warga_id: string;
      tanggal_mutasi: string;
      keterangan: string;
    }) => {
      // 1. Insert into mutasi_penduduk as gugur/abortus
      const { data, error } = await supabase
        .from('mutasi_penduduk')
        .insert([{
          warga_id: payload.warga_id,
          rt_id: profile?.rt_id,
          jenis_mutasi: 'kehamilan',
          tanggal_mutasi: payload.tanggal_mutasi,
          status_kehamilan: 'gugur',
          keterangan: payload.keterangan,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      // 2. Update status_kehamilan in wargas table to false
      const { error: wargaError } = await supabase
        .from('wargas')
        .update({ status_kehamilan: false })
        .eq('id', payload.warga_id);

      if (wargaError) throw wargaError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kehamilan_list'] });
      queryClient.invalidateQueries({ queryKey: ['active_kehamilan_list'] });
      queryClient.invalidateQueries({ queryKey: ['wargas'] });
    }
  });
};
