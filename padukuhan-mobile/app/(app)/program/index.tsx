import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProposals } from '@/hooks/useProgram';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Construction,
  Filter,
  ChevronRight
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ProgramListScreen() {
  const router = useRouter();
  const isKetuaRT = useAuthStore((s) => s.isKetuaRT);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { data: proposals, isLoading, refetch } = useProposals(
    filterStatus === 'all' ? undefined : { status: filterStatus }
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#1B5E20" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>Pembangunan</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.subtitle}>Pantau usulan dan realisasi pembangunan</Text>
      </View>

      {/* Summary Area */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>TOTAL PROGRAM</Text>
            <Text style={styles.summaryValue}>{proposals?.length || 0}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/program/baru')}
            style={styles.addButton}
          >
            <Plus color="white" size={24} />
            <Text style={styles.addButtonText}>Usulkan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterScroll}
        >
          <FilterChip active={filterStatus === 'all'} label="Semua" onPress={() => setFilterStatus('all')} />
          <FilterChip active={filterStatus === 'diusulkan'} label="Usulan" onPress={() => setFilterStatus('diusulkan')} />
          <FilterChip active={filterStatus === 'disetujui'} label="Disetujui" onPress={() => setFilterStatus('disetujui')} />
          <FilterChip active={filterStatus === 'dilaksanakan'} label="Berjalan" onPress={() => setFilterStatus('dilaksanakan')} />
          <FilterChip active={filterStatus === 'selesai'} label="Selesai" onPress={() => setFilterStatus('selesai')} />
        </ScrollView>
      </View>

      {/* List Section */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#1B5E20" />}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#1B5E20" size="large" />
          </View>
        ) : proposals?.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Construction size={48} color="#E2E8F0" />
            </View>
            <Text style={styles.emptyText}>Belum Ada Program</Text>
            <Text style={styles.emptySubtext}>
              Data usulan pembangunan akan muncul di sini.
            </Text>
          </View>
        ) : (
          <View style={{ paddingBottom: 40 }}>
            {proposals?.map((item) => (
              <ProposalCard key={item.id} item={item} onPress={() => router.push(`/program/${item.id}`)} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterChip({ active, label, onPress }: { active: boolean, label: string, onPress: () => void }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

function ProposalCard({ item, onPress }: { item: any, onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{item.jenis_program?.replace(/_/g, ' ')}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <Text style={styles.cardTitle}>{item.nama_program}</Text>
      
      <View style={styles.divider} />
      
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <MapPin size={14} color="#1B5E20" />
          <Text style={styles.footerText}>{item.lokasi || 'Mandingan'}</Text>
        </View>
        <View style={styles.footerItem}>
          <Calendar size={14} color="#3B82F6" />
          <Text style={styles.footerText}>{item.tahun_diusulkan}</Text>
        </View>
        <View style={styles.rtBadge}>
          <Text style={styles.rtText}>RT {item.rts?.nomor_rt}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function StatusBadge({ status }: { status: string }) {
  let color = "#D97706";
  let bgColor = "#FFFBEB";
  let icon = <Clock size={12} color="#D97706" />;

  if (['disetujui', 'dilaksanakan'].includes(status)) {
    color = "#059669";
    bgColor = "#ECFDF5";
    icon = <CheckCircle2 size={12} color="#059669" />;
  } else if (status === 'selesai') {
    color = "#2563EB";
    bgColor = "#EFF6FF";
    icon = <Construction size={12} color="#2563EB" />;
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
      {icon}
      <Text style={[styles.statusText, { color }]}>{status.toUpperCase()}</Text>
    </View>
  )
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
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 12,
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
    marginTop: 8,
  },
  summarySection: {
    paddingHorizontal: 24,
    marginTop: -10,
    zIndex: 10,
  },
  summaryCard: {
    backgroundColor: '#1B5E20',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '800',
    marginLeft: 8,
    fontSize: 14,
  },
  filterSection: {
    marginTop: 20,
    paddingBottom: 4,
  },
  filterScroll: {
    paddingHorizontal: 24,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  chipTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: 24,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  typeBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '600',
  },
  rtBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  rtText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    fontSize: 18,
    fontWeight: '800',
    color: '#475569',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  }
});
