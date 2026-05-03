import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateMutasi } from '@/hooks/useMutasi';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Baby, 
  Skull, 
  ArrowRightLeft, 
  Search,
  CheckCircle2,
  Calendar as CalendarIcon,
  User,
  Info,
  X,
  CreditCard,
  MapPin,
  FileText
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
type MutationType = 'kelahiran' | 'kematian' | 'pindah_keluar' | 'pindah_masuk';

export default function AddMutasiScreen() {
  const router = useRouter();
  const createMutasi = useCreateMutasi();
  const [activeTab, setActiveTab] = useState<MutationType>('kelahiran');
  
  const [wargaSearch, setWargaSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedWarga, setSelectedWarga] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const [form, setForm] = useState({
    jenis_mutasi: 'kelahiran' as MutationType,
    tanggal_mutasi: new Date().toISOString().split('T')[0],
    nama_bayi: '',
    jenis_kelamin_bayi: 'L',
    nama_ibu: '',
    nama_ayah: '',
    ada_akte: false,
    sebab_meninggal: '',
    tujuan_daerah: '',
    asal_daerah: '',
    keterangan: '',
    warga_id: ''
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
      .select('id, nama_lengkap, nik, rts(nomor_rt)')
      .ilike('nama_lengkap', `%${text}%`)
      .eq('status_warga', 'aktif')
      .limit(5);
    
    if (!error && data) {
      setSearchResults(data);
    }
    setSearching(false);
  };

  const selectWarga = (warga: any) => {
    setSelectedWarga(warga);
    setForm({ ...form, warga_id: warga.id });
    setWargaSearch('');
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!form.tanggal_mutasi) {
      Alert.alert('Eror', 'Silakan isi tanggal mutasi.');
      return;
    }

    if (activeTab !== 'kelahiran' && !form.warga_id) {
      Alert.alert('Eror', 'Silakan cari dan pilih warga terlebih dahulu.');
      return;
    }

    if (activeTab === 'kelahiran' && !form.nama_bayi) {
      Alert.alert('Eror', 'Silakan isi nama bayi.');
      return;
    }

    try {
      await createMutasi.mutateAsync({ ...form, jenis_mutasi: activeTab });
      Alert.alert('Berhasil', 'Data mutasi berhasil disimpan.');
      router.back();
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal menyimpan data mutasi.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color="#1B5E20" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Input Mutasi</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.content}>
            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TabButton 
                active={activeTab === 'kelahiran'} 
                label="Lahir" 
                icon={<Baby size={16} color={activeTab === 'kelahiran' ? '#fff' : '#64748B'} />}
                onPress={() => setActiveTab('kelahiran')} 
              />
              <TabButton 
                active={activeTab === 'kematian'} 
                label="Wafat" 
                icon={<Skull size={16} color={activeTab === 'kematian' ? '#fff' : '#64748B'} />}
                onPress={() => setActiveTab('kematian')} 
              />
              <TabButton 
                active={activeTab === 'pindah_keluar'} 
                label="Pindah" 
                icon={<ArrowRightLeft size={16} color={activeTab === 'pindah_keluar' ? '#fff' : '#64748B'} />}
                onPress={() => setActiveTab('pindah_keluar')} 
              />
            </View>

            <View style={styles.formCard}>
              {/* Warga Search (Not for Kelahiran) */}
              {activeTab !== 'kelahiran' && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>WARGA YANG BERSANGKUTAN</Text>
                  {selectedWarga ? (
                    <View style={styles.selectedWargaCard}>
                      <View style={styles.wargaAvatar}>
                        <User color="#fff" size={20} />
                      </View>
                      <View style={styles.wargaInfo}>
                        <Text style={styles.wargaName}>{selectedWarga.nama_lengkap}</Text>
                        <Text style={styles.wargaSub}>NIK: {selectedWarga.nik} • RT {selectedWarga.rts?.nomor_rt}</Text>
                      </View>
                      <TouchableOpacity onPress={() => setSelectedWarga(null)} style={styles.removeWarga}>
                        <X size={16} color="#64748B" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.searchContainer}>
                      <View style={styles.searchInputWrapper}>
                        <Search size={20} color="#94A3B8" style={{ marginLeft: 16 }} />
                        <TextInput
                          placeholder="Cari nama atau NIK..."
                          style={styles.searchInput}
                          value={wargaSearch}
                          onChangeText={handleSearchWarga}
                        />
                        {searching && <ActivityIndicator size="small" color="#1B5E20" style={{ marginRight: 16 }} />}
                      </View>
                      
                      {searchResults.length > 0 && (
                        <View style={styles.resultsOverlay}>
                          {searchResults.map((w) => (
                            <TouchableOpacity 
                              key={w.id} 
                              onPress={() => selectWarga(w)}
                              style={styles.resultItem}
                            >
                              <View style={styles.resultMain}>
                                <Text style={styles.resultName}>{w.nama_lengkap}</Text>
                                <Text style={styles.resultNik}>NIK: {w.nik}</Text>
                              </View>
                              <View style={styles.rtBadge}>
                                <Text style={styles.rtBadgeText}>RT {w.rts?.nomor_rt}</Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Common Fields */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>TANGGAL PERISTIWA</Text>
                <View style={styles.inputWrapper}>
                  <CalendarIcon size={20} color="#94A3B8" style={{ marginLeft: 16 }} />
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    style={styles.input}
                    value={form.tanggal_mutasi}
                    onChangeText={(val) => setForm({...form, tanggal_mutasi: val})}
                  />
                </View>
              </View>

              {/* Type Specific Fields */}
              {activeTab === 'kelahiran' && (
                <>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>NAMA BAYI</Text>
                    <View style={styles.inputWrapper}>
                      <Baby size={20} color="#94A3B8" style={{ marginLeft: 16 }} />
                      <TextInput
                        placeholder="Nama Lengkap Bayi"
                        style={styles.input}
                        value={form.nama_bayi}
                        onChangeText={(val) => setForm({...form, nama_bayi: val})}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>JENIS KELAMIN</Text>
                    <View style={styles.genderRow}>
                      <TouchableOpacity 
                        onPress={() => setForm({...form, jenis_kelamin_bayi: 'L'})}
                        style={[styles.genderButton, form.jenis_kelamin_bayi === 'L' && styles.genderButtonActive]}
                      >
                        <Text style={[styles.genderText, form.jenis_kelamin_bayi === 'L' && styles.genderTextActive]}>Laki-laki</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => setForm({...form, jenis_kelamin_bayi: 'P'})}
                        style={[styles.genderButton, form.jenis_kelamin_bayi === 'P' && styles.genderButtonActive]}
                      >
                        <Text style={[styles.genderText, form.jenis_kelamin_bayi === 'P' && styles.genderTextActive]}>Perempuan</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>NAMA IBU</Text>
                    <View style={styles.inputWrapper}>
                      <User size={20} color="#94A3B8" style={{ marginLeft: 16 }} />
                      <TextInput
                        placeholder="Nama Lengkap Ibu"
                        style={styles.input}
                        value={form.nama_ibu}
                        onChangeText={(val) => setForm({...form, nama_ibu: val})}
                      />
                    </View>
                  </View>
                </>
              )}

              {activeTab === 'kematian' && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>SEBAB MENINGGAL</Text>
                  <View style={styles.inputWrapper}>
                    <Info size={20} color="#94A3B8" style={{ marginLeft: 16 }} />
                    <TextInput
                      placeholder="Sakit, Usia Lanjut, Kecelakaan, dll"
                      style={styles.input}
                      value={form.sebab_meninggal}
                      onChangeText={(val) => setForm({...form, sebab_meninggal: val})}
                    />
                  </View>
                </View>
              )}

              {activeTab === 'pindah_keluar' && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>DAERAH TUJUAN</Text>
                  <View style={styles.inputWrapper}>
                    <MapPin size={20} color="#94A3B8" style={{ marginLeft: 16 }} />
                    <TextInput
                      placeholder="Contoh: Bantul, Yogyakarta"
                      style={styles.input}
                      value={form.tujuan_daerah}
                      onChangeText={(val) => setForm({...form, tujuan_daerah: val})}
                    />
                  </View>
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>KETERANGAN TAMBAHAN</Text>
                <TextInput
                  placeholder="Tambahkan catatan jika diperlukan..."
                  multiline
                  style={[styles.input, styles.textArea]}
                  textAlignVertical="top"
                  value={form.keterangan}
                  onChangeText={(val) => setForm({...form, keterangan: val})}
                />
              </View>

              <TouchableOpacity 
                onPress={handleSubmit}
                disabled={createMutasi.isPending}
                style={styles.submitButton}
              >
                {createMutasi.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <CheckCircle2 size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>SIMPAN DATA MUTASI</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TabButton({ active, label, icon, onPress }: { active: boolean, label: string, icon: React.ReactNode, onPress: () => void }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      {icon}
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 6,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 16,
  },
  tabButtonActive: {
    backgroundColor: '#1B5E20',
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 8,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '900',
  },
  formCard: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  textArea: {
    height: 100,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  selectedWargaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 20,
  },
  wargaAvatar: {
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wargaInfo: {
    flex: 1,
    marginLeft: 16,
  },
  wargaName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  wargaSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    marginTop: 2,
  },
  removeWarga: {
    height: 32,
    width: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    position: 'relative',
    zIndex: 100,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchInput: {
    flex: 1,
    padding: 16,
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  resultsOverlay: {
    position: 'absolute',
    top: '110%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  resultMain: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  resultNik: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  rtBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rtBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1E293B',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  genderButtonActive: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  genderTextActive: {
    color: '#fff',
    fontWeight: '900',
  },
  submitButton: {
    height: 64,
    backgroundColor: '#1B5E20',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 12,
    letterSpacing: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  }
});
