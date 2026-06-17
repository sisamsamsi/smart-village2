import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSuratList } from '@/hooks/useSurat';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Search,
  MessageSquare,
  Calendar,
  ChevronRight
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { formatTanggal } from '@/lib/format';

const { width } = Dimensions.get('window');

export default function SuratListScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'selesai'>('pending');
  const { data: surat, isLoading, refetch } = useSuratList({ 
    status: activeTab === 'pending' ? 'pending' : undefined 
  });

  const displayedSurat = activeTab === 'pending' 
    ? surat 
    : surat?.filter(s => s.status !== 'pending');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#67C090" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>Layanan Surat</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.subtitle}>Kelola pengajuan surat keterangan warga</Text>
      </View>

      {/* Summary Area */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>TOTAL PENGAJUAN</Text>
            <Text style={styles.summaryValue}>{displayedSurat?.length || 0}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/surat/tambah')}
            style={styles.addButton}
          >
            <Plus color="white" size={24} />
            <Text style={styles.addButtonText}>Baru</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabSection}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            onPress={() => setActiveTab('pending')}
            style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>ANTREAN</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('selesai')}
            style={[styles.tab, activeTab === 'selesai' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'selesai' && styles.tabTextActive]}>SELESAI</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List Section */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#67C090" />}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#67C090" size="large" />
          </View>
        ) : displayedSurat?.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <FileText size={48} color="#E2E8F0" />
            </View>
            <Text style={styles.emptyText}>Tidak Ada Pengajuan</Text>
            <Text style={styles.emptySubtext}>
              Pengajuan surat dari warga akan muncul di sini.
            </Text>
          </View>
        ) : (
          <View style={{ paddingBottom: 40 }}>
            {displayedSurat?.map((item) => (
              <SuratCard 
                key={item.id} 
                item={item} 
                onPress={() => router.push(`/surat/${item.id}`)} 
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SuratCard({ item, onPress }: { item: any, onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{item.jenis_surat?.replace(/_/g, ' ')}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <Text style={styles.cardTitle}>{item.wargas?.nama_lengkap}</Text>
      <Text style={styles.cardSubtitle}>NIK: {item.wargas?.nik}</Text>
      
      <View style={styles.divider} />
      
      <View style={styles.cardFooter}>
        <View style={styles.dateInfo}>
          <Calendar size={14} color="#94A3B8" />
          <Text style={styles.dateText}>{formatTanggal(item.created_at)}</Text>
        </View>
        <View style={styles.rtBadge}>
          <Text style={styles.rtText}>RT {item.wargas?.rts?.nomor_rt}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function StatusBadge({ status }: { status: string }) {
  let color = "#D97706";
  let bgColor = "#FFFBEB";
  let icon = <Clock size={12} color="#D97706" />;
  let label = status;

  if (status === 'approved' || status === 'selesai') {
    color = "#059669";
    bgColor = "#ECFDF5";
    icon = <CheckCircle2 size={12} color="#059669" />;
    label = 'Selesai';
  } else if (status === 'rejected') {
    color = "#DC2626";
    bgColor = "#FEF2F2";
    icon = <XCircle size={12} color="#DC2626" />;
    label = 'Ditolak';
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
      {icon}
      <Text style={[styles.statusText, { color }]}>{label.toUpperCase()}</Text>
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
    backgroundColor: '#67C090',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#67C090',
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
  tabSection: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#F1F5F9',
  },
  tabText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  tabTextActive: {
    color: '#67C090',
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
    marginBottom: 12,
  },
  typeBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0369A1',
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
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '600',
  },
  rtBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rtText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
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
