import React, { useState } from 'react';
import { Alert, View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useCreateProposal, useRts } from '@/hooks/useProgram';
import { useAuthStore } from '@/stores/authStore';
import { ArrowLeft, Send, Construction, MapPin, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';

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
      alert('Mohon lengkapi semua bidang.');
      return;
    }
    if (isDukuh() && !form.rt_id) {
      alert('Silakan pilih wilayah RT terkait.');
      return;
    }

    try {
      await createProposal.mutateAsync(form);
      alert('Berhasil! Usulan program telah diajukan.');
      router.back();
    } catch (err: any) {
      alert(err.message || 'Gagal mengajukan usulan.');
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
            <Text className="ml-4 text-xl font-black text-slate-900">Usulan Baru</Text>
          </View>

          <View className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
            <View className="items-center mb-4">
              <View className="bg-emerald-50 p-6 rounded-full">
                {isDukuh() ? <ShieldCheck size={32} color="#1B5E20" /> : <Construction size={32} color="#1B5E20" />}
              </View>
            </View>

            <View className="space-y-2">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Program</Text>
              <TextInput
                placeholder="Contoh: Perbaikan Jalan"
                className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold"
                value={form.nama_program}
                onChangeText={(val) => setForm({...form, nama_program: val})}
              />
            </View>

            <View className="space-y-2">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Program</Text>
              <View className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-2">
                  {['infrastruktur', 'sosial', 'kesehatan', 'pendidikan', 'lainnya'].map((type) => (
                    <TouchableOpacity 
                      key={type}
                      onPress={() => setForm({...form, jenis_program: type})}
                      className={`mr-2 px-4 py-2 rounded-xl ${form.jenis_program === type ? 'bg-emerald-600' : 'bg-white border border-slate-100'}`}
                    >
                      <Text className={`text-[10px] font-black uppercase ${form.jenis_program === type ? 'text-white' : 'text-slate-400'}`}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {isDukuh() && (
               <View className="space-y-2">
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Wilayah RT</Text>
                <View className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-2">
                    {rts?.map((rt: any) => (
                      <TouchableOpacity 
                        key={rt.id}
                        onPress={() => setForm({...form, rt_id: rt.id})}
                        className={`mr-2 px-4 py-2 rounded-xl ${form.rt_id === rt.id ? 'bg-slate-900' : 'bg-white border border-slate-100'}`}
                      >
                        <Text className={`text-[10px] font-black uppercase ${form.rt_id === rt.id ? 'text-white' : 'text-slate-400'}`}>RT {rt.nomor_rt}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            <View className="space-y-2">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lokasi Detail</Text>
              <TextInput
                placeholder="Contoh: RT 06, Area Sawah"
                className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-bold"
                value={form.lokasi}
                onChangeText={(val) => setForm({...form, lokasi: val})}
              />
            </View>

            <View className="space-y-2">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Lengkap</Text>
              <TextInput
                placeholder="Jelaskan detail rencana program..."
                multiline
                numberOfLines={4}
                className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-medium h-32"
                textAlignVertical="top"
                value={form.deskripsi}
                onChangeText={(val) => setForm({...form, deskripsi: val})}
              />
            </View>

            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={createProposal.isPending}
              className="bg-[#1B5E20] p-6 rounded-3xl items-center shadow-xl shadow-green-900/20"
            >
              {createProposal.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Send size={18} color="white" />
                  <Text className="text-white font-black uppercase tracking-widest ml-3">Kirim Usulan</Text>
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
