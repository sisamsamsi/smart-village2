import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

export default function TambahWargaScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama_lengkap: '',
    nik: '',
    tempat_lahir: 'Bantul',
    tanggal_lahir: '2000-01-01',
    jenis_kelamin: 'L',
    agama: 'Islam',
    pekerjaan: 'Buruh',
    status_perkawinan: 'belum_kawin',
    hubungan_keluarga: 'anak',
    rt_id: '1',
  });

  const handleSubmit = async () => {
    if (!form.nama_lengkap || !form.nik) {
      Alert.alert('Error', 'Nama dan NIK wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('wargas').insert([form]);

      if (error) throw error;

      Alert.alert('Sukses', 'Data warga berhasil ditambahkan');
      queryClient.invalidateQueries({ queryKey: ['wargas'] });
      router.back();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan';
      Alert.alert('Gagal', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Text className="text-blue-600 font-bold">✕ Batalkan</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-slate-800 mb-2">Tambah Warga Baru</Text>
        <Text className="text-slate-500 mb-8">Pastikan data yang dimasukkan sesuai dengan KTP/KK.</Text>

        <View className="space-y-6">
          <InputGroup
            label="Nama Lengkap"
            value={form.nama_lengkap}
            onChangeText={(v: string) => setForm({ ...form, nama_lengkap: v })}
            placeholder="Contoh: Budi Santoso"
          />

          <InputGroup
            label="NIK"
            value={form.nik}
            onChangeText={(v: string) => setForm({ ...form, nik: v })}
            placeholder="16 digit nomor induk"
            keyboardType="numeric"
          />

          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <Text className="mb-2 text-sm font-semibold text-slate-700">Jenis Kelamin</Text>
              <View className="flex-row rounded-xl border border-slate-200 bg-slate-50 p-1">
                <SelectBtn label="L" active={form.jenis_kelamin === 'L'} onPress={() => setForm({ ...form, jenis_kelamin: 'L' })} />
                <SelectBtn label="P" active={form.jenis_kelamin === 'P'} onPress={() => setForm({ ...form, jenis_kelamin: 'P' })} />
              </View>
            </View>
            <View className="w-[48%]">
              <InputGroup
                label="RT"
                value={form.rt_id}
                onChangeText={(v: string) => setForm({ ...form, rt_id: v })}
                placeholder="1-6"
                keyboardType="numeric"
              />
            </View>
          </View>

          <InputGroup label="Tempat Lahir" value={form.tempat_lahir} onChangeText={(v: string) => setForm({ ...form, tempat_lahir: v })} />

          <InputGroup
            label="Tanggal Lahir (YYYY-MM-DD)"
            value={form.tanggal_lahir}
            onChangeText={(v: string) => setForm({ ...form, tanggal_lahir: v })}
            placeholder="2000-01-01"
          />

          <InputGroup label="Pekerjaan" value={form.pekerjaan} onChangeText={(v: string) => setForm({ ...form, pekerjaan: v })} />

          <TouchableOpacity
            className={`mt-10 h-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg ${loading ? 'opacity-70' : ''}`}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-lg font-bold text-white">Simpan Data Warga</Text>
            )}
          </TouchableOpacity>

          <View className="h-20" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InputGroup({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-slate-700">{label}</Text>
      <TextInput
        className="h-14 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function SelectBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className={`flex-1 h-10 items-center justify-center rounded-lg ${active ? 'bg-white shadow-sm' : ''}`}>
      <Text className={`font-bold ${active ? 'text-blue-600' : 'text-slate-400'}`}>{label}</Text>
    </TouchableOpacity>
  );
}
