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
import { supabase } from '@/lib/supabase';
import { useDraftStore } from '@/hooks/useDraftStore';
import { 
  ArrowLeft, 
  ArrowRight,
  Baby, 
  Skull, 
  LogOut, 
  LogIn, 
  Heart,
  Search,
  CheckCircle2,
  Calendar as CalendarIcon,
  User,
  Info,
  X,
  Plus
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');
type MutationType = 'kelahiran' | 'kematian' | 'pindah_keluar' | 'pindah_masuk' | 'kehamilan';

export default function AddMutasiScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ wargaId?: string }>();
  const createMutasi = useCreateMutasi();
  const { addDraft } = useDraftStore();
  
  const [step, setStep] = useState(1); 
  const [activeTab, setActiveTab] = useState<MutationType>('kelahiran');
  const [isSatuKk, setIsSatuKk] = useState(false);
  
  const [wargaSearch, setWargaSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedWarga, setSelectedWarga] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState<'tanggal_mutasi' | 'hpht' | 'tanggal_melahirkan' | null>(null);
  const [showPicker, setShowPicker] = useState(false);

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
    warga_id: '',
    status_kehamilan: 'hamil' as 'hamil' | 'melahirkan' | 'nifas',
    hpht: '',
    hpl: '',
    tanggal_melahirkan: '',
  });

  useEffect(() => {
    if (params.wargaId) {
      const fetchWarga = async () => {
        const { data, error } = await supabase
          .from('wargas')
          .select('id, nama_lengkap, nik, rts(nomor_rt), hubungan_keluarga, jenis_kelamin')
          .eq('id', params.wargaId)
          .single();
        if (!error && data) {
          setSelectedWarga(data);
          setForm(prev => ({ 
            ...prev, 
            warga_id: data.id,
            nama_ibu: data.jenis_kelamin === 'P' ? data.nama_lengkap : prev.nama_ibu
          }));
          if (data.jenis_kelamin === 'P') {
            setActiveTab('kehamilan');
          } else {
            setActiveTab('kematian');
          }
        }
      };
      fetchWarga();
    }
  }, [params.wargaId]);

  const handleSearchWarga = async (text: string) => {
    setWargaSearch(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    let query = supabase
      .from('wargas')
      .select('id, nama_lengkap, nik, rts(nomor_rt), hubungan_keluarga, jenis_kelamin')
      .ilike('nama_lengkap', `%${text}%`)
      .eq('status_warga', 'aktif');
    
    if (activeTab === 'kehamilan') query = query.eq('jenis_kelamin', 'P');
    const { data, error } = await query.limit(5);
    if (!error && data) setSearchResults(data);
    setSearching(false);
  };

  const selectWarga = (warga: any) => {
    setSelectedWarga(warga);
    setForm({ 
      ...form, 
      warga_id: warga.id,
      nama_ibu: activeTab === 'kehamilan' ? warga.nama_lengkap : form.nama_ibu
    });
    setWargaSearch('');
    setSearchResults([]);
  };

  const handleTabChange = (tab: MutationType) => {
    setActiveTab(tab);
    if (!params.wargaId) setSelectedWarga(null);
    setWargaSearch('');
    setSearchResults([]);
    setIsSatuKk(false);
    setForm(prev => ({
      ...prev,
      warga_id: params.wargaId || '',
      nama_bayi: '',
      jenis_kelamin_bayi: 'L',
      nama_ibu: selectedWarga && tab === 'kehamilan' ? selectedWarga.nama_lengkap : '',
      nama_ayah: '',
      ada_akte: false,
      sebab_meninggal: '',
      tujuan_daerah: '',
      asal_daerah: '',
      status_kehamilan: 'hamil',
      hpht: '',
      hpl: '',
      tanggal_melahirkan: '',
    }));
  };

  const getHplDate = (hphtStr: string) => {
    if (!hphtStr) return new Date();
    const date = new Date(hphtStr);
    date.setDate(date.getDate() + 280);
    return date;
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getUsiaKehamilan = (hphtStr: string) => {
    if (!hphtStr) return '-';
    const hpht = new Date(hphtStr);
    const diffMs = new Date().getTime() - hpht.getTime();
    const diffHari = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHari < 0) return 'Belum dimulai';
    return `${Math.floor(diffHari / 7)} minggu ${diffHari % 7} hari`;
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (activeTab !== 'kelahiran' && activeTab !== 'pindah_masuk' && !form.warga_id) {
        Alert.alert('Peringatan', 'Silakan cari dan pilih warga terlebih dahulu.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!form.tanggal_mutasi) {
        Alert.alert('Peringatan', 'Silakan tentukan tanggal peristiwa.');
        return;
      }
      if (activeTab === 'kelahiran' && !form.nama_bayi) {
        Alert.alert('Peringatan', 'Silakan isi nama bayi.');
        return;
      }
      if (activeTab === 'kematian' && !form.sebab_meninggal) {
        Alert.alert('Peringatan', 'Silakan isi sebab meninggal.');
        return;
      }
      if (activeTab === 'pindah_keluar' && !form.tujuan_daerah) {
        Alert.alert('Peringatan', 'Silakan isi daerah tujuan pindah.');
        return;
      }
      if (activeTab === 'kehamilan') {
        if (form.status_kehamilan === 'hamil' && !form.hpht) {
          Alert.alert('Peringatan', 'Silakan isi tanggal HPHT.');
          return;
        }
        if ((form.status_kehamilan === 'melahirkan' || form.status_kehamilan === 'nifas') && !form.tanggal_melahirkan) {
          Alert.alert('Peringatan', 'Silakan isi tanggal melahirkan.');
          return;
        }
      }
      setStep(4);
    } else if (step === 4) {
      handleSubmit();
    }
  };

  const handlePrevStep = () => { if (step > 1) setStep(step - 1); };

  const handleSaveDraftDirectly = () => {
    const payload: any = { ...form, jenis_mutasi: activeTab, is_satu_kk: isSatuKk };
    if (activeTab === 'kehamilan' && form.status_kehamilan === 'hamil') {
      payload.hpl = getHplDate(form.hpht).toISOString().split('T')[0];
    }
    const label = `Mutasi ${activeTab.toUpperCase()} - ${
      activeTab === 'kelahiran' ? form.nama_bayi : (selectedWarga?.nama_lengkap || 'Warga Baru')
    }`;
    addDraft('mutasi', label, payload);
    Alert.alert('Draf Disimpan', 'Data mutasi berhasil disimpan ke draf offline HP Anda.');
    router.back();
  };

  const handleSubmit = async () => {
    const payload: any = { ...form, jenis_mutasi: activeTab, is_satu_kk: isSatuKk };
    if (activeTab === 'kehamilan' && form.status_kehamilan === 'hamil') {
      payload.hpl = getHplDate(form.hpht).toISOString().split('T')[0];
    }

    try {
      await createMutasi.mutateAsync(payload);
      Alert.alert('Berhasil', 'Data mutasi berhasil disimpan.');
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
              const label = `Mutasi ${activeTab.toUpperCase()} - ${
                activeTab === 'kelahiran' ? form.nama_bayi : (selectedWarga?.nama_lengkap || 'Warga Baru')
              }`;
              addDraft('mutasi', label, payload);
              Alert.alert('Draf Disimpan', 'Data disimpan di memori HP. Anda dapat mengirimkannya nanti di dashboard.');
              router.back();
            }
          }
        ]
      );
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (!selectedDate) return;
    const formattedDate = selectedDate.toISOString().split('T')[0];
    if (activeDatePicker === 'tanggal_mutasi') setForm({ ...form, tanggal_mutasi: formattedDate });
    else if (activeDatePicker === 'hpht') setForm({ ...form, hpht: formattedDate });
    else if (activeDatePicker === 'tanggal_melahirkan') setForm({ ...form, tanggal_melahirkan: formattedDate });
    setActiveDatePicker(null);
  };

  const openDatePicker = (field: 'tanggal_mutasi' | 'hpht' | 'tanggal_melahirkan') => {
    setActiveDatePicker(field);
    setShowPicker(true);
  };

  const renderStep3Fields = () => {
    switch (activeTab) {
      case 'kelahiran':
        return (
          <>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NAMA BAYI</Text>
              <TextInput placeholder="Nama Lengkap Bayi" style={styles.textInput} value={form.nama_bayi} onChangeText={(val) => setForm({...form, nama_bayi: val})} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>JENIS KELAMIN</Text>
              <View style={styles.selectionRow}>
                <TouchableOpacity onPress={() => setForm({...form, jenis_kelamin_bayi: 'L'})} style={[styles.selectionButton, form.jenis_kelamin_bayi === 'L' && styles.selectionButtonActive]}><Text style={[styles.selectionText, form.jenis_kelamin_bayi === 'L' && styles.selectionTextActive]}>Laki-laki</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setForm({...form, jenis_kelamin_bayi: 'P'})} style={[styles.selectionButton, form.jenis_kelamin_bayi === 'P' && styles.selectionButtonActive]}><Text style={[styles.selectionText, form.jenis_kelamin_bayi === 'P' && styles.selectionTextActive]}>Perempuan</Text></TouchableOpacity>
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NAMA IBU</Text>
              <TextInput placeholder="Nama Lengkap Ibu Kandung" style={styles.textInput} value={form.nama_ibu} onChangeText={(val) => setForm({...form, nama_ibu: val})} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NAMA AYAH</Text>
              <TextInput placeholder="Nama Lengkap Ayah Kandung" style={styles.textInput} value={form.nama_ayah} onChangeText={(val) => setForm({...form, nama_ayah: val})} />
            </View>
            <TouchableOpacity onPress={() => setForm({...form, ada_akte: !form.ada_akte})} style={[styles.checkboxRow, form.ada_akte && styles.checkboxRowActive]}>
              <View style={[styles.checkbox, form.ada_akte && styles.checkboxActive]}>{form.ada_akte && <CheckCircle2 size={14} color="#fff" />}</View>
              <Text style={[styles.checkboxLabel, form.ada_akte && styles.checkboxLabelActive]}>Memiliki Akte Kelahiran</Text>
            </TouchableOpacity>
          </>
        );
      case 'kematian':
        return (
          <>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>SEBAB MENINGGAL</Text>
              <TextInput placeholder="Misal: Sakit, Usia Tua, Kecelakaan..." style={styles.textInput} value={form.sebab_meninggal} onChangeText={(val) => setForm({...form, sebab_meninggal: val})} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>KETERANGAN TAMBAHAN</Text>
              <TextInput placeholder="Catatan tambahan (opsional)" style={[styles.textInput, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]} multiline numberOfLines={3} value={form.keterangan} onChangeText={(val) => setForm({...form, keterangan: val})} />
            </View>
          </>
        );
      case 'pindah_keluar':
        return (
          <>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>DAERAH TUJUAN PINDAH</Text>
              <TextInput placeholder="Kecamatan, Kota, Provinsi tujuan..." style={styles.textInput} value={form.tujuan_daerah} onChangeText={(val) => setForm({...form, tujuan_daerah: val})} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>ALASAN PINDAH</Text>
              <TextInput placeholder="Catatan alasan kepindahan (opsional)" style={[styles.textInput, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]} multiline value={form.keterangan} onChangeText={(val) => setForm({...form, keterangan: val})} />
            </View>
          </>
        );
      case 'pindah_masuk':
        return (
          <>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>DAERAH ASAL PERPINDAHAN</Text>
              <TextInput placeholder="Kecamatan, Kota, Provinsi asal..." style={styles.textInput} value={form.asal_daerah} onChangeText={(val) => setForm({...form, asal_daerah: val})} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>KETERANGAN</Text>
              <TextInput placeholder="Catatan tambahan (opsional)" style={[styles.textInput, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]} multiline value={form.keterangan} onChangeText={(val) => setForm({...form, keterangan: val})} />
            </View>
          </>
        );
      case 'kehamilan':
        return (
          <>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>STATUS KEHAMILAN</Text>
              <View style={styles.selectionRow}>
                <TouchableOpacity onPress={() => setForm({...form, status_kehamilan: 'hamil'})} style={[styles.selectionButton, form.status_kehamilan === 'hamil' && styles.selectionButtonActive]}><Text style={[styles.selectionText, form.status_kehamilan === 'hamil' && styles.selectionTextActive]}>Hamil</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setForm({...form, status_kehamilan: 'melahirkan'})} style={[styles.selectionButton, form.status_kehamilan === 'melahirkan' && styles.selectionButtonActive]}><Text style={[styles.selectionText, form.status_kehamilan === 'melahirkan' && styles.selectionTextActive]}>Melahirkan</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setForm({...form, status_kehamilan: 'nifas'})} style={[styles.selectionButton, form.status_kehamilan === 'nifas' && styles.selectionButtonActive]}><Text style={[styles.selectionText, form.status_kehamilan === 'nifas' && styles.selectionTextActive]}>Nifas</Text></TouchableOpacity>
              </View>
            </View>
            {form.status_kehamilan === 'hamil' ? (
              <>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>TANGGAL HPHT (HARI PERTAMA HAID TERAKHIR)</Text>
                  <TouchableOpacity onPress={() => openDatePicker('hpht')} style={styles.dateSelector}>
                    <CalendarIcon size={20} color="#64748B" style={{ marginRight: 12 }} /><Text style={styles.dateSelectorText}>{form.hpht || 'Pilih Tanggal HPHT'}</Text>
                  </TouchableOpacity>
                </View>
                {form.hpht ? (
                  <View style={styles.pkkInfoBox}>
                    <Info size={18} color="#D97706" style={{ marginRight: 10, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pkkInfoTitle}>Kalkulator Kehamilan:</Text>
                      <Text style={styles.pkkInfoText}>• Perkiraan Lahir (HPL): <Text style={{ fontWeight: '700' }}>{formatDate(getHplDate(form.hpht))}</Text></Text>
                      <Text style={styles.pkkInfoText}>• Usia Kehamilan: <Text style={{ fontWeight: '700' }}>{getUsiaKehamilan(form.hpht)}</Text></Text>
                    </View>
                  </View>
                ) : null}
              </>
            ) : (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>TANGGAL MELAHIRKAN / PERSALINAN</Text>
                <TouchableOpacity onPress={() => openDatePicker('tanggal_melahirkan')} style={styles.dateSelector}>
                  <CalendarIcon size={20} color="#64748B" style={{ marginRight: 12 }} /><Text style={styles.dateSelectorText}>{form.tanggal_melahirkan || 'Pilih Tanggal Melahirkan'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        );
      default: return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Pilih Jenis Mutasi';
      case 2: return 'Pilih Data Warga';
      case 3: return 'Detail Catatan Mutasi';
      case 4: return 'Konfirmasi Data';
      default: return '';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1: return 'Pilih jenis mutasi yang akan dicatat';
      case 2: return 'Cari warga yang bersangkutan dengan mutasi';
      case 3: return 'Lengkapi data spesifik peristiwa mutasi';
      case 4: return 'Periksa kembali data sebelum disimpan';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevStep} style={styles.backButton} disabled={step === 1}><ArrowLeft color={step === 1 ? '#CBD5E1' : '#1E293B'} size={24} /></TouchableOpacity>
        <View style={styles.headerCenter}><Text style={styles.headerTitle}>Mutasi Penduduk</Text><Text style={styles.headerStep}>Langkah {step} dari 4</Text></View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}><X color="#1E293B" size={24} /></TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}><View style={[styles.progressBarActive, { width: `${((step - 1) / 3) * 100}%` }]} /></View>
        <View style={styles.stepsRow}>
          <StepCircle num={1} label="Jenis Mutasi" active={step >= 1} current={step === 1} />
          <StepCircle num={2} label="Data Warga" active={step >= 2} current={step === 2} />
          <StepCircle num={3} label="Detail Mutasi" active={step >= 3} current={step === 3} />
          <StepCircle num={4} label="Konfirmasi" active={step >= 4} current={step === 4} />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.stepTitleContainer}><Text style={styles.stepTitle}>{getStepTitle()}</Text><Text style={styles.stepSubtitle}>{getStepSubtitle()}</Text></View>
          {step === 1 && (
            <View style={styles.stepBody}>
              <View style={styles.gridContainer}>
                <MutationCard label="Kelahiran" icon={<Baby size={32} color="#2E7D32" />} selected={activeTab === 'kelahiran'} color="#2E7D32" bg="#E8F5E9" onPress={() => handleTabChange('kelahiran')} />
                <MutationCard label="Kematian" icon={<Skull size={32} color="#7C3AED" />} selected={activeTab === 'kematian'} color="#7C3AED" bg="#F3E8FF" onPress={() => handleTabChange('kematian')} />
                <MutationCard label="Pindah Keluar" icon={<LogOut size={32} color="#2563EB" />} selected={activeTab === 'pindah_keluar'} color="#2563EB" bg="#DBEAFE" onPress={() => handleTabChange('pindah_keluar')} />
                <MutationCard label="Pindah Masuk" icon={<LogIn size={32} color="#16A34A" />} selected={activeTab === 'pindah_masuk'} color="#16A34A" bg="#DCFCE7" onPress={() => handleTabChange('pindah_masuk')} />
                <MutationCard label="Kehamilan" icon={<Heart size={32} color="#D97706" />} selected={activeTab === 'kehamilan'} color="#D97706" bg="#FEF3C7" onPress={() => handleTabChange('kehamilan')} />
              </View>
              <View style={styles.alertBox}>
                <Info size={20} color="#2E7D32" style={{ marginRight: 12, marginTop: 2 }} />
                <View style={{ flex: 1 }}><Text style={styles.alertTitle}>Informasi</Text><Text style={styles.alertText}>Pastikan data yang Anda masukkan sudah benar. Data mutasi akan mempengaruhi status warga terkait.</Text></View>
              </View>
            </View>
          )}
          {step === 2 && (
            <View style={styles.stepBody}>
              {activeTab === 'kelahiran' ? (
                <View style={styles.infoBoxBlue}><Info size={20} color="#1D4ED8" /><Text style={styles.infoTextBlue}>Mutasi Kelahiran tidak memerlukan pencarian warga aktif. Silakan lanjut ke langkah berikutnya untuk mengisi data bayi baru lahir.</Text></View>
              ) : activeTab === 'pindah_masuk' ? (
                <View style={styles.infoBoxBlue}>
                  <Info size={20} color="#1D4ED8" />
                  <View style={{ flex: 1 }}><Text style={styles.infoTextBlue}>Mutasi Penduduk Datang (Masuk) sebaiknya dilakukan dengan menambahkan data warga baru secara lengkap.</Text><TouchableOpacity style={styles.addWargaButton} onPress={() => router.push('/kependudukan/tambah')}><Plus size={16} color="#fff" style={{ marginRight: 6 }} /><Text style={styles.addWargaButtonText}>Tambah Warga Baru</Text></TouchableOpacity></View>
                </View>
              ) : selectedWarga ? (
                <View style={styles.wargaSelectedCard}>
                  <View style={styles.avatarCircle}><User size={24} color="#64748B" /></View>
                  <View style={styles.wargaSelectedInfo}><Text style={styles.wargaSelectedName}>{selectedWarga.nama_lengkap}</Text><Text style={styles.wargaSelectedNik}>NIK: {selectedWarga.nik || '-'}</Text><Text style={styles.wargaSelectedRt}>Hubungan: {selectedWarga.hubungan_keluarga ?? '-'} • RT {selectedWarga.rts?.nomor_rt ?? '-'}</Text></View>
                  <TouchableOpacity onPress={() => setSelectedWarga(null)} style={styles.removeWargaButton}><X size={18} color="#64748B" /></TouchableOpacity>
                </View>
              ) : (
                <View style={styles.searchContainer}>
                  <Text style={styles.fieldLabel}>WARGA YANG BERSANGKUTAN</Text>
                  <View style={styles.searchInputWrapper}><Search size={20} color="#94A3B8" style={{ marginLeft: 16 }} /><TextInput placeholder="Ketik nama atau NIK warga..." style={styles.searchInput} value={wargaSearch} onChangeText={handleSearchWarga} />{searching && <ActivityIndicator size="small" color="#2E7D32" style={{ marginRight: 16 }} />}</View>
                  {searchResults.length > 0 ? (
                    <View style={styles.searchResultsList}>{searchResults.map((w) => (<TouchableOpacity key={w.id} onPress={() => selectWarga(w)} style={styles.searchItem}><View style={{ flex: 1 }}><Text style={styles.searchItemName}>{w.nama_lengkap}</Text><Text style={styles.searchItemSub}>NIK: {w.nik || '-'} • RT 0{w.rts?.nomor_rt}</Text></View><View style={styles.rtBadge}><Text style={styles.rtBadgeText}>RT {w.rts?.nomor_rt}</Text></View></TouchableOpacity>))}</View>
                  ) : wargaSearch.length >= 2 ? <Text style={styles.noResultsText}>Warga tidak ditemukan atau tidak aktif.</Text> : null}
                </View>
              )}
              {activeTab === 'pindah_keluar' && selectedWarga && (
                <TouchableOpacity onPress={() => setIsSatuKk(!isSatuKk)} style={[styles.checkboxRow, isSatuKk && styles.checkboxRowActive, { marginTop: 16 }]}><View style={[styles.checkbox, isSatuKk && styles.checkboxActive]}>{isSatuKk && <CheckCircle2 size={14} color="#fff" />}</View><Text style={[styles.checkboxLabel, isSatuKk && styles.checkboxLabelActive]}>Mutasi seluruh anggota keluarga (1 KK)</Text></TouchableOpacity>
              )}
            </View>
          )}
          {step === 3 && (
            <View style={styles.stepBody}>
              <View style={styles.field}><Text style={styles.fieldLabel}>TANGGAL PERISTIWA MUTASI</Text><TouchableOpacity onPress={() => openDatePicker('tanggal_mutasi')} style={styles.dateSelector}><CalendarIcon size={20} color="#64748B" style={{ marginRight: 12 }} /><Text style={styles.dateSelectorText}>{form.tanggal_mutasi || 'Pilih Tanggal'}</Text></TouchableOpacity></View>
              {renderStep3Fields()}
            </View>
          )}
          {step === 4 && (
            <View style={styles.stepBody}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryHeader}>Rangkuman Laporan Mutasi</Text>
                <SummaryRow label="Jenis Mutasi" value={activeTab.toUpperCase().replace('_', ' ')} /><SummaryRow label="Tanggal Peristiwa" value={formatDate(form.tanggal_mutasi)} />
                {selectedWarga && <><View style={styles.divider} /><SummaryRow label="Warga Terdampak" value={selectedWarga.nama_lengkap} /><SummaryRow label="NIK Warga" value={selectedWarga.nik || '-'} />{isSatuKk && <SummaryRow label="Cakupan Mutasi" value="Seluruh Anggota KK (1 KK)" />}</>}
                {activeTab === 'kelahiran' && <><View style={styles.divider} /><SummaryRow label="Nama Bayi" value={form.nama_bayi} /><SummaryRow label="Jenis Kelamin" value={form.jenis_kelamin_bayi === 'L' ? 'Laki-laki' : 'Perempuan'} /><SummaryRow label="Nama Ibu" value={form.nama_ibu || '-'} /><SummaryRow label="Nama Ayah" value={form.nama_ayah || '-'} /><SummaryRow label="Akte Kelahiran" value={form.ada_akte ? 'Sudah Ada' : 'Belum Ada'} /></>}
                {activeTab === 'kematian' && <><View style={styles.divider} /><SummaryRow label="Sebab Meninggal" value={form.sebab_meninggal} />{form.keterangan ? <SummaryRow label="Keterangan" value={form.keterangan} /> : null}</>}
                {activeTab === 'pindah_keluar' && <><View style={styles.divider} /><SummaryRow label="Daerah Tujuan" value={form.tujuan_daerah} />{form.keterangan ? <SummaryRow label="Alasan" value={form.keterangan} /> : null}</>}
{activeTab === 'pindah_masuk' && <><View style={styles.divider} /><SummaryRow label="Daerah Asal" value={form.asal_daerah} />{form.keterangan ? <SummaryRow label="Keterangan" value={form.keterangan} /> : null}</>}
                {activeTab === 'kehamilan' && <><View style={styles.divider} /><SummaryRow label="Status Kehamilan" value={form.status_kehamilan.toUpperCase()} />{form.status_kehamilan === 'hamil' ? <><SummaryRow label="Tanggal HPHT" value={formatDate(form.hpht)} /><SummaryRow label="Estimasi Lahir (HPL)" value={formatDate(getHplDate(form.hpht))} /><SummaryRow label="Usia Kandungan" value={getUsiaKehamilan(form.hpht)} /></> : <SummaryRow label="Tanggal Melahirkan" value={formatDate(form.tanggal_melahirkan)} />}</>}
              </View>
            </View>
          )}
          {showPicker && <DateTimePicker value={activeDatePicker === 'hpht' && form.hpht ? new Date(form.hpht) : activeDatePicker === 'tanggal_melahirkan' && form.tanggal_melahirkan ? new Date(form.tanggal_melahirkan) : form.tanggal_mutasi ? new Date(form.tanggal_mutasi) : new Date()} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={handleDateChange} maximumDate={new Date()} />}
          <View style={styles.buttonRow}>
            {step > 1 && <TouchableOpacity style={styles.btnSecondary} onPress={handlePrevStep}><Text style={styles.btnSecondaryText}>Kembali</Text></TouchableOpacity>}
            {step === 4 && <TouchableOpacity style={styles.btnDraft} onPress={handleSaveDraftDirectly}><Text style={styles.btnDraftText}>Simpan Draf</Text></TouchableOpacity>}
            <TouchableOpacity style={[styles.btnPrimary, step === 1 && { width: '100%' }]} onPress={handleNextStep}><Text style={styles.btnPrimaryText}>{step === 4 ? 'Simpan Laporan' : 'Selanjutnya'}</Text>{step < 4 && <ArrowRight size={18} color="#fff" style={{ marginLeft: 8 }} />}</TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepCircle({ num, label, active, current }: { num: number; label: string; active: boolean; current: boolean }) {
  return (
    <View style={styles.stepItem}>
      <View style={[styles.stepCircle, active && styles.stepCircleActive, current && styles.stepCircleCurrent]}><Text style={[styles.stepCircleText, active && styles.stepCircleTextActive]}>{num}</Text></View>
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
    </View>
  );
}

function MutationCard({ label, icon, selected, color, bg, onPress }: { label: string; icon: React.ReactNode; selected: boolean; color: string; bg: string; onPress: () => void; }) {
  return (
    <TouchableOpacity style={[styles.mutationCard, selected && { borderColor: color, borderWidth: 2, backgroundColor: bg }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.mutationCardIcon}>{icon}</View>
      <Text style={[styles.mutationCardLabel, selected && { color: color, fontWeight: '800' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backButton: { padding: 4 },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  headerStep: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 2 },
  closeButton: { padding: 4 },
  progressContainer: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  progressBarBg: { position: 'absolute', left: 48, right: 48, top: 32, height: 2, backgroundColor: '#E2E8F0', zIndex: 1 },
  progressBarActive: { height: '100%', backgroundColor: '#2E7D32' },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 },
  stepItem: { alignItems: 'center', width: 64 },
  stepCircle: { height: 32, width: 32, borderRadius: 16, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  stepCircleActive: { backgroundColor: '#81C784', borderColor: '#81C784' },
  stepCircleCurrent: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  stepCircleText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepCircleTextActive: { color: '#fff' },
  stepLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 6, textAlign: 'center' },
  stepLabelActive: { color: '#2E7D32', fontWeight: '700' },
  scrollView: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  stepTitleContainer: { marginBottom: 20, marginTop: 8 },
  stepTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  stepSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  stepBody: { minHeight: 200 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  mutationCard: { width: (width - 44) / 2, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, borderColor: '#E2E8F0', padding: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 },
  mutationCardIcon: { marginBottom: 12, height: 48, width: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  mutationCardLabel: { fontSize: 14, fontWeight: '700', color: '#475569' },
  alertBox: { flexDirection: 'row', backgroundColor: '#E8F5E9', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#C8E6C9' },
  alertTitle: { fontSize: 14, fontWeight: '800', color: '#2E7D32', marginBottom: 4 },
  alertText: { fontSize: 13, color: '#475569', lineHeight: 18, fontWeight: '500' },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '800', color: '#475569', marginBottom: 8, letterSpacing: 0.5 },
  textInput: { height: 52, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontWeight: '700', color: '#0F172A' },
  dateSelector: { flexDirection: 'row', alignItems: 'center', height: 52, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16 },
  dateSelectorText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  selectionRow: { flexDirection: 'row', gap: 12 },
  selectionButton: { flex: 1, height: 48, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  selectionButtonActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  selectionText: { fontSize: 14, fontWeight: '700', color: '#475569' },
  selectionTextActive: { color: '#fff', fontWeight: '800' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16, padding: 16 },
  checkboxRowActive: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  checkbox: { height: 22, width: 22, borderRadius: 6, borderWidth: 2, borderColor: '#64748B', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkboxActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  checkboxLabel: { fontSize: 14, fontWeight: '600', color: '#475569' },
  checkboxLabelActive: { color: '#2E7D32', fontWeight: '800' },
  infoBoxBlue: { flexDirection: 'row', padding: 16, backgroundColor: '#EFF6FF', borderRadius: 16, borderWidth: 1, borderColor: '#DBEAFE', alignItems: 'center' },
  infoTextBlue: { flex: 1, fontSize: 14, color: '#1E40AF', lineHeight: 20, fontWeight: '600' },
  addWargaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB', height: 40, borderRadius: 10, marginTop: 12, alignSelf: 'flex-start', paddingHorizontal: 12 },
  addWargaButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  searchContainer: { marginBottom: 16 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', height: 52, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16 },
  searchInput: { flex: 1, paddingHorizontal: 12, fontSize: 14, fontWeight: '700', color: '#0F172A' },
  searchResultsList: { marginTop: 8, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, borderColor: '#E2E8F0', overflow: 'hidden' },
  searchItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  searchItemName: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  searchItemSub: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },
  rtBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  rtBadgeText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  noResultsText: { fontSize: 13, color: '#64748B', fontStyle: 'italic', marginTop: 8, textAlign: 'center' },
  wargaSelectedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#2E7D32', borderRadius: 20, padding: 16 },
  avatarCircle: { height: 48, width: 48, borderRadius: 24, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  wargaSelectedInfo: { flex: 1, marginLeft: 16 },
  wargaSelectedName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  wargaSelectedNik: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 2 },
  wargaSelectedRt: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 2 },
  removeWargaButton: { padding: 8 },
  pkkInfoBox: { flexDirection: 'row', backgroundColor: '#FFFBEB', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FEF3C7', marginTop: 12 },
  pkkInfoTitle: { fontSize: 13, fontWeight: '800', color: '#D97706', marginBottom: 4 },
  pkkInfoText: { fontSize: 13, color: '#475569', marginTop: 2, fontWeight: '500' },
  summaryCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: '#E2E8F0' },
  summaryHeader: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  summaryLabel: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  summaryValue: { fontSize: 14, color: '#0F172A', fontWeight: '800', textAlign: 'right', flex: 1, marginLeft: 16 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 6 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btnPrimary: { flex: 1.5, height: 52, backgroundColor: '#2E7D32', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  btnSecondary: { flex: 1, height: 52, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { color: '#475569', fontSize: 15, fontWeight: '700' },
  btnDraft: { flex: 1, height: 52, backgroundColor: '#FFFBEB', borderWidth: 1.5, borderColor: '#FEF3C7', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnDraftText: { color: '#D97706', fontSize: 15, fontWeight: '700' }
});
