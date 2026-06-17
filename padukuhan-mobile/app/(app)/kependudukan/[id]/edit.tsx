import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/lib/supabase';
import { useUpdateWarga } from '@/hooks/useKependudukan';
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Heart, 
  Users, 
  CheckCircle2,
  Info,
  ChevronDown
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function EditWargaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const wargaId = Array.isArray(id) ? id[0] : id;
  const updateWarga = useUpdateWarga();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: warga, isLoading } = useQuery({
    queryKey: ['warga', wargaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wargas')
        .select('*')
        .eq('id', wargaId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!wargaId,
  });

  const [form, setForm] = useState({
    nama_lengkap: '',
    nik: '',
    jenis_kelamin: 'L',
    tempat_lahir: '',
    tanggal_lahir: '',
    agama: 'ISLAM',
    pekerjaan: '',
    status_kawin: 'BELUM KAWIN',
    pendidikan: 'SD/SEDERAJAT',
    status_dalam_keluarga: '',
    status_warga: '',
    status_kehamilan: false,
    status_menyusui: false,
  });

  useEffect(() => {
    if (warga) {
      setForm({
        nama_lengkap: warga.nama_lengkap || '',
        nik: warga.nik || '',
        jenis_kelamin: warga.jenis_kelamin || 'L',
        tempat_lahir: warga.tempat_lahir || '',
        tanggal_lahir: warga.tanggal_lahir || '',
        agama: warga.agama || 'ISLAM',
        pekerjaan: warga.pekerjaan || '',
        status_kawin: warga.status_kawin || 'BELUM KAWIN',
        pendidikan: warga.pendidikan || 'SD/SEDERAJAT',
        status_dalam_keluarga: warga.status_dalam_keluarga || '',
        status_warga: warga.status_warga || '',
        status_kehamilan: warga.status_kehamilan || false,
        status_menyusui: warga.status_menyusui || false,
      });
    }
  }, [warga]);

  const handleSubmit = async () => {
    if (!form.nama_lengkap) {
      Alert.alert('Perhatian', 'Nama lengkap wajib diisi.');
      return;
    }

    try {
      await updateWarga.mutateAsync({ id: wargaId, ...form });
      Alert.alert('Berhasil', 'Data warga telah diperbarui.');
      router.back();
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal memperbarui data.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#67C090" />
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Perbarui Data</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.content}>
            <View style={styles.formCard}>
              {/* Nama Lengkap */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>NAMA LENGKAP</Text>
                <View style={styles.inputWrapper}>
                  <User size={20} color="#94A3B8" style={{ marginLeft: 16 }} />
                  <TextInput
                    placeholder="Nama Lengkap sesuai KTP"
                    style={styles.input}
                    value={form.nama_lengkap}
                    onChangeText={(val) => setForm({...form, nama_lengkap: val})}
                  />
                </View>
              </View>

              {/* NIK */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>NOMOR INDUK KEPENDUDUKAN (NIK)</Text>
                <View style={styles.inputWrapper}>
                  <CreditCard size={20} color="#94A3B8" style={{ marginLeft: 16 }} />
                  <TextInput
                    placeholder="16 Digit NIK"
                    keyboardType="numeric"
                    style={styles.input}
                    value={form.nik}
                    onChangeText={(val) => setForm({...form, nik: val})}
                  />
                </View>
              </View>

              {/* Jenis Kelamin */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>JENIS KELAMIN</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity 
                    onPress={() => setForm({...form, jenis_kelamin: 'L'})}
                    style={[styles.genderButton, form.jenis_kelamin === 'L' && styles.genderButtonActive]}
                  >
                    <Text style={[styles.genderText, form.jenis_kelamin === 'L' && styles.genderTextActive]}>Laki-laki</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setForm({...form, jenis_kelamin: 'P'})}
                    style={[styles.genderButton, form.jenis_kelamin === 'P' && styles.genderButtonActive]}
                  >
                    <Text style={[styles.genderText, form.jenis_kelamin === 'P' && styles.genderTextActive]}>Perempuan</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* TTL Section */}
              <View style={styles.row}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>TEMPAT LAHIR</Text>
                  <View style={styles.inputWrapper}>
                    <MapPin size={18} color="#94A3B8" style={{ marginLeft: 16 }} />
                    <TextInput
                      placeholder="Kota/Kab"
                      style={[styles.input, { paddingLeft: 12 }]}
                      value={form.tempat_lahir}
                      onChangeText={(val) => setForm({...form, tempat_lahir: val})}
                    />
                  </View>
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>TGL LAHIR</Text>
                  <TouchableOpacity 
                    onPress={() => setShowDatePicker(true)}
                    style={[styles.inputWrapper, { height: 56, paddingLeft: 16, flexDirection: 'row', alignItems: 'center' }]}
                  >
                    <Calendar size={18} color="#94A3B8" />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B', marginLeft: 12, flex: 1 }}>
                      {form.tanggal_lahir || 'YYYY-MM-DD'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Pekerjaan */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>PEKERJAAN</Text>
                <View style={styles.inputWrapper}>
                  <Briefcase size={20} color="#94A3B8" style={{ marginLeft: 16 }} />
                  <TextInput
                    placeholder="Contoh: Buruh Harian Lepas"
                    style={styles.input}
                    value={form.pekerjaan}
                    onChangeText={(val) => setForm({...form, pekerjaan: val})}
                  />
                </View>
              </View>

              {/* Pendidikan */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>PENDIDIKAN TERAKHIR</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
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

              {/* Agama */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>AGAMA</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
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

              {/* Status Kawin */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>STATUS PERKAWINAN</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
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

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>HUBUNGAN KELUARGA</Text>
                <View style={styles.inputWrapper}>
                  <Users size={20} color="#94A3B8" style={{ marginLeft: 16 }} />
                  <TextInput
                    placeholder="Contoh: Anak"
                    style={styles.input}
                    value={form.status_dalam_keluarga}
                    onChangeText={(val) => setForm({...form, status_dalam_keluarga: val})}
                  />
                </View>
              </View>

              {/* PKK Specific (Hanya untuk Perempuan atau jika sudah ada data sebelumnya) */}
              {form.jenis_kelamin === 'P' && (
                <View style={styles.pkkSection}>
                  <Text style={styles.sectionDivider}>DATA KESEHATAN (PKK)</Text>
                  
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Sedang Hamil?</Text>
                    <TouchableOpacity 
                      onPress={() => setForm({...form, status_kehamilan: !form.status_kehamilan})}
                      style={[styles.toggleBtn, form.status_kehamilan && styles.toggleBtnActive]}
                    >
                      <Text style={[styles.toggleBtnText, form.status_kehamilan && styles.toggleBtnTextActive]}>
                        {form.status_kehamilan ? 'YA' : 'TIDAK'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Sedang Menyusui?</Text>
                    <TouchableOpacity 
                      onPress={() => setForm({...form, status_menyusui: !form.status_menyusui})}
                      style={[styles.toggleBtn, form.status_menyusui && styles.toggleBtnActive]}
                    >
                      <Text style={[styles.toggleBtnText, form.status_menyusui && styles.toggleBtnTextActive]}>
                        {form.status_menyusui ? 'YA' : 'TIDAK'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity 
                onPress={handleSubmit}
                disabled={updateWarga.isPending}
                style={styles.submitButton}
              >
                {updateWarga.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <CheckCircle2 size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>SIMPAN PERUBAHAN</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#67C090',
    borderColor: '#67C090',
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
  row: {
    flexDirection: 'row',
    gap: 12,
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
  },
  pkkSection: {
    backgroundColor: '#FFF1F2',
    padding: 16,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  sectionDivider: {
    fontSize: 10,
    fontWeight: '900',
    color: '#E11D48',
    letterSpacing: 1,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    minWidth: 70,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
  },
  toggleBtnTextActive: {
    color: '#fff',
  },
  miniBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
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
  }
});
