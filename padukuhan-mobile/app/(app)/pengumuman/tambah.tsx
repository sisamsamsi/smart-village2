import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Dimensions } from 'react-native';
import { useCreateAnnouncement } from '@/hooks/useAnnouncements';
import { 
  ArrowLeft, 
  Send,
  Image as ImageIcon,
  Target,
  Globe,
  Check
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

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
      Alert.alert('Eror', 'Silakan isi judul dan isi pengumuman.');
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#1E293B" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buat Pengumuman</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>JUDUL PENGUMUMAN</Text>
              <TextInput
                placeholder="Masukkan judul..."
                style={styles.textInput}
                value={form.judul}
                onChangeText={(val) => setForm({...form, judul: val})}
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ISI PENGUMUMAN</Text>
              <TextInput
                placeholder="Tulis informasi selengkap mungkin..."
                multiline
                style={[styles.textInput, styles.textArea]}
                textAlignVertical="top"
                value={form.isi}
                onChangeText={(val) => setForm({...form, isi: val})}
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelWithIcon}>
                <ImageIcon size={12} color="#94A3B8" style={{ marginRight: 6 }} />
                <Text style={styles.inputLabel}>URL GAMBAR (OPSIONAL)</Text>
              </View>
              <TextInput
                placeholder="https://..."
                style={[styles.textInput, styles.smallInput]}
                value={form.foto_url}
                onChangeText={(val) => setForm({...form, foto_url: val})}
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>TARGET PENERIMA</Text>
              <View style={styles.targetGrid}>
                <TouchableOpacity 
                  onPress={() => setForm({...form, target: 'semua'})}
                  style={[styles.targetOption, form.target === 'semua' && styles.targetActive]}
                >
                  <Globe size={18} color={form.target === 'semua' ? 'white' : '#94A3B8'} />
                  <Text style={[styles.targetText, form.target === 'semua' && styles.targetTextActive]}>Publik</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setForm({...form, target: 'rt_tertentu'})}
                  style={[styles.targetOption, form.target === 'rt_tertentu' && styles.targetActive]}
                >
                  <Target size={18} color={form.target === 'rt_tertentu' ? 'white' : '#94A3B8'} />
                  <Text style={[styles.targetText, form.target === 'rt_tertentu' && styles.targetTextActive]}>Internal</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={createAnnouncement.isPending}
              style={[styles.submitButton, createAnnouncement.isPending && styles.submitDisabled]}
            >
              {createAnnouncement.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={styles.submitContent}>
                  <Send size={20} color="white" style={{ marginRight: 10 }} />
                  <Text style={styles.submitText}>Terbitkan Pengumuman</Text>
                </View>
              )}
            </TouchableOpacity>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
  },
  textArea: {
    height: 150,
  },
  smallInput: {
    padding: 14,
    fontSize: 13,
  },
  targetGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  targetOption: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetActive: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  targetText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  targetTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#1B5E20',
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  }
});
