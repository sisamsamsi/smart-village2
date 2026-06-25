import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, FlatList, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDasawismaWarga, usePkkPartisipasi, useDasawismaList, useUpdatePkkPartisipasi, useUpdateWargaPkkParams } from '@/hooks/usePkkData';
import { ArrowLeft, Users, Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const PROGRAMS = [
  // 8 PKK Partisipasi (from pkk_partisipasi)
  { key: 'penghayatan_pancasila', label: 'Penghayatan Pancasila', short: 'Pancasila', source: 'pkk_partisipasi' },
  { key: 'gotong_royong',         label: 'Gotong Royong', short: 'GR', source: 'pkk_partisipasi' },
  { key: 'pendidikan_keterampilan', label: 'Pendidikan & Keterampilan', short: 'Pendidikan', source: 'pkk_partisipasi' },
  { key: 'pengembangan_koperasi', label: 'Koperasi', short: 'Koperasi', source: 'pkk_partisipasi' },
  { key: 'pangan',                label: 'Pangan', short: 'Pangan', source: 'pkk_partisipasi' },
  { key: 'sandang',               label: 'Sandang', short: 'Sandang', source: 'pkk_partisipasi' },
  { key: 'kesehatan',             label: 'Kesehatan', short: 'Kesehatan', source: 'pkk_partisipasi' },
  { key: 'perencanaan_sehat',     label: 'Perencanaan Sehat', short: 'P.Sehat', source: 'pkk_partisipasi' },

  // 8 Warga parameters (from wargas)
  { key: 'ikut_bkb',              label: 'Bina Keluarga Balita (BKB)', short: 'BKB', source: 'wargas' },
  { key: 'ikut_paud',             label: 'Ikut PAUD', short: 'PAUD', source: 'wargas' },
  { key: 'memiliki_akte',         label: 'Memiliki Akte Kelahiran', short: 'Akte', source: 'wargas' },
  { key: 'aktif_posyandu',        label: 'Aktif Posyandu', short: 'Posyandu', source: 'wargas' },
  { key: 'akseptor_kb',           label: 'Akseptor KB', short: 'KB', source: 'wargas' },
  { key: 'status_menyusui',       label: 'Ibu Menyusui', short: 'Menyusui', source: 'wargas' },
  { key: 'status_kehamilan',      label: 'Ibu Hamil', short: 'Hamil', source: 'wargas' },
  { key: 'berkebutuhan_khusus',   label: 'Berkebutuhan Khusus', short: 'ABK', source: 'wargas' },
];

const getAgeInMonths = (dobString: string | null) => {
  if (!dobString) return -1;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return -1;
  const today = new Date();
  const yearsDiff = today.getFullYear() - dob.getFullYear();
  const monthsDiff = today.getMonth() - dob.getMonth();
  return yearsDiff * 12 + monthsDiff;
};

const getAgeInYears = (dobString: string | null) => {
  if (!dobString) return -1;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return -1;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export default function PkkDetailScreen() {
  const { id, tahun } = useLocalSearchParams();
  const router = useRouter();
  const idStr = Array.isArray(id) ? id[0] : id;
  const selectedTahun = tahun ? parseInt(tahun as string, 10) : new Date().getFullYear();

  const { data: dws } = useDasawismaList();
  const dw = dws?.find(d => d.id === idStr);

  const { data: allWarga, isLoading: loadingWarga } = useDasawismaWarga(idStr);
  const { data: pkkRecords, isLoading: loadingPkk } = usePkkPartisipasi(idStr, selectedTahun);

  const updateMutation = useUpdatePkkPartisipasi();
  const updateWargaMutation = useUpdateWargaPkkParams();

  const [activeProgIdx, setActiveProgIdx] = useState(0);
  // track pending local toggles before saving: { wargaId: boolean }
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const activeProg = PROGRAMS[activeProgIdx];

  // Group households containing a baby aged 0-24 months (for status_menyusui filter)
  const householdWithBabyIds = useMemo(() => {
    const ids = new Set<string>();
    allWarga?.forEach(w => {
      if (w.tanggal_lahir) {
        const months = getAgeInMonths(w.tanggal_lahir);
        if (months >= 0 && months <= 24) {
          if (w.rumah_tangga_id) {
            ids.add(w.rumah_tangga_id);
          }
        }
      }
    });
    return ids;
  }, [allWarga]);

  // Filter warga according to the active program criteria
  const filteredWarga = useMemo(() => {
    if (!allWarga) return [];
    
    if (activeProg.key === 'ikut_bkb' || activeProg.key === 'ikut_paud' || activeProg.key === 'memiliki_akte') {
      // Show only balita (<= 60 months)
      return allWarga.filter(w => {
        const months = getAgeInMonths(w.tanggal_lahir);
        return months >= 0 && months <= 60;
      });
    }
    
    if (activeProg.key === 'akseptor_kb') {
      // Show PUS: female, 15-49, married, and NOT pregnant
      return allWarga.filter(w => {
        const age = getAgeInYears(w.tanggal_lahir);
        return w.jenis_kelamin === 'P' && age >= 15 && age <= 49 && w.status_perkawinan === 'kawin' && !w.status_kehamilan;
      });
    }
    
    if (activeProg.key === 'status_menyusui') {
      // Show mothers with a child 0-24 months in the same household
      return allWarga.filter(w => {
        const age = getAgeInYears(w.tanggal_lahir);
        const isMotherAge = w.jenis_kelamin === 'P' && age >= 15 && age <= 49;
        return isMotherAge && w.rumah_tangga_id && householdWithBabyIds.has(w.rumah_tangga_id);
      });
    }

    if (activeProg.key === 'status_kehamilan') {
      // Show females 15-49
      return allWarga.filter(w => {
        const age = getAgeInYears(w.tanggal_lahir);
        return w.jenis_kelamin === 'P' && age >= 15 && age <= 49;
      });
    }

    if (activeProg.key === 'aktif_posyandu') {
      // Posyandu applies to balita (<= 60 months) OR lansia (>= 60 years)
      return allWarga.filter(w => {
        const months = getAgeInMonths(w.tanggal_lahir);
        const ageYears = getAgeInYears(w.tanggal_lahir);
        const isBalita = months >= 0 && months <= 60;
        const isLansia = ageYears >= 60;
        return isBalita || isLansia;
      });
    }

    // Default: show all residents
    return allWarga;
  }, [allWarga, activeProg.key, householdWithBabyIds]);

  // Build participation map for current program
  const participationMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    if (activeProg.source === 'pkk_partisipasi') {
      allWarga?.forEach(w => {
        const record = pkkRecords?.find(r => (r as any).warga_id === w.id);
        map[w.id] = record ? !!record[activeProg.key as keyof typeof record] : false;
      });
    } else {
      allWarga?.forEach(w => {
        map[w.id] = !!w[activeProg.key as keyof typeof w];
      });
    }
    return map;
  }, [allWarga, pkkRecords, activeProg]);

  const getIsActive = (wargaId: string) => {
    if (wargaId in pendingChanges) return pendingChanges[wargaId];
    return participationMap[wargaId] ?? false;
  };

  const handleToggleSelectAll = () => {
    const allSelected = filteredWarga.every(w => getIsActive(w.id));
    const nextVal = !allSelected;
    
    const newChanges = { ...pendingChanges };
    filteredWarga.forEach(w => {
      newChanges[w.id] = nextVal;
    });
    setPendingChanges(newChanges);
  };

  const toggleWarga = (wargaId: string) => {
    const current = getIsActive(wargaId);
    setPendingChanges(prev => ({ ...prev, [wargaId]: !current }));
  };

  const hasPending = Object.keys(pendingChanges).length > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeProg.source === 'pkk_partisipasi') {
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
      } else {
        // Save to wargas table
        await Promise.all(
          Object.entries(pendingChanges).map(([wargaId, val]) => {
            return updateWargaMutation.mutateAsync({
              wargaId,
              data: {
                [activeProg.key]: val,
              }
            });
          })
        );
      }
      setPendingChanges({});
      
      // Auto-next component callback
      Alert.alert(
        'Tersimpan', 
        `Data ${activeProg.label} berhasil disimpan.`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (activeProgIdx < PROGRAMS.length - 1) {
                setActiveProgIdx(prev => prev + 1);
              }
            }
          }
        ]
      );
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

  const activeCount = filteredWarga.filter(w => getIsActive(w.id)).length;
  const totalCount = filteredWarga.length;

  if (loadingWarga || loadingPkk) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator color="#124170" size="large" />
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
          <Users size={12} color="#124170" />
          <Text style={styles.wargaBadgeText}>{allWarga?.length ?? 0}</Text>
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={styles.statsText}>
            <Text style={styles.statsNum}>{activeCount}</Text>
            <Text style={styles.statsOf}> / {totalCount} warga aktif memenuhi kriteria</Text>
          </Text>
          {totalCount > 0 && (
            <TouchableOpacity 
              onPress={handleToggleSelectAll}
              style={styles.selectAllBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.selectAllBtnText}>
                {filteredWarga.every(w => getIsActive(w.id)) ? 'Batal Semua' : 'Tandai Semua'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${totalCount > 0 ? (activeCount / totalCount) * 100 : 0}%` as any }]} />
        </View>
        {hasPending && (
          <Text style={styles.pendingHint}>• Ada perubahan belum disimpan</Text>
        )}
      </View>

      {/* Warga List */}
      <FlatList
        data={filteredWarga}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListHeaderComponent={<View style={{ height: 8 }} />}
        ListFooterComponent={<View style={{ height: 100 }} />}
        contentContainerStyle={styles.listContent}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
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
                <Text style={styles.wargaNik}>
                  NIK: {item.nik} • {item.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  {item.tanggal_lahir ? ` • ${getAgeInYears(item.tanggal_lahir)} Th` : ''}
                </Text>
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
    backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: '#DBEAFE',
  },
  wargaBadgeText: { fontSize: 12, fontWeight: '700', color: '#124170' },

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
  dotActive: { width: 20, backgroundColor: '#124170' },

  // Stats bar
  statsBar: {
    backgroundColor: '#fff', paddingHorizontal: 16,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  statsText: { marginBottom: 6, flex: 1, marginRight: 8 },
  statsNum: { fontSize: 14, fontWeight: '700', color: '#124170' },
  statsOf: { fontSize: 12, color: '#64748B' },
  selectAllBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  selectAllBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#124170',
  },
  progressTrack: {
    height: 4, backgroundColor: '#F1F5F9',
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: '#124170', borderRadius: 2 },
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
    backgroundColor: '#124170', borderColor: '#124170',
  },

  // Save bar
  saveBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', paddingHorizontal: 16,
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  saveBtn: {
    backgroundColor: '#124170', borderRadius: 12,
    paddingVertical: 13, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
