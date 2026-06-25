import React, { useState } from 'react';
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
import { useCreateKehamilan } from '@/hooks/useKehamilan';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  ArrowRight,
  Search,
  Calendar as CalendarIcon,
  User,
  Info,
  X,
  Check
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

export default function TambahKehamilanScreen() {
  const router = useRouter();
  const createKehamilan = useCreateKehamilan();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Search state for WUS (Wanita Usia Subur)
  const [wargaSearch, setWargaSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedWarga, setSelectedWarga] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  // Date Pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState<'tanggal_mutasi' | 'hpht' | 'hpl' | null>(null);

  // Form State
  const [form, setForm] = useState({
    tanggal_mutasi: new Date().toISOString().split('T')[0],
    hpht: new Date().toISOString().split('T')[0],
    hpl: '', // auto calculated but modifiable
    bb_awal: '',
    tinggi_badan: '',
    jarak_pernikahan_tahun: '',
    jarak_pernikahan_bulan: '',
    golongan_darah: 'O',
    alergi: '',
    no_jkn: '',
    faskes: '',
    pendidikan: '',
    catatan: ''
  });

  const handleSearchWarga = async (text: string) => {
    setWargaSearch(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    
    // Fetch female residents (jenis_kelamin = P)
    const { data, error } = await supabase
      .from('wargas')
      .select('id, nama_lengkap, nik, tanggal_lahir, rts(nomor_rt), rumah_tanggas(no_kk, alamat_detail)')
      .eq('jenis_kelamin', 'P')
      .eq('status_warga', 'aktif')
      .or(`nama_lengkap.ilike.%${text}%,nik.like.%${text}%`)
      .limit(10);

    if (!error && data) {
      // Filter for WUS (age 15-49 years) on the client-side for accuracy and simplicity
      const today = new Date();
      const filtered = data.filter(w => {
        if (!w.tanggal_lahir) return false;
        const birthDate = new Date(w.tanggal_lahir);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 15 && age <= 49;
      });
      setSearchResults(filtered);
    }
    setSearching(false);
  };

  const selectWarga = (warga: any) => {
    setSelectedWarga(warga);
    setWargaSearch('');
    setSearchResults([]);
  };

  const openDatePicker = (field: 'tanggal_mutasi' | 'hpht' | 'hpl') => {
    setDateField(field);
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (!selectedDate) return;
    const formattedDate = selectedDate.toISOString().split('T')[0];
    
    setForm(prev => {
      const updated = { ...prev };
      if (dateField === 'tanggal_mutasi') {
        updated.tanggal_mutasi = formattedDate;
      } else if (dateField === 'hpht') {
        updated.hpht = formattedDate;
        // Auto-calculate HPL: HPHT + 280 days
        const hplDate = new Date(selectedDate);
        hplDate.setDate(hplDate.getDate() + 280);
        updated.hpl = hplDate.toISOString().split('T')[0];
      } else if (dateField === 'hpl') {
        updated.hpl = formattedDate;
      }
      return updated;
    });
    
    setDateField(null);
  };

  const handleNextStep = () => {
    if (!selectedWarga) {
      Alert.alert('Peringatan', 'Silakan cari dan pilih ibu hamil terlebih dahulu.');
      return;
    }
    // Initialize HPL based on HPHT if HPL is empty
    if (!form.hpl && form.hpht) {
      const hphtDate = new Date(form.hpht);
      const hplDate = new Date(hphtDate);
      hplDate.setDate(hplDate.getDate() + 280);
      setForm(prev => ({ ...prev, hpl: hplDate.toISOString().split('T')[0] }));
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.hpht) {
      Alert.alert('Peringatan', 'Tanggal HPHT wajib diisi.');
      return;
    }
    if (!form.hpl) {
      Alert.alert('Peringatan', 'Estimasi Lahir (HPL) wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      // Serialize medical data as JSON into keterangan field
      const keteranganObj = {
        bb_awal: form.bb_awal ? parseFloat(form.bb_awal) : null,
        tinggi_badan: form.tinggi_badan ? parseFloat(form.tinggi_badan) : null,
        jarak_pernikahan_tahun: form.jarak_pernikahan_tahun ? parseInt(form.jarak_pernikahan_tahun) : null,
        jarak_pernikahan_bulan: form.jarak_pernikahan_bulan ? parseInt(form.jarak_pernikahan_bulan) : null,
        golongan_darah: form.golongan_darah,
        alergi: form.alergi || null,
        no_jkn: form.no_jkn || null,
        faskes: form.faskes || null,
        pendidikan: form.pendidikan || null,
        catatan: form.catatan || null
      };

      await createKehamilan.mutateAsync({
        warga_id: selectedWarga.id,
        tanggal_mutasi: form.tanggal_mutasi,
        hpht: form.hpht,
        hpl: form.hpl,
        keterangan: JSON.stringify(keteranganObj)
      });

      Alert.alert('Berhasil', 'Data kehamilan warga berhasil dicatat.');
      router.back();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Gagal', err.message || 'Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 2 ? setStep(1) : router.back()} style={styles.backButton}>
          <ArrowLeft color="#1E293B" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catat Kehamilan Baru</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepContainer}>
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
            <Text style={[styles.stepDotText, step >= 1 && styles.stepDotTextActive]}>1</Text>
          </View>
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
            <Text style={[styles.stepDotText, step >= 2 && styles.stepDotTextActive]}>2</Text>
          </View>
        </View>
        <View style={styles.stepLabels}>
          <Text style={[styles.stepLabel, step === 1 && styles.stepLabelActive]}>Pilih Ibu Hamil</Text>
          <Text style={[styles.stepLabel, step === 2 && styles.stepLabelActive]}>Data Pemeriksaan Medis</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* STEP 1: PILIH IBU HAMIL */}
          {step === 1 && (
            <View>
              {/* Tanggal Pencatatan */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>TANGGAL PENCATATAN</Text>
                <TouchableOpacity onPress={() => openDatePicker('tanggal_mutasi')} style={styles.dateSelector}>
                  <CalendarIcon size={16} color="#64748B" style={{ marginRight: 8 }} />
                  <Text style={styles.dateSelectorText}>{form.tanggal_mutasi}</Text>
                </TouchableOpacity>
              </View>

              {selectedWarga ? (
                <View style={styles.wargaSelectedCard}>
                  <View style={styles.wargaSelectedInfo}>
                    <Text style={styles.wargaSelectedName}>{selectedWarga.nama_lengkap}</Text>
                    <Text style={styles.wargaSelectedNik}>NIK: {selectedWarga.nik || '-'}</Text>
                    <Text style={styles.wargaSelectedRt}>
                      RT {selectedWarga.rts?.nomor_rt ?? '-'} • KK: {selectedWarga.rumah_tanggas?.no_kk ?? '-'}
                    </Text>
                    {selectedWarga.rumah_tanggas?.alamat_detail && (
                      <Text style={styles.wargaSelectedAddress}>{selectedWarga.rumah_tanggas.alamat_detail}</Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => setSelectedWarga(null)} style={styles.removeWargaButton}>
                    <X size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>CARI IBU (WUS 15-49 TAHUN)</Text>
                  <View style={styles.searchInputWrapper}>
                    <Search size={18} color="#94A3B8" style={{ marginLeft: 12 }} />
                    <TextInput 
                      placeholder="Ketik NIK atau nama ibu..." 
                      style={styles.searchInput} 
                      value={wargaSearch} 
                      onChangeText={handleSearchWarga} 
                    />
                    {searching && <ActivityIndicator size="small" color="#124170" style={{ marginRight: 12 }} />}
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
                    <Text style={styles.noResultsText}>Ibu tidak ditemukan atau umur di luar WUS (15-49).</Text>
                  )}
                </View>
              )}

              <TouchableOpacity style={styles.nextBtn} onPress={handleNextStep}>
                <Text style={styles.nextBtnText}>Lanjutkan ke Data Medis</Text>
                <ArrowRight size={16} color="#fff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: DATA PEMERIKSAAN MEDIS */}
          {step === 2 && (
            <View>
              <View style={styles.medisHeader}>
                <User size={16} color="#1E293B" style={{ marginRight: 6 }} />
                <Text style={styles.medisHeaderText}>Ibu: {selectedWarga?.nama_lengkap}</Text>
              </View>

              {/* Tanggal HPHT */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>HARI PERTAMA HAID TERAKHIR (HPHT) *</Text>
                <TouchableOpacity onPress={() => openDatePicker('hpht')} style={styles.dateSelector}>
                  <CalendarIcon size={16} color="#64748B" style={{ marginRight: 8 }} />
                  <Text style={styles.dateSelectorText}>{form.hpht}</Text>
                </TouchableOpacity>
              </View>

              {/* Estimasi Lahir HPL */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>ESTIMASI LAHIR (HPL) *</Text>
                <TouchableOpacity onPress={() => openDatePicker('hpl')} style={styles.dateSelector}>
                  <CalendarIcon size={16} color="#64748B" style={{ marginRight: 8 }} />
                  <Text style={styles.dateSelectorText}>{form.hpl}</Text>
                </TouchableOpacity>
                <Text style={styles.fieldHelper}>Dihitung otomatis 280 hari dari HPHT (dapat disesuaikan jika perlu).</Text>
              </View>

              {/* BB Awal & TB */}
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>BB AWAL (KG)</Text>
                  <TextInput 
                    placeholder="Contoh: 52" 
                    keyboardType="numeric"
                    style={styles.textInput} 
                    value={form.bb_awal} 
                    onChangeText={(val) => setForm({ ...form, bb_awal: val })} 
                  />
                </View>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>TINGGI BADAN (CM)</Text>
                  <TextInput 
                    placeholder="Contoh: 158" 
                    keyboardType="numeric"
                    style={styles.textInput} 
                    value={form.tinggi_badan} 
                    onChangeText={(val) => setForm({ ...form, tinggi_badan: val })} 
                  />
                </View>
              </View>

              {/* Jarak Pernikahan */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>JARAK PERNIKAHAN DENGAN KEHAMILAN</Text>
                <View style={styles.row}>
                  <View style={styles.half}>
                    <View style={styles.inputWithSuffix}>
                      <TextInput 
                        placeholder="0" 
                        keyboardType="numeric"
                        style={styles.textInputSuffix} 
                        value={form.jarak_pernikahan_tahun} 
                        onChangeText={(val) => setForm({ ...form, jarak_pernikahan_tahun: val })} 
                      />
                      <Text style={styles.suffixText}>Tahun</Text>
                    </View>
                  </View>
                  <View style={styles.half}>
                    <View style={styles.inputWithSuffix}>
                      <TextInput 
                        placeholder="0" 
                        keyboardType="numeric"
                        style={styles.textInputSuffix} 
                        value={form.jarak_pernikahan_bulan} 
                        onChangeText={(val) => setForm({ ...form, jarak_pernikahan_bulan: val })} 
                      />
                      <Text style={styles.suffixText}>Bulan</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Golongan Darah */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>GOLONGAN DARAH</Text>
                <View style={styles.selectRow}>
                  {['A', 'B', 'AB', 'O', 'Tidak Tahu'].map((gol) => (
                    <TouchableOpacity 
                      key={gol} 
                      style={[styles.selectOption, form.golongan_darah === gol && styles.selectOptionActive]}
                      onPress={() => setForm({ ...form, golongan_darah: gol })}
                    >
                      <Text style={[styles.selectOptionText, form.golongan_darah === gol && styles.selectOptionTextActive]}>
                        {gol}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Alergi */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>ALERGI (JIKA ADA)</Text>
                <TextInput 
                  placeholder="Contoh: Alergi udang, penisilin" 
                  style={styles.textInput} 
                  value={form.alergi} 
                  onChangeText={(val) => setForm({ ...form, alergi: val })} 
                />
              </View>

              {/* JKN & Faskes */}
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>NO. JKN / BPJS</Text>
                  <TextInput 
                    placeholder="Nomer kepesertaan" 
                    keyboardType="numeric"
                    style={styles.textInput} 
                    value={form.no_jkn} 
                    onChangeText={(val) => setForm({ ...form, no_jkn: val })} 
                  />
                </View>
                <View style={styles.half}>
                  <Text style={styles.fieldLabel}>FASKES RUJUKAN</Text>
                  <TextInput 
                    placeholder="Contoh: Puskesmas" 
                    style={styles.textInput} 
                    value={form.faskes} 
                    onChangeText={(val) => setForm({ ...form, faskes: val })} 
                  />
                </View>
              </View>

              {/* Pendidikan Terakhir */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>PENDIDIKAN TERAKHIR IBU</Text>
                <TextInput 
                  placeholder="SD, SMP, SMA, S1, dll." 
                  style={styles.textInput} 
                  value={form.pendidikan} 
                  onChangeText={(val) => setForm({ ...form, pendidikan: val })} 
                />
              </View>

              {/* Catatan / Keterangan */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>CATATAN TAMBAHAN</Text>
                <TextInput 
                  placeholder="Keterangan kondisi kesehatan ibu..." 
                  style={[styles.textInput, { height: 64, textAlignVertical: 'top', paddingTop: 8 }]} 
                  multiline 
                  value={form.catatan} 
                  onChangeText={(val) => setForm({ ...form, catatan: val })} 
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity 
                  style={[styles.btn, styles.btnDraft, loading && styles.btnDisabled]} 
                  onPress={() => setStep(1)}
                  disabled={loading}
                >
                  <Text style={styles.btnDraftText}>Kembali</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, styles.btnSubmit, loading && styles.btnDisabled]} 
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.btnSubmitText}>Simpan Kehamilan</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {showDatePicker && (
            <DateTimePicker 
              value={
                dateField === 'hpht' 
                  ? new Date(form.hpht) 
                  : dateField === 'hpl' && form.hpl 
                    ? new Date(form.hpl) 
                    : new Date(form.tanggal_mutasi)
              } 
              mode="date" 
              display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
              onChange={handleDateChange} 
              maximumDate={dateField === 'hpl' ? undefined : new Date()} 
            />
          )}

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
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  stepDot: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#124170',
  },
  stepDotText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  stepDotTextActive: {
    color: '#fff',
  },
  stepLine: {
    flex: 1,
    maxWidth: 100,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#124170',
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    flex: 1,
  },
  stepLabelActive: {
    color: '#124170',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 150,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  fieldHelper: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
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
  wargaSelectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  wargaSelectedInfo: {
    flex: 1,
  },
  wargaSelectedName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  wargaSelectedNik: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  wargaSelectedRt: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  wargaSelectedAddress: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  removeWargaButton: {
    padding: 6,
    marginLeft: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
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
  nextBtn: {
    backgroundColor: '#124170',
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  medisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  medisHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
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
    marginBottom: 16,
  },
  inputWithSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 16,
  },
  textInputSuffix: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  suffixText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    paddingRight: 12,
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
    backgroundColor: '#124170',
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
