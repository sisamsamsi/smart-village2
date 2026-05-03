import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
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
    agama: '',
    pekerjaan: '',
    status_perkawinan: '',
    hubungan_keluarga: '',
    status_warga: '',
  });

  useEffect(() => {
    if (warga) {
      setForm({
        nama_lengkap: warga.nama_lengkap || '',
        nik: warga.nik || '',
        jenis_kelamin: warga.jenis_kelamin || 'L',
        tempat_lahir: warga.tempat_lahir || '',
        tanggal_lahir: warga.tanggal_lahir || '',
        agama: warga.agama || '',
        pekerjaan: warga.pekerjaan || '',
        status_perkawinan: warga.status_perkawinan || '',
        hubungan_keluarga: warga.hubungan_keluarga || '',
        status_warga: warga.status_warga || '',
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
        <ActivityIndicator size="large" color="#1B5E20" />
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
              <ArrowLeft color="#1B5E20" size={24} />
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
                  <View style={styles.inputWrapper}>
                    <Calendar size={18} color="#94A3B8" style={{ marginLeft: 16 }} />
                    <TextInput
                      placeholder="YYYY-MM-DD"
                      style={[styles.input, { paddingLeft: 12 }]}
                      value={form.tanggal_lahir}
                      onChangeText={(val) => setForm({...form, tanggal_lahir: val})}
                    />
                  </View>
                </View>
              </View>

              {/* Pekerjaan & Agama */}
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

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>STATUS PERKAWINAN</Text>
                <View style={styles.inputWrapper}>
                  <Heart size={20} color="#94A3B8" style={{ marginLeft: 16 }} />
                  <TextInput
                    placeholder="Contoh: Belum Kawin"
                    style={styles.input}
                    value={form.status_perkawinan}
                    onChangeText={(val) => setForm({...form, status_perkawinan: val})}
                  />
                </View>
              </View>

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
  row: {
    flexDirection: 'row',
    gap: 12,
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
