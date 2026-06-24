import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, FlatList, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDasawismaWarga, usePkkPartisipasi, useDasawismaList, useUpdatePkkPartisipasi } from '@/hooks/usePkkData';
import { ArrowLeft, Users, Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const PROGRAMS = [
  { key: 'penghayatan_pancasila', label: 'Pancasila', short: 'Pan.' },
  { key: 'gotong_royong',         label: 'Gotong Royong', short: 'GR' },
  { key: 'pendidikan_keterampilan', label: 'Pendidikan & Keterampilan', short: 'Pend.' },
  { key: 'pengembangan_koperasi', label: 'Koperasi', short: 'Kop.' },
  { key: 'pangan',                label: 'Pangan', short: 'Pang.' },
  { key: 'sandang',               label: 'Sandang', short: 'Sand.' },
  { key: 'kesehatan',             label: 'Kesehatan', short: 'Kes.' },
  { key: 'perencanaan_sehat',     label: 'Perencanaan Sehat', short: 'P.Sehat' },
];

export default function PkkDetailScreen() {
  const { id, tahun } = useLocalSearchParams();
  const router = useRouter();
  const idStr = Array.isArray(id) ? id[0] : id;
  const selectedTahun = tahun ? parseInt(tahun as string, 10) : 2025;

  const { data: dws } = useDasawismaList();
  const dw = dws?.find(d => d.id === idStr);

  const { data: allWarga, isLoading: loadingWarga } = useDasawismaWarga(idStr);
  const { data: pkkRecords, isLoading: loadingPkk } = usePkkPartisipasi(idStr, selectedTahun);

  const updateMutation = useUpdatePkkPartisipasi();

  const [activeProgIdx, setActiveProgIdx] = useState(0);
  // track pending local toggles before saving: { wargaId: boolean }
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const activeProg = PROGRAMS[activeProgIdx];

  // Build participation map for current program
  const participationMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    allWarga?.forEach(w => {
      const record = pkkRecords?.find(r => (r as any).warga_id === w.id);
      map[w.id] = record ? !!record[activeProg.key as keyof typeof record] : false;
    });
    return map;
  }, [allWarga, pkkRecords, activeProg.key]);

  const getIsActive = (wargaId: string) => {
    if (wargaId in pendingChanges) return pendingChanges[wargaId];
    return participationMap[wargaId] ?? false;
  };

  const toggleWarga = (wargaId: string) => {
    const current = getIsActive(wargaId);
    setPendingChanges(prev => ({ ...prev, [wargaId]: !current }));
  };

  const hasPending = Object.keys(pendingChanges).length > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(pendingChanges).map(([wargaId, val]) => {
          const existing = pkkRecords?.find(r => (r as any).warga_id === wargaId) as any;
          return updateMutation.mutateAsync({
            wargaId,
            dasawismaId: idStr || '',
            tahun: selectedTahun,
            data: {
              ...(existing ? {
                penghayatan_pancasila: existing.penghayatan_pancasila,
                gotong_royong: existing.gotong_royong,
                pendidikan_keterampilan: existing.pendidikan_keterampilan,
                pengembangan_koperasi: existing.pengembangan_koperasi,
                pangan: existing.pangan,
                sandang: existing.sandang,
                kesehatan: existing.kesehatan,
                perencanaan_sehat: existing.perencanaan_sehat,
              } : {}),
              [activeProg.key]: val,
            }
          });
        })
      );
      setPendingChanges({});
      Alert.alert('Tersimpan', `Data partisipasi ${activeProg.label} berhasil disimpan.`);
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrevProg = () => {
    if (hasPending) {
      Alert.alert('Ada perubahan belum disimpan', 'Simpan dulu sebelum pindah program?', [
        { text: 'Batalkan', style: 'cancel' },
        { text: 'Abaikan', style: 'destructive', onPress: () => { setPendingChanges({}); setActiveProgIdx(p => Math.max(0, p - 1)); } },
        { text: 'Simpan Dulu', onPress: async () => { await handleSave(); setActiveProgIdx(p => Math.max(0, p - 1)); } },
      ]);
    } else {
      setActiveProgIdx(p => Math.max(0, p - 1));
    }
  };

  const handleNextProg = () => {
    if (hasPending) {
      Alert.alert('Ada perubahan belum disimpan', 'Simpan dulu sebelum pindah program?', [
        { text: 'Batalkan', style: 'cancel' },
        { text: 'Abaikan', style: 'destructive', onPress: () => { setPendingChanges({}); setActiveProgIdx(p => Math.min(PROGRAMS.length - 1, p + 1)); } },
        { text: 'Simpan Dulu', onPress: async () => { await handleSave(); setActiveProgIdx(p => Math.min(PROGRAMS.length - 1, p + 1)); } },
      ]);
    } else {
      setActiveProgIdx(p => Math.min(PROGRAMS.length - 1, p + 1));
    }
  };

  const activeCount = allWarga?.filter(w => getIsActive(w.id)).length ?? 0;
  const totalCount = allWarga?.length ?? 0;

  if (loadingWarga || loadingPkk) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator color="#67C090" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{dw?.nama_dasawisma ?? 'PKK Detail'}</Text>
          <Text style={styles.headerSub}>Tahun {selectedTahun}</Text>
        </View>
        <View style={styles.wargaBadge}>
          <Users size={12} color="#67C090" />
          <Text style={styles.wargaBadgeText}>{totalCount}</Text>
        </View>
      </View>

      {/* Program Navigator */}
      <View style={styles.progNav}>
        <TouchableOpacity
          onPress={handlePrevProg}
          style={[styles.navArrow, activeProgIdx === 0 && styles.navArrowDisabled]}
          disabled={activeProgIdx === 0}
        >
          <ChevronLeft size={18} color={activeProgIdx === 0 ? '#CBD5E1' : '#1E293B'} />
        </TouchableOpacity>

        <View style={styles.progInfo}>
          <Text style={styles.progCounter}>{activeProgIdx + 1} / {PROGRAMS.length}</Text>
          <Text style={styles.progName}>{activeProg.label}</Text>
          <View style={styles.progDots}>
            {PROGRAMS.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  if (hasPending) return;
                  setActiveProgIdx(i);
                }}
                style={[styles.dot, i === activeProgIdx && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleNextProg}
          style={[styles.navArrow, activeProgIdx === PROGRAMS.length - 1 && styles.navArrowDisabled]}
          disabled={activeProgIdx === PROGRAMS.length - 1}
        >
          <ChevronRight size={18} color={activeProgIdx === PROGRAMS.length - 1 ? '#CBD5E1' : '#1E293B'} />
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          <Text style={styles.statsNum}>{activeCount}</Text>
          <Text style={styles.statsOf}> / {totalCount} warga ikut</Text>
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${totalCount > 0 ? (activeCount / totalCount) * 100 : 0}%` as any }]} />
        </View>
        {hasPending && (
          <Text style={styles.pendingHint}>• Ada perubahan belum disimpan</Text>
        )}
      </View>

      {/* Warga List */}
      <FlatList
        data={allWarga ?? []}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListHeaderComponent={<View style={{ height: 8 }} />}
        ListFooterComponent={<View style={{ height: 32 }} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const active = getIsActive(item.id);
          const isPending = item.id in pendingChanges;
          return (
            <TouchableOpacity
              style={styles.wargaRow}
              onPress={() => toggleWarga(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.wargaInfo}>
                <Text style={styles.wargaName}>{item.nama_lengkap}</Text>
                <Text style={styles.wargaNik}>{item.nik}</Text>
              </View>
              {isPending && <View style={styles.pendingDot} />}
              <View style={[styles.checkBox, active && styles.checkBoxActive]}>
                {active && <Check size={14} color="#fff" strokeWidth={3} />}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Save Button (sticky bottom) */}
      {hasPending && (
        <View style={styles.saveBar}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Simpan Perubahan ({Object.keys(pendingChanges).length})</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },

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
  wargaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: '#D1FAE5',
  },
  wargaBadgeText: { fontSize: 12, fontWeight: '700', color: '#67C090' },

  // Program Navigator
  progNav: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingVertical: 16,
    paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  navArrow: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center',
  },
  navArrowDisabled: { backgroundColor: '#F8FAFC' },
  progInfo: { flex: 1, alignItems: 'center' },
  progCounter: { fontSize: 10, fontWeight: '600', color: '#94A3B8', letterSpacing: 1 },
  progName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 2, textAlign: 'center' },
  progDots: { flexDirection: 'row', gap: 5, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E2E8F0' },
  dotActive: { width: 20, backgroundColor: '#67C090' },

  // Stats bar
  statsBar: {
    backgroundColor: '#fff', paddingHorizontal: 16,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  statsText: { marginBottom: 6 },
  statsNum: { fontSize: 14, fontWeight: '700', color: '#67C090' },
  statsOf: { fontSize: 12, color: '#64748B' },
  progressTrack: {
    height: 4, backgroundColor: '#F1F5F9',
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: '#67C090', borderRadius: 2 },
  pendingHint: { fontSize: 11, color: '#F59E0B', marginTop: 4, fontWeight: '600' },

  // List
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16 },
  sep: { height: 1, backgroundColor: '#F8FAFC' },
  wargaRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12,
  },
  wargaInfo: { flex: 1 },
  wargaName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  wargaNik: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  pendingDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#F59E0B', marginRight: 10,
  },
  checkBox: {
    width: 28, height: 28, borderRadius: 8,
    borderWidth: 2, borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center', justifyContent: 'center',
  },
  checkBoxActive: {
    backgroundColor: '#67C090', borderColor: '#67C090',
  },

  // Save bar
  saveBar: {
    backgroundColor: '#fff', paddingHorizontal: 16,
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  saveBtn: {
    backgroundColor: '#67C090', borderRadius: 12,
    paddingVertical: 13, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
