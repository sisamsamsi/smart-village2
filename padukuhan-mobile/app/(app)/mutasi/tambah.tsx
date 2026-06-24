import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateMutasi } from '@/hooks/useMutasi';
import { useRTs, useKKs } from '@/hooks/useKependudukan';
import { supabase } from '@/lib/supabase';
import { useDraftStore } from '@/hooks/useDraftStore';
import { 
  ArrowLeft, 
  ArrowRight,
  LogOut, 
  LogIn, 
  Search,
  Calendar as CalendarIcon,
  User,
  Info,
  X,
  Plus,
  Check
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');
type MutationType = 'pindah_keluar' | 'pindah_masuk';

export default function AddMutasiScreen() {
  const router = useRouter();
  const createMutasi = useCreateMutasi();
  const { addDraft } = useDraftStore();
  const { data: rts } = useRTs();
  const { data: kkList } = useKKs();
  
  const [activeTab, setActiveTab] = useState<MutationType>('pindah_keluar');
  
  // Search state for existing residents (pindah_keluar)
  const [wargaSearch, setWargaSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedWarga, setSelectedWarga] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  // Search state for KK selection (pindah_masuk)
  const [kkSearch, setKkSearch] = useState('');
  const [showKkList, setShowKkList] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState<'tanggal_mutasi' | 'tanggal_lahir' | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    jenis_mutasi: 'pindah_keluar' as MutationType,
    tanggal_mutasi: new Date().toISOString().split('T')[0],
    warga_id: '',
    rt_id: '',
    tujuan_daerah: '',
    asal_daerah: '',
    keterangan: '',
    
    // New resident fields for pindah_masuk
    nama_lengkap: '',
    nik: '',
    jenis_kelamin: 'L' as 'L' | 'P',
    tanggal_lahir: new Date().toISOString().split('T')[0],
    is_new_kk: false,
    rumah_tangga_id: '',
    no_kk_baru: '',
    nama_kepala_keluarga_baru: '',
  });

  const handleSearchWarga = async (text: string) => {
    setWargaSearch(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    
    const { data, error } = await supabase
      .from('wargas')
      .select('id, nama_lengkap, nik, rts(nomor_rt), hubungan_keluarga, jenis_kelamin')
      .or(`nama_lengkap.ilike.%${text}%,nik.like.%${text}%`)
      .eq('status_warga', 'aktif')
      .limit(5);

    if (!error && data) {
      setSearchResults(data);
    }
    setSearching(false);
  };

  const selectWarga = (warga: any) => {
    setSelectedWarga(warga);
    setForm(prev => ({ 
      ...prev, 
      warga_id: warga.id 
    }));
    setWargaSearch('');
    setSearchResults([]);
  };

  const handleTabChange = (tab: MutationType) => {
    setActiveTab(tab);
    setSelectedWarga(null);
    setWargaSearch('');
    setSearchResults([]);
    setForm(prev => ({
      ...prev,
      jenis_mutasi: tab,
      warga_id: '',
      tujuan_daerah: '',
      asal_daerah: '',
      keterangan: '',
      nama_lengkap: '',
      nik: '',
      jenis_kelamin: 'L',
      tanggal_lahir: new Date().toISOString().split('T')[0],
      is_new_kk: false,
      rumah_tangga_id: '',
      no_kk_baru: '',
      nama_kepala_keluarga_baru: '',
    }));
  };

  const openDatePicker = (field: 'tanggal_mutasi' | 'tanggal_lahir') => {
    setDateField(field);
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (!selectedDate) return;
    const formattedDate = selectedDate.toISOString().split('T')[0];
    if (dateField === 'tanggal_mutasi') {
      setForm(prev => ({ ...prev, tanggal_mutasi: formattedDate }));
    } else if (dateField === 'tanggal_lahir') {
      setForm(prev => ({ ...prev, tanggal_lahir: formattedDate }));
    }
    setDateField(null);
  };

  const handleSaveDraftDirectly = () => {
    const label = `Mutasi ${activeTab === 'pindah_keluar' ? 'Keluar' : 'Masuk'} - ${
      activeTab === 'pindah_keluar' ? (selectedWarga?.nama_lengkap || 'Warga') : form.nama_lengkap
    }`;
    addDraft('mutasi', label, form);
    Alert.alert('Draf Disimpan', 'Data mutasi berhasil disimpan ke draf offline HP Anda.');
    router.back();
  };

  const handleSubmit = async () => {
    if (activeTab === 'pindah_keluar') {
      if (!form.warga_id) {
        Alert.alert('Peringatan', 'Silakan cari dan pilih warga terlebih dahulu.');
        return;
      }
      if (!form.tujuan_daerah) {
        Alert.alert('Peringatan', 'Silakan isi daerah tujuan pindah.');
        return;
      }
    } else {
      // pindah_masuk
      if (!form.nama_lengkap || !form.nik) {
        Alert.alert('Peringatan', 'Nama lengkap dan NIK wajib diisi.');
        return;
      }
      if (form.nik.length !== 16) {
        Alert.alert('Peringatan', 'NIK harus terdiri dari 16 digit.');
        return;
      }
      if (!form.rt_id) {
        Alert.alert('Peringatan', 'Silakan pilih RT.');
        return;
      }
      if (!form.is_new_kk && !form.rumah_tangga_id) {
        Alert.alert('Peringatan', 'Silakan pilih KK atau gunakan opsi KK Baru.');
        return;
      }
      if (form.is_new_kk && (!form.no_kk_baru || !form.nama_kepala_keluarga_baru)) {
        Alert.alert('Peringatan', 'No. KK Baru dan Nama Kepala Keluarga Baru wajib diisi.');
        return;
      }
      if (!form.asal_daerah) {
        Alert.alert('Peringatan', 'Silakan isi daerah asal perpindahan.');
        return;
      }
    }

    setLoading(true);
    try {
      await createMutasi.mutateAsync(form);
      Alert.alert('Berhasil', 'Laporan mutasi berhasil disimpan.');
      router.back();
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        'Gagal Mengirim Data',
        'Koneksi internet bermasalah. Simpan ke draf offline agar dapat dikirim nanti?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Simpan ke Draf',
            onPress: () => {
              const label = `Mutasi ${activeTab === 'pindah_keluar' ? 'Keluar' : 'Masuk'} - ${
                activeTab === 'pindah_keluar' ? (selectedWarga?.nama_lengkap || 'Warga') : form.nama_lengkap
              }`;
              addDraft('mutasi', label, form);
              Alert.alert('Draf Disimpan', 'Data disimpan di memori HP. Anda dapat mengirimkannya nanti di dashboard.');
              router.back();
            }
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredKk = kkList?.filter((kk: any) =>
    kk.no_kk?.toLowerCase().includes(kkSearch.toLowerCase()) ||
    kk.nama_kepala_keluarga?.toLowerCase().includes(kkSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1E293B" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catat Perpindahan Warga</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'pindah_keluar' && styles.tabBtnActive]}
          onPress={() => handleTabChange('pindah_keluar')}
        >
          <LogOut size={16} color={activeTab === 'pindah_keluar' ? '#fff' : '#64748B'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabBtnText, activeTab === 'pindah_keluar' && styles.tabBtnTextActive]}>Pindah Keluar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'pindah_masuk' && styles.tabBtnActive]}
          onPress={() => handleTabChange('pindah_masuk')}
        >
          <LogIn size={16} color={activeTab === 'pindah_masuk' ? '#fff' : '#64748B'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabBtnText, activeTab === 'pindah_masuk' && styles.tabBtnTextActive]}>Pindah Masuk (Datang)</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Tanggal Peristiwa */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>TANGGAL PERISTIWA MUTASI</Text>
            <TouchableOpacity onPress={() => openDatePicker('tanggal_mutasi')} style={styles.dateSelector}>
              <CalendarIcon size={16} color="#64748B" style={{ marginRight: 8 }} />
              <Text style={styles.dateSelectorText}>{form.tanggal_mutasi}</Text>
            </TouchableOpacity>
          </View>

          {/* PINDAH KELUAR FLOW */}
          {activeTab === 'pindah_keluar' && (
            <View>
              {selectedWarga ? (
                <View style={styles.wargaSelectedCard}>
                  <View style={styles.wargaSelectedInfo}>
                    <Text style={styles.wargaSelectedName}>{selectedWarga.nama_lengkap}</Text>
                    <Text style={styles.wargaSelectedNik}>NIK: {selectedWarga.nik || '-'}</Text>
                    <Text style={styles.wargaSelectedRt}>RT {selectedWarga.rts?.nomor_rt ?? '-'} • {selectedWarga.hubungan_keluarga ?? '-'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedWarga(null)} style={styles.removeWargaButton}>
                    <X size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>WARGA YANG BERSANGKUTAN</Text>
                  <View style={styles.searchInputWrapper}>
                    <Search size={18} color="#94A3B8" style={{ marginLeft: 12 }} />
                    <TextInput 
                      placeholder="Cari nama atau NIK warga..." 
                      style={styles.searchInput} 
                      value={wargaSearch} 
                      onChangeText={handleSearchWarga} 
                    />
                    {searching && <ActivityIndicator size="small" color="#67C090" style={{ marginRight: 12 }} />}
                  </View>
                  {searchResults.length > 0 && (
                    <View style={styles.searchResultsList}>
                      {searchResults.map((w) => (
                        <TouchableOpacity key={w.id} onPress={() => selectWarga(w)} style={styles.searchItem}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.searchItemName}>{w.nama_lengkap}</Text>
                            <Text style={styles.searchItemSub}>NIK: {w.nik || '-'} • RT {w.rts?.nomor_rt}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {wargaSearch.length >= 2 && searchResults.length === 0 && !searching && (
                    <Text style={styles.noResultsText}>Warga tidak ditemukan atau tidak aktif.</Text>
                  )}
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>DAERAH TUJUAN PINDAH</Text>
                <TextInput 
                  placeholder="Kecamatan, Kota, Provinsi tujuan..." 
                  style={styles.textInput} 
                  value={form.tujuan_daerah} 
                  onChangeText={(val) => setForm({ ...form, tujuan_daerah: val })} 
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>ALASAN / KETERANGAN</Text>
                <TextInput 
                  placeholder="Catatan alasan kepindahan..." 
                  style={[styles.textInput, { height: 64, textAlignVertical: 'top', paddingTop: 8 }]} 
                  multiline 
                  value={form.keterangan} 
                  onChangeText={(val) => setForm({ ...form, keterangan: val })} 
                />
              </View>
            </View>
          )}

          {/* PINDAH MASUK FLOW */}
          {activeTab === 'pindah_masuk' && (
            <View>
              <View style={styles.alertBox}>
                <Info size={16} color="#2563EB" style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={styles.alertText}>
                  Warga pindah datang otomatis belum terdaftar di database. Masukkan identitas warga baru di bawah ini.
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>NAMA LENGKAP WARGA BARU</Text>
                <TextInput 
                  placeholder="Nama Lengkap sesuai KTP" 
                  style={styles.textInput} 
                  value={form.nama_lengkap} 
                  onChangeText={(val) => setForm({ ...form, nama_lengkap: val })} 
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>NOMOR INDUK KEPENDUDUKAN (NIK)</Text>
                <TextInput 
                  placeholder="16 digit nomor NIK" 
                  style={styles.textInput} 
                  value={form.nik} 
                  onChangeText={(val) => setForm({ ...form, nik: val })} 
                  keyboardType="numeric"
                  maxLength={16}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>JENIS KELAMIN</Text>
                  <View style={styles.genderRow}>
                    <TouchableOpacity 
                      onPress={() => setForm({ ...form, jenis_kelamin: 'L' })}
                      style={[styles.genderBtn, form.jenis_kelamin === 'L' && styles.genderBtnActive]}
                    >
                      <Text style={[styles.genderBtnText, form.jenis_kelamin === 'L' && styles.genderBtnTextActive]}>Pria</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setForm({ ...form, jenis_kelamin: 'P' })}
                      style={[styles.genderBtn, form.jenis_kelamin === 'P' && styles.genderBtnActive]}
                    >
                      <Text style={[styles.genderBtnText, form.jenis_kelamin === 'P' && styles.genderBtnTextActive]}>Wanita</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>TANGGAL LAHIR</Text>
                  <TouchableOpacity onPress={() => openDatePicker('tanggal_lahir')} style={styles.dateSelector}>
                    <CalendarIcon size={16} color="#64748B" style={{ marginRight: 8 }} />
                    <Text style={styles.dateSelectorText}>{form.tanggal_lahir}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* RT ID */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>RT TUJUAN</Text>
                <View style={styles.selectRow}>
                  {rts?.map((rt: any) => (
                    <TouchableOpacity 
                      key={rt.id} 
                      style={[styles.selectOption, form.rt_id === rt.id && styles.selectOptionActive]}
                      onPress={() => setForm({ ...form, rt_id: rt.id })}
                    >
                      <Text style={[styles.selectOptionText, form.rt_id === rt.id && styles.selectOptionTextActive]}>
                        RT 0{rt.nomor_rt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* KK Options */}
              <View style={styles.field}>
                <View style={styles.checkboxRow}>
                  <TouchableOpacity 
                    onPress={() => setForm(prev => ({ ...prev, is_new_kk: !prev.is_new_kk, rumah_tangga_id: '' }))}
                    style={[styles.checkboxBox, form.is_new_kk && styles.checkboxBoxActive]}
                  >
                    {form.is_new_kk && <Check size={14} color="#fff" />}
                  </TouchableOpacity>
                  <Text style={styles.checkboxText}>Buat Kartu Keluarga (KK) Baru</Text>
                </View>
              </View>

              {form.is_new_kk ? (
                <View style={styles.newKkSection}>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>NOMOR KK BARU</Text>
                    <TextInput 
                      placeholder="16 digit nomor KK" 
                      style={styles.textInput} 
                      value={form.no_kk_baru} 
                      onChangeText={(val) => setForm({ ...form, no_kk_baru: val })} 
                      keyboardType="numeric"
                      maxLength={16}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>NAMA KEPALA KELUARGA BARU</Text>
                    <TextInput 
                      placeholder="Nama Lengkap Kepala Keluarga" 
                      style={styles.textInput} 
                      value={form.nama_kepala_keluarga_baru} 
                      onChangeText={(val) => setForm({ ...form, nama_kepala_keluarga_baru: val })} 
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>PILIH KARTU KELUARGA (KK) EXISTING</Text>
                  <View style={styles.searchInputWrapper}>
                    <Search size={18} color="#94A3B8" style={{ marginLeft: 12 }} />
                    <TextInput 
                      placeholder="Cari No. KK atau Kepala Keluarga..." 
                      style={styles.searchInput} 
                      value={kkSearch} 
                      onChangeText={(val) => {
                        setKkSearch(val);
                        setShowKkList(val.length > 0);
                      }} 
                    />
                  </View>
                  {showKkList && filteredKk && (
                    <View style={styles.searchResultsList}>
                      {filteredKk.slice(0, 5).map((kk: any) => (
                        <TouchableOpacity 
                          key={kk.id} 
                          onPress={() => {
                            setForm(prev => ({ ...prev, rumah_tangga_id: kk.id }));
                            setKkSearch(`${kk.no_kk} - ${kk.nama_kepala_keluarga}`);
                            setShowKkList(false);
                          }} 
                          style={styles.searchItem}
                        >
                          <Text style={styles.searchItemName}>{kk.nama_kepala_keluarga}</Text>
                          <Text style={styles.searchItemSub}>No. KK: {kk.no_kk}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>DAERAH ASAL PINDAH</Text>
                <TextInput 
                  placeholder="Kecamatan, Kota, Provinsi asal..." 
                  style={styles.textInput} 
                  value={form.asal_daerah} 
                  onChangeText={(val) => setForm({ ...form, asal_daerah: val })} 
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>KETERANGAN</Text>
                <TextInput 
                  placeholder="Catatan tambahan perpindahan..." 
                  style={[styles.textInput, { height: 64, textAlignVertical: 'top', paddingTop: 8 }]} 
                  multiline 
                  value={form.keterangan} 
                  onChangeText={(val) => setForm({ ...form, keterangan: val })} 
                />
              </View>
            </View>
          )}

          {showDatePicker && (
            <DateTimePicker 
              value={dateField === 'tanggal_lahir' ? new Date(form.tanggal_lahir) : new Date(form.tanggal_mutasi)} 
              mode="date" 
              display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
              onChange={handleDateChange} 
              maximumDate={new Date()} 
            />
          )}

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.btnDraft, loading && styles.btnDisabled]} 
              onPress={handleSaveDraftDirectly}
              disabled={loading}
            >
              <Text style={styles.btnDraftText}>Simpan Draf</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btn, styles.btnSubmit, loading && styles.btnDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnSubmitText}>Simpan</Text>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtnActive: {
    backgroundColor: '#124170',
    borderColor: '#124170',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  textInput: {
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  dateSelectorText: {
    fontSize: 13,
    color: '#0F172A',
  },
  wargaSelectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  wargaSelectedInfo: {
    flex: 1,
  },
  wargaSelectedName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
  wargaSelectedNik: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },
  wargaSelectedRt: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
  },
  removeWargaButton: {
    padding: 4,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  searchResultsList: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  searchItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  searchItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  noResultsText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  alertText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnActive: {
    backgroundColor: '#67C090',
    borderColor: '#67C090',
  },
  genderBtnText: {
    fontSize: 13,
    color: '#64748B',
  },
  genderBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
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
    backgroundColor: '#67C090',
    borderColor: '#67C090',
  },
  selectOptionText: {
    fontSize: 12,
    color: '#475569',
  },
  selectOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkboxBox: {
    height: 18,
    width: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxBoxActive: {
    backgroundColor: '#124170',
    borderColor: '#124170',
  },
  checkboxText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  newKkSection: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDraft: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  btnDraftText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  btnSubmit: {
    backgroundColor: '#67C090',
  },
  btnSubmitText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.6,
  }
});
