import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, User, CreditCard, MapPin, Calendar, Briefcase, Users, X, Check } from 'lucide-react-native';

export default function TambahWargaScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama_lengkap: '',
    nik: '',
    tempat_lahir: 'Bantul',
    tanggal_lahir: '2000-01-01',
    jenis_kelamin: 'L',
    agama: 'Islam',
    pekerjaan: 'Buruh',
    status_perkawinan: 'belum_kawin',
    hubungan_keluarga: 'anak',
    rt_id: '1',
  });

  const handleSubmit = async () => {
    if (!form.nama_lengkap || !form.nik) {
      Alert.alert('Error', 'Nama dan NIK wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('wargas').insert([form]);

      if (error) throw error;

      Alert.alert('Sukses', 'Data warga berhasil ditambahkan');
      queryClient.invalidateQueries({ queryKey: ['wargas'] });
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/warga' as any);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan';
      Alert.alert('Gagal', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/warga' as any)} style={styles.closeButton}>
            <X color="#64748B" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tambah Warga</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introSection}>
            <View style={styles.iconWrapper}>
              <Users color="#1B5E20" size={32} />
            </View>
            <Text style={styles.introTitle}>Data Penduduk Baru</Text>
            <Text style={styles.introSub}>Lengkapi formulir di bawah sesuai dengan identitas resmi (KTP/KK).</Text>
          </View>

          <View style={styles.form}>
            <InputGroup
              label="Nama Lengkap"
              icon={<User size={18} color="#94A3B8" />}
              value={form.nama_lengkap}
              onChangeText={(v) => setForm({ ...form, nama_lengkap: v })}
              placeholder="Masukkan nama lengkap"
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
              <View style={styles.half}>
                <InputGroup
                  label="Nomor RT"
                  value={form.rt_id}
                  onChangeText={(v) => setForm({ ...form, rt_id: v })}
                  placeholder="1-6"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <InputGroup 
              label="Tempat Lahir" 
              icon={<MapPin size={18} color="#94A3B8" />}
              value={form.tempat_lahir} 
              onChangeText={(v) => setForm({ ...form, tempat_lahir: v })} 
              placeholder="Contoh: Bantul"
            />

            <InputGroup
              label="Tanggal Lahir"
              icon={<Calendar size={18} color="#94A3B8" />}
              value={form.tanggal_lahir}
              onChangeText={(v) => setForm({ ...form, tanggal_lahir: v })}
              placeholder="YYYY-MM-DD"
            />

            <InputGroup 
              label="Pekerjaan" 
              icon={<Briefcase size={18} color="#94A3B8" />}
              value={form.pekerjaan} 
              onChangeText={(v) => setForm({ ...form, pekerjaan: v })} 
              placeholder="Contoh: Karyawan Swasta"
            />

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Check color="#fff" size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Simpan Data</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  closeButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    height: 64,
    width: 64,
    borderRadius: 24,
    backgroundColor: 'rgba(27, 94, 32, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 8,
  },
  introSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#1E293B',
    fontSize: 15,
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
    height: 60,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 6,
  },
  genderOption: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
  },
  genderTextActive: {
    color: '#1B5E20',
  },
  submitButton: {
    height: 64,
    backgroundColor: '#1B5E20',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  }
});
