import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSuratList } from '@/hooks/useSurat';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Search,
  MessageSquare,
  Calendar
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { formatTanggal } from '@/lib/format';

export default function SuratListScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'selesai'>('pending');
  const { data: surat, isLoading, refetch } = useSuratList({ 
    status: activeTab === 'pending' ? 'pending' : undefined 
  });

  // Filter local for 'selesai' tab if we didn't use server filter fully
  const displayedSurat = activeTab === 'pending' 
    ? surat 
    : surat?.filter(s => s.status !== 'pending');

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="flex-1">
        {/* Header Section */}
        <View className="bg-blue-900 px-6 pt-12 pb-16 rounded-b-[40px] shadow-2xl">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => router.back()} className="bg-white/10 p-3 rounded-2xl border border-white/20">
              <ArrowLeft color="white" size={20} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-black tracking-tight">Layanan Surat</Text>
            <View className="w-11" />
          </View>
          
          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Pengajuan Masuk</Text>
              <Text className="text-white text-4xl font-black">{displayedSurat?.length || 0}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/surat/tambah')}
              className="bg-white p-4 rounded-3xl shadow-xl shadow-black/20"
            >
              <Plus color="#1E3A8A" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row mx-6 -mt-8 bg-white p-2 rounded-[30px] shadow-xl border border-slate-50">
          <TouchableOpacity 
            onPress={() => setActiveTab('pending')}
            className={`flex-1 py-4 rounded-[25px] items-center ${activeTab === 'pending' ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'bg-transparent'}`}
          >
            <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'pending' ? 'text-white' : 'text-slate-400'}`}>Antrean</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('selesai')}
            className={`flex-1 py-4 rounded-[25px] items-center ${activeTab === 'selesai' ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'bg-transparent'}`}
          >
            <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'selesai' ? 'text-white' : 'text-slate-400'}`}>Selesai</Text>
          </TouchableOpacity>
        </View>

        {/* List Section */}
        <ScrollView 
          className="flex-1 px-6 mt-6"
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
        >
          {isLoading ? (
            <View className="py-20">
              <ActivityIndicator color="#1E3A8A" size="large" />
            </View>
          ) : displayedSurat?.length === 0 ? (
            <View className="py-20 items-center">
              <View className="bg-slate-100 p-8 rounded-full mb-4">
                <FileText size={40} color="#CBD5E1" />
              </View>
              <Text className="text-slate-900 font-bold text-lg">Tidak Ada Pengajuan</Text>
              <Text className="text-slate-400 text-xs text-center mt-2 px-10">
                Pengajuan surat dari warga akan muncul di sini.
              </Text>
            </View>
          ) : (
            <View className="pb-10">
              {displayedSurat?.map((item) => (
                <SuratCard key={item.id} item={item} onPress={() => router.push(`/surat/${item.id}`)} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function SuratCard({ item, onPress }: { item: any, onPress: () => void }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-xl shadow-slate-200/40 mb-4"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="bg-blue-50 px-3 py-1.5 rounded-xl self-start border border-blue-100/50">
          <Text className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.jenis_surat?.replace('_', ' ')}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <Text className="text-slate-900 text-lg font-black tracking-tight leading-6 mb-1">{item.wargas?.nama_lengkap}</Text>
      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">NIK: {item.wargas?.nik}</Text>
      
      <View className="h-[1px] bg-slate-50 mb-4" />
      
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Calendar size={12} color="#64748B" />
          <Text className="text-slate-500 text-[10px] ml-1.5 font-bold">{formatTanggal(item.created_at)}</Text>
        </View>
        <View className="bg-slate-900 px-3 py-1 rounded-full">
          <Text className="text-white text-[8px] font-black uppercase tracking-widest">RT {item.wargas?.rts?.nomor_rt}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function StatusBadge({ status }: { status: string }) {
  let color = "text-amber-600";
  let bg = "bg-amber-50";
  let icon = <Clock size={10} color="#D97706" />;

  if (status === 'approved' || status === 'selesai') {
    color = "text-emerald-600";
    bg = "bg-emerald-50";
    icon = <CheckCircle2 size={10} color="#059669" />;
  } else if (status === 'rejected') {
    color = "text-rose-600";
    bg = "bg-rose-50";
    icon = <XCircle size={10} color="#E11D48" />;
  }

  return (
    <View className={`flex-row items-center px-3 py-1.5 rounded-full ${bg}`}>
      {icon}
      <Text className={`text-[8px] font-black uppercase tracking-widest ml-1 ${color}`}>{status}</Text>
    </View>
  )
}
