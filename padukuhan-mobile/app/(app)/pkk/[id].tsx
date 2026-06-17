import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, Platform, Modal, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDasawismaWarga, usePkkPartisipasi, useDasawismaList, useUpdatePkkPartisipasi } from '@/hooks/usePkkData';
import { 
  ArrowLeft, 
  Users, 
  Check,
  X,
  User,
  LayoutGrid,
  Info,
  ChevronRight,
  Save
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const PROGRAMS = [
  { key: 'penghayatan_pancasila', label: 'Pancasila' },
  { key: 'gotong_royong', label: 'Gotong Royong' },
  { key: 'pendidikan_keterampilan', label: 'Pendidikan' },
  { key: 'pengembangan_koperasi', label: 'Koperasi' },
  { key: 'pangan', label: 'Pangan' },
  { key: 'sandang', label: 'Sandang' },
  { key: 'kesehatan', label: 'Kesehatan' },
  { key: 'perencanaan_sehat', label: 'P. Sehat' },
];

export default function PkkDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: dws } = useDasawismaList();
  const dw = dws?.find(d => d.id === id);
  
  const { data: allWarga, isLoading: loadingWarga } = useDasawismaWarga(id as string);
  const { data: pkkRecords, isLoading: loadingPkk } = usePkkPartisipasi(id as string, 2025);
  const updateMutation = useUpdatePkkPartisipasi();

  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const combinedData = useMemo(() => {
    if (!allWarga) return [];
    return allWarga.map(warga => {
      const record = pkkRecords?.find(r => (r as any).warga_id === warga.id);
      return {
        id: warga.id,
        nama_lengkap: warga.nama_lengkap,
        nik: warga.nik,
        hasRecord: !!record,
        ...record
      };
    });
  }, [allWarga, pkkRecords]);

  const openEditModal = (person: any) => {
    setSelectedPerson(person);
    const initialForm: any = {};
    PROGRAMS.forEach(p => {
      initialForm[p.key] = person[p.key] || false;
    });
    setEditForm(initialForm);
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        wargaId: selectedPerson.id,
        dasawismaId: id as string,
        tahun: 2025,
        data: editForm
      });
      setEditModalVisible(false);
      Alert.alert('Sukses', 'Data partisipasi berhasil disimpan.');
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Gagal menyimpan data.');
    }
  };

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
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#67C090" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Partisipasi PKK</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.headerTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dwName} numberOfLines={1}>{dw?.nama_dasawisma || 'Detail Kelompok'}</Text>
            <Text style={styles.subtitle}>Tahun Monitoring 2025</Text>
          </View>
          <View style={styles.badgeCount}>
            <Users size={14} color="#67C090" />
            <Text style={styles.badgeText}>{allWarga?.length || 0} Warga</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tipBox}>
          <Info size={16} color="#67C090" />
          <Text style={styles.tipText}>Klik pada kartu warga untuk mengisi atau mengubah data partisipasi.</Text>
        </View>

        {combinedData.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.personCard}
            onPress={() => openEditModal(item)}
            activeOpacity={0.7}
          >
            <View style={styles.personHeader}>
              <View style={styles.avatar}>
                <User size={20} color="#64748B" />
              </View>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{item.nama_lengkap}</Text>
                <Text style={styles.personNik}>{item.nik}</Text>
              </View>
              <View style={[styles.statusBadge, item.hasRecord ? styles.statusBadgeActive : styles.statusBadgeEmpty]}>
                <Text style={[styles.statusBadgeText, item.hasRecord ? styles.statusBadgeTextActive : styles.statusBadgeTextEmpty]}>
                  {item.hasRecord ? 'TERISI' : 'BELUM'}
                </Text>
              </View>
            </View>

            <View style={styles.programsGrid}>
              {PROGRAMS.map((prog) => {
                const isActive = item[prog.key];
                return (
                  <View key={prog.key} style={styles.progItem}>
                    <View style={[styles.progDot, isActive ? styles.progDotActive : styles.progDotInactive]}>
                      {isActive ? <Check size={10} color="#fff" strokeWidth={4} /> : <X size={10} color="#CBD5E1" />}
                    </View>
                    <Text style={[styles.progLabel, isActive && styles.progLabelActive]}>{prog.label}</Text>
                  </View>
                );
              })}
            </View>
            
            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterText}>Klik untuk edit</Text>
              <ChevronRight size={14} color="#CBD5E1" />
            </View>
          </TouchableOpacity>
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setEditModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Update Partisipasi</Text>
                <Text style={styles.modalSubtitle}>{selectedPerson?.nama_lengkap}</Text>
              </View>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalClose}>
                <X color="#64748B" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              {PROGRAMS.map((prog) => (
                <View key={prog.key} style={styles.formRow}>
                  <View style={styles.formLabelCol}>
                    <Text style={styles.formLabel}>{prog.label}</Text>
                  </View>
                  <Switch
                    value={editForm[prog.key]}
                    onValueChange={(val) => setEditForm({...editForm, [prog.key]: val})}
                    trackColor={{ false: '#E2E8F0', true: '#67C090' }}
                    thumbColor={Platform.OS === 'ios' ? '#fff' : editForm[prog.key] ? '#fff' : '#f4f3f4'}
                  />
                </View>
              ))}
              <View style={{ height: 20 }} />
            </ScrollView>

            <TouchableOpacity 
              style={[styles.saveButton, updateMutation.isPending && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={styles.saveButtonContent}>
                  <Save size={20} color="white" style={{ marginRight: 10 }} />
                  <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 20,
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dwName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#67C090',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '700',
  },
  badgeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(103, 192, 144, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#67C090',
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(103, 192, 144, 0.08)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(103, 192, 144, 0.15)',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#67C090',
    marginLeft: 10,
    fontWeight: '600',
    lineHeight: 18,
  },
  personCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  personNik: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusBadgeEmpty: {
    backgroundColor: '#F1F5F9',
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '900',
  },
  statusBadgeTextActive: {
    color: '#10B981',
  },
  statusBadgeTextEmpty: {
    color: '#94A3B8',
  },
  programsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progItem: {
    width: (width - 48 - 40 - 24) / 3, // 3 columns
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progDot: {
    height: 18,
    width: 18,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    borderWidth: 1,
  },
  progDotActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  progDotInactive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  progLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  progLabelActive: {
    color: '#1E293B',
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  cardFooterText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#CBD5E1',
    marginRight: 4,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  modalClose: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalForm: {
    marginBottom: 24,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  formLabelCol: {
    flex: 1,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  saveButton: {
    backgroundColor: '#67C090',
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#67C090',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  }
});
