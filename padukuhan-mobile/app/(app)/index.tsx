import { useDashboardStats } from '@/hooks/useDashboardStats';

export default function DashboardScreen() {
  const { profile } = useAuthStore();
  const { data: stats, isLoading } = useDashboardStats();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-blue-600 px-6 py-8 rounded-b-[40px] shadow-lg">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white text-lg opacity-80">Selamat datang,</Text>
              <Text className="text-white text-2xl font-bold">{profile?.nama_lengkap?.split(' ')[0] || 'Petugas'}</Text>
              <Text className="text-blue-100 mt-1 capitalize">{profile?.role?.replace('_', ' ') || 'Admin'}</Text>
            </View>
            <TouchableOpacity 
              onPress={handleLogout}
              className="bg-blue-500 h-12 w-12 rounded-full items-center justify-center border border-blue-400"
            >
              <Text className="text-white text-[10px] font-bold">LOGOUT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View className="px-6 -mt-6">
          <View className="bg-white rounded-3xl p-6 shadow-md flex-row justify-between items-center h-24">
            {isLoading ? (
              <ActivityIndicator className="flex-1" color="#2563eb" />
            ) : (
              <>
                <View className="items-center flex-1 border-r border-slate-100">
                  <Text className="text-2xl font-bold text-blue-600">{stats?.totalKK ?? 0}</Text>
                  <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter mt-1">Total KK</Text>
                </View>
                <View className="items-center flex-1 border-r border-slate-100">
                  <Text className="text-2xl font-bold text-green-600">{stats?.totalWarga ?? 0}</Text>
                  <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter mt-1">Warga</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-red-600">{stats?.totalLaporan ?? 0}</Text>
                  <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter mt-1">Laporan</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Menu Grid */}
        <View className="px-6 py-8">
          <Text className="text-lg font-bold text-slate-800 mb-4">Layanan Utama</Text>
          <View className="flex-row flex-wrap justify-between">
            <MenuCard title="Data Warga" color="bg-blue-100" textColor="text-blue-700" icon="👥" />
            <MenuCard title="Pengajuan Surat" color="bg-green-100" textColor="text-green-700" icon="📄" />
            <MenuCard title="Kegiatan PKK" color="bg-purple-100" textColor="text-purple-700" icon="🌸" />
            <MenuCard title="Laporan Keamanan" color="bg-red-100" textColor="text-red-700" icon="🚨" />
          </View>
        </View>

        {/* Info Box */}
        <View className="mx-6 mb-10 p-6 bg-blue-50 rounded-3xl border border-blue-100">
          <Text className="text-blue-800 font-bold mb-2">Informasi Terbaru</Text>
          <Text className="text-blue-700 leading-5">
            Musyawarah Padukuhan Mandingan akan dilaksanakan pada hari Sabtu, 10 Mei 2026. Mohon kehadiran seluruh Ketua RT.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuCard({ title, color, textColor, icon }: { title: string, color: string, textColor: string, icon: string }) {
  return (
    <TouchableOpacity className={`w-[48%] mb-4 p-5 rounded-3xl ${color} items-center shadow-sm`}>
      <Text className="text-3xl mb-3">{icon}</Text>
      <Text className={`font-bold text-center ${textColor}`}>{title}</Text>
    </TouchableOpacity>
  );
}
