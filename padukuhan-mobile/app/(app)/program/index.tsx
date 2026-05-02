import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useProposals } from '@/hooks/useProgram';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Construction,
  Filter
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ProgramListScreen() {
  const router = useRouter();
  const isKetuaRT = useAuthStore((s) => s.isKetuaRT);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { data: proposals, isLoading, refetch } = useProposals(
    filterStatus === 'all' ? undefined : { status: filterStatus }
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="flex-1">
        {/* Header Section */}
        <View className="bg-[#1B5E20] px-6 pt-12 pb-16 rounded-b-[40px] shadow-2xl">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => router.back()} className="bg-white/10 p-3 rounded-2xl border border-white/20">
              <ArrowLeft color="white" size={20} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-black tracking-tight">Pembangunan</Text>
            <View className="w-11" />
          </View>
          
          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Program</Text>
              <Text className="text-white text-4xl font-black">{proposals?.length || 0}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/program/baru')}
              className="bg-white p-4 rounded-3xl shadow-xl shadow-black/20"
            >
              <Plus color="#1B5E20" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Scroll */}
        <View className="mt-4">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="px-6 py-2"
            contentContainerStyle={{ paddingRight: 40 }}
          >
            <FilterChip active={filterStatus === 'all'} label="Semua" onPress={() => setFilterStatus('all')} />
            <FilterChip active={filterStatus === 'diusulkan'} label="Usulan" onPress={() => setFilterStatus('diusulkan')} />
            <FilterChip active={filterStatus === 'disetujui'} label="Disetujui" onPress={() => setFilterStatus('disetujui')} />
            <FilterChip active={filterStatus === 'dilaksanakan'} label="Berjalan" onPress={() => setFilterStatus('dilaksanakan')} />
            <FilterChip active={filterStatus === 'selesai'} label="Selesai" onPress={() => setFilterStatus('selesai')} />
          </ScrollView>
        </View>

        {/* List Section */}
        <ScrollView 
          className="flex-1 px-6 mt-2"
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
        >
          {isLoading ? (
            <View className="py-20">
              <ActivityIndicator color="#1B5E20" size="large" />
            </View>
          ) : proposals?.length === 0 ? (
            <View className="py-20 items-center">
              <View className="bg-slate-100 p-8 rounded-full mb-4">
                <Construction size={40} color="#CBD5E1" />
              </View>
              <Text className="text-slate-900 font-bold text-lg">Belum Ada Program</Text>
              <Text className="text-slate-400 text-xs text-center mt-2 px-10">
                Data usulan pembangunan akan muncul di sini.
              </Text>
            </View>
          ) : (
            <View className="pb-10 space-y-4">
              {proposals?.map((item) => (
                <ProposalCard key={item.id} item={item} onPress={() => router.push(`/program/${item.id}`)} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function FilterChip({ active, label, onPress }: { active: boolean, label: string, onPress: () => void }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`mr-3 px-6 py-3 rounded-2xl border ${active ? 'bg-[#1B5E20] border-[#1B5E20] shadow-lg shadow-green-900/20' : 'bg-white border-slate-100'}`}
    >
      <Text className={`text-xs font-black uppercase tracking-widest ${active ? 'text-white' : 'text-slate-400'}`}>{label}</Text>
    </TouchableOpacity>
  )
}

function ProposalCard({ item, onPress }: { item: any, onPress: () => void }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-xl shadow-slate-200/40 mb-4"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="bg-slate-50 px-3 py-1.5 rounded-xl self-start border border-slate-100">
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.jenis_program}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <Text className="text-slate-900 text-lg font-black tracking-tight leading-6 mb-3">{item.nama_program}</Text>
      
      <View className="space-y-2 border-t border-slate-50 pt-4">
        <View className="flex-row items-center">
          <MapPin size={14} color="#1B5E20" />
          <Text className="text-slate-500 text-xs ml-2 font-medium">{item.lokasi || 'Mandingan'}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Calendar size={14} color="#3B82F6" />
            <Text className="text-slate-500 text-xs ml-2 font-medium">Tahun {item.tahun_diusulkan}</Text>
          </View>
          <View className="bg-slate-900 px-3 py-1 rounded-full">
            <Text className="text-white text-[9px] font-black uppercase tracking-widest">RT {item.rts?.nomor_rt}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function StatusBadge({ status }: { status: string }) {
  let color = "text-amber-600";
  let bg = "bg-amber-50";
  let icon = <Clock size={12} color="#D97706" />;

  if (['disetujui', 'dilaksanakan'].includes(status)) {
    color = "text-emerald-600";
    bg = "bg-emerald-50";
    icon = <CheckCircle2 size={12} color="#059669" />;
  } else if (status === 'selesai') {
    color = "text-blue-600";
    bg = "bg-blue-50";
    icon = <Construction size={12} color="#2563EB" />;
  }

  return (
    <View className={`flex-row items-center px-3 py-1.5 rounded-full ${bg} space-x-1`}>
      {icon}
      <Text className={`text-[9px] font-black uppercase tracking-widest ml-1 ${color}`}>{status}</Text>
    </View>
  )
}
