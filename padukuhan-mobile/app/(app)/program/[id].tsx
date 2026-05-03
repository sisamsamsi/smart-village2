import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProposal, useUpdateProposalStatus } from '@/hooks/useProgram';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Construction, 
  Edit3, 
  X,
  Wallet,
  MessageSquare,
  FileText,
  XCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Info
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ProposalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const proposalId = Array.isArray(id) ? id[0] : id;
  const { data: item, isLoading, error } = useProposal(proposalId as string);
  const updateStatus = useUpdateProposalStatus();
  const isDukuh = useAuthStore((s) => s.isDukuh);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    status: '',
    catatan_dukuh: '',
    sumber_dana: '',
    tahun_dilaksanakan: ''
  });

  useEffect(() => {
    if (item) {
      setForm({
        status: item.status,
        catatan_dukuh: item.catatan_dukuh || '',
        sumber_dana: item.sumber_dana || '',
        tahun_dilaksanakan: item.tahun_dilaksanakan?.toString() || ''
      });
    }
  }, [item]);

  const handleUpdate = async () => {
    try {
      await updateStatus.mutateAsync({
        id: id as string,
        ...form,
        tahun_dilaksanakan: form.tahun_dilaksanakan ? parseInt(form.tahun_dilaksanakan) : null
      });
      Alert.alert('Berhasil', 'Status usulan telah diperbarui.');
      setEditMode(false);
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal memperbarui status.');
    }
  };

  if (isLoading) return (
    <SafeAreaView style={styles.loaderContainer}>
      <ActivityIndicator color="#1B5E20" size="large" />
    </SafeAreaView>
  );

  if (error || !item) return (
    <SafeAreaView style={styles.loaderContainer}>
      <XCircle color="#EF4444" size={48} style={{ marginBottom: 16 }} />
      <Text style={styles.emptyText}>{error ? "Terjadi kesalahan memuat data." : "Data usulan tidak ditemukan."}</Text>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
        <Text style={{ color: '#1B5E20', fontWeight: '800' }}>Kembali</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#1B5E20" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Program</Text>
          {isDukuh() && !editMode ? (
            <TouchableOpacity onPress={() => setEditMode(true)} style={styles.editButton}>
              <Edit3 color="#fff" size={20} />
            </TouchableOpacity>
          ) : <View style={{ width: 44 }} />}
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          {/* Main Title Card */}
          <View style={styles.titleCard}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{item.jenis_program?.replace(/_/g, ' ').toUpperCase()}</Text>
            </View>
            <Text style={styles.programTitle}>{item.nama_program}</Text>
            
            <View style={styles.quickInfo}>
              <InfoItem icon={<MapPin size={14} color="#1B5E20" />} label={item.lokasi || 'Mandingan'} />
              <InfoItem icon={<Calendar size={14} color="#3B82F6" />} label={`Tahun ${item.tahun_diusulkan}`} />
              <InfoItem icon={<TrendingUp size={14} color="#F59E0B" />} label={`RT ${item.rts?.nomor_rt}`} />
            </View>
          </View>

          {/* Status Tracker */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>STATUS PELAKSANAAN</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusMain}>
                <View style={styles.statusIconWrapper}>
                  {item.status === 'selesai' ? <ShieldCheck color="#fff" size={24} /> : <Clock color="#fff" size={24} />}
                </View>
                <View style={styles.statusInfo}>
                  <Text style={styles.statusLabel}>TAHAPAN SAAT INI</Text>
                  <Text style={styles.statusValue}>{(item?.status || 'diusulkan').toUpperCase()}</Text>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.danaRow}>
                <View style={styles.danaItem}>
                  <Wallet size={16} color="#1B5E20" />
                  <View style={styles.danaTextWrapper}>
                    <Text style={styles.danaLabel}>SUMBER DANA</Text>
                    <Text style={styles.danaValue}>{item.sumber_dana?.replace(/_/g, ' ').toUpperCase() || 'BELUM DITENTUKAN'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DESKRIPSI & LATAR BELAKANG</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{item.deskripsi || 'Tidak ada deskripsi tambahan.'}</Text>
            </View>
          </View>

          {/* Dukuh Notes */}
          {item.catatan_dukuh && !editMode && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CATATAN DUKUH</Text>
              <View style={styles.notesCard}>
                <MessageSquare size={18} color="#1B5E20" style={{ marginBottom: 8 }} />
                <Text style={styles.notesText}>{item.catatan_dukuh}</Text>
              </View>
            </View>
          )}

          {/* Edit Mode (Dukuh Only) */}
          {editMode && isDukuh() && (
            <View style={styles.editSection}>
              <View style={styles.editHeader}>
                <Text style={styles.editTitle}>Proses Usulan</Text>
                <TouchableOpacity onPress={() => setEditMode(false)} style={styles.closeEdit}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>STATUS PROGRAM</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                  {['diusulkan', 'dikaji', 'disetujui', 'dilaksanakan', 'selesai', 'ditolak'].map(s => (
                    <TouchableOpacity 
                      key={s}
                      onPress={() => setForm({...form, status: s})}
                      style={[styles.chip, form.status === s && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, form.status === s && styles.chipTextActive]}>{s.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>SUMBER DANA</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                  {['dana_desa', 'pagu_indikatif', 'swadaya', 'pihak_ketiga', 'apbd'].map(s => (
                    <TouchableOpacity 
                      key={s}
                      onPress={() => setForm({...form, sumber_dana: s})}
                      style={[styles.chip, form.sumber_dana === s && styles.chipActiveDark]}
                    >
                      <Text style={[styles.chipText, form.sumber_dana === s && styles.chipTextActive]}>{s.replace(/_/g, ' ').toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>TAHUN PELAKSANAAN</Text>
                <TextInput 
                  placeholder="Contoh: 2026"
                  keyboardType="numeric"
                  style={styles.textInput}
                  value={form.tahun_dilaksanakan}
                  onChangeText={val => setForm({...form, tahun_dilaksanakan: val})}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>TANGGAPAN / CATATAN</Text>
                <TextInput 
                  placeholder="Berikan feedback untuk usulan ini..."
                  multiline
                  style={[styles.textInput, styles.textArea]}
                  textAlignVertical="top"
                  value={form.catatan_dukuh}
                  onChangeText={val => setForm({...form, catatan_dukuh: val})}
                />
              </View>

              <TouchableOpacity 
                onPress={handleUpdate}
                disabled={updateStatus.isPending}
                style={styles.saveButton}
              >
                {updateStatus.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>SIMPAN PERUBAHAN</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <View style={styles.infoItem}>
      {icon}
      <Text style={styles.infoText}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 60,
  },
  backButton: {
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  editButton: {
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleCard: {
    marginBottom: 30,
  },
  typeBadge: {
    backgroundColor: 'rgba(27, 94, 32, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1B5E20',
    letterSpacing: 1,
  },
  programTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 36,
    marginBottom: 20,
  },
  quickInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    marginLeft: 8,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  statusCard: {
    backgroundColor: '#1E293B',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  statusMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIconWrapper: {
    height: 52,
    width: 52,
    borderRadius: 18,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    marginLeft: 16,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  danaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  danaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  danaTextWrapper: {
    marginLeft: 12,
  },
  danaLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  danaValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 2,
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  descriptionText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    fontWeight: '500',
  },
  notesCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  notesText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 22,
    fontWeight: '600',
  },
  editSection: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 20,
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
  },
  closeEdit: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  chipScroll: {
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  chipActiveDark: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#fff',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  textArea: {
    height: 100,
  },
  saveButton: {
    height: 64,
    backgroundColor: '#1B5E20',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  }
});
