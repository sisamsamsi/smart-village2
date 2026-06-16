import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useRTs } from '@/hooks/useKependudukan';
import { Search, User, ChevronRight, Plus, MapPin, Filter, X, XCircle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/stores/authStore';

const { width } = Dimensions.get('window');

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

export default function WargaTabScreen() {
  const { profile } = useAuthStore();
  const role = profile?.role;
  const rtId = profile?.rt_id;
  const dasawismaId = profile?.dasawisma_id;

  const [search, setSearch] = useState('');
  const { data: rtList } = useRTs();
  const [filterRT, setFilterRT] = useState<string | null>(null);
  const router = useRouter();

  const { data: wargas, isLoading, error, refetch } = useQuery({
    queryKey: ['wargas', search, filterRT, role, rtId, dasawismaId],
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
        .order('nama_lengkap', { ascending: true })
        .limit(50);

      if (search) {
        query = query.ilike('nama_lengkap', `%${search}%`);
      }

      // Filter berdasarkan hak akses peran aktif
      if (role === 'kader_dasawisma' && dasawismaId) {
        query = query.eq('rumah_tanggas.dasawisma_id', dasawismaId);
      } else if (role === 'ketua_rt' && rtId) {
        query = query.eq('rt_id', rtId);
      } else if (filterRT) {
        query = query.eq('rt_id', filterRT);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[] | null;
    },
  });

  const renderItem = ({ item }: { item: WargaListItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/kependudukan/${item.id}`)}
    >
      <View style={styles.cardIconWrapper}>
        <User size={24} color="#1B5E20" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.nama_lengkap}</Text>
        <Text style={styles.cardNik}>NIK: {item.nik || '-'}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.rtBadge}>
            <MapPin size={10} color="#1B5E20" style={{ marginRight: 4 }} />
            <Text style={styles.rtText}>RT {rtNomor(item)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status_warga === 'tetap' ? '#ECFDF5' : '#F1F5F9' }]}>
            <Text style={[styles.statusText, { color: item.status_warga === 'tetap' ? '#059669' : '#64748B' }]}>
              {item.status_warga || 'Warga'}
            </Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.filterSection}>
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

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1B5E20" />
        </View>
      ) : (
        <FlatList
          data={wargas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/kependudukan/tambah')}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
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
    paddingTop: Platform.OS === 'android' ? 40 : 12,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
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
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  filterSection: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 24,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  cardIconWrapper: {
    height: 48,
    width: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(27, 94, 32, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  cardNik: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  rtText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0369A1',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#475569',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
