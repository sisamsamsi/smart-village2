import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useCreateAnnouncement } from '@/hooks/useAnnouncements';
import { 
  ArrowLeft, 
  Send,
  Image as ImageIcon,
  Target,
  Globe,
  Info
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

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
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 pb-10">
          <View className="flex-row items-center mt-6 mb-8">
            <TouchableOpacity onPress={() => router.back()} className="bg-slate-100 p-3 rounded-2xl">
              <ArrowLeft color="#64748B" size={20} />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-black text-slate-900">Buat Pengumuman</Text>
          </View>

          <View className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
            <View className="space-y-2">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Pengumuman</Text>
              <TextInput
                placeholder="Masukkan judul..."
                className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold text-slate-900"
                value={form.judul}
                onChangeText={(val) => setForm({...form, judul: val})}
              />
            </View>

            <View className="space-y-2">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Isi Pengumuman</Text>
              <TextInput
                placeholder="Tulis informasi selengkap mungkin..."
                multiline
                className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-medium h-48 text-slate-700"
                textAlignVertical="top"
                value={form.isi}
                onChangeText={(val) => setForm({...form, isi: val})}
              />
            </View>

            <View className="space-y-2">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex-row items-center">
                <ImageIcon size={10} color="#94A3B8" /> URL Gambar (Opsional)
              </Text>
              <TextInput
                placeholder="https://..."
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium text-slate-400 text-xs"
                value={form.foto_url}
                onChangeText={(val) => setForm({...form, foto_url: val})}
              />
            </View>

            <View className="space-y-3">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Penerima</Text>
              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  onPress={() => setForm({...form, target: 'semua'})}
                  className={`flex-1 p-4 rounded-2xl border flex-row items-center justify-center ${form.target === 'semua' ? 'bg-slate-900 border-slate-900 shadow-lg' : 'bg-slate-50 border-slate-100'}`}
                >
                  <Globe size={14} color={form.target === 'semua' ? 'white' : '#94A3B8'} />
                  <Text className={`ml-2 font-black text-[10px] uppercase tracking-widest ${form.target === 'semua' ? 'text-white' : 'text-slate-400'}`}>Publik</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setForm({...form, target: 'rt_tertentu'})}
                  className={`flex-1 p-4 rounded-2xl border flex-row items-center justify-center ${form.target === 'rt_tertentu' ? 'bg-slate-900 border-slate-900 shadow-lg' : 'bg-slate-50 border-slate-100'}`}
                >
                  <Target size={14} color={form.target === 'rt_tertentu' ? 'white' : '#94A3B8'} />
                  <Text className={`ml-2 font-black text-[10px] uppercase tracking-widest ${form.target === 'rt_tertentu' ? 'text-white' : 'text-slate-400'}`}>Internal</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={createAnnouncement.isPending}
              className="bg-blue-600 p-6 rounded-3xl items-center shadow-xl shadow-blue-900/20 mt-4"
            >
              {createAnnouncement.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Send size={18} color="white" />
                  <Text className="text-white font-black uppercase tracking-widest ml-3">Terbitkan</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
