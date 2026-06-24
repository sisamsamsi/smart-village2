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
import { useCreateKelahiran } from '@/hooks/useKelahiran';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Search,
  Calendar as CalendarIcon,
  X,
  Check
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

export default function TambahKelahiranScreen() {
  const router = useRouter();
  const createKelahiran = useCreateKelahiran();

  const [loading, setLoading] = useState(false);

  // Search Mother state
  const [ibuSearch, setIbuSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedIbu, setSelectedIbu] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  // NIK temporary state
  const [isTemporaryNik, setIsTemporaryNik] = useState(false);

  // Date Picker
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form State
  const [form, setForm] = useState({
    nama_bayi: '',
    nik_bayi: '',
    jenis_kelamin_bayi: 'L' as 'L' | 'P',
    tanggal_lahir_bayi: new Date().toISOString().split('T')[0],
    bb_lahir: '',
    tb_lahir: '',
    nama_ibu: '',
    nama_ayah: '',
    rumah_tangga_id: '',
    rt_id: ''
  });

  const handleSearchIbu = async (text: string) => {
    setIbuSearch(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    
    // Fetch active female residents
    const { data, error } = await supabase
      .from('wargas')
      .select('id, nama_lengkap, nik, rt_id, rumah_tangga_id, rts(nomor_rt), rumah_tanggas(no_kk, alamat_detail)')
      .eq('jenis_kelamin', 'P')
      .eq('status_warga', 'aktif')
      .or(`nama_lengkap.ilike.%${text}%,nik.like.%${text}%`)
      .limit(5);

    if (!error && data) {
      setSearchResults(data);
    }
    setSearching(false);
  };

  const selectIbu = (ibu: any) => {
    setSelectedIbu(ibu);
    setForm(prev => ({
      ...prev,
      nama_ibu: ibu.nama_lengkap,
      rumah_tangga_id: ibu.rumah_tangga_id || '',
      rt_id: ibu.rt_id || ''
    }));
    setIbuSearch('');
    setSearchResults([]);
  };

  const generateTemporaryNik = () => {
    // Generate 12 random digits after '3402' prefix
    const randomDigits = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    return `3402${randomDigits}`;
  };

  const toggleTemporaryNik = () => {
    const nextVal = !isTemporaryNik;
    setIsTemporaryNik(nextVal);
    if (nextVal) {
      setForm(prev => ({ ...prev, nik_bayi: generateTemporaryNik() }));
    } else {
      setForm(prev => ({ ...prev, nik_bayi: '' }));
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (!selectedDate) return;
    const formattedDate = selectedDate.toISOString().split('T')[0];
    setForm(prev => ({ ...prev, tanggal_lahir_bayi: formattedDate }));
  };

  const handleSubmit = async () => {
    if (!selectedIbu) {
      Alert.alert('Peringatan', 'Silakan cari dan pilih ibu kandung terlebih dahulu.');
      return;
    }
    if (!form.nama_bayi) {
      Alert.alert('Peringatan', 'Nama bayi wajib diisi.');
      return;
    }
    if (!form.nik_bayi) {
      Alert.alert('Peringatan', 'NIK bayi wajib diisi.');
      return;
    }
    if (form.nik_bayi.length !== 16) {
      Alert.alert('Peringatan', 'NIK harus terdiri dari 16 digit.');
      return;
    }
    if (!form.bb_lahir || !form.tb_lahir) {
      Alert.alert('Peringatan', 'Berat badan dan tinggi badan lahir wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      await createKelahiran.mutateAsync({
        nama_bayi: form.nama_bayi,
        nik_bayi: form.nik_bayi,
        jenis_kelamin_bayi: form.jenis_kelamin_bayi,
        tanggal_lahir_bayi: form.tanggal_lahir_bayi,
        bb_lahir: parseFloat(form.bb_lahir),
        tb_lahir: parseFloat(form.tb_lahir),
        nama_ibu: form.nama_ibu,
        nama_ayah: form.nama_ayah,
        rumah_tangga_id: form.rumah_tangga_id,
        rt_id: form.rt_id
      });

      Alert.alert('Berhasil', 'Pencatatan kelahiran bayi berhasil disimpan.');
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1E293B" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catat Kelahiran Bayi</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* 1. Pilih Ibu Kandung */}
          {selectedIbu ? (
            <View style={styles.wargaSelectedCard}>
              <View style={styles.wargaSelectedInfo}>
                <Text style={styles.fieldLabel}>IBU KANDUNG SELESAI DIPILIH</Text>
                <Text style={styles.wargaSelectedName}>{selectedIbu.nama_lengkap}</Text>
                <Text style={styles.wargaSelectedNik}>NIK: {selectedIbu.nik || '-'}</Text>
                <Text style={styles.wargaSelectedRt}>
                  RT {selectedIbu.rts?.nomor_rt ?? '-'} • KK: {selectedIbu.rumah_tanggas?.no_kk ?? '-'}
                </Text>
                {selectedIbu.rumah_tanggas?.alamat_detail && (
                  <Text style={styles.wargaSelectedAddress}>{selectedIbu.rumah_tanggas.alamat_detail}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setSelectedIbu(null)} style={styles.removeWargaButton}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>CARI IBU KANDUNG (WARGA AKTIF) *</Text>
              <View style={styles.searchInputWrapper}>
                <Search size={18} color="#94A3B8" style={{ marginLeft: 12 }} />
                <TextInput 
                  placeholder="Ketik NIK atau nama ibu kandung..." 
                  style={styles.searchInput} 
                  value={ibuSearch} 
                  onChangeText={handleSearchIbu} 
                />
                {searching && <ActivityIndicator size="small" color="#67C090" style={{ marginRight: 12 }} />}
              </View>
              {searchResults.length > 0 && (
                <View style={styles.searchResultsList}>
                  {searchResults.map((w) => (
                    <TouchableOpacity key={w.id} onPress={() => selectIbu(w)} style={styles.searchItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.searchItemName}>{w.nama_lengkap}</Text>
                        <Text style={styles.searchItemSub}>NIK: {w.nik || '-'} • RT {w.rts?.nomor_rt}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {ibuSearch.length >= 2 && searchResults.length === 0 && !searching && (
                <Text style={styles.noResultsText}>Ibu tidak ditemukan atau tidak aktif.</Text>
              )}
            </View>
          )}

          {/* 2. Form Data Bayi */}
          <View style={{ marginTop: 8 }}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NAMA BAYI *</Text>
              <TextInput 
                placeholder="Nama Lengkap Bayi" 
                style={styles.textInput} 
                value={form.nama_bayi} 
                onChangeText={(val) => setForm({ ...form, nama_bayi: val })} 
              />
            </View>

            {/* NIK Bayi & Checkbox NIK Sementara */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NOMOR INDUK KEPENDUDUKAN (NIK) BAYI *</Text>
              <TextInput 
                placeholder="16 digit NIK bayi" 
                style={styles.textInput} 
                value={form.nik_bayi} 
                onChangeText={(val) => setForm({ ...form, nik_bayi: val })} 
                keyboardType="numeric"
                maxLength={16}
                editable={!isTemporaryNik}
              />
              <View style={styles.checkboxRow}>
                <TouchableOpacity 
                  onPress={toggleTemporaryNik}
                  style={[styles.checkboxBox, isTemporaryNik && styles.checkboxBoxActive]}
                >
                  {isTemporaryNik && <Check size={14} color="#fff" />}
                </TouchableOpacity>
                <Text style={styles.checkboxText}>Belum memiliki NIK (Gunakan NIK Sementara)</Text>
              </View>
            </View>

            {/* Gender & Tanggal Lahir */}
            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.fieldLabel}>JENIS KELAMIN *</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity 
                    onPress={() => setForm({ ...form, jenis_kelamin_bayi: 'L' })}
                    style={[styles.genderBtn, form.jenis_kelamin_bayi === 'L' && styles.genderBtnActive]}
                  >
                    <Text style={[styles.genderBtnText, form.jenis_kelamin_bayi === 'L' && styles.genderBtnTextActive]}>Pria</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setForm({ ...form, jenis_kelamin_bayi: 'P' })}
                    style={[styles.genderBtn, form.jenis_kelamin_bayi === 'P' && styles.genderBtnActive]}
                  >
                    <Text style={[styles.genderBtnText, form.jenis_kelamin_bayi === 'P' && styles.genderBtnTextActive]}>Wanita</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.half}>
                <Text style={styles.fieldLabel}>TANGGAL LAHIR *</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateSelector}>
                  <CalendarIcon size={16} color="#64748B" style={{ marginRight: 8 }} />
                  <Text style={styles.dateSelectorText}>{form.tanggal_lahir_bayi}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* BB Lahir & TB Lahir */}
            <View style={[styles.row, { marginTop: 16 }]}>
              <View style={styles.half}>
                <Text style={styles.fieldLabel}>BERAT BADAN LAHIR (KG) *</Text>
                <TextInput 
                  placeholder="Contoh: 3.1" 
                  keyboardType="numeric"
                  style={styles.textInput} 
                  value={form.bb_lahir} 
                  onChangeText={(val) => setForm({ ...form, bb_lahir: val })} 
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.fieldLabel}>TINGGI BADAN LAHIR (CM) *</Text>
                <TextInput 
                  placeholder="Contoh: 49" 
                  keyboardType="numeric"
                  style={styles.textInput} 
                  value={form.tb_lahir} 
                  onChangeText={(val) => setForm({ ...form, tb_lahir: val })} 
                />
              </View>
            </View>

            {/* Nama Ayah */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NAMA AYAH</Text>
              <TextInput 
                placeholder="Nama Lengkap Ayah" 
                style={styles.textInput} 
                value={form.nama_ayah} 
                onChangeText={(val) => setForm({ ...form, nama_ayah: val })} 
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.btnDraft, loading && styles.btnDisabled]} 
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.btnDraftText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btn, styles.btnSubmit, loading && styles.btnDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnSubmitText}>Simpan Kelahiran</Text>
              )}
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker 
              value={new Date(form.tanggal_lahir_bayi)} 
              mode="date" 
              display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
              onChange={handleDateChange} 
              maximumDate={new Date()} 
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
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
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
