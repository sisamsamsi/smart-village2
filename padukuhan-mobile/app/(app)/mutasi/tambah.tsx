import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useCreateMutasi } from '@/hooks/useMutasi';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Baby, 
  Skull, 
  ArrowRightLeft, 
  Search,
  CheckCircle2,
  Calendar as CalendarIcon,
  User,
  Info
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

type MutationType = 'kelahiran' | 'kematian' | 'pindah_keluar' | 'pindah_masuk';

export default function AddMutasiScreen() {
  const router = useRouter();
  const createMutasi = useCreateMutasi();
  const [activeTab, setActiveTab] = useState<MutationType>('kelahiran');
  
  const [wargaSearch, setWargaSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedWarga, setSelectedWarga] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const [form, setForm] = useState({
    jenis_mutasi: 'kelahiran' as MutationType,
    tanggal_mutasi: new Date().toISOString().split('T')[0],
    nama_bayi: '',
    jenis_kelamin_bayi: 'L',
    nama_ibu: '',
    nama_ayah: '',
    ada_akte: false,
    sebab_meninggal: '',
    tujuan_daerah: '',
    asal_daerah: '',
    keterangan: '',
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
    if (!form.tanggal_mutasi) {
      Alert.alert('Eror', 'Silakan isi tanggal mutasi.');
      return;
    }

    if (activeTab !== 'kelahiran' && !form.warga_id) {
      Alert.alert('Eror', 'Silakan cari dan pilih warga terlebih dahulu.');
      return;
    }

    if (activeTab === 'kelahiran' && !form.nama_bayi) {
      Alert.alert('Eror', 'Silakan isi nama bayi.');
      return;
    }

    try {
      await createMutasi.mutateAsync({ ...form, jenis_mutasi: activeTab });
      Alert.alert('Berhasil', 'Data mutasi berhasil disimpan.');
      router.back();
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal menyimpan data mutasi.');
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
            <Text className="ml-4 text-xl font-black text-slate-900">Input Mutasi</Text>
          </View>

          {/* Tabs */}
          <View className="flex-row mb-8 bg-white p-1.5 rounded-[25px] border border-slate-100 shadow-sm">
            <TabButton 
              active={activeTab === 'kelahiran'} 
              label="Lahir" 
              icon={<Baby size={14} color={activeTab === 'kelahiran' ? 'white' : '#64748B'} />}
              onPress={() => setActiveTab('kelahiran')} 
            />
            <TabButton 
              active={activeTab === 'kematian'} 
              label="Wafat" 
              icon={<Skull size={14} color={activeTab === 'kematian' ? 'white' : '#64748B'} />}
              onPress={() => setActiveTab('kematian')} 
            />
            <TabButton 
              active={activeTab === 'pindah_keluar'} 
              label="Pindah" 
              icon={<ArrowRightLeft size={14} color={activeTab === 'pindah_keluar' ? 'white' : '#64748B'} />}
              onPress={() => setActiveTab('pindah_keluar')} 
            />
          </View>

          <View className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
            {/* Warga Search (Not for Kelahiran) */}
            {activeTab !== 'kelahiran' && (
              <View className="space-y-2">
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Warga</Text>
                {selectedWarga ? (
                  <View className="bg-slate-900 p-5 rounded-2xl flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-white font-black text-base">{selectedWarga.nama_lengkap}</Text>
                      <Text className="text-white/40 text-[10px] font-bold">NIK: {selectedWarga.nik} • RT {selectedWarga.rts?.nomor_rt}</Text>
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
                      {searching && <ActivityIndicator size="small" color="#1B5E20" />}
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
                            <Text className="text-[10px] font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md">RT {w.rts?.nomor_rt}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Common Fields */}
            <View className="space-y-2">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Mutasi</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold"
                value={form.tanggal_mutasi}
                onChangeText={(val) => setForm({...form, tanggal_mutasi: val})}
              />
            </View>

            {/* Type Specific Fields */}
            {activeTab === 'kelahiran' && (
              <>
                <View className="space-y-2">
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Bayi</Text>
                  <TextInput
                    placeholder="Nama Lengkap Bayi"
                    className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold"
                    value={form.nama_bayi}
                    onChangeText={(val) => setForm({...form, nama_bayi: val})}
                  />
                </View>
                <View className="flex-row space-x-4">
                  <TouchableOpacity 
                    onPress={() => setForm({...form, jenis_kelamin_bayi: 'L'})}
                    className={`flex-1 p-4 rounded-2xl border items-center ${form.jenis_kelamin_bayi === 'L' ? 'bg-blue-600 border-blue-600' : 'bg-slate-50 border-slate-100'}`}
                  >
                    <Text className={`font-black text-[10px] uppercase ${form.jenis_kelamin_bayi === 'L' ? 'text-white' : 'text-slate-400'}`}>Laki-laki</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setForm({...form, jenis_kelamin_bayi: 'P'})}
                    className={`flex-1 p-4 rounded-2xl border items-center ${form.jenis_kelamin_bayi === 'P' ? 'bg-rose-600 border-rose-600' : 'bg-slate-50 border-slate-100'}`}
                  >
                    <Text className={`font-black text-[10px] uppercase ${form.jenis_kelamin_bayi === 'P' ? 'text-white' : 'text-slate-400'}`}>Perempuan</Text>
                  </TouchableOpacity>
                </View>
                <View className="space-y-2">
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Ibu</Text>
                  <TextInput
                    placeholder="Nama Lengkap Ibu"
                    className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold"
                    value={form.nama_ibu}
                    onChangeText={(val) => setForm({...form, nama_ibu: val})}
                  />
                </View>
              </>
            )}

            {activeTab === 'kematian' && (
              <View className="space-y-2">
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sebab Meninggal</Text>
                <TextInput
                  placeholder="Sakit, Usia Lanjut, dll"
                  className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold"
                  value={form.sebab_meninggal}
                  onChangeText={(val) => setForm({...form, sebab_meninggal: val})}
                />
              </View>
            )}

            {activeTab === 'pindah_keluar' && (
              <View className="space-y-2">
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tujuan Kepindahan</Text>
                <TextInput
                  placeholder="Kabupaten / Kota Tujuan"
                  className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold"
                  value={form.tujuan_daerah}
                  onChangeText={(val) => setForm({...form, tujuan_daerah: val})}
                />
              </View>
            )}

            <View className="space-y-2">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keterangan</Text>
              <TextInput
                placeholder="Tambahkan catatan jika perlu..."
                multiline
                className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-medium h-24"
                textAlignVertical="top"
                value={form.keterangan}
                onChangeText={(val) => setForm({...form, keterangan: val})}
              />
            </View>

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={createMutasi.isPending}
              className="bg-slate-900 p-6 rounded-3xl items-center shadow-xl shadow-slate-900/20"
            >
              {createMutasi.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                  <CheckCircle2 size={18} color="white" />
                  <Text className="text-white font-black uppercase tracking-widest ml-3">Simpan Data</Text>
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

function TabButton({ active, label, icon, onPress }: { active: boolean, label: string, icon: React.ReactNode, onPress: () => void }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center py-3.5 rounded-[20px] ${active ? 'bg-slate-900 shadow-lg' : 'bg-transparent'}`}
    >
      {icon}
      <Text className={`ml-2 text-[10px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-slate-400'}`}>{label}</Text>
    </TouchableOpacity>
  )
}
