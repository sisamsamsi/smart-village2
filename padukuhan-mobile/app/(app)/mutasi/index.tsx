import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useMutasiList } from '@/hooks/useMutasi';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft, 
  Plus, 
  Baby, 
  Skull, 
  ArrowRightLeft, 
  MapPin, 
  Calendar, 
  Clock,
  Search,
  Filter
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function MutasiListScreen() {
  const router = useRouter();
  const { data: mutasi, isLoading, refetch } = useMutasiList();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="flex-1">
        {/* Header Section */}
        <View className="bg-slate-900 px-6 pt-12 pb-16 rounded-b-[40px] shadow-2xl">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => router.back()} className="bg-white/10 p-3 rounded-2xl border border-white/20">
              <ArrowLeft color="white" size={20} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-black tracking-tight">Mutasi Penduduk</Text>
            <View className="w-11" />
          </View>
          
          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Riwayat Mutasi</Text>
              <Text className="text-white text-4xl font-black">{mutasi?.length || 0}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/mutasi/tambah')}
              className="bg-emerald-500 p-4 rounded-3xl shadow-xl shadow-emerald-900/40"
            >
              <Plus color="white" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* List Section */}
        <ScrollView 
          className="flex-1 px-6 mt-6"
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
        >
          {isLoading ? (
            <View className="py-20">
              <ActivityIndicator color="#1E293B" size="large" />
            </View>
          ) : mutasi?.length === 0 ? (
            <View className="py-20 items-center">
              <View className="bg-slate-100 p-8 rounded-full mb-4">
                <ArrowRightLeft size={40} color="#CBD5E1" />
              </View>
              <Text className="text-slate-900 font-bold text-lg">Belum Ada Mutasi</Text>
              <Text className="text-slate-400 text-xs text-center mt-2 px-10">
                Data mutasi (kelahiran, kematian, pindah) akan muncul di sini.
              </Text>
            </View>
          ) : (
            <View className="pb-10">
              {mutasi?.map((item) => (
                <MutasiCard key={item.id} item={item} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function MutasiCard({ item }: { item: any }) {
  const getIcon = () => {
    switch(item.jenis_mutasi) {
      case 'kelahiran': return <Baby size={18} color="#10B981" />;
      case 'kematian': return <Skull size={18} color="#EF4444" />;
      case 'pindah_keluar': return <ArrowRightLeft size={18} color="#F59E0B" />;
      case 'pindah_masuk': return <ArrowRightLeft size={18} color="#3B82F6" />;
      default: return <ArrowRightLeft size={18} color="#64748B" />;
    }
  }

  const getLabel = () => {
    switch(item.jenis_mutasi) {
      case 'kelahiran': return 'Kelahiran';
      case 'kematian': return 'Kematian';
      case 'pindah_keluar': return 'Pindah Keluar';
      case 'pindah_masuk': return 'Pindah Masuk';
      default: return item.jenis_mutasi;
    }
  }

  const getTargetName = () => {
    if (item.jenis_mutasi === 'kelahiran') return item.nama_bayi;
    return item.wargas?.nama_lengkap;
  }

  return (
    <View className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-xl shadow-slate-200/40 mb-4">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <View className="bg-slate-50 p-2.5 rounded-xl mr-3 border border-slate-100">
            {getIcon()}
          </View>
          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{getLabel()}</Text>
            <Text className="text-slate-900 text-base font-black tracking-tight">{getTargetName()}</Text>
          </View>
        </View>
      </View>

      <View className="h-[1px] bg-slate-50 mb-4" />
      
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Calendar size={12} color="#64748B" />
          <Text className="text-slate-500 text-[10px] ml-1.5 font-bold">
            {format(new Date(item.tanggal_mutasi), 'dd MMM yyyy', { locale: id })}
          </Text>
        </View>
        <View className="bg-slate-900 px-3 py-1 rounded-full">
          <Text className="text-white text-[8px] font-black uppercase tracking-widest">RT {item.wargas?.rts?.nomor_rt || '?'}</Text>
        </View>
      </View>

      {item.keterangan && (
        <Text className="text-slate-400 text-[10px] mt-3 font-medium italic">"{item.keterangan}"</Text>
      )}
    </View>
  )
}
