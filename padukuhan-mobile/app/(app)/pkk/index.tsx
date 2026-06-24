import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDasawismaList } from '@/hooks/usePkkData';
import { ArrowLeft, Users, ClipboardList, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function PkkListScreen() {
  const router = useRouter();
  const { data: dws, isLoading, error, refetch } = useDasawismaList();
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>PKK & Dasawisma</Text>
          <Text style={styles.headerSub}>Monitoring 10 Program Pokok PKK</Text>
        </View>
        {/* Year Selector */}
        <View style={styles.yearSwitch}>
          <TouchableOpacity
            onPress={() => setSelectedYear(2025)}
            style={[styles.yearBtn, selectedYear === 2025 && styles.yearBtnActive]}
          >
            <Text style={[styles.yearBtnText, selectedYear === 2025 && styles.yearBtnTextActive]}>2025</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedYear(2026)}
            style={[styles.yearBtn, selectedYear === 2026 && styles.yearBtnActive]}
          >
            <Text style={[styles.yearBtnText, selectedYear === 2026 && styles.yearBtnTextActive]}>2026</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info bar */}
      <View style={styles.infoBar}>
        <View style={styles.infoItem}>
          <Users size={13} color="#67C090" />
          <Text style={styles.infoText}>{dws?.length ?? 0} Kelompok Dasawisma</Text>
        </View>
        <Text style={styles.infoSep}>·</Text>
        <Text style={styles.infoText}>Tahun {selectedYear}</Text>
      </View>

      {/* List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color="#67C090" style={{ marginTop: 48 }} />
        ) : error ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Gagal memuat data</Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listCard}>
            {dws?.map((dw: any, idx: number) => (
              <TouchableOpacity
                key={dw.id}
                style={[styles.row, idx === (dws?.length ?? 0) - 1 && { borderBottomWidth: 0 }]}
                onPress={() => router.push(`/pkk/${dw.id}?tahun=${selectedYear}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.rowIconBox}>
                  <ClipboardList size={16} color="#67C090" />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle}>{dw.nama_dasawisma}</Text>
                  <View style={styles.rowMeta}>
                    <Users size={11} color="#94A3B8" />
                    <Text style={styles.rowSub}>{dw.warga_count} Warga</Text>
                    <View style={styles.dot} />
                    <Text style={styles.rowSub}>RT {(dw.rts as any)?.nomor_rt ?? '—'}</Text>
                  </View>
                </View>
                <ChevronRight size={16} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
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

  yearSwitch: {
    flexDirection: 'row', backgroundColor: '#F1F5F9',
    borderRadius: 8, padding: 2,
  },
  yearBtn: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  yearBtnActive: { backgroundColor: '#67C090' },
  yearBtnText: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  yearBtnTextActive: { color: '#fff' },

  infoBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#fff', borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9', gap: 6,
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  infoSep: { fontSize: 12, color: '#CBD5E1' },

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
    backgroundColor: '#F0FDF4', alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 3 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowSub: { fontSize: 11, color: '#94A3B8' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CBD5E1' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#475569' },
  retryBtn: {
    marginTop: 12, paddingHorizontal: 20, paddingVertical: 8,
    backgroundColor: '#67C090', borderRadius: 10,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
