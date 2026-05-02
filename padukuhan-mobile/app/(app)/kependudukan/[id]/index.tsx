import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

type WargaDetail = {
  nama_lengkap: string;
  nik: string | null;
  jenis_kelamin: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  agama: string | null;
  pekerjaan: string | null;
  status_perkawinan: string | null;
  hubungan_keluarga?: string | null;
  status_warga: string | null;
  rumah_tanggas?: { no_kk?: string | null } | null;
  kk?: { no_kk?: string | null } | null;
  rts?: { nomor_rt: number | string } | null;
};

export default function WargaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const wargaId = Array.isArray(id) ? id[0] : id;

  const { data: warga, isLoading } = useQuery({
    queryKey: ['warga', wargaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wargas')
        .select(`
          *,
          rts(nomor_rt),
          kk:rumah_tanggas(*)
        `)
        .eq('id', wargaId)
        .single();

      if (error) throw error;
      return data as WargaDetail;
    },
    enabled: !!wargaId,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!warga) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <Text className="text-slate-500">Data warga tidak ditemukan</Text>
        <TouchableOpacity className="mt-4 rounded-xl bg-blue-600 px-6 py-3" onPress={() => router.back()}>
          <Text className="text-white font-bold">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const noKk = warga.kk?.no_kk ?? warga.rumah_tanggas?.no_kk;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="bg-slate-50 px-6 py-8 border-b border-slate-100">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-blue-600 font-bold">← Kembali</Text>
          </TouchableOpacity>
          <View className="flex-row items-center">
            <View className="h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 mr-4">
              <Text className="text-2xl">{warga.jenis_kelamin === 'L' ? '👨' : '👩'}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-slate-800">{warga.nama_lengkap}</Text>
              <Text className="text-slate-500">{warga.nik}</Text>
            </View>
          </View>
        </View>

        <View className="p-6">
          <Section title="Informasi Pribadi">
            <InfoRow label="Tempat, Tgl Lahir" value={`${warga.tempat_lahir}, ${warga.tanggal_lahir}`} />
            <InfoRow label="Jenis Kelamin" value={warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
            <InfoRow label="Agama" value={warga.agama ?? ''} />
            <InfoRow label="Pekerjaan" value={warga.pekerjaan ?? ''} />
            <InfoRow label="Status" value={warga.status_perkawinan?.replace('_', ' ') ?? ''} />
          </Section>

          <Section title="Kependudukan">
            <InfoRow label="Nomor KK" value={noKk || '-'} />
            <InfoRow label="Hubungan Keluarga" value={warga.hubungan_keluarga?.replace('_', ' ') ?? '-'} />
            <InfoRow label="RT" value={`RT ${warga.rts?.nomor_rt ?? '-'}`} />
            <InfoRow label="Status Warga" value={warga.status_warga ?? '-'} />
          </Section>

          <View className="mt-8 flex-row justify-between">
            <TouchableOpacity
              className="flex-1 mr-2 rounded-2xl border border-blue-600 py-4 items-center"
              onPress={() => router.push(`/kependudukan/${wargaId}/edit`)}
            >
              <Text className="text-blue-600 font-bold">Edit Data</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 ml-2 rounded-2xl bg-blue-600 py-4 items-center">
              <Text className="text-white font-bold">Cetak Surat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-8">
      <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{title}</Text>
      <View className="rounded-3xl border border-slate-100 bg-slate-50/30 p-4">{children}</View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-slate-50 last:border-0">
      <Text className="text-slate-500 flex-1">{label}</Text>
      <Text className="text-slate-800 font-semibold flex-1 text-right capitalize">{value || '-'}</Text>
    </View>
  );
}
