import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

type WargaListItem = {
  id: string;
  nama_lengkap: string;
  nik: string | null;
  status_warga: string | null;
  rts: { nomor_rt: number | string } | { nomor_rt: number | string }[] | null;
};

function rtNomor(rts: WargaListItem['rts']): string | number {
  if (rts == null) return '-';
  if (Array.isArray(rts)) return rts[0]?.nomor_rt ?? '-';
  return rts.nomor_rt;
}

export default function KependudukanListScreen() {
  const [search, setSearch] = useState('');
  const [filterRT, setFilterRT] = useState<string | null>(null);
  const router = useRouter();

  const { data: wargas, isLoading, refetch } = useQuery({
    queryKey: ['wargas', search, filterRT],
    queryFn: async () => {
      let query = supabase
        .from('wargas')
        .select('id, nama_lengkap, nik, no_kk_id, status_warga, rts(nomor_rt)')
        .order('nama_lengkap', { ascending: true })
        .limit(50);

      if (search) {
        query = query.ilike('nama_lengkap', `%${search}%`);
      }

      if (filterRT) {
        query = query.eq('rt_id', filterRT);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WargaListItem[] | null;
    },
  });

  const renderItem = ({ item }: { item: WargaListItem }) => (
    <TouchableOpacity
      className="mx-6 mb-3 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
      onPress={() => router.push(`/kependudukan/${item.id}`)}
    >
      <View className="flex-1">
        <Text className="text-base font-bold text-slate-800">{item.nama_lengkap}</Text>
        <Text className="text-xs text-slate-500 mt-1">NIK: {item.nik}</Text>
        <View className="mt-2 flex-row items-center">
          <View className="rounded-full bg-blue-50 px-2 py-0.5 mr-2">
            <Text className="text-[10px] font-bold text-blue-600">RT {rtNomor(item.rts)}</Text>
          </View>
          <Text className="text-[10px] text-slate-400 capitalize">{item.status_warga}</Text>
        </View>
      </View>
      <Text className="text-xl text-slate-300">›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 py-4">
        <Text className="text-2xl font-bold text-slate-800">Kependudukan</Text>
        <Text className="text-slate-500 text-sm mt-1">Kelola data penduduk Padukuhan Mandingan</Text>
      </View>

      <View className="px-6 mb-4">
        <View className="h-12 flex-row items-center rounded-xl bg-white px-4 shadow-sm border border-slate-100">
          <Text className="mr-2">🔍</Text>
          <TextInput
            placeholder="Cari nama atau NIK..."
            className="flex-1 text-slate-800 h-full"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text className="text-slate-400">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="px-6 mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterChip label="Semua" active={!filterRT} onPress={() => setFilterRT(null)} />
          {[1, 2, 3, 4, 5, 6].map((rt) => (
            <FilterChip
              key={rt}
              label={`RT ${rt}`}
              active={filterRT === rt.toString()}
              onPress={() => setFilterRT(rt.toString())}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={wargas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="mt-20 items-center justify-center">
              <Text className="text-slate-400 text-base">Tidak ada data warga ditemukan</Text>
            </View>
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}

      <TouchableOpacity
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-xl"
        onPress={() => router.push('/kependudukan/tambah')}
      >
        <Text className="text-white text-3xl font-bold">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mr-2 rounded-full px-4 py-2 ${active ? 'bg-blue-600' : 'bg-white border border-slate-200'}`}
    >
      <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-600'}`}>{label}</Text>
    </TouchableOpacity>
  );
}
