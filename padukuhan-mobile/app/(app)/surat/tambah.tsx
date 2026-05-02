import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useCreateSurat, useSuratTemplates } from '@/hooks/useSurat';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Search,
  CheckCircle2,
  FileText,
  User,
  Info
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AddSuratScreen() {
  const router = useRouter();
  const createSurat = useCreateSurat();
  const { data: templates } = useSuratTemplates();
  
  const [wargaSearch, setWargaSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedWarga, setSelectedWarga] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const [form, setForm] = useState({
    jenis_surat: 'pengantar_rt',
    keperluan: '',
    warga_id: ''
  });

  const handleSearchWarga = async (text: string) => {
    setWargaSearch(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const { data, error } = await supabase
      .from('wargas')
      .select('id, nama_lengkap, nik, rts(nomor_rt)')
      .ilike('nama_lengkap', `%${text}%`)
      .eq('status_warga', 'aktif')
      .limit(5);
    
    if (!error && data) {
      setSearchResults(data);
    }
    setSearching(false);
  };

  const selectWarga = (warga: any) => {
    setSelectedWarga(warga);
    setForm({ ...form, warga_id: warga.id });
    setWargaSearch('');
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!form.warga_id) {
      Alert.alert('Eror', 'Silakan cari dan pilih warga.');
      return;
    }

    if (!form.keperluan) {
      Alert.alert('Eror', 'Silakan isi keperluan surat.');
      return;
    }

    try {
      await createSurat.mutateAsync(form);
      Alert.alert('Berhasil', 'Pengajuan surat berhasil dibuat. Silakan cek di daftar antrean.');
      router.back();
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal membuat pengajuan.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6">
          <View className="flex-row items-center mt-6 mb-8">
            <TouchableOpacity onPress={() => router.back()} className="bg-slate-100 p-3 rounded-2xl">
              <ArrowLeft color="#64748B" size={20} />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-black text-slate-900">Buat Surat</Text>
          </View>

          <View className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
            <View className="items-center mb-4">
              <View className="bg-blue-50 p-6 rounded-full">
                <FileText size={32} color="#1E3A8A" />
              </View>
            </View>

            {/* Warga Search */}
            <View className="space-y-2">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Warga</Text>
              {selectedWarga ? (
                <View className="bg-slate-900 p-5 rounded-2xl flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-white font-black text-base">{selectedWarga.nama_lengkap}</Text>
                    <Text className="text-white/40 text-[10px] font-bold">NIK: {selectedWarga.nik}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedWarga(null)} className="bg-white/10 p-2 rounded-full">
                    <Text className="text-white text-xs">✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="relative">
                  <View className="bg-slate-50 flex-row items-center px-5 rounded-2xl border border-slate-100">
                    <Search size={18} color="#94A3B8" />
                    <TextInput
                      placeholder="Cari nama atau NIK..."
                      className="flex-1 p-5 font-bold text-slate-800"
                      value={wargaSearch}
                      onChangeText={handleSearchWarga}
                    />
                    {searching && <ActivityIndicator size="small" color="#1E3A8A" />}
                  </View>
                  
                  {searchResults.length > 0 && (
                    <View className="absolute top-full left-0 right-0 bg-white mt-2 rounded-2xl border border-slate-100 shadow-2xl z-50 overflow-hidden">
                      {searchResults.map((w) => (
                        <TouchableOpacity 
                          key={w.id} 
                          onPress={() => selectWarga(w)}
                          className="p-4 border-b border-slate-50 flex-row justify-between items-center"
                        >
                          <View>
                            <Text className="font-bold text-slate-800">{w.nama_lengkap}</Text>
                            <Text className="text-[10px] text-slate-400">NIK: {w.nik}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>

            <View className="space-y-2">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Surat</Text>
              <View className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-2">
                  {templates?.map((t: any) => (
                    <TouchableOpacity 
                      key={t.id}
                      onPress={() => setForm({...form, jenis_surat: t.jenis_surat})}
                      className={`mr-2 px-4 py-2 rounded-xl ${form.jenis_surat === t.jenis_surat ? 'bg-blue-600' : 'bg-white border border-slate-100'}`}
                    >
                      <Text className={`text-[10px] font-black uppercase ${form.jenis_surat === t.jenis_surat ? 'text-white' : 'text-slate-400'}`}>{t.judul}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View className="space-y-2">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keperluan / Tujuan</Text>
              <TextInput
                placeholder="Contoh: Mengurus KK Baru"
                multiline
                className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-medium h-32"
                textAlignVertical="top"
                value={form.keperluan}
                onChangeText={(val) => setForm({...form, keperluan: val})}
              />
            </View>

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={createSurat.isPending}
              className="bg-blue-600 p-6 rounded-3xl items-center shadow-xl shadow-blue-900/20"
            >
              {createSurat.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                  <CheckCircle2 size={18} color="white" />
                  <Text className="text-white font-black uppercase tracking-widest ml-3">Buat Pengajuan</Text>
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
