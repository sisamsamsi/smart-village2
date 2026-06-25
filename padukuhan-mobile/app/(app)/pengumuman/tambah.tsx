import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateAnnouncement } from '@/hooks/useAnnouncements';
import { ArrowLeft, Send, Globe, Target, Image as ImageIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AddAnnouncementScreen() {
  const router = useRouter();
  const createAnnouncement = useCreateAnnouncement();

  const [form, setForm] = useState({
    judul: '',
    isi: '',
    foto_url: '',
    target: 'semua' as 'semua' | 'rt_tertentu',
    aktif: true
  });

  const handleSubmit = async () => {
    if (!form.judul || !form.isi) {
      Alert.alert('Perhatian', 'Silakan isi judul dan isi pengumuman.');
      return;
    }
    try {
      await createAnnouncement.mutateAsync(form);
      Alert.alert('Berhasil', 'Pengumuman berhasil diterbitkan.');
      router.back();
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal menerbitkan pengumuman.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buat Pengumuman</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Judul */}
          <View style={styles.field}>
            <Text style={styles.label}>JUDUL</Text>
            <TextInput
              placeholder="Masukkan judul pengumuman..."
              style={styles.input}
              value={form.judul}
              onChangeText={(v) => setForm({ ...form, judul: v })}
              placeholderTextColor="#CBD5E1"
            />
          </View>

          {/* Isi */}
          <View style={styles.field}>
            <Text style={styles.label}>ISI PENGUMUMAN</Text>
            <TextInput
              placeholder="Tulis informasi selengkap mungkin..."
              style={[styles.input, styles.textarea]}
              multiline
              textAlignVertical="top"
              value={form.isi}
              onChangeText={(v) => setForm({ ...form, isi: v })}
              placeholderTextColor="#CBD5E1"
            />
          </View>

          {/* URL Gambar */}
          <View style={styles.field}>
            <Text style={styles.label}>URL GAMBAR (OPSIONAL)</Text>
            <View style={styles.inputWithIcon}>
              <ImageIcon size={14} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="https://..."
                style={styles.inputInline}
                value={form.foto_url}
                onChangeText={(v) => setForm({ ...form, foto_url: v })}
                placeholderTextColor="#CBD5E1"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Target */}
          <View style={styles.field}>
            <Text style={styles.label}>TARGET PENERIMA</Text>
            <View style={styles.segmentRow}>
              <TouchableOpacity
                onPress={() => setForm({ ...form, target: 'semua' })}
                style={[styles.segment, form.target === 'semua' && styles.segmentActive]}
              >
                <Globe size={14} color={form.target === 'semua' ? '#124170' : '#94A3B8'} />
                <Text style={[styles.segmentText, form.target === 'semua' && styles.segmentTextActive]}>Semua Warga</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setForm({ ...form, target: 'rt_tertentu' })}
                style={[styles.segment, form.target === 'rt_tertentu' && styles.segmentActive]}
              >
                <Target size={14} color={form.target === 'rt_tertentu' ? '#124170' : '#94A3B8'} />
                <Text style={[styles.segmentText, form.target === 'rt_tertentu' && styles.segmentTextActive]}>RT Tertentu</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={createAnnouncement.isPending}
            style={[styles.submitBtn, createAnnouncement.isPending && { opacity: 0.6 }]}
          >
            {createAnnouncement.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Send size={16} color="#fff" />
                <Text style={styles.submitText}>Terbitkan Pengumuman</Text>
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
  inputInline: { flex: 1, fontSize: 13, color: '#1E293B' },

  segmentRow: { flexDirection: 'row', gap: 10 },
  segment: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0',
  },
  segmentActive: { borderColor: '#124170', backgroundColor: '#EFF6FF' },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  segmentTextActive: { color: '#124170' },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#124170',
    paddingVertical: 14, borderRadius: 12, marginTop: 4,
  },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
