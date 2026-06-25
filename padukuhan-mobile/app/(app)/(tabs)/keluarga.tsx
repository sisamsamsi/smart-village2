import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useRTs } from '@/hooks/useKependudukan';
import { Search, Home, ChevronRight, X, XCircle, ArrowLeft } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/stores/authStore';

type KkListItem = {
  id: string;
  no_kk: string;
  nama_kepala_keluarga: string;
  alamat_detail: string | null;
  rt_id: string | null;
  rts: { nomor_rt: number | string } | null;
};

const KkCard = React.memo(({ item, onPress }: { item: KkListItem; onPress: () => void }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardIconWrapper}>
        <Home size={18} color="#124170" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.nama_kepala_keluarga || 'Kepala Keluarga Tidak Diketahui'}</Text>
        <Text style={styles.cardSub}>No. KK: {item.no_kk || '-'}</Text>
        {item.alamat_detail && (
          <Text style={styles.cardAddress} numberOfLines={1}>{item.alamat_detail}</Text>
        )}
      </View>
      <View style={styles.cardRight}>
        {item.rts && (
          <View style={styles.rtBadge}>
            <Text style={styles.rtText}>RT 0{(item.rts as any).nomor_rt}</Text>
          </View>
        )}
        <ChevronRight size={16} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );
});

export default function KeluargaIndexScreen() {
  const { profile, isKetuaRT, isKader } = useAuthStore();
  const role = profile?.role;
  const rtId = profile?.rt_id;
  const dasawismaId = profile?.dasawisma_id;

  const [search, setSearch] = useState('');
  const { data: rtList } = useRTs();
  const [filterRT, setFilterRT] = useState<string | null>(null);
  const router = useRouter();

  const { data: households, isLoading, error, refetch } = useQuery({
    queryKey: ['households_list', search, filterRT, role, rtId, dasawismaId],
    queryFn: async () => {
      let query = supabase
        .from('rumah_tanggas')
        .select(`
          id,
          no_kk,
          nama_kepala_keluarga,
          alamat_detail,
          rt_id,
          rts:rt_id(nomor_rt)
        `)
        .eq('status_aktif', true)
        .order('nama_kepala_keluarga', { ascending: true })
        .limit(60);

      if (search) {
        query = query.or(`nama_kepala_keluarga.ilike.%${search}%,no_kk.like.%${search}%`);
      }

      // Peran aktif filter
      if (isKader() && dasawismaId && !__DEV__) {
        query = query.eq('dasawisma_id', dasawismaId);
      } else if (isKetuaRT() && rtId && !__DEV__) {
        query = query.eq('rt_id', rtId);
      } else if (filterRT) {
        query = query.eq('rt_id', filterRT);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as KkListItem[] | null;
    },
  });

  const handlePressCard = React.useCallback((id: string) => {
    router.push(`/keluarga/${id}` as any);
  }, [router]);

  const renderItem = React.useCallback(({ item }: { item: KkListItem }) => (
    <KkCard item={item} onPress={() => handlePressCard(item.id)} />
  ), [handlePressCard]);

  const isRoleRestricted = isKetuaRT() || isKader();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Data Keluarga</Text>
          <Text style={styles.subtitle}>Kelola KK & fasilitas rumah tangga</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Search size={20} color="#94A3B8" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Cari kepala keluarga atau KK..."
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

      {/* Filter RT (jika Dukuh atau Admin) */}
      {!isRoleRestricted && (
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
          <ActivityIndicator size="large" color="#124170" />
        </View>
      ) : (
        <FlatList
          data={households}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                {error ? <XCircle size={48} color="#EF4444" /> : <Home size={48} color="#E2E8F0" />}
              </View>
              <Text style={styles.emptyText}>{error ? "Gagal memuat data" : "Tidak ada data keluarga ditemukan"}</Text>
              <Text style={styles.emptySubtext}>
                {error ? "Terjadi kesalahan pada koneksi database." : "Coba masukkan nomor KK atau nama lain"}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  searchWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#124170',
  },
  listContainer: {
    padding: 16,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  cardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cardAddress: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rtBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rtText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#124170',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
});
