import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDasawismaList } from '@/hooks/usePkkData';
import { 
  ArrowLeft, 
  Users, 
  ChevronRight,
  ClipboardList,
  Filter,
  CheckCircle2,
  XCircle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function PkkListScreen() {
  const router = useRouter();
  const { data: dws, isLoading, error, refetch } = useDasawismaList();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#1B5E20" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>PKK & Dasawisma</Text>
          <View style={{ width: 44 }} />
        </View>
        <Text style={styles.subtitle}>Monitoring 10 Program Pokok PKK Padukuhan</Text>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>TOTAL KELOMPOK</Text>
          <Text style={styles.statValue}>{dws?.length || 0}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#1B5E20' }]}>
          <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.6)' }]}>TAHUN AKTIF</Text>
          <Text style={[styles.statValue, { color: '#fff' }]}>2025</Text>
        </View>
      </View>

      {/* List Section */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>KELOMPOK DASAWISMA</Text>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#1B5E20" size="large" />
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <XCircle size={48} color="#EF4444" />
            <Text style={styles.emptyText}>Gagal memuat data</Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
              <Text style={styles.retryText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : (
          dws?.map((dw) => (
            <TouchableOpacity 
              key={dw.id} 
              style={styles.dwCard}
              onPress={() => router.push(`/pkk/${dw.id}` as any)}
            >
              <View style={styles.dwIconWrapper}>
                <ClipboardList size={24} color="#1B5E20" />
              </View>
              <View style={styles.dwInfo}>
                <Text style={styles.dwName}>{dw.nama_dasawisma}</Text>
                <View style={styles.dwMeta}>
                  <View style={styles.metaItem}>
                    <Users size={12} color="#94A3B8" />
                    <Text style={styles.metaText}>{dw.warga_count} Warga</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Text style={styles.metaText}>RT 0{(dw.rts as any)?.nomor_rt}</Text>
                  </View>
                </View>
              </View>
              <ChevronRight size={20} color="#CBD5E1" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 2,
    marginBottom: 20,
    marginLeft: 4,
  },
  dwCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  dwIconWrapper: {
    height: 52,
    width: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(27, 94, 32, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dwInfo: {
    flex: 1,
  },
  dwName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  dwMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginLeft: 4,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1B5E20',
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  }
});
