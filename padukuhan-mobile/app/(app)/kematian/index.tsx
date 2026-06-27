import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, Modal, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKematianList, useUpdateKematian, useDeleteKematian } from '@/hooks/useKematian';
import { useYearStore } from '@/stores/yearStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft, 
  Plus, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  Edit2,
  Trash2,
  X
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function KematianListScreen() {
  const router = useRouter();
  const { activeYear, setActiveYear } = useYearStore();
  const { isKader } = useAuthStore();
  const { data: kematian, isLoading, refetch } = useKematianList(activeYear);

  const updateKematian = useUpdateKematian();
  const deleteKematian = useDeleteKematian();

  // Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [form, setForm] = useState({
    tanggal_mutasi: '',
    sebab_meninggal: 'Sakit',
    sebab_meninggal_detail: '',
    keterangan: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleEditPress = (record: any) => {
    setSelectedRecord(record);
    const isStandardSebab = ['Sakit', 'Usia Tua', 'Kecelakaan'].includes(record.sebab_meninggal);
    setForm({
      tanggal_mutasi: record.tanggal_mutasi || new Date().toISOString().split('T')[0],
      sebab_meninggal: isStandardSebab ? record.sebab_meninggal : 'Lainnya',
      sebab_meninggal_detail: isStandardSebab ? '' : record.sebab_meninggal,
      keterangan: record.keterangan || ''
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    const sebab = form.sebab_meninggal === 'Lainnya' 
      ? form.sebab_meninggal_detail 
      : form.sebab_meninggal;

    if (!sebab) {
      Alert.alert('Peringatan', 'Sebab meninggal wajib diisi.');
      return;
    }

    try {
      await updateKematian.mutateAsync({
        id: selectedRecord.id,
        tanggal_mutasi: form.tanggal_mutasi,
        sebab_meninggal: sebab,
        keterangan: form.keterangan
      });
      Alert.alert('Sukses', 'Data kematian berhasil diperbarui.');
      setEditModalVisible(false);
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Terjadi kesalahan.');
    }
  };

  const handleDeletePress = (record: any) => {
    Alert.alert(
      'Hapus Data Kematian',
      `Apakah Anda yakin ingin menghapus laporan kematian untuk warga ${record.wargas?.nama_lengkap || ''}? Status warga akan dikembalikan menjadi AKTIF.`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteKematian.mutateAsync({ id: record.id, warga_id: record.warga_id });
              Alert.alert('Sukses', 'Data kematian berhasil dihapus.');
            } catch (e: any) {
              Alert.alert('Gagal', e.message || 'Terjadi kesalahan.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#1E293B" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>Kematian Warga</Text>
          {!isKader() ? (
            <TouchableOpacity 
              onPress={() => router.push('/kematian/tambah' as any)}
              style={styles.addButton}
            >
              <Plus color="#fff" size={16} />
              <Text style={styles.addButtonText}>Tambah</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
        <Text style={styles.subtitle}>Pencatatan pelaporan kematian warga padukuhan</Text>
      </View>

      {/* Year Switcher */}
      <View style={styles.yearSwitcher}>
        <TouchableOpacity 
          style={styles.yearChangeBtn}
          onPress={() => setActiveYear(activeYear - 1)}
        >
          <ChevronLeft size={18} color="#475569" />
        </TouchableOpacity>
        <View style={styles.yearDisplay}>
          <CalendarIcon size={14} color="#124170" style={{ marginRight: 6 }} />
          <Text style={styles.yearText}>Tahun Aktif: {activeYear}</Text>
        </View>
        <TouchableOpacity 
          style={styles.yearChangeBtn}
          onPress={() => setActiveYear(activeYear + 1)}
        >
          <ChevronRight size={18} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* List Section */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#124170" />}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#124170" size="large" />
          </View>
        ) : !kematian || kematian.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Info size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyText}>Belum Ada Data Kematian</Text>
            <Text style={styles.emptySubtext}>
              Data kematian warga tahun {activeYear} akan muncul di sini.
            </Text>
          </View>
        ) : (
          <View style={{ paddingBottom: 24 }}>
            {kematian.map((item) => (
              <View key={item.id} style={styles.listItemRow}>
                <View style={styles.iconWrapper}>
                  <Info size={16} color="#64748B" />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{item.wargas?.nama_lengkap || 'Warga'}</Text>
                  <View style={styles.itemMetaRow}>
                    <Text style={styles.itemDate}>
                      Wafat: {format(new Date(item.tanggal_mutasi), 'dd MMM yyyy', { locale: localeId })}
                    </Text>
                    <Text style={styles.dividerDot}>•</Text>
                    <Text style={styles.itemRt}>RT {item.wargas?.rts?.nomor_rt || '?'}</Text>
                  </View>
                  {item.sebab_meninggal && (
                    <Text style={styles.itemSebab}>Sebab: {item.sebab_meninggal}</Text>
                  )}
                  {item.keterangan ? (
                    <Text style={styles.itemNote}>"{item.keterangan}"</Text>
                  ) : null}
                </View>
                
                {!isKader() && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => handleEditPress(item)} style={styles.actionBtn}>
                      <Edit2 size={14} color="#475569" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeletePress(item)} style={styles.actionBtn}>
                      <Trash2 size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Kematian Warga</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalSubtitle}>Warga: {selectedRecord?.wargas?.nama_lengkap}</Text>
              
              {/* Tanggal Wafat */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>TANGGAL WAFAT *</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateSelector}>
                  <CalendarIcon size={16} color="#64748B" style={{ marginRight: 8 }} />
                  <Text style={styles.dateSelectorText}>{form.tanggal_mutasi}</Text>
                </TouchableOpacity>
              </View>

              {/* Sebab Meninggal */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>SEBAB MENINGGAL *</Text>
                <View style={styles.selectRow}>
                  {['Sakit', 'Usia Tua', 'Kecelakaan', 'Lainnya'].map((seb) => (
                    <TouchableOpacity 
                      key={seb} 
                      style={[styles.selectOption, form.sebab_meninggal === seb && styles.selectOptionActive]}
                      onPress={() => setForm(prev => ({ ...prev, sebab_meninggal: seb }))}
                    >
                      <Text style={[styles.selectOptionText, form.sebab_meninggal === seb && styles.selectOptionTextActive]}>
                        {seb}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {form.sebab_meninggal === 'Lainnya' && (
                  <TextInput 
                    placeholder="Sebutkan sebab meninggal..." 
                    style={[styles.textInput, { marginTop: 8 }]} 
                    value={form.sebab_meninggal_detail} 
                    onChangeText={(val) => setForm({ ...form, sebab_meninggal_detail: val })} 
                  />
                )}
              </View>

              {/* Keterangan */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>KETERANGAN / CATATAN LAIN</Text>
                <TextInput 
                  placeholder="Contoh: Lokasi makam, jam wafat, dll." 
                  style={[styles.textInput, { height: 64, textAlignVertical: 'top', paddingTop: 8 }]} 
                  multiline 
                  value={form.keterangan} 
                  onChangeText={(val) => setForm({ ...form, keterangan: val })} 
                />
              </View>

              <TouchableOpacity 
                style={[styles.saveConfirmBtn, updateKematian.isPending && { opacity: 0.6 }]} 
                onPress={handleUpdate}
                disabled={updateKematian.isPending}
              >
                {updateKematian.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveConfirmBtnText}>Simpan Perubahan</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker 
          value={form.tanggal_mutasi ? new Date(form.tanggal_mutasi) : new Date()} 
          mode="date" 
          display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setForm(prev => ({ ...prev, tanggal_mutasi: selectedDate.toISOString().split('T')[0] }));
            }
          }} 
          maximumDate={new Date()} 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    height: 36,
    width: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  addButton: {
    backgroundColor: '#124170',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  yearSwitcher: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  yearChangeBtn: {
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  yearDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listItemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconWrapper: {
    height: 36,
    width: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#64748B',
  },
  dividerDot: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 6,
  },
  itemRt: {
    fontSize: 12,
    color: '#64748B',
  },
  itemSebab: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  itemNote: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 4,
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
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  // Modal styles
  modalBg: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  modalScroll: {
    flexGrow: 0,
    marginBottom: 20,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 16,
  },
  modalField: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
  },
  dateSelectorText: {
    fontSize: 13,
    color: '#334155',
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectOptionActive: {
    backgroundColor: '#124170',
    borderColor: '#124170',
  },
  selectOptionText: {
    fontSize: 12,
    color: '#475569',
  },
  selectOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  textInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#fff',
  },
  saveConfirmBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#124170',
    alignItems: 'center',
    marginTop: 16,
  },
  saveConfirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
