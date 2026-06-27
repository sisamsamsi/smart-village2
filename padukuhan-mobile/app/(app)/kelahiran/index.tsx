import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, Modal, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKelahiranList, useUpdateKelahiran, useDeleteKelahiran } from '@/hooks/useKelahiran';
import { useYearStore } from '@/stores/yearStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft, 
  Plus, 
  Baby, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  X
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function KelahiranListScreen() {
  const router = useRouter();
  const { activeYear, setActiveYear } = useYearStore();
  const { isKader } = useAuthStore();
  const { data: kelahiran, isLoading, refetch } = useKelahiranList(activeYear);

  const updateKelahiran = useUpdateKelahiran();
  const deleteKelahiran = useDeleteKelahiran();

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [form, setForm] = useState({
    nama_bayi: '',
    nik_bayi: '',
    jenis_kelamin_bayi: 'L' as 'L' | 'P',
    tanggal_lahir_bayi: '',
    bb_lahir: '',
    tb_lahir: '',
    nama_ibu: '',
    nama_ayah: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getBabyDetails = (keteranganStr?: string) => {
    if (!keteranganStr) return null;
    try {
      if (keteranganStr.startsWith('{')) {
        return JSON.parse(keteranganStr);
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  const handleEditPress = (record: any) => {
    setSelectedRecord(record);
    const details = getBabyDetails(record.keterangan) || {};
    setForm({
      nama_bayi: record.nama_bayi || record.wargas?.nama_lengkap || '',
      nik_bayi: record.wargas?.nik || '',
      jenis_kelamin_bayi: record.jenis_kelamin_bayi || record.wargas?.jenis_kelamin || 'L',
      tanggal_lahir_bayi: record.tanggal_mutasi || new Date().toISOString().split('T')[0],
      bb_lahir: details.bb_lahir ? String(details.bb_lahir) : '',
      tb_lahir: details.tb_lahir ? String(details.tb_lahir) : '',
      nama_ibu: record.nama_ibu || '',
      nama_ayah: record.nama_ayah || ''
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!form.nama_bayi || !form.nama_ibu || !form.nama_ayah) {
      Alert.alert('Peringatan', 'Nama bayi, nama ibu, dan nama ayah wajib diisi.');
      return;
    }

    try {
      await updateKelahiran.mutateAsync({
        id: selectedRecord.id,
        warga_id: selectedRecord.warga_id,
        nama_bayi: form.nama_bayi,
        nik_bayi: form.nik_bayi,
        jenis_kelamin_bayi: form.jenis_kelamin_bayi,
        tanggal_lahir_bayi: form.tanggal_lahir_bayi,
        bb_lahir: parseFloat(form.bb_lahir) || 0,
        tb_lahir: parseFloat(form.tb_lahir) || 0,
        nama_ibu: form.nama_ibu,
        nama_ayah: form.nama_ayah
      });
      Alert.alert('Sukses', 'Data kelahiran berhasil diperbarui.');
      setEditModalVisible(false);
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Terjadi kesalahan.');
    }
  };

  const handleDeletePress = (record: any) => {
    Alert.alert(
      'Hapus Data Kelahiran',
      `Apakah Anda yakin ingin menghapus data kelahiran ${record.nama_bayi || record.wargas?.nama_lengkap || 'bayi'}? Data bayi di kependudukan juga akan DIHAPUS, dan status kehamilan ibu akan DIKEMBALIKAN.`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteKelahiran.mutateAsync({ 
                id: record.id, 
                warga_id: record.warga_id, 
                nama_ibu: record.nama_ibu 
              });
              Alert.alert('Sukses', 'Data kelahiran berhasil dihapus.');
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
          <Text style={styles.title}>Kelahiran Bayi</Text>
          {!isKader() ? (
            <TouchableOpacity 
              onPress={() => router.push('/kelahiran/tambah' as any)}
              style={styles.addButton}
            >
              <Plus color="#fff" size={16} />
              <Text style={styles.addButtonText}>Tambah</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
        <Text style={styles.subtitle}>Pencatatan data kelahiran bayi baru padukuhan</Text>
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
        ) : !kelahiran || kelahiran.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Baby size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyText}>Belum Ada Data Kelahiran</Text>
            <Text style={styles.emptySubtext}>
              Data kelahiran bayi baru tahun {activeYear} akan muncul di sini.
            </Text>
          </View>
        ) : (
          <View style={{ paddingBottom: 24 }}>
            {kelahiran.map((item) => {
              const details = getBabyDetails(item.keterangan);
              return (
                <View key={item.id} style={styles.listItemRow}>
                  <View style={styles.iconWrapper}>
                    <Baby size={16} color="#124170" />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{item.nama_bayi || item.wargas?.nama_lengkap || 'Bayi Baru'}</Text>
                    <View style={styles.itemMetaRow}>
                      <Text style={styles.itemGender}>{item.jenis_kelamin_bayi === 'L' ? 'Laki-laki' : 'Perempuan'}</Text>
                      <Text style={styles.dividerDot}>•</Text>
                      <Text style={styles.itemDate}>
                        {format(new Date(item.tanggal_mutasi), 'dd MMM yyyy', { locale: localeId })}
                      </Text>
                      <Text style={styles.dividerDot}>•</Text>
                      <Text style={styles.itemRt}>RT {item.wargas?.rts?.nomor_rt || '?'}</Text>
                    </View>
                    
                    <Text style={styles.itemParents}>
                      Ibu: {item.nama_ibu || '-'} • Ayah: {item.nama_ayah || '-'}
                    </Text>

                    {details && (
                      <Text style={styles.itemDetails}>
                        Lahir: {details.bb_lahir ? `${details.bb_lahir} kg` : '-'} / {details.tb_lahir ? `${details.tb_lahir} cm` : '-'}
                      </Text>
                    )}
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
              );
            })}
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
              <Text style={styles.modalTitle}>Edit Data Kelahiran</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              
              {/* Nama Bayi */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>NAMA LENGKAP BAYI *</Text>
                <TextInput 
                  placeholder="Nama Lengkap" 
                  style={styles.textInput} 
                  value={form.nama_bayi} 
                  onChangeText={(val) => setForm({ ...form, nama_bayi: val })} 
                />
              </View>

              {/* NIK Bayi */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>NOMOR INDUK KEPENDUDUKAN (NIK)</Text>
                <TextInput 
                  placeholder="16 Digit NIK (Jika ada)" 
                  keyboardType="numeric"
                  style={styles.textInput} 
                  value={form.nik_bayi} 
                  onChangeText={(val) => setForm({ ...form, nik_bayi: val })} 
                />
              </View>

              {/* Jenis Kelamin */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>JENIS KELAMIN *</Text>
                <View style={styles.selectRow}>
                  {[
                    { label: 'Laki-laki', val: 'L' },
                    { label: 'Perempuan', val: 'P' }
                  ].map((gender) => (
                    <TouchableOpacity 
                      key={gender.val} 
                      style={[styles.selectOption, form.jenis_kelamin_bayi === gender.val && styles.selectOptionActive]}
                      onPress={() => setForm(prev => ({ ...prev, jenis_kelamin_bayi: gender.val as 'L' | 'P' }))}
                    >
                      <Text style={[styles.selectOptionText, form.jenis_kelamin_bayi === gender.val && styles.selectOptionTextActive]}>
                        {gender.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Tanggal Lahir */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>TANGGAL LAHIR BAYI *</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateSelector}>
                  <CalendarIcon size={16} color="#64748B" style={{ marginRight: 8 }} />
                  <Text style={styles.dateSelectorText}>{form.tanggal_lahir_bayi}</Text>
                </TouchableOpacity>
              </View>

              {/* BB Awal & TB */}
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.modalLabel}>BERAT LAHIR (KG)</Text>
                  <TextInput 
                    placeholder="Contoh: 3.2" 
                    keyboardType="numeric"
                    style={styles.textInput} 
                    value={form.bb_lahir} 
                    onChangeText={(val) => setForm({ ...form, bb_lahir: val })} 
                  />
                </View>
                <View style={styles.half}>
                  <Text style={styles.modalLabel}>PANJANG LAHIR (CM)</Text>
                  <TextInput 
                    placeholder="Contoh: 49" 
                    keyboardType="numeric"
                    style={styles.textInput} 
                    value={form.tb_lahir} 
                    onChangeText={(val) => setForm({ ...form, tb_lahir: val })} 
                  />
                </View>
              </View>

              {/* Nama Ibu & Nama Ayah */}
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>NAMA IBU *</Text>
                <TextInput 
                  placeholder="Nama Lengkap Ibu" 
                  style={styles.textInput} 
                  value={form.nama_ibu} 
                  onChangeText={(val) => setForm({ ...form, nama_ibu: val })} 
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>NAMA AYAH *</Text>
                <TextInput 
                  placeholder="Nama Lengkap Ayah" 
                  style={styles.textInput} 
                  value={form.nama_ayah} 
                  onChangeText={(val) => setForm({ ...form, nama_ayah: val })} 
                />
              </View>

              <TouchableOpacity 
                style={[styles.saveConfirmBtn, updateKelahiran.isPending && { opacity: 0.6 }]} 
                onPress={handleUpdate}
                disabled={updateKelahiran.isPending}
              >
                {updateKelahiran.isPending ? (
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
          value={form.tanggal_lahir_bayi ? new Date(form.tanggal_lahir_bayi) : new Date()} 
          mode="date" 
          display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setForm(prev => ({ ...prev, tanggal_lahir_bayi: selectedDate.toISOString().split('T')[0] }));
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
  itemGender: {
    fontSize: 12,
    color: '#64748B',
  },
  dividerDot: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 6,
  },
  itemDate: {
    fontSize: 12,
    color: '#64748B',
  },
  itemRt: {
    fontSize: 12,
    color: '#64748B',
  },
  itemParents: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  itemDetails: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
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
    marginBottom: 12,
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
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
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
