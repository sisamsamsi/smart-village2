import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { 
  ArrowLeft, 
  Plus, 
  Megaphone, 
  Calendar, 
  ArrowRight,
  Bell,
  Share2
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { formatTanggal } from '@/lib/format';

export default function AnnouncementListScreen() {
  const router = useRouter();
  const { data: announcements, isLoading, refetch } = useAnnouncements({ activeOnly: true });

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="flex-1">
        {/* Header Section */}
        <View className="bg-slate-900 px-6 pt-12 pb-16 rounded-b-[40px] shadow-2xl">
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity onPress={() => router.back()} className="bg-white/10 p-3 rounded-2xl border border-white/20">
              <ArrowLeft color="white" size={20} />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Megaphone color="#FACC15" size={20} />
              <Text className="text-white text-xl font-black tracking-tight ml-3">Informasi</Text>
            </View>
            <TouchableOpacity className="bg-white/10 p-3 rounded-2xl border border-white/20">
              <Bell color="white" size={20} />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Berita Terbaru</Text>
              <Text className="text-white text-4xl font-black">{announcements?.length || 0}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/pengumuman/tambah')}
              className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-900/40"
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
          ) : announcements?.length === 0 ? (
            <View className="py-20 items-center">
              <View className="bg-slate-100 p-8 rounded-full mb-4">
                <Megaphone size={40} color="#CBD5E1" />
              </View>
              <Text className="text-slate-900 font-bold text-lg">Belum Ada Pengumuman</Text>
              <Text className="text-slate-400 text-xs text-center mt-2 px-10">
                Informasi dan berita untuk warga akan muncul di sini.
              </Text>
            </View>
          ) : (
            <View className="pb-10">
              {announcements?.map((item) => (
                <AnnouncementCard 
                  key={item.id} 
                  item={item} 
                  onPress={() => router.push(`/pengumuman/${item.id}`)} 
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function AnnouncementCard({ item, onPress }: { item: any, onPress: () => void }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white rounded-[35px] border border-slate-100 shadow-xl shadow-slate-200/40 mb-6 overflow-hidden"
    >
      {item.foto_url && (
        <Image 
          source={{ uri: item.foto_url }} 
          className="w-full h-48"
          resizeMode="cover"
        />
      )}
      <View className="p-6">
        <View className="flex-row items-center gap-2 mb-3">
          <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            <Text className="text-[8px] font-black text-blue-600 uppercase tracking-widest">
              {item.rt_pembuat ? `RT ${item.rts?.nomor_rt}` : 'DUKUH'}
            </Text>
          </View>
          <Text className="text-slate-400 text-[10px] font-bold">{formatTanggal(item.created_at)}</Text>
        </View>

        <Text className="text-slate-900 text-lg font-black tracking-tight leading-6 mb-3">{item.judul}</Text>
        <Text className="text-slate-500 text-xs leading-5 mb-4 line-clamp-2" numberOfLines={2}>
          {item.isi}
        </Text>

        <View className="h-[1px] bg-slate-50 mb-4" />
        
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-blue-600 text-[10px] font-black uppercase tracking-widest">Baca Selengkapnya</Text>
            <ArrowRight size={12} color="#2563EB" className="ml-1" />
          </View>
          <TouchableOpacity className="bg-slate-50 p-2 rounded-full">
            <Share2 size={14} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}
