import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useProposal, useUpdateProposalStatus } from '@/hooks/useProgram';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Construction, 
  Edit3, 
  X,
  Wallet,
  MessageSquare
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ProposalDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: item, isLoading } = useProposal(id as string);
  const updateStatus = useUpdateProposalStatus();
  const isDukuh = useAuthStore((s) => s.isDukuh);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    status: '',
    catatan_dukuh: '',
    sumber_dana: '',
    tahun_dilaksanakan: ''
  });

  useEffect(() => {
    if (item) {
      setForm({
        status: item.status,
        catatan_dukuh: item.catatan_dukuh || '',
        sumber_dana: item.sumber_dana || '',
        tahun_dilaksanakan: item.tahun_dilaksanakan?.toString() || ''
      });
    }
  }, [item]);

  const handleUpdate = async () => {
    try {
      await updateStatus.mutateAsync({
        id,
        ...form,
        tahun_dilaksanakan: form.tahun_dilaksanakan ? parseInt(form.tahun_dilaksanakan) : null
      });
      Alert.alert('Berhasil', 'Status usulan telah diperbarui.');
      setEditMode(false);
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Gagal memperbarui status.');
    }
  };

  if (isLoading) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator color="#1B5E20" size="large" />
    </SafeAreaView>
  );

  if (!item) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="font-bold text-slate-400">Data tidak ditemukan.</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 pt-6 pb-10 border-b border-slate-100 rounded-b-[40px] shadow-sm">
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity onPress={() => router.back()} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <ArrowLeft color="#64748B" size={20} />
            </TouchableOpacity>
            <Text className="text-lg font-black text-slate-900">Detail Program</Text>
            {isDukuh() && !editMode ? (
              <TouchableOpacity onPress={() => setEditMode(true)} className="bg-emerald-600 p-3 rounded-2xl">
                <Edit3 color="white" size={20} />
              </TouchableOpacity>
            ) : <View className="w-11" />}
          </View>

          <View className="bg-slate-900 self-start px-4 py-1.5 rounded-full mb-4">
            <Text className="text-white text-[9px] font-black uppercase tracking-widest">{item.jenis_program}</Text>
          </View>
          <Text className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{item.nama_program}</Text>
          
          <View className="flex-row flex-wrap gap-4 mt-6 pt-6 border-t border-slate-50">
            <InfoItem icon={<MapPin size={14} color="#10B981" />} label={item.lokasi || 'Mandingan'} />
            <InfoItem icon={<Calendar size={14} color="#3B82F6" />} label={`Tahun ${item.tahun_diusulkan}`} />
            <InfoItem icon={<Clock size={14} color="#F59E0B" />} label={`RT ${item.rts?.nomor_rt}`} />
          </View>
        </View>

        <View className="px-6 py-8 space-y-8">
          {/* Description Section */}
          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Deskripsi Program</Text>
            <View className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-xl shadow-slate-200/30">
              <Text className="text-slate-600 text-sm leading-6">{item.deskripsi}</Text>
            </View>
          </View>

          {/* Execution Info */}
          {!editMode && (
            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Status & Dana</Text>
              <View className="bg-slate-900 p-8 rounded-[40px] shadow-2xl shadow-slate-900/30">
                <View className="flex-row items-center justify-between mb-6">
                  <View>
                    <Text className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Status Saat Ini</Text>
                    <Text className="text-white font-bold text-lg">{item.status.toUpperCase()}</Text>
                  </View>
                  <StatusBadge status={item.status} />
                </View>
                
                <View className="h-[1px] bg-white/10 mb-6" />

                <View className="flex-row justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Sumber Dana</Text>
                    <Text className="text-emerald-400 font-bold text-xs">{item.sumber_dana?.toUpperCase().replace('_', ' ') || '-'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Pelaksanaan</Text>
                    <Text className="text-blue-400 font-bold text-xs">{item.tahun_dilaksanakan ? `TAHUN ${item.tahun_dilaksanakan}` : '-'}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Response Box */}
          {item.catatan_dukuh && !editMode && (
             <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Catatan Dukuh</Text>
              <View className="bg-emerald-50/50 p-6 rounded-[35px] border border-emerald-100">
                <Text className="text-emerald-900 text-sm leading-relaxed">{item.catatan_dukuh}</Text>
              </View>
            </View>
          )}

          {/* Edit Mode / Processing */}
          {editMode && isDukuh() && (
            <View className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl space-y-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xl font-black text-slate-900">Proses Usulan</Text>
                <TouchableOpacity onPress={() => setEditMode(false)} className="bg-slate-50 p-2 rounded-full">
                  <X size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View className="space-y-2">
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                  {['diusulkan', 'dikaji', 'disetujui', 'dilaksanakan', 'selesai', 'ditolak'].map(s => (
                    <TouchableOpacity 
                      key={s}
                      onPress={() => setForm({...form, status: s})}
                      className={`mr-2 px-4 py-2 rounded-xl ${form.status === s ? 'bg-emerald-600' : 'bg-slate-50 border border-slate-100'}`}
                    >
                      <Text className={`text-[10px] font-black uppercase ${form.status === s ? 'text-white' : 'text-slate-400'}`}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="space-y-2">
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sumber Dana</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                  {['dana_desa', 'pagu_indikatif', 'swadaya', 'pihak_ketiga', 'apbd'].map(s => (
                    <TouchableOpacity 
                      key={s}
                      onPress={() => setForm({...form, sumber_dana: s})}
                      className={`mr-2 px-4 py-2 rounded-xl ${form.sumber_dana === s ? 'bg-slate-900' : 'bg-slate-50 border border-slate-100'}`}
                    >
                      <Text className={`text-[10px] font-black uppercase ${form.sumber_dana === s ? 'text-white' : 'text-slate-400'}`}>{s.replace('_', ' ')}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="space-y-2">
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tahun Pelaksanaan</Text>
                <TextInput 
                  placeholder="Contoh: 2026"
                  keyboardType="number-pad"
                  className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold"
                  value={form.tahun_dilaksanakan}
                  onChangeText={val => setForm({...form, tahun_dilaksanakan: val})}
                />
              </View>

              <View className="space-y-2">
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catatan / Feedback</Text>
                <TextInput 
                  placeholder="Tanggapan untuk Ketua RT..."
                  multiline
                  className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium h-24"
                  textAlignVertical="top"
                  value={form.catatan_dukuh}
                  onChangeText={val => setForm({...form, catatan_dukuh: val})}
                />
              </View>

              <TouchableOpacity 
                onPress={handleUpdate}
                disabled={updateStatus.isPending}
                className="bg-emerald-600 p-5 rounded-3xl items-center shadow-xl shadow-emerald-900/20"
              >
                {updateStatus.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-black uppercase tracking-widest">Simpan Perubahan</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <View className="flex-row items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
      {icon}
      <Text className="text-slate-500 text-[10px] font-bold ml-2">{label}</Text>
    </View>
  )
}

function StatusBadge({ status }: { status: string }) {
  let color = "text-amber-600";
  let bg = "bg-amber-50";
  let icon = <Clock size={10} color="#D97706" />;

  if (['disetujui', 'dilaksanakan'].includes(status)) {
    color = "text-emerald-600";
    bg = "bg-emerald-50";
    icon = <CheckCircle2 size={10} color="#059669" />;
  } else if (status === 'selesai') {
    color = "text-blue-600";
    bg = "bg-blue-50";
    icon = <Construction size={10} color="#2563EB" />;
  }

  return (
    <View className={`flex-row items-center px-3 py-1 rounded-full ${bg}`}>
      {icon}
      <Text className={`text-[8px] font-black uppercase tracking-widest ml-1 ${color}`}>{status}</Text>
    </View>
  )
}
