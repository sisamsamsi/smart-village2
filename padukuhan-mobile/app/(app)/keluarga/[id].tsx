import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, Alert, Modal, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Home, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Edit2, 
  ChevronRight,
  Droplet,
  Trash,
  HelpCircle
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

type FamilyMember = {
  id: string;
  nama_lengkap: string;
  nik: string | null;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string | null;
  status_dalam_keluarga: string;
};

const getAge = (dobString: string | null) => {
  if (!dobString) return '';
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return `${age} th`;
};

function formatHubungan(val: string): string {
  const clean = val.toLowerCase().replace('_', ' ');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export default function DetailKeluargaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const kkId = Array.isArray(id) ? id[0] : id;
  const queryClient = useQueryClient();

  const [editModalVisible, setEditModalVisible] = useState(false);

  // Form State
  const [makananPokok, setMakananPokok] = useState('beras');
  const [sumberAir, setSumberAir] = useState('pdam');
  const [jamban, setJamban] = useState(false);
  const [sampah, setSampah] = useState(false);
  const [spal, setSpal] = useState(false);
  const [stikerP4k, setStikerP4k] = useState(false);
  const [up2k, setUp2k] = useState(false);
  const [pekarangan, setPekarangan] = useState(false);
  const [industri, setIndustri] = useState(false);
  const [kriteriaRumah, setKriteriaRumah] = useState('sehat_layak_huni');

  // Fetch KK detail
  const { data: kk, isLoading: isKkLoading, error: kkError } = useQuery({
    queryKey: ['kk_detail', kkId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rumah_tanggas')
        .select(`
          *,
          rts:rt_id(nomor_rt)
        `)
        .eq('id', kkId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!kkId,
  });

  // Fetch family members
  const { data: members, isLoading: isMembersLoading } = useQuery({
    queryKey: ['kk_members', kkId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wargas')
        .select('id, nama_lengkap, nik, jenis_kelamin, tanggal_lahir, status_dalam_keluarga')
        .eq('rumah_tangga_id', kkId)
        .eq('status_warga', 'aktif')
        .order('tanggal_lahir', { ascending: true }); // Oldest first

      if (error) throw error;
      
      // Sort head of household first, then others
      return (data as FamilyMember[]).sort((a, b) => {
        if (a.status_dalam_keluarga === 'kepala_keluarga') return -1;
        if (b.status_dalam_keluarga === 'kepala_keluarga') return 1;
        return 0;
      });
    },
    enabled: !!kkId,
  });

  // Mutasi Update KK
  const updateKkMutation = useMutation({
    mutationFn: async (updatedFields: Record<string, any>) => {
      const { data, error } = await supabase
        .from('rumah_tanggas')
        .update(updatedFields)
        .eq('id', kkId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kk_detail', kkId] });
      queryClient.invalidateQueries({ queryKey: ['households_list'] });
      Alert.alert('Sukses', 'Fasilitas keluarga berhasil diperbarui.');
      setEditModalVisible(false);
    },
    onError: (err: any) => {
      Alert.alert('Gagal', err.message || 'Gagal memperbarui data.');
    },
  });

  const openEditModal = () => {
    if (kk) {
      setMakananPokok(kk.makanan_pokok || 'beras');
      setSumberAir(kk.sumber_air || 'pdam');
      setJamban(!!kk.memiliki_jamban);
      setSampah(!!kk.memiliki_tempat_sampah);
      setSpal(!!kk.memiliki_spal);
      setStikerP4k(!!kk.menempel_stiker_p4k);
      setUp2k(!!kk.aktivitas_up2k);
      setPekarangan(!!kk.pemanfaatan_pekarangan);
      setIndustri(!!kk.industri_rumah_tangga);
      setKriteriaRumah(kk.kriteria_rumah || 'sehat_layak_huni');
      setEditModalVisible(true);
    }
  };

  const handleSaveFasilitas = () => {
    updateKkMutation.mutate({
      makanan_pokok: makananPokok,
      sumber_air: sumberAir,
      memiliki_jamban: jamban,
      memiliki_tempat_sampah: sampah,
      memiliki_spal: spal,
      menempel_stiker_p4k: stikerP4k,
      aktivitas_up2k: up2k,
      pemanfaatan_pekarangan: pekarangan,
      industri_rumah_tangga: industri,
      kriteria_rumah: kriteriaRumah,
    });
  };

  if (isKkLoading || isMembersLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#124170" />
      </View>
    );
  }

  if (kkError || !kk) {
    return (
      <View style={styles.emptyContainer}>
        <XCircle color="#EF4444" size={48} style={{ marginBottom: 16 }} />
        <Text style={styles.emptyText}>Data keluarga tidak ditemukan</Text>
        <TouchableOpacity style={styles.backButtonLarge} onPress={() => router.back()}>
          <Text style={styles.backButtonLargeText}>Kembali</Text>
        </TouchableOpacity>
      </View>
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
        <Text style={styles.headerTitle}>Detail Keluarga</Text>
        <TouchableOpacity onPress={openEditModal} style={styles.editBtn}>
          <Edit2 size={18} color="#124170" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* KK Card */}
        <View style={styles.kkCard}>
          <View style={styles.kkHeader}>
            <View style={styles.kkBadge}>
              <Text style={styles.kkBadgeText}>KARTU KELUARGA</Text>
            </View>
            {kk.rts && (
              <Text style={styles.rtText}>RT 0{(kk.rts as any).nomor_rt}</Text>
            )}
          </View>
          <Text style={styles.kkNo}>No. {kk.no_kk}</Text>
          <Text style={styles.kkKepala}>Kepala Keluarga: <Text style={{ fontWeight: '700' }}>{kk.nama_kepala_keluarga}</Text></Text>
          {kk.alamat_detail && (
            <Text style={styles.kkAddress}>{kk.alamat_detail}</Text>
          )}
        </View>

        {/* Anggota Keluarga */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={16} color="#124170" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Anggota Keluarga ({members?.length ?? 0})</Text>
          </View>
          <View style={styles.membersList}>
            {members?.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.memberItem}
                onPress={() => router.push(`/kependudukan/${member.id}`)}
              >
                <View style={styles.memberLeft}>
                  <View style={styles.memberInitial}>
                    <Text style={styles.memberInitialText}>{member.nama_lengkap.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{member.nama_lengkap}</Text>
                    <Text style={styles.memberRelation}>
                      {formatHubungan(member.status_dalam_keluarga)} • {member.jenis_kelamin === 'L' ? 'L' : 'P'}
                    </Text>
                  </View>
                </View>
                <View style={styles.memberRight}>
                  <Text style={styles.memberAge}>{getAge(member.tanggal_lahir)}</Text>
                  <ChevronRight size={14} color="#94A3B8" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fasilitas Rumah Tangga */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Home size={16} color="#124170" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Fasilitas Rumah Tangga</Text>
          </View>
          <View style={styles.gridContainer}>
            <FasilitasItem 
              label="Kriteria Rumah" 
              value={kk.kriteria_rumah === 'sehat_layak_huni' ? 'Sehat Huni' : 'Tidak Sehat'} 
              active={kk.kriteria_rumah === 'sehat_layak_huni'} 
            />
            <FasilitasItem 
              label="Makanan Pokok" 
              value={kk.makanan_pokok === 'beras' ? 'Beras' : 'Non Beras'} 
              active={true} 
            />
            <FasilitasItem 
              label="Sumber Air" 
              value={kk.sumber_air ? kk.sumber_air.toUpperCase() : '-'} 
              active={kk.sumber_air === 'pdam' || kk.sumber_air === 'sumur'} 
            />
            <FasilitasItem 
              label="Miliki Jamban" 
              active={!!kk.memiliki_jamban} 
            />
            <FasilitasItem 
              label="Tempat Sampah" 
              active={!!kk.memiliki_tempat_sampah} 
            />
            <FasilitasItem 
              label="Miliki SPAL" 
              active={!!kk.memiliki_spal} 
            />
            <FasilitasItem 
              label="Stiker P4K" 
              active={!!kk.menempel_stiker_p4k} 
            />
            <FasilitasItem 
              label="Kegiatan UP2K" 
              active={!!kk.aktivitas_up2k} 
            />
            <FasilitasItem 
              label="Pemanfaatan Pekarangan" 
              active={!!kk.pemanfaatan_pekarangan} 
            />
            <FasilitasItem 
              label="Industri Rumah Tangga" 
              active={!!kk.industri_rumah_tangga} 
            />
          </View>
        </View>
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Fasilitas Keluarga</Text>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              
              <View style={styles.pickerSection}>
                <Text style={styles.fieldLabel}>Kriteria Rumah</Text>
                <View style={styles.rowSelector}>
                  <TouchableOpacity 
                    style={[styles.selectorBtn, kriteriaRumah === 'sehat_layak_huni' && styles.selectorBtnActive]}
                    onPress={() => setKriteriaRumah('sehat_layak_huni')}
                  >
                    <Text style={[styles.selectorBtnText, kriteriaRumah === 'sehat_layak_huni' && styles.selectorBtnTextActive]}>Sehat Layak</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.selectorBtn, kriteriaRumah === 'tidak_layak_huni' && styles.selectorBtnActive]}
                    onPress={() => setKriteriaRumah('tidak_layak_huni')}
                  >
                    <Text style={[styles.selectorBtnText, kriteriaRumah === 'tidak_layak_huni' && styles.selectorBtnTextActive]}>Tidak Layak</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.pickerSection}>
                <Text style={styles.fieldLabel}>Makanan Pokok</Text>
                <View style={styles.rowSelector}>
                  <TouchableOpacity 
                    style={[styles.selectorBtn, makananPokok === 'beras' && styles.selectorBtnActive]}
                    onPress={() => setMakananPokok('beras')}
                  >
                    <Text style={[styles.selectorBtnText, makananPokok === 'beras' && styles.selectorBtnTextActive]}>Beras</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.selectorBtn, makananPokok === 'non_beras' && styles.selectorBtnActive]}
                    onPress={() => setMakananPokok('non_beras')}
                  >
                    <Text style={[styles.selectorBtnText, makananPokok === 'non_beras' && styles.selectorBtnTextActive]}>Non Beras</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.pickerSection}>
                <Text style={styles.fieldLabel}>Sumber Air</Text>
                <View style={styles.rowSelector}>
                  {['pdam', 'sumur', 'sungai', 'lainnya'].map((air) => (
                    <TouchableOpacity 
                      key={air}
                      style={[styles.selectorBtnCompact, sumberAir === air && styles.selectorBtnActive]}
                      onPress={() => setSumberAir(air)}
                    >
                      <Text style={[styles.selectorBtnText, sumberAir === air && styles.selectorBtnTextActive]}>{air.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Memiliki Jamban Sehat</Text>
                <Switch value={jamban} onValueChange={setJamban} trackColor={{ true: '#124170' }} />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Memiliki Tempat Sampah</Text>
                <Switch value={sampah} onValueChange={setSampah} trackColor={{ true: '#124170' }} />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Memiliki SPAL (Air Limbah)</Text>
                <Switch value={spal} onValueChange={setSpal} trackColor={{ true: '#124170' }} />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Menempel Stiker P4K</Text>
                <Switch value={stikerP4k} onValueChange={setStikerP4k} trackColor={{ true: '#124170' }} />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Aktivitas UP2K</Text>
                <Switch value={up2k} onValueChange={setUp2k} trackColor={{ true: '#124170' }} />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Pemanfaatan Pekarangan</Text>
                <Switch value={pekarangan} onValueChange={setPekarangan} trackColor={{ true: '#124170' }} />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Industri Rumah Tangga</Text>
                <Switch value={industri} onValueChange={setIndustri} trackColor={{ true: '#124170' }} />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveConfirmBtn, updateKkMutation.isPending && { opacity: 0.6 }]} 
                onPress={handleSaveFasilitas}
                disabled={updateKkMutation.isPending}
              >
                <Text style={styles.saveConfirmBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function FasilitasItem({ label, value, active }: { label: string; value?: string; active: boolean }) {
  return (
    <View style={styles.gridItem}>
      <Text style={styles.gridLabel} numberOfLines={1}>{label}</Text>
      <View style={styles.gridValueRow}>
        {active ? (
          <CheckCircle2 size={14} color="#10B981" />
        ) : (
          <XCircle size={14} color="#EF4444" />
        )}
        <Text style={[styles.gridValue, active ? styles.textActive : styles.textInactive]}>
          {value !== undefined ? value : (active ? 'Tersedia / Ya' : 'Tidak')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#64748B', marginTop: 12 },
  backButtonLarge: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#124170' },
  backButtonLargeText: { color: '#fff', fontWeight: '600' },
  
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F1F5F9',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', flex: 1 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE',
  },
  editBtnText: { fontSize: 12, fontWeight: '700', color: '#124170' },

  scrollView: { flex: 1 },
  
  // KK Card
  kkCard: {
    margin: 16, padding: 16, borderRadius: 16,
    backgroundColor: '#124170',
    shadowColor: '#124170', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
  },
  kkHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kkBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 6,
  },
  kkBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  rtText: { fontSize: 12, fontWeight: '700', color: '#EFF6FF' },
  kkNo: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginTop: 12 },
  kkKepala: { fontSize: 13, color: '#EFF6FF', marginTop: 8 },
  kkAddress: { fontSize: 11, color: '#BFDBFE', marginTop: 4 },

  // Sections
  section: { backgroundColor: '#FFFFFF', padding: 16, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B' },

  // Members list
  membersList: { gap: 10 },
  memberItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F1F5F9',
  },
  memberLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  memberInitial: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  memberInitialText: { fontSize: 14, fontWeight: '700', color: '#124170' },
  memberName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  memberRelation: { fontSize: 11, color: '#64748B', marginTop: 1 },
  memberRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberAge: { fontSize: 12, color: '#94A3B8' },

  // Grid
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: {
    width: (width - 42) / 2, backgroundColor: '#F8FAFC',
    padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0',
  },
  gridLabel: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  gridValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  gridValue: { fontSize: 11, fontWeight: '700' },
  textActive: { color: '#059669' },
  textInactive: { color: '#DC2626' },

  // Modal styles
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.4)' },
  modalCard: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '80%',
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  modalScroll: { flexGrow: 0, marginBottom: 20 },
  pickerSection: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8 },
  rowSelector: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  selectorBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
    alignItems: 'center', minWidth: 100,
  },
  selectorBtnCompact: {
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
    alignItems: 'center', flex: 1, minWidth: 60,
  },
  selectorBtnActive: { backgroundColor: '#EFF6FF', borderColor: '#124170' },
  selectorBtnText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  selectorBtnTextActive: { color: '#124170', fontWeight: '700' },

  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F1F5F9',
  },
  switchLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    backgroundColor: '#F1F5F9', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  saveConfirmBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    backgroundColor: '#124170', alignItems: 'center',
  },
  saveConfirmBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
