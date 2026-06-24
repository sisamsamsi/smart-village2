import React, { useState } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateProposal, useRts } from '@/hooks/useProgram';
import { useAuthStore } from '@/stores/authStore';
import { ArrowLeft, Send, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const CATEGORIES = ['infrastruktur', 'sosial', 'kesehatan', 'pendidikan', 'lainnya'];

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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Usulan Program</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Nama Program */}
          <View style={styles.field}>
            <Text style={styles.label}>NAMA PROGRAM / KEGIATAN</Text>
            <TextInput
              placeholder="Contoh: Perbaikan Aspal RT 04"
              style={styles.input}
              value={form.nama_program}
              onChangeText={(v) => setForm({ ...form, nama_program: v })}
              placeholderTextColor="#CBD5E1"
            />
          </View>

          {/* Kategori */}
          <View style={styles.field}>
            <Text style={styles.label}>KATEGORI</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setForm({ ...form, jenis_program: cat })}
                  style={[styles.chip, form.jenis_program === cat && styles.chipActive]}
                >
                  <Text style={[styles.chipText, form.jenis_program === cat && styles.chipTextActive]}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* RT (Dukuh only) */}
          {isDukuh() && (
            <View style={styles.field}>
              <Text style={styles.label}>WILAYAH RT TERDAMPAK</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {rts?.map((rt: any) => (
                  <TouchableOpacity
                    key={rt.id}
                    onPress={() => setForm({ ...form, rt_id: rt.id })}
                    style={[styles.chip, form.rt_id === rt.id && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, form.rt_id === rt.id && styles.chipTextActive]}>RT {rt.nomor_rt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Lokasi */}
          <View style={styles.field}>
            <Text style={styles.label}>LOKASI DETAIL</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={14} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Contoh: Depan Masjid Al-Ikhlas"
                style={styles.inputInline}
                value={form.lokasi}
                onChangeText={(v) => setForm({ ...form, lokasi: v })}
                placeholderTextColor="#CBD5E1"
              />
            </View>
          </View>

          {/* Deskripsi */}
          <View style={styles.field}>
            <Text style={styles.label}>DESKRIPSI & LATAR BELAKANG</Text>
            <TextInput
              placeholder="Jelaskan secara rinci alasan dan rencana program..."
              multiline
              style={[styles.input, styles.textarea]}
              textAlignVertical="top"
              value={form.deskripsi}
              onChangeText={(v) => setForm({ ...form, deskripsi: v })}
              placeholderTextColor="#CBD5E1"
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={createProposal.isPending}
            style={[styles.submitBtn, createProposal.isPending && { opacity: 0.6 }]}
          >
            {createProposal.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Send size={16} color="#fff" />
                <Text style={styles.submitText}>Kirim Usulan</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#1E293B' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },

  field: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '700', color: '#94A3B8', letterSpacing: 1, marginBottom: 8 },

  input: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#1E293B',
  },
  textarea: { height: 130, paddingTop: 12 },
  inputWithIcon: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  inputInline: { flex: 1, fontSize: 14, color: '#1E293B' },

  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#EDF7F2', borderColor: '#67C090' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  chipTextActive: { color: '#67C090' },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#67C090',
    paddingVertical: 14, borderRadius: 12, marginTop: 4,
  },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
