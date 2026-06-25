import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useRTs } from '@/hooks/useKependudukan';
import { Search, User, ChevronRight, MapPin, X, XCircle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/stores/authStore';

type WargaListItem = {
  id: string;
  nama_lengkap: string;
  nik: string | null;
  status_warga: string | null;
  rts: { nomor_rt: number | string } | { nomor_rt: number | string }[] | null;
};

function rtNomor(item: any): string | number {
  const rt = item.rt || item.rts;
  if (rt == null) return '-';
  if (Array.isArray(rt)) return rt[0]?.nomor_rt ?? '-';
  return rt.nomor_rt;
}

const WargaCard = React.memo(({ item, onPress }: { item: WargaListItem; onPress: () => void }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardIconWrapper}>
        <User size={18} color="#124170" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>{item.nama_lengkap}</Text>
        <Text style={styles.cardNik}>NIK: {item.nik || '-'}</Text>
      </View>
      <View style={styles.cardRight}>
        <View style={styles.rtBadge}>
          <Text style={styles.rtText}>RT {rtNomor(item)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status_warga === 'tetap' ? '#EFF6FF' : '#F1F5F9' }]}>
          <Text style={[styles.statusText, { color: item.status_warga === 'tetap' ? '#124170' : '#64748B' }]}>
            {item.status_warga || 'Warga'}
          </Text>
        </View>
        <ChevronRight size={16} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );
});

export default function WargaTabScreen() {
  const { profile } = useAuthStore();
  const role = profile?.role;
  const rtId = profile?.rt_id;
  const dasawismaId = profile?.dasawisma_id;

  const [search, setSearch] = useState('');
  const { data: rtList } = useRTs();
  const [filterRT, setFilterRT] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'balita' | 'lansia' | 'pus' | 'wus' | null>(null);
  const router = useRouter();

  const { data: wargas, isLoading, error, refetch } = useQuery({
    queryKey: ['wargas', search, filterRT, categoryFilter, role, rtId, dasawismaId],
    queryFn: async () => {
      let selectFields = `
        id, 
        nama_lengkap, 
        nik, 
        rumah_tangga_id, 
        status_warga, 
        rt:rt_id(nomor_rt)
      `;

      if (role === 'kader_dasawisma' && dasawismaId) {
        selectFields += `, rumah_tanggas!inner(dasawisma_id)`;
      }

      let query = supabase
        .from('wargas')
        .select(selectFields)
        .eq('status_warga', 'aktif')
        .order('nama_lengkap', { ascending: true })
        .limit(50);

      if (search) {
        query = query.or(`nama_lengkap.ilike.%${search}%,nik.like.%${search}%`);
      }

      // Filter berdasarkan hak akses peran aktif
      if (role === 'kader_dasawisma' && dasawismaId && !__DEV__) {
        query = query.eq('rumah_tanggas.dasawisma_id', dasawismaId);
      } else if (role === 'ketua_rt' && rtId && !__DEV__) {
        query = query.eq('rt_id', rtId);
      } else if (filterRT) {
        query = query.eq('rt_id', filterRT);
      }

      // Category filters (Balita, Lansia, WUS, PUS)
      if (categoryFilter) {
        const now = new Date();
        if (categoryFilter === 'balita') {
          const fiveYearsAgo = new Date();
          fiveYearsAgo.setFullYear(now.getFullYear() - 5);
          const fiveYearsAgoStr = fiveYearsAgo.toISOString().split('T')[0];
          query = query.gte('tanggal_lahir', fiveYearsAgoStr);
        } else if (categoryFilter === 'lansia') {
          const sixtyYearsAgo = new Date();
          sixtyYearsAgo.setFullYear(now.getFullYear() - 60);
          const sixtyYearsAgoStr = sixtyYearsAgo.toISOString().split('T')[0];
          query = query.lte('tanggal_lahir', sixtyYearsAgoStr);
        } else if (categoryFilter === 'wus') {
          const fifteenYearsAgo = new Date();
          fifteenYearsAgo.setFullYear(now.getFullYear() - 15);
          const fifteenYearsAgoStr = fifteenYearsAgo.toISOString().split('T')[0];

          const fiftyYearsAgo = new Date();
          fiftyYearsAgo.setFullYear(now.getFullYear() - 50);
          const fiftyYearsAgoStr = fiftyYearsAgo.toISOString().split('T')[0];

          query = query
            .eq('jenis_kelamin', 'P')
            .gte('tanggal_lahir', fiftyYearsAgoStr)
            .lte('tanggal_lahir', fifteenYearsAgoStr);
        } else if (categoryFilter === 'pus') {
          const fifteenYearsAgo = new Date();
          fifteenYearsAgo.setFullYear(now.getFullYear() - 15);
          const fifteenYearsAgoStr = fifteenYearsAgo.toISOString().split('T')[0];

          const fiftyYearsAgo = new Date();
          fiftyYearsAgo.setFullYear(now.getFullYear() - 50);
          const fiftyYearsAgoStr = fiftyYearsAgo.toISOString().split('T')[0];

          query = query
            .eq('jenis_kelamin', 'P')
            .eq('status_perkawinan', 'kawin')
            .gte('tanggal_lahir', fiftyYearsAgoStr)
            .lte('tanggal_lahir', fifteenYearsAgoStr);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[] | null;
    },
  });

  const handlePressCard = React.useCallback((id: string) => {
    router.push(`/kependudukan/${id}`);
  }, [router]);

  const renderItem = React.useCallback(({ item }: { item: WargaListItem }) => (
    <WargaCard item={item} onPress={() => handlePressCard(item.id)} />
  ), [handlePressCard]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Kependudukan</Text>
        <Text style={styles.subtitle}>Kelola data penduduk Padukuhan Mandingan</Text>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Search size={20} color="#94A3B8" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Cari nama atau NIK..."
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94A3B8"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!(role === 'ketua_rt' || role === 'kader_dasawisma') && (
        <View style={[styles.filterSection, { paddingBottom: 6, borderBottomWidth: 0 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <FilterChip label="Semua RT" active={!filterRT} onPress={() => setFilterRT(null)} />
            {rtList?.map((rt) => (
              <FilterChip
                key={rt.id}
                label={`RT 0${rt.nomor_rt}`}
                active={filterRT === rt.id}
                onPress={() => setFilterRT(rt.id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={[styles.filterSection, { paddingTop: !(role === 'ketua_rt' || role === 'kader_dasawisma') ? 4 : 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <FilterChip label="Semua Kategori" active={!categoryFilter} onPress={() => setCategoryFilter(null)} />
          <FilterChip label="Balita" active={categoryFilter === 'balita'} onPress={() => setCategoryFilter('balita')} />
          <FilterChip label="Lansia" active={categoryFilter === 'lansia'} onPress={() => setCategoryFilter('lansia')} />
          <FilterChip label="WUS" active={categoryFilter === 'wus'} onPress={() => setCategoryFilter('wus')} />
          <FilterChip label="PUS" active={categoryFilter === 'pus'} onPress={() => setCategoryFilter('pus')} />
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#124170" />
        </View>
      ) : (
        <FlatList
          data={wargas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                {error ? <XCircle size={48} color="#EF4444" /> : <User size={48} color="#E2E8F0" />}
              </View>
              <Text style={styles.emptyText}>{error ? "Gagal memuat data" : "Tidak ada data warga ditemukan"}</Text>
              <Text style={styles.emptySubtext}>
                {error ? "Terjadi kesalahan pada koneksi database." : "Coba gunakan kata kunci atau filter RT yang lain"}
              </Text>
            </View>
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  searchWrapper: {
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  filterSection: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 24,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#124170',
    borderColor: '#124170',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cardIconWrapper: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardNik: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rtBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rtText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#124170',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyIconWrapper: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
