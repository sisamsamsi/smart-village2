import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateSurat } from '@/hooks/useSurat';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Search,
  CheckCircle2,
  FileText,
  User,
  Info,
  X,
  CreditCard,
  ChevronRight,
  Stamp
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AddSuratScreen() {
  const router = useRouter();
  const createSurat = useCreateSurat();
  const templates = [
    { id: '1', jenis_surat: 'pengantar_rt', judul: 'Surat Pengantar RT' },
    { id: '2', jenis_surat: 'domisili', judul: 'Surat Keterangan Domisili' }
  ];
  
  const [wargaSearch, setWargaSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedWarga, setSelectedWarga] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const [form, setForm] = useState({
    jenis_surat: 'pengantar_rt',
    keperluan: '',
    warga_id: '',
    nomor_surat: ''
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
    if (!form.warga_id) {
      Alert.alert('Eror', 'Silakan cari dan pilih warga.');
      return;
    }

    if (!form.nomor_surat) {
      Alert.alert('Eror', 'Silakan isi nomor surat.');
      return;
    }

    if (!form.keperluan) {
      Alert.alert('Eror', 'Silakan isi keperluan surat.');
      return;
    }

    try {
      await createSurat.mutateAsync(form);
      Alert.alert('Berhasil', 'Surat berhasil diterbitkan.');
      router.back();
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal menerbitkan surat.');
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
              <ArrowLeft color="#67C090" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Buat Layanan</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.content}>
            {/* Top Illustration Card */}
            <View style={styles.heroCard}>
              <View style={styles.iconCircle}>
                <Stamp size={32} color="#fff" />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Terbitkan Surat RT</Text>
                <Text style={styles.heroSubtitle}>Buat surat pengantar atau domisili untuk warga wilayah RT Anda.</Text>
              </View>
            </View>

            <View style={styles.formCard}>
              {/* Warga Search */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>NAMA WARGA</Text>
                {selectedWarga ? (
                  <View style={styles.selectedWargaCard}>
                    <View style={styles.wargaAvatar}>
                      <User color="#fff" size={20} />
                    </View>
                    <View style={styles.wargaInfo}>
                      <Text style={styles.wargaName}>{selectedWarga.nama_lengkap}</Text>
                      <Text style={styles.wargaSub}>NIK: {selectedWarga.nik}</Text>
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
                      {searching && <ActivityIndicator size="small" color="#67C090" style={{ marginRight: 16 }} />}
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
                            <ChevronRight size={16} color="#E2E8F0" />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Template Selector */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>JENIS LAYANAN SURAT</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateScroll}>
                  {(templates || []).map((t: any) => (
                    <TouchableOpacity 
                      key={t.id}
                      onPress={() => setForm({...form, jenis_surat: t.jenis_surat})}
                      style={[styles.templateChip, form.jenis_surat === t.jenis_surat && styles.templateChipActive]}
                    >
                      <Text style={[styles.templateText, form.jenis_surat === t.jenis_surat && styles.templateTextActive]}>
                        {(t.judul || t.jenis_surat || '').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Nomor Surat */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>NOMOR SURAT</Text>
                <TextInput
                  placeholder="Contoh: 001/RT-01/VI/2026"
                  style={styles.input}
                  value={form.nomor_surat}
                  onChangeText={(val) => setForm({...form, nomor_surat: val})}
                />
              </View>

              {/* Keperluan */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>KEPERLUAN / TUJUAN</Text>
                <TextInput
                  placeholder="Contoh: Mengurus KK Baru, Jaminan Kesehatan, dll..."
                  multiline
                  style={[styles.input, styles.textArea]}
                  textAlignVertical="top"
                  value={form.keperluan}
                  onChangeText={(val) => setForm({...form, keperluan: val})}
                />
              </View>

              <TouchableOpacity 
                onPress={handleSubmit}
                disabled={createSurat.isPending}
                style={styles.submitButton}
              >
                {createSurat.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <CheckCircle2 size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>TERBITKAN SURAT</Text>
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
  heroCard: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    height: 64,
    width: 64,
    borderRadius: 22,
    backgroundColor: '#67C090',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    marginLeft: 20,
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 18,
  },
  formCard: {
    gap: 24,
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
  selectedWargaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  wargaAvatar: {
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: '#67C090',
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
    color: '#1E293B',
  },
  wargaSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  removeWarga: {
    height: 32,
    width: 32,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
  templateScroll: {
    paddingBottom: 4,
  },
  templateChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  templateChipActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  templateText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  templateTextActive: {
    color: '#fff',
  },
  input: {
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
    height: 120,
  },
  submitButton: {
    height: 64,
    backgroundColor: '#67C090',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#67C090',
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
