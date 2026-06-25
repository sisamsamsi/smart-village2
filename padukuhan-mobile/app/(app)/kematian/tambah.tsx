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
import { useCreateKematian } from '@/hooks/useKematian';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Search,
  Calendar as CalendarIcon,
  X
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

export default function TambahKematianScreen() {
  const router = useRouter();
  const createKematian = useCreateKematian();

  const [loading, setLoading] = useState(false);

  // Search Warga state
  const [wargaSearch, setWargaSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedWarga, setSelectedWarga] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  // Date Picker
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form State
  const [form, setForm] = useState({
    warga_id: '',
    tanggal_mutasi: new Date().toISOString().split('T')[0],
    sebab_meninggal: 'Sakit',
    sebab_meninggal_detail: '',
    keterangan: ''
  });

  const handleSearchWarga = async (text: string) => {
    setWargaSearch(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    
    // Fetch active residents
    const { data, error } = await supabase
      .from('wargas')
      .select('id, nama_lengkap, nik, rts(nomor_rt), status_dalam_keluarga')
      .eq('status_warga', 'aktif')
      .or(`nama_lengkap.ilike.%${text}%,nik.like.%${text}%`)
      .limit(5);

    if (!error && data) {
      setSearchResults(data);
    }
    setSearching(false);
  };

  const selectWarga = (warga: any) => {
    setSelectedWarga(warga);
    setForm(prev => ({ ...prev, warga_id: warga.id }));
    setWargaSearch('');
    setSearchResults([]);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (!selectedDate) return;
    const formattedDate = selectedDate.toISOString().split('T')[0];
    setForm(prev => ({ ...prev, tanggal_mutasi: formattedDate }));
  };

  const handleSubmit = async () => {
    if (!selectedWarga) {
      Alert.alert('Peringatan', 'Silakan cari dan pilih warga terlebih dahulu.');
      return;
    }
    if (!form.tanggal_mutasi) {
      Alert.alert('Peringatan', 'Tanggal wafat wajib diisi.');
      return;
    }

    const sebab = form.sebab_meninggal === 'Lainnya' 
      ? form.sebab_meninggal_detail 
      : form.sebab_meninggal;

    if (!sebab) {
      Alert.alert('Peringatan', 'Silakan tentukan sebab meninggal.');
      return;
    }

    setLoading(true);
    try {
      await createKematian.mutateAsync({
        warga_id: form.warga_id,
        tanggal_mutasi: form.tanggal_mutasi,
        sebab_meninggal: sebab,
        keterangan: form.keterangan
      });

      Alert.alert('Berhasil', 'Pencatatan kematian warga berhasil disimpan.');
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
        <Text style={styles.headerTitle}>Catat Kematian Warga</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* 1. Pilih Warga */}
          {selectedWarga ? (
            <View style={styles.wargaSelectedCard}>
              <View style={styles.wargaSelectedInfo}>
                <Text style={styles.fieldLabel}>WARGA TERPILIH</Text>
                <Text style={styles.wargaSelectedName}>{selectedWarga.nama_lengkap}</Text>
                <Text style={styles.wargaSelectedNik}>NIK: {selectedWarga.nik || '-'}</Text>
                <Text style={styles.wargaSelectedRt}>
                  RT {selectedWarga.rts?.nomor_rt ?? '-'} • {selectedWarga.status_dalam_keluarga ? selectedWarga.status_dalam_keluarga.replace(/_/g, ' ').toUpperCase() : '-'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedWarga(null)} style={styles.removeWargaButton}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>CARI WARGA (WARGA AKTIF) *</Text>
              <View style={styles.searchInputWrapper}>
                <Search size={18} color="#94A3B8" style={{ marginLeft: 12 }} />
                <TextInput 
                  placeholder="Ketik NIK atau nama warga..." 
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
                <Text style={styles.noResultsText}>Warga tidak ditemukan atau status meninggal.</Text>
              )}
            </View>
          )}

          {/* 2. Form Data Kematian */}
          <View style={{ marginTop: 8 }}>
            {/* Tanggal Wafat */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>TANGGAL WAFAT *</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateSelector}>
                <CalendarIcon size={16} color="#64748B" style={{ marginRight: 8 }} />
                <Text style={styles.dateSelectorText}>{form.tanggal_mutasi}</Text>
              </TouchableOpacity>
            </View>

            {/* Sebab Meninggal */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>SEBAB MENINGGAL *</Text>
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

            {/* Keterangan Tambahan */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>KETERANGAN / CATATAN LAIN</Text>
              <TextInput 
                placeholder="Contoh: Lokasi makam, jam wafat, dll." 
                style={[styles.textInput, { height: 64, textAlignVertical: 'top', paddingTop: 8 }]} 
                multiline 
                value={form.keterangan} 
                onChangeText={(val) => setForm({ ...form, keterangan: val })} 
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
                <Text style={styles.btnSubmitText}>Simpan Kematian</Text>
              )}
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker 
              value={new Date(form.tanggal_mutasi)} 
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
