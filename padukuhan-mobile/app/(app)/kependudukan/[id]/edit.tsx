import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditWargaPlaceholderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      <Text className="text-xl font-bold text-slate-800">Edit warga</Text>
      <Text className="mt-2 text-slate-500">
        Form edit lengkap (React Hook Form + Zod) mengikuti blueprint Modul 1 — ID: {Array.isArray(id) ? id[0] : id}
      </Text>
      <TouchableOpacity className="mt-8 rounded-xl bg-blue-600 px-6 py-3" onPress={() => router.back()}>
        <Text className="text-center font-bold text-white">Kembali</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
