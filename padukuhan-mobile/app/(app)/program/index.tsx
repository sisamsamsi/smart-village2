import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProposals } from '@/hooks/useProgram';
import { ArrowLeft, Plus, MapPin, Calendar, Clock, CheckCircle2, Construction, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  diusulkan:    { color: '#F59E0B', bg: '#FFFBEB', label: 'Usulan' },
  disetujui:    { color: '#10B981', bg: '#EFF6FF', label: 'Disetujui' },
  dilaksanakan: { color: '#3B82F6', bg: '#EFF6FF', label: 'Berjalan' },
  selesai:      { color: '#6366F1', bg: '#EEF2FF', label: 'Selesai' },
  ditolak:      { color: '#EF4444', bg: '#FEF2F2', label: 'Ditolak' },
};

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'diusulkan', label: 'Usulan' },
  { key: 'disetujui', label: 'Disetujui' },
  { key: 'dilaksanakan', label: 'Berjalan' },
  { key: 'selesai', label: 'Selesai' },
];

export default function ProgramListScreen() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { data: proposals, isLoading, refetch } = useProposals(
    filterStatus === 'all' ? undefined : { status: filterStatus }
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Program Pembangunan</Text>
          <Text style={styles.headerSub}>{proposals?.length ?? 0} program tercatat</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/program/baru' as any)} style={styles.addBtn}>
          <Plus size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilterStatus(f.key)}
              style={[styles.chip, filterStatus === f.key && styles.chipActive]}
            >
              <Text style={[styles.chipText, filterStatus === f.key && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#124170" />}
      >
        {isLoading ? (
          <ActivityIndicator color="#124170" style={{ marginTop: 48 }} />
        ) : proposals?.length === 0 ? (
          <View style={styles.empty}>
            <Construction size={36} color="#E2E8F0" />
            <Text style={styles.emptyTitle}>Belum Ada Program</Text>
            <Text style={styles.emptySub}>Data usulan pembangunan akan muncul di sini.</Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {proposals?.map((item: any, idx: number) => {
              const st = STATUS_CONFIG[item.status] ?? STATUS_CONFIG['diusulkan'];
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.row, idx === (proposals?.length ?? 0) - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => router.push(`/program/${item.id}` as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowIconBox}>
                    <Construction size={16} color="#124170" />
                  </View>
                  <View style={styles.rowContent}>
                    <View style={styles.rowTop}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{item.nama_program}</Text>
                      <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                        <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                      </View>
                    </View>
                    <View style={styles.rowMeta}>
                      <Text style={styles.rowType}>{item.jenis_program?.replace(/_/g, ' ')}</Text>
                      {item.lokasi && (
                        <>
                          <View style={styles.dot} />
                          <MapPin size={11} color="#94A3B8" />
                          <Text style={styles.rowDate} numberOfLines={1}>{item.lokasi}</Text>
                        </>
                      )}
                      {item.tahun_diusulkan && (
                        <>
                          <View style={styles.dot} />
                          <Calendar size={11} color="#94A3B8" />
                          <Text style={styles.rowDate}>{item.tahun_diusulkan}</Text>
                        </>
                      )}
                    </View>
                  </View>
                  <ChevronRight size={16} color="#CBD5E1" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

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
    backgroundColor: '#124170', alignItems: 'center', justifyContent: 'center',
  },

  filterBar: {
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    paddingVertical: 10,
  },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9',
  },
  chipActive: { backgroundColor: '#EFF6FF', borderColor: '#124170' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  chipTextActive: { color: '#124170' },

  list: { flex: 1 },
  listCard: {
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  rowIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EFF6FF', alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  rowContent: { flex: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', flex: 1, marginRight: 8 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  rowType: { fontSize: 11, color: '#94A3B8', textTransform: 'capitalize' },
  rowDate: { fontSize: 11, color: '#94A3B8' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CBD5E1' },
  statusPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#475569', marginTop: 12 },
  emptySub: { fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center', lineHeight: 18 },
});
