import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

function normalizeStatusKawin(val: string): string {
  if (!val) return 'belum_kawin';
  const clean = val.toUpperCase().trim();
  if (clean === 'BELUM KAWIN') return 'belum_kawin';
  if (clean === 'KAWIN') return 'kawin';
  if (clean === 'CERAI HIDUP') return 'cerai_hidup';
  if (clean === 'CERAI MATI') return 'cerai_mati';
  return val.toLowerCase().replace(' ', '_');
}

function normalizeHubungan(val: string): string {
  if (!val) return 'lainnya';
  const clean = val.toUpperCase().trim();
  if (clean === 'KEPALA KELUARGA') return 'kepala_keluarga';
  if (clean === 'ISTERI' || clean === 'ISTRI') return 'istri';
  if (clean === 'ANAK') return 'anak';
  if (clean === 'MERTUA') return 'mertua';
  if (clean === 'ORANG TUA') return 'orang_tua';
  if (clean === 'LAINNYA') return 'lainnya';
  return val.toLowerCase().replace(' ', '_');
}

function normalizeWargaData(input: any) {
  const normalized = { ...input };
  
  let statusKawinRaw = normalized.status_kawin || normalized.status_perkawinan;
  if (statusKawinRaw !== undefined) {
    normalized.status_perkawinan = normalizeStatusKawin(statusKawinRaw);
  }
  delete normalized.status_kawin;

  let hubunganRaw = normalized.hubungan_keluarga || normalized.status_dalam_keluarga;
  if (hubunganRaw !== undefined) {
    normalized.status_dalam_keluarga = normalizeHubungan(hubunganRaw);
  }
  delete normalized.hubungan_keluarga;

  return normalized;
}

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
      const normalizedUpdates = normalizeWargaData(updates);
      const { data, error } = await supabase
        .from('wargas')
        .update(normalizedUpdates)
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

export function useDasawismasByRt(rtId: string | null) {
  return useQuery({
    queryKey: ['dasawismas_by_rt', rtId],
    queryFn: async () => {
      if (!rtId) return [];
      const { data, error } = await supabase
        .from('dasawismas')
        .select('id, nama_dasawisma, rt_id')
        .eq('rt_id', rtId)
        .order('nama_dasawisma', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!rtId,
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
            rt_id: data.rt_id,
            dasawisma_id: data.dasawisma_id
          }])
          .select()
          .single();
        
        if (kkError) throw kkError;
        rumahTanggaId = newKk.id;
      }

      const { is_new_kk, no_kk_baru, nama_kepala_keluarga_baru, ...wargaData } = data;
      const normalizedWargaData = normalizeWargaData(wargaData);
      
      const { error } = await supabase
        .from('wargas')
        .insert([{
          ...normalizedWargaData,
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

export function useWargaMutasi(wargaId: string) {
  return useQuery({
    queryKey: ['warga_mutasi', wargaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mutasi_penduduk')
        .select('*')
        .eq('warga_id', wargaId)
        .order('tanggal_mutasi', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!wargaId,
  });
}

