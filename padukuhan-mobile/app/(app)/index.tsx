import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Users, Home, FileText, AlertTriangle } from 'lucide-react-native';

export default function DashboardScreen() {
  const { profile } = useAuthStore();
  const { data: stats, isLoading } = useDashboardStats();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <ScrollView className="flex-1">
        {/* Header - Premium Green Gradient Look */}
        <View className="bg-[#1B5E20] px-8 pt-16 pb-20 rounded-b-[50px] shadow-2xl">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Padukuhan Mandingan</Text>
              <Text className="text-white text-3xl font-black tracking-tight leading-tight">
                Halo,{"\n"}{profile?.nama_lengkap?.split(' ')[0] || 'Dukuh'}
              </Text>
              <View className="flex-row items-center mt-3 bg-white/10 self-start px-3 py-1 rounded-full border border-white/10">
                <View className="h-1.5 w-1.5 rounded-full bg-green-400 mr-2" />
                <Text className="text-white text-[9px] font-bold uppercase tracking-widest">{profile?.role?.replace('_', ' ') || 'Admin'}</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={handleLogout}
              className="bg-white/10 h-12 w-12 rounded-2xl items-center justify-center border border-white/20"
            >
              <Text className="text-white text-[10px] font-black">KELUAR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section - Floating over header */}
        <View className="px-6 -mt-12">
          <View className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 flex-row justify-between items-center h-32 border border-slate-50">
            {isLoading ? (
              <ActivityIndicator className="flex-1" color="#1B5E20" />
            ) : (
              <>
                <StatItem label="Jiwa" value={stats?.totalWarga ?? 0} color="text-emerald-600" />
                <View className="h-12 w-[1px] bg-slate-100" />
                <StatItem label="KK" value={stats?.totalKK ?? 0} color="text-blue-600" />
                <View className="h-12 w-[1px] bg-slate-100" />
                <StatItem label="Laporan" value={stats?.totalLaporan ?? 0} color="text-rose-600" />
              </>
            )}
          </View>
        </View>

        {/* Menu Grid */}
        <View className="px-8 py-10">
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Layanan Digital</Text>
          <View className="flex-row flex-wrap justify-between">
            <MenuCard title="Data Warga" icon={<Users size={24} color="#1B5E20" />} />
            <MenuCard title="Layanan Surat" icon={<FileText size={24} color="#1B5E20" />} />
            <MenuCard title="Kegiatan PKK" icon={<Home size={24} color="#1B5E20" />} />
            <MenuCard title="Keamanan" icon={<AlertTriangle size={24} color="#1B5E20" />} />
          </View>
        </View>

        {/* Info Box */}
        <View className="mx-8 mb-12 p-8 bg-slate-900 rounded-[40px] shadow-2xl shadow-slate-900/30 overflow-hidden relative">
          <View className="relative z-10">
            <Text className="text-white/40 font-black uppercase tracking-widest text-[9px] mb-2">Informasi Terkini</Text>
            <Text className="text-white text-base font-bold leading-6 mb-4">
              Musyawarah Padukuhan Mandingan hari Sabtu, 10 Mei 2026 jam 19.30 WIB.
            </Text>
            <TouchableOpacity className="bg-[#1B5E20] px-5 py-2.5 rounded-2xl self-start">
               <Text className="text-white text-[10px] font-black uppercase tracking-wider">Lihat Agenda</Text>
            </TouchableOpacity>
          </View>
          {/* Decoration */}
          <View className="absolute -bottom-10 -right-10 h-32 w-32 bg-white/5 rounded-full" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value, color }: { label: string, value: number | string, color: string }) {
  return (
    <View className="items-center flex-1">
      <Text className={`text-2xl font-black ${color}`}>{value}</Text>
      <Text className="text-slate-400 text-[9px] uppercase font-black tracking-widest mt-1">{label}</Text>
    </View>
  )
}

function MenuCard({ title, icon }: { title: string, icon: React.ReactNode }) {
  return (
    <TouchableOpacity className="w-[47%] mb-6 p-7 rounded-[35px] bg-white items-center shadow-xl shadow-slate-200/40 border border-slate-50/50 active:scale-95 transition-all">
      <View className="h-14 w-14 rounded-2xl bg-primary/5 items-center justify-center mb-4">
         {icon}
      </View>
      <Text className="font-black text-slate-800 tracking-tighter text-xs text-center">{title}</Text>
    </TouchableOpacity>
  );
}
