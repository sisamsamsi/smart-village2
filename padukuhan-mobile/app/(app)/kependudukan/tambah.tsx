import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, User, CreditCard, MapPin, Calendar, Briefcase, Users, X, Check, Search, Info } from 'lucide-react-native';
import { useTambahWarga, useRTs, useKKs } from '@/hooks/useKependudukan';

export default function TambahWargaScreen() {
  const router = useRouter();
  const { mutateAsync: tambahWarga } = useTambahWarga();
  const { data: rts } = useRTs();
  const { data: kkList } = useKKs();
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
    if (!form.nama_lengkap || !form.nik || !form.rt_id) {
      Alert.alert('Error', 'Nama, NIK, dan RT wajib diisi');
      return;
    }

    if (!form.is_new_kk && !form.rumah_tangga_id) {
      Alert.alert('Error', 'Silakan pilih No KK atau gunakan opsi KK Baru');
      return;
    }

    setLoading(true);
    try {
      await tambahWarga(form);

      Alert.alert('Sukses', 'Data warga berhasil ditambahkan');
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(app)/(tabs)/kependudukan' as any);
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

            {/* RT Selection */}
            <View style={styles.field}>
              <Text style={styles.label}>Pilih RT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
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
                <Text style={styles.label}>Pilih Kartu Keluarga (KK)</Text>
                <View style={styles.searchContainer}>
                  <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: 16, top: 18, zIndex: 1 }} />
                  <TextInput 
                    style={[styles.input, { paddingLeft: 48, backgroundColor: '#F8FAFC', borderRadius: 18, height: 56, borderWidth: 1, borderColor: '#E2E8F0' }]}
                    placeholder="Cari No KK atau Nama Kepala Keluarga..."
                    onChangeText={(text) => {
                      // Simple search logic could be added here
                    }}
                  />
                  <ScrollView style={{ maxHeight: 200, marginTop: 8 }} nestedScrollEnabled>
                    {kkList?.map((kk: any) => (
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
                  label="Nama Kepala Keluarga (Baru)"
                  value={form.nama_kepala_keluarga_baru}
                  onChangeText={(v) => setForm({ ...form, nama_kepala_keluarga_baru: v })}
                  placeholder="Sesuai nama di KK"
                />
              </View>
            )}

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
                <InputGroup
                  label="Tanggal Lahir"
                  value={form.tanggal_lahir}
                  onChangeText={(v) => setForm({ ...form, tanggal_lahir: v })}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Agama</Text>
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

            <View style={styles.field}>
              <Text style={styles.label}>Pendidikan</Text>
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

            <View style={styles.field}>
              <Text style={styles.label}>Status Kawin</Text>
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
                  <Text style={styles.submitButtonText}>Daftarkan Warga</Text>
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
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
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
    backgroundColor: '#F1F5F9',
    padding: 4,
    borderRadius: 16,
  },
  toggleBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#1B5E20',
  },
  searchContainer: {
    backgroundColor: '#fff',
  },
  kkItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  kkItemActive: {
    backgroundColor: '#F0FDF4',
  },
  kkItemText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  kkItemTextActive: {
    color: '#1B5E20',
  },
  kkItemSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  newKkBox: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
  },
  field: {
    gap: 10,
  }
});
