import React, { useState } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateProposal, useRts } from '@/hooks/useProgram';
import { useAuthStore } from '@/stores/authStore';
import { ArrowLeft, Send, Construction, MapPin, ShieldCheck, LayoutGrid, Info, FileText } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function NewProposalScreen() {
  const router = useRouter();
  const createProposal = useCreateProposal();
  const { data: rts } = useRts();
  const isDukuh = useAuthStore((s) => s.isDukuh);
  
  const [form, setForm] = useState({
    nama_program: '',
    jenis_program: 'infrastruktur',
    deskripsi: '',
    lokasi: '',
    sumber_usulan: isDukuh() ? 'inisiatif_dukuh' : 'warga',
    rt_id: '',
  });

  const handleSubmit = async () => {
    if (!form.nama_program || !form.deskripsi || !form.lokasi) {
      Alert.alert('Perhatian', 'Mohon lengkapi semua bidang.');
      return;
    }
    if (isDukuh() && !form.rt_id) {
      Alert.alert('Perhatian', 'Silakan pilih wilayah RT terkait.');
      return;
    }

    try {
      await createProposal.mutateAsync(form);
      Alert.alert('Berhasil', 'Usulan program telah diajukan ke sistem.');
      router.back();
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal mengajukan usulan.');
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
            <Text style={styles.headerTitle}>Usulan Program</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.content}>
            {/* Hero Illustration */}
            <View style={styles.heroSection}>
              <View style={styles.heroIconWrapper}>
                {isDukuh() ? <ShieldCheck size={36} color="#fff" /> : <Construction size={36} color="#fff" />}
              </View>
              <View style={styles.heroTextContent}>
                <Text style={styles.heroTitle}>
                  {isDukuh() ? 'Inisiatif Dukuh' : 'Aspirasi Warga'}
                </Text>
                <Text style={styles.heroDescription}>
                  Sampaikan ide pembangunan atau kegiatan untuk kemajuan Padukuhan Mandingan.
                </Text>
              </View>
            </View>

            <View style={styles.formCard}>
              {/* Nama Program */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>NAMA PROGRAM / KEGIATAN</Text>
                <View style={styles.inputWrapper}>
                  <LayoutGrid size={20} color="#94A3B8" style={{ marginLeft: 16 }} />
                  <TextInput
                    placeholder="Contoh: Perbaikan Aspal RT 04"
                    style={styles.input}
                    value={form.nama_program}
                    onChangeText={(val) => setForm({...form, nama_program: val})}
                  />
                </View>
              </View>

              {/* Jenis Program */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>KATEGORI PROGRAM</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                  {['infrastruktur', 'sosial', 'kesehatan', 'pendidikan', 'lainnya'].map((type) => (
                    <TouchableOpacity 
                      key={type}
                      onPress={() => setForm({...form, jenis_program: type})}
                      style={[styles.categoryChip, form.jenis_program === type && styles.categoryChipActive]}
                    >
                      <Text style={[styles.categoryText, form.jenis_program === type && styles.categoryTextActive]}>
                        {type.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* RT Selection (Dukuh only) */}
              {isDukuh() && (
                 <View style={styles.field}>
                  <Text style={styles.fieldLabel}>WILAYAH RT TERDAMPAK</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {rts?.map((rt: any) => (
                      <TouchableOpacity 
                        key={rt.id}
                        onPress={() => setForm({...form, rt_id: rt.id})}
                        style={[styles.rtChip, form.rt_id === rt.id && styles.rtChipActive]}
                      >
                        <Text style={[styles.rtText, form.rt_id === rt.id && styles.rtTextActive]}>RT {rt.nomor_rt}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Lokasi */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>LOKASI DETAIL</Text>
                <View style={styles.inputWrapper}>
                  <MapPin size={20} color="#94A3B8" style={{ marginLeft: 16 }} />
                  <TextInput
                    placeholder="Contoh: Depan Masjid Al-Ikhlas"
                    style={styles.input}
                    value={form.lokasi}
                    onChangeText={(val) => setForm({...form, lokasi: val})}
                  />
                </View>
              </View>

              {/* Deskripsi */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>DESKRIPSI & LATAR BELAKANG</Text>
                <TextInput
                  placeholder="Jelaskan secara rinci alasan dan rencana program..."
                  multiline
                  style={[styles.input, styles.textArea]}
                  textAlignVertical="top"
                  value={form.deskripsi}
                  onChangeText={(val) => setForm({...form, deskripsi: val})}
                />
              </View>

              <TouchableOpacity 
                onPress={handleSubmit}
                disabled={createProposal.isPending}
                style={styles.submitButton}
              >
                {createProposal.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Send size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>KIRIM USULAN PROGRAM</Text>
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
  heroSection: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  heroIconWrapper: {
    height: 64,
    width: 64,
    borderRadius: 22,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextContent: {
    marginLeft: 20,
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  heroDescription: {
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
    height: 140,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  categoryScroll: {
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  categoryChipActive: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
  },
  categoryTextActive: {
    color: '#fff',
  },
  rtChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rtChipActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  rtText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
  },
  rtTextActive: {
    color: '#fff',
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
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 12,
    letterSpacing: 1,
  }
});
