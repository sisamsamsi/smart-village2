import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, CreditCard, Calendar, Briefcase, Users, X, Check, Search, Info, ArrowRight, Home } from 'lucide-react-native';
import { useTambahWarga, useRTs, useKKs } from '@/hooks/useKependudukan';
import { useDraftStore } from '@/hooks/useDraftStore';

const { width } = Dimensions.get('window');

export default function TambahWargaScreen() {
  const router = useRouter();
  const { mutateAsync: tambahWarga } = useTambahWarga();
  const { data: rts } = useRTs();
  const { data: kkList } = useKKs();
  const { addDraft } = useDraftStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [kkSearch, setKkSearch] = useState('');

  const [form, setForm] = useState({
    nama_lengkap: '',
    nik: '',
    tempat_lahir: 'Bantul',
    tanggal_lahir: new Date().toISOString().split('T')[0],
    jenis_kelamin: 'L',
    agama: 'ISLAM',
    pekerjaan: '',
    status_kawin: 'BELUM KAWIN',
    hubungan_keluarga: 'ANAK',
    rt_id: '',
    rumah_tangga_id: '',
    is_new_kk: false,
    no_kk_baru: '',
    nama_kepala_keluarga_baru: '',
    pendidikan: 'SD/SEDERAJAT'
  });

  const filteredKk = kkList?.filter((kk: any) =>
    kk.no_kk?.toLowerCase().includes(kkSearch.toLowerCase()) ||
    kk.nama_kepala_keluarga?.toLowerCase().includes(kkSearch.toLowerCase())
  );

  const handleNextStep = () => {
    if (step === 1) {
      if (!form.nama_lengkap || !form.nik) {
        Alert.alert('Peringatan', 'Nama Lengkap dan NIK wajib diisi.');
        return;
      }
      if (form.nik.length !== 16) {
        Alert.alert('Peringatan', 'NIK harus terdiri dari 16 digit.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!form.rt_id) {
        Alert.alert('Peringatan', 'Silakan pilih RT terlebih dahulu.');
        return;
      }
      if (!form.is_new_kk && !form.rumah_tangga_id) {
        Alert.alert('Peringatan', 'Silakan pilih Kartu Keluarga atau gunakan opsi KK Baru.');
        return;
      }
      if (form.is_new_kk && (!form.no_kk_baru || !form.nama_kepala_keluarga_baru)) {
        Alert.alert('Peringatan', 'Harap isi No. KK Baru dan Nama Kepala Keluarga.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSaveDraftDirectly = () => {
    const label = `Tambah Warga - ${form.nama_lengkap} (${form.nik})`;
    addDraft('warga', label, form);
    Alert.alert('Draf Disimpan', 'Data warga berhasil disimpan ke draf offline HP Anda.');
    router.back();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await tambahWarga(form);
      Alert.alert('Sukses', 'Data warga berhasil ditambahkan');
      router.back();
    } catch (error: unknown) {
      console.error(error);
      Alert.alert(
        'Gagal Mengirim Data',
        'Koneksi internet bermasalah. Simpan ke draf offline agar dapat dikirim nanti?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Simpan ke Draf',
            onPress: () => {
              const label = `Tambah Warga - ${form.nama_lengkap} (${form.nik})`;
              addDraft('warga', label, form);
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevStep} style={styles.backButton} disabled={step === 1}>
            <ArrowLeft color={step === 1 ? '#CBD5E1' : '#1E293B'} size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Daftarkan Warga</Text>
            <Text style={styles.headerStep}>Langkah {step} dari 3</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X color="#1E293B" size={24} />
          </TouchableOpacity>
        </View>

        {/* Wizard Steps Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarActive, { width: `${((step - 1) / 2) * 100}%` }]} />
          </View>
          <View style={styles.stepsRow}>
            <StepCircle num={1} label="Identitas" active={step >= 1} current={step === 1} />
            <StepCircle num={2} label="Keluarga" active={step >= 2} current={step === 2} />
            <StepCircle num={3} label="Sosial & Final" active={step >= 3} current={step === 3} />
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Step 1: Identitas Dasar */}
          {step === 1 && (
            <View style={styles.stepBody}>
              <View style={styles.introSection}>
                <View style={styles.iconWrapper}>
                  <User color="#67C090" size={32} />
                </View>
                <Text style={styles.introTitle}>Identitas Dasar</Text>
                <Text style={styles.introSub}>Masukkan data identitas sesuai KTP atau Akta Kelahiran resmi.</Text>
              </View>

              <View style={styles.formGap}>
                <InputGroup
                  label="Nama Lengkap"
                  icon={<User size={18} color="#94A3B8" />}
                  value={form.nama_lengkap}
                  onChangeText={(v) => setForm({ ...form, nama_lengkap: v })}
                  placeholder="Masukkan nama lengkap warga"
                />

                <InputGroup
                  label="Nomor Induk Kependudukan (NIK)"
                  icon={<CreditCard size={18} color="#94A3B8" />}
                  value={form.nik}
                  onChangeText={(v) => setForm({ ...form, nik: v })}
                  placeholder="16 digit nomor NIK"
                  keyboardType="numeric"
                  maxLength={16}
                />

                <View style={styles.row}>
                  <View style={styles.half}>
                    <Text style={styles.label}>Jenis Kelamin</Text>
                    <View style={styles.genderToggle}>
                      <TouchableOpacity 
                        onPress={() => setForm({ ...form, jenis_kelamin: 'L' })}
                        style={[styles.genderOption, form.jenis_kelamin === 'L' && styles.genderActive]}
                      >
                        <Text style={[styles.genderText, form.jenis_kelamin === 'L' && styles.genderTextActive]}>Pria</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => setForm({ ...form, jenis_kelamin: 'P' })}
                        style={[styles.genderOption, form.jenis_kelamin === 'P' && styles.genderActive]}
                      >
                        <Text style={[styles.genderText, form.jenis_kelamin === 'P' && styles.genderTextActive]}>Wanita</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.half}>
                    <InputGroup 
                      label="Tempat Lahir" 
                      value={form.tempat_lahir} 
                      onChangeText={(v) => setForm({ ...form, tempat_lahir: v })} 
                      placeholder="Bantul"
                    />
                  </View>
                  <View style={styles.half}>
                    <Text style={styles.label}>Tanggal Lahir</Text>
                    <TouchableOpacity 
                      onPress={() => setShowDatePicker(true)}
                      style={[styles.inputWrapper, { height: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }]}
                    >
                      <Calendar size={18} color="#94A3B8" style={{ marginRight: 12 }} />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B', flex: 1 }}>
                        {form.tanggal_lahir || 'YYYY-MM-DD'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Agama</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
                    {['ISLAM', 'KRISTEN', 'KATHOLIK', 'HINDU', 'BUDHA', 'KONGHUCU'].map((a) => (
                      <TouchableOpacity 
                        key={a}
                        onPress={() => setForm({ ...form, agama: a })}
                        style={[styles.miniBadge, form.agama === a && styles.miniBadgeActive]}
                      >
                        <Text style={[styles.miniBadgeText, form.agama === a && styles.miniBadgeTextActive]}>{a}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Pendidikan Terakhir</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
                    {['SD/SEDERAJAT', 'SMP/SEDERAJAT', 'SMA/SEDERAJAT', 'DIPLOMA IV/STRATA I', 'STRATA II'].map((p) => (
                      <TouchableOpacity 
                        key={p}
                        onPress={() => setForm({ ...form, pendidikan: p })}
                        style={[styles.miniBadge, form.pendidikan === p && styles.miniBadgeActive]}
                      >
                        <Text style={[styles.miniBadgeText, form.pendidikan === p && styles.miniBadgeTextActive]}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          )}

          {/* Step 2: Hubungan Domisili & KK */}
          {step === 2 && (
            <View style={styles.stepBody}>
              <View style={styles.introSection}>
                <View style={styles.iconWrapper}>
                  <Home color="#67C090" size={32} />
                </View>
                <Text style={styles.introTitle}>Keluarga & Domisili</Text>
                <Text style={styles.introSub}>Tentukan domisili wilayah RT dan relasi Kartu Keluarga warga.</Text>
              </View>

              <View style={styles.formGap}>
                {/* RT Selection */}
                <View style={styles.field}>
                  <Text style={styles.label}>Pilih RT Domisili</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
                    {rts?.map((rt: any) => (
                      <TouchableOpacity 
                        key={rt.id}
                        onPress={() => setForm({ ...form, rt_id: rt.id })}
                        style={[styles.miniBadge, form.rt_id === rt.id && styles.miniBadgeActive]}
                      >
                        <Text style={[styles.miniBadgeText, form.rt_id === rt.id && styles.miniBadgeTextActive]}>RT {rt.nomor_rt}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* KK Toggle */}
                <View style={styles.field}>
                  <Text style={styles.label}>Opsi Kartu Keluarga (KK)</Text>
                  <View style={styles.toggleContainer}>
                    <TouchableOpacity 
                      onPress={() => setForm({ ...form, is_new_kk: false })}
                      style={[styles.toggleBtn, !form.is_new_kk && styles.toggleBtnActive]}
                    >
                      <Text style={[styles.toggleBtnText, !form.is_new_kk && styles.toggleBtnTextActive]}>KK Terdaftar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setForm({ ...form, is_new_kk: true })}
                      style={[styles.toggleBtn, form.is_new_kk && styles.toggleBtnActive]}
                    >
                      <Text style={[styles.toggleBtnText, form.is_new_kk && styles.toggleBtnTextActive]}>KK Baru</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {!form.is_new_kk ? (
                  <View style={styles.field}>
                    <Text style={styles.label}>Cari & Pilih Kartu Keluarga</Text>
                    <View style={styles.searchContainer}>
                      <View style={styles.searchInputWrapper}>
                        <Search size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                        <TextInput 
                          style={styles.searchInput}
                          placeholder="No KK / Kepala Keluarga..."
                          value={kkSearch}
                          onChangeText={setKkSearch}
                        />
                      </View>
                      <ScrollView style={styles.kkListScroll} nestedScrollEnabled>
                        {filteredKk?.map((kk: any) => (
                          <TouchableOpacity 
                            key={kk.id}
                            onPress={() => setForm({ ...form, rumah_tangga_id: kk.id })}
                            style={[styles.kkItem, form.rumah_tangga_id === kk.id && styles.kkItemActive]}
                          >
                            <Text style={[styles.kkItemText, form.rumah_tangga_id === kk.id && styles.kkItemTextActive]}>{kk.no_kk}</Text>
                            <Text style={styles.kkItemSub}>{kk.nama_kepala_keluarga}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                ) : (
                  <View style={styles.newKkBox}>
                    <InputGroup
                      label="No. KK Baru"
                      value={form.no_kk_baru}
                      onChangeText={(v) => setForm({ ...form, no_kk_baru: v })}
                      placeholder="Masukkan 16 digit No KK"
                      keyboardType="numeric"
                    />
                    <InputGroup
                      label="Nama Kepala Keluarga Baru"
                      value={form.nama_kepala_keluarga_baru}
                      onChangeText={(v) => setForm({ ...form, nama_kepala_keluarga_baru: v })}
                      placeholder="Sesuai nama kepala keluarga"
                    />
                  </View>
                )}

                {/* Hubungan Keluarga */}
                <View style={styles.field}>
                  <Text style={styles.label}>Hubungan Dalam Keluarga</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
                    {['KEPALA KELUARGA', 'ISTERI', 'ANAK', 'MERTUA', 'ORANG TUA', 'LAINNYA'].map((h) => (
                      <TouchableOpacity 
                        key={h}
                        onPress={() => setForm({ ...form, hubungan_keluarga: h })}
                        style={[styles.miniBadge, form.hubungan_keluarga === h && styles.miniBadgeActive]}
                      >
                        <Text style={[styles.miniBadgeText, form.hubungan_keluarga === h && styles.miniBadgeTextActive]}>{h}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          )}

          {/* Step 3: Pekerjaan & Konfirmasi */}
          {step === 3 && (
            <View style={styles.stepBody}>
              <View style={styles.introSection}>
                <View style={styles.iconWrapper}>
                  <Briefcase color="#67C090" size={32} />
                </View>
                <Text style={styles.introTitle}>Konfirmasi & Simpan</Text>
                <Text style={styles.introSub}>Lengkapi status sosial dan periksa kembali data sebelum menyimpan.</Text>
              </View>

              <View style={styles.formGap}>
                <InputGroup 
                  label="Pekerjaan" 
                  icon={<Briefcase size={18} color="#94A3B8" />}
                  value={form.pekerjaan} 
                  onChangeText={(v) => setForm({ ...form, pekerjaan: v })} 
                  placeholder="Contoh: Karyawan Swasta, Wiraswasta"
                />

                <View style={styles.field}>
                  <Text style={styles.label}>Status Perkawinan</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
                    {['BELUM KAWIN', 'KAWIN', 'CERAI HIDUP', 'CERAI MATI'].map((s) => (
                      <TouchableOpacity 
                        key={s}
                        onPress={() => setForm({ ...form, status_kawin: s })}
                        style={[styles.miniBadge, form.status_kawin === s && styles.miniBadgeActive]}
                      >
                        <Text style={[styles.miniBadgeText, form.status_kawin === s && styles.miniBadgeTextActive]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Summary Card */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryHeader}>Rangkuman Data Warga</Text>
                  <SummaryRow label="Nama Lengkap" value={form.nama_lengkap} />
                  <SummaryRow label="NIK" value={form.nik} />
                  <SummaryRow label="Jenis Kelamin" value={form.jenis_kelamin === 'L' ? 'Pria' : 'Wanita'} />
                  <SummaryRow label="Tempat, Tgl Lahir" value={`${form.tempat_lahir}, ${formatDate(form.tanggal_lahir)}`} />
                  <SummaryRow label="Agama" value={form.agama} />
                  <SummaryRow label="Pendidikan" value={form.pendidikan} />
                  <View style={styles.divider} />
                  <SummaryRow label="RT Domisili" value={rts?.find((r: any) => r.id === form.rt_id)?.nomor_rt ? `RT ${rts.find((r: any) => r.id === form.rt_id)?.nomor_rt}` : '-'} />
                  <SummaryRow label="Status KK" value={form.is_new_kk ? 'Kartu Keluarga Baru' : 'KK Terdaftar'} />
                  <SummaryRow 
                    label="No. KK" 
                    value={form.is_new_kk ? form.no_kk_baru : (kkList?.find((k: any) => k.id === form.rumah_tangga_id)?.no_kk || '-')} 
                  />
                  <SummaryRow label="Hubungan Keluarga" value={form.hubungan_keluarga} />
                  <SummaryRow label="Pekerjaan" value={form.pekerjaan || '-'} />
                  <SummaryRow label="Status Kawin" value={form.status_kawin} />
                </View>
              </View>
            </View>
          )}

          {/* Nav Buttons */}
          <View style={styles.buttonRow}>
            {step > 1 && (
              <TouchableOpacity style={styles.btnSecondary} onPress={handlePrevStep}>
                <Text style={styles.btnSecondaryText}>Kembali</Text>
              </TouchableOpacity>
            )}

            {step === 3 && (
              <TouchableOpacity style={styles.btnDraft} onPress={handleSaveDraftDirectly}>
                <Text style={styles.btnDraftText}>Simpan Draf</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.btnPrimary, step === 1 && { width: '100%' }, loading && styles.btnDisabled]} 
              onPress={handleNextStep}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.btnPrimaryText}>{step === 3 ? 'Daftarkan Warga' : 'Selanjutnya'}</Text>
                  {step < 3 && <ArrowRight size={18} color="#fff" style={{ marginLeft: 8 }} />}
                  {step === 3 && <Check size={18} color="#fff" style={{ marginLeft: 8 }} />}
                </>
              )}
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={form.tanggal_lahir ? new Date(form.tanggal_lahir) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setForm({ ...form, tanggal_lahir: selectedDate.toISOString().split('T')[0] });
              }
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepCircle({ num, label, active, current }: { num: number; label: string; active: boolean; current: boolean }) {
  return (
    <View style={styles.stepItem}>
      <View style={[styles.stepCircle, active && styles.stepCircleActive, current && styles.stepCircleCurrent]}>
        <Text style={[styles.stepCircleText, active && styles.stepCircleTextActive]}>{num}</Text>
      </View>
      <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
    </View>
  );
}

function InputGroup({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  maxLength?: number;
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        {icon && <View style={styles.inputIcon}>{icon}</View>}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={maxLength}
        />
      </View>
    </View>
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
    padding: 4,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerStep: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  progressBarBg: {
    position: 'absolute',
    left: 48,
    right: 48,
    top: 32,
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  progressBarActive: {
    height: '100%',
    backgroundColor: '#67C090',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  stepItem: {
    alignItems: 'center',
    width: 64,
  },
  stepCircle: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  stepCircleActive: {
    backgroundColor: '#A8E6CF',
    borderColor: '#A8E6CF',
  },
  stepCircleCurrent: {
    backgroundColor: '#67C090',
    borderColor: '#67C090',
  },
  stepCircleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepCircleTextActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#67C090',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
  },
  stepBody: {
    minHeight: 200,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrapper: {
    height: 64,
    width: 64,
    borderRadius: 24,
    backgroundColor: 'rgba(103, 192, 144, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 6,
  },
  introSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  formGap: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
    gap: 8,
  },
  genderToggle: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 4,
  },
  genderOption: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderActive: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#67C090',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  genderTextActive: {
    color: '#67C090',
    fontWeight: '800',
  },
  field: {
    gap: 8,
  },
  miniBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  miniBadgeActive: {
    backgroundColor: '#67C090',
    borderColor: '#67C090',
  },
  miniBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  miniBadgeTextActive: {
    color: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 4,
    borderRadius: 14,
  },
  toggleBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#67C090',
    fontWeight: '800',
  },
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  kkListScroll: {
    maxHeight: 180,
    marginTop: 8,
  },
  kkItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  kkItemActive: {
    backgroundColor: '#F0FDF4',
  },
  kkItemText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  kkItemTextActive: {
    color: '#67C090',
  },
  kkItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  newKkBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  summaryHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '800',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  btnPrimary: {
    flex: 1.5,
    height: 52,
    backgroundColor: '#67C090',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#67C090',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  btnSecondary: {
    flex: 1,
    height: 52,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
  },
  btnDraft: {
    flex: 1,
    height: 52,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FEF3C7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDraftText: {
    color: '#D97706',
    fontSize: 15,
    fontWeight: '700',
  }
});
