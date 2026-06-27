import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateAnnouncement } from '@/hooks/useAnnouncements';
import { useRts } from '@/hooks/useProgram';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Send, Globe, Target, Image as ImageIcon, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const supabaseService = createClient(
  'https://ouvkmlfbvhtpqqrtcesn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dmttbGZidmh0cHFxcnRjZXNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY4MjczNCwiZXhwIjoyMDkzMjU4NzM0fQ.0B-aU9V4G2NIqvM4-TcFO-FUlSWKuPC3g0Pgp3rUoZM'
);

export default function AddAnnouncementScreen() {
  const router = useRouter();
  const createAnnouncement = useCreateAnnouncement();
  const { profile } = useAuthStore();
  const { data: rts } = useRts();
  const isDukuh = profile?.role === 'dukuh';

  const [form, setForm] = useState({
    judul: '',
    isi: '',
    foto_url: '',
    target: (profile?.role === 'dukuh' ? 'semua' : 'rt_tertentu') as 'semua' | 'rt_tertentu',
    aktif: true
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedRtIds, setSelectedRtIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Ditolak', 'Aplikasi memerlukan izin galeri untuk memilih foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: filename,
        type
      } as any);

      const fileExt = uri.split('.').pop() || 'jpg';
      const filePath = `announcement_${Date.now()}.${fileExt}`;

      const { data, error } = await supabaseService.storage
        .from('pengumuman')
        .upload(filePath, formData, {
          contentType: type
        });

      if (error) throw error;

      const { data: publicUrlData } = supabaseService.storage
        .from('pengumuman')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err: any) {
      console.log('Error uploading image:', err);
      Alert.alert('Gagal Upload', 'Gagal mengunggah foto pengumuman. Melanjutkan tanpa foto.');
      return null;
    }
  };

  const toggleRtSelection = (rtId: string) => {
    if (selectedRtIds.includes(rtId)) {
      setSelectedRtIds(selectedRtIds.filter(id => id !== rtId));
    } else {
      setSelectedRtIds([...selectedRtIds, rtId]);
    }
  };

  const handleSubmit = async () => {
    if (!form.judul || !form.isi) {
      Alert.alert('Perhatian', 'Silakan isi judul dan isi pengumuman.');
      return;
    }
    if (form.target === 'rt_tertentu' && isDukuh && selectedRtIds.length === 0) {
      Alert.alert('Perhatian', 'Silakan pilih minimal satu wilayah RT sasaran.');
      return;
    }

    setUploading(true);
    let imageUrl = '';
    
    if (selectedImage) {
      const uploadedUrl = await uploadImage(selectedImage);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    try {
      const payload = {
        ...form,
        foto_url: imageUrl || form.foto_url,
        target_rt_ids: isDukuh ? selectedRtIds : [profile?.rt_id]
      };

      await createAnnouncement.mutateAsync(payload);
      Alert.alert('Berhasil', 'Pengumuman berhasil diterbitkan.');
      router.back();
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal menerbitkan pengumuman.');
    } finally {
      setUploading(false);
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

          {/* Lampiran Gambar */}
          <View style={styles.field}>
            <Text style={styles.label}>FOTO PENGUMUMAN (DARI HP)</Text>
            {selectedImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} resizeMode="cover" />
                <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeImageBtn}>
                  <X size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={pickImage} style={styles.pickImageBtn}>
                <ImageIcon size={18} color="#94A3B8" />
                <Text style={styles.pickImageText}>Pilih Gambar dari Galeri</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Target (Dukuh Only) */}
          {isDukuh && (
            <View style={styles.field}>
              <Text style={styles.label}>TARGET PENERIMA</Text>
              <View style={styles.segmentRow}>
                <TouchableOpacity
                  onPress={() => setForm({ ...form, target: 'semua' })}
                  style={[styles.segment, form.target === 'semua' && styles.segmentActive]}
                >
                  <Globe size={14} color={form.target === 'semua' ? '#124170' : '#94A3B8'} />
                  <Text style={[styles.segmentText, form.target === 'semua' && styles.segmentTextActive]}>Semua Dasawisma</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setForm({ ...form, target: 'rt_tertentu' })}
                  style={[styles.segment, form.target === 'rt_tertentu' && styles.segmentActive]}
                >
                  <Target size={14} color={form.target === 'rt_tertentu' ? '#124170' : '#94A3B8'} />
                  <Text style={[styles.segmentText, form.target === 'rt_tertentu' && styles.segmentTextActive]}>RT Sasaran</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* RT List Selector (Dukuh & RT sasaran only) */}
          {isDukuh && form.target === 'rt_tertentu' && (
            <View style={styles.field}>
              <Text style={styles.label}>PILIH WILAYAH RT SASARAN</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                {rts?.map((rt: any) => {
                  const isSelected = selectedRtIds.includes(rt.id);
                  return (
                    <TouchableOpacity
                      key={rt.id}
                      onPress={() => toggleRtSelection(rt.id)}
                      style={[styles.chip, isSelected && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>RT {rt.nomor_rt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={createAnnouncement.isPending || uploading}
            style={[styles.submitBtn, (createAnnouncement.isPending || uploading) && { opacity: 0.6 }]}
          >
            {createAnnouncement.isPending || uploading ? (
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

  pickImageBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12,
    paddingVertical: 16, borderStyle: 'dashed',
  },
  pickImageText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  imagePreviewContainer: {
    position: 'relative', width: '100%', height: 180, borderRadius: 12, overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: '100%' },
  removeImageBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },

  segmentRow: { flexDirection: 'row', gap: 10 },
  segment: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0',
  },
  segmentActive: { borderColor: '#124170', backgroundColor: '#124170' },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  segmentTextActive: { color: '#fff' },

  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#124170', borderColor: '#124170' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  chipTextActive: { color: '#fff' },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#124170',
    paddingVertical: 14, borderRadius: 12, marginTop: 4,
  },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
