import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSuratList } from '@/hooks/useSurat';
import { useAuthStore } from '@/stores/authStore';
import { ArrowLeft, Plus, FileText, Clock, CheckCircle2, XCircle, Calendar, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { formatTanggal } from '@/lib/format';

export default function SuratListScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const isRT = profile?.role === 'ketua_rt';
  const [activeTab, setActiveTab] = useState<'pending' | 'selesai'>('selesai');
  const { data: surat, isLoading, refetch } = useSuratList({
    status: activeTab === 'pending' ? 'pending' : undefined
  });

  const displayedSurat = activeTab === 'pending'
    ? surat
    : surat?.filter(s => s.status !== 'pending');

  const pendingCount = surat?.filter(s => s.status === 'pending').length ?? 0;
  const selesaiCount = surat?.filter(s => s.status !== 'pending').length ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Layanan Surat</Text>
          <Text style={styles.headerSub}>Pengantar & Domisili RT</Text>
        </View>
        {isRT ? (
          <TouchableOpacity onPress={() => router.push('/surat/tambah')} style={styles.addBtn}>
            <Plus size={18} color="#fff" />
          </TouchableOpacity>
        ) : <View style={{ width: 36 }} />}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{surat?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#F59E0B' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#10B981' }]}>{selesaiCount}</Text>
          <Text style={styles.statLabel}>Selesai</Text>
        </View>
      </View>

      {/* Tab Pills */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('pending')}
          style={[styles.tabPill, activeTab === 'pending' && styles.tabPillActive]}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>Pending</Text>
          {pendingCount > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{pendingCount}</Text></View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('selesai')}
          style={[styles.tabPill, activeTab === 'selesai' && styles.tabPillActive]}
        >
          <Text style={[styles.tabText, activeTab === 'selesai' && styles.tabTextActive]}>Selesai</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#67C090" />}
      >
        {isLoading ? (
          <ActivityIndicator color="#67C090" style={{ marginTop: 40 }} />
        ) : displayedSurat?.length === 0 ? (
          <View style={styles.empty}>
            <FileText size={36} color="#E2E8F0" />
            <Text style={styles.emptyTitle}>Belum ada surat</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'pending' ? 'Tidak ada surat pending saat ini.' : 'Surat yang diterbitkan RT akan muncul di sini.'}
            </Text>
          </View>
        ) : (
          <View style={styles.listInner}>
            {displayedSurat?.map((item, idx) => (
              <SuratRow
                key={item.id}
                item={item}
                isLast={idx === (displayedSurat?.length ?? 0) - 1}
                onPress={() => router.push(`/surat/${item.id}` as any)}
              />
            ))}
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SuratRow({ item, isLast, onPress }: { item: any; isLast: boolean; onPress: () => void }) {
  const getStatus = () => {
    const s = item.status?.toLowerCase();
    if (s === 'approved' || s === 'selesai') return { color: '#10B981', bg: '#ECFDF5', label: 'Selesai', icon: <CheckCircle2 size={11} color="#10B981" /> };
    if (s === 'rejected') return { color: '#EF4444', bg: '#FEF2F2', label: 'Ditolak', icon: <XCircle size={11} color="#EF4444" /> };
    return { color: '#F59E0B', bg: '#FFFBEB', label: 'Pending', icon: <Clock size={11} color="#F59E0B" /> };
  };
  const st = getStatus();

  return (
    <TouchableOpacity onPress={onPress} style={[styles.row, isLast && { borderBottomWidth: 0 }]}>
      <View style={styles.rowIconBox}>
        <FileText size={16} color="#67C090" />
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.rowName} numberOfLines={1}>{item.wargas?.nama_lengkap ?? '—'}</Text>
          <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
            {st.icon}
            <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>
        <View style={styles.rowBottom}>
          <Text style={styles.rowType}>{item.jenis_surat?.replace(/_/g, ' ')}</Text>
          <Text style={styles.rowDot}>·</Text>
          <Calendar size={11} color="#94A3B8" />
          <Text style={styles.rowDate}>{formatTanggal(item.created_at)}</Text>
        </View>
      </View>
      <ChevronRight size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, marginHorizontal: 12 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  headerSub: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  addBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#67C090', alignItems: 'center', justifyContent: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },

  // Tabs
  tabRow: {
    flexDirection: 'row', paddingHorizontal: 16,
    paddingVertical: 10, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  tabPillActive: { backgroundColor: '#EDF7F2', borderColor: '#67C090' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  tabTextActive: { color: '#67C090' },
  badge: {
    marginLeft: 6, backgroundColor: '#F59E0B',
    borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1,
  },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },

  // List
  list: { flex: 1 },
  listInner: {
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  rowIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F0FDF4', alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  rowContent: { flex: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  rowName: { fontSize: 14, fontWeight: '600', color: '#1E293B', flex: 1, marginRight: 8 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowType: { fontSize: 11, color: '#94A3B8', textTransform: 'capitalize' },
  rowDot: { fontSize: 11, color: '#CBD5E1' },
  rowDate: { fontSize: 11, color: '#94A3B8', marginLeft: 2 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, gap: 3,
  },
  statusText: { fontSize: 10, fontWeight: '600' },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#475569', marginTop: 12 },
  emptySub: { fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center', lineHeight: 18 },
});
