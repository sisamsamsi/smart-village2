import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, Image, Share } from 'react-native';
import { useAnnouncementDetail } from '@/hooks/useAnnouncements';
import { 
  ArrowLeft, 
  Share2, 
  Calendar, 
  User, 
  Target,
  Megaphone,
  Globe
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { formatTanggal } from '@/lib/format';

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: item, isLoading } = useAnnouncementDetail(id as string);

  const handleShare = async () => {
    if (!item) return;
    try {
      await Share.share({
        message: `${item.judul}\n\n${item.isi}\n\nInformasi dari Padukuhan Mandingan`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator color="#1E293B" size="large" />
    </SafeAreaView>
  );

  if (!item) return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="font-bold text-slate-400">Pengumuman tidak ditemukan.</Text>
    </SafeAreaView>
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" bounces={false}>
        {/* Dynamic Header / Hero */}
        <View className="relative h-[400px] w-full">
          {item.foto_url ? (
            <Image source={{ uri: item.foto_url }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full bg-slate-900 items-center justify-center">
              <Megaphone size={80} color="#334155" />
            </View>
          )}
          
          <View className="absolute inset-0 bg-black/30" />
          
          {/* Top Actions */}
          <SafeAreaView className="absolute top-0 left-0 right-0">
            <View className="flex-row justify-between px-6 py-4">
              <TouchableOpacity onPress={() => router.back()} className="bg-white/20 backdrop-blur-xl p-3 rounded-2xl border border-white/20">
                <ArrowLeft color="white" size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} className="bg-white/20 backdrop-blur-xl p-3 rounded-2xl border border-white/20">
                <Share2 color="white" size={20} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Content Section */}
        <View className="flex-1 -mt-10 bg-white rounded-t-[50px] px-8 pt-10 pb-20">
          <View className="flex-row items-center mb-6">
            <View className="bg-blue-50 px-4 py-1.5 rounded-full mr-3 border border-blue-100">
              <Text className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                {item.rt_pembuat ? `RT ${item.rts?.nomor_rt}` : 'PENGUMUMAN DUKUH'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Calendar size={12} color="#94A3B8" />
              <Text className="text-slate-400 text-[10px] font-bold ml-1.5">{formatTanggal(item.created_at)}</Text>
            </View>
          </View>

          <Text className="text-slate-900 text-3xl font-black tracking-tight leading-tight mb-8">
            {item.judul}
          </Text>

          {/* Quick Info Grid */}
          <View className="flex-row bg-slate-50 p-6 rounded-[35px] border border-slate-100 mb-8">
            <View className="flex-1 flex-row items-center">
              <View className="bg-white p-2.5 rounded-xl mr-3 shadow-sm">
                <User size={16} color="#64748B" />
              </View>
              <View>
                <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Penulis</Text>
                <Text className="text-slate-900 text-[10px] font-black uppercase">
                  {item.rt_pembuat ? 'Ketua RT' : 'Dukuh'}
                </Text>
              </View>
            </View>
            <View className="w-[1px] bg-slate-200 mx-4" />
            <View className="flex-1 flex-row items-center">
              <View className="bg-white p-2.5 rounded-xl mr-3 shadow-sm">
                <Globe size={16} color="#64748B" />
              </View>
              <View>
                <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Target</Text>
                <Text className="text-slate-900 text-[10px] font-black uppercase">
                  {item.target === 'semua' ? 'PUBLIK' : 'INTERNAL'}
                </Text>
              </View>
            </View>
          </View>

          {/* Body Text */}
          <Text className="text-slate-600 text-lg leading-[30px] font-medium">
            {item.isi}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
