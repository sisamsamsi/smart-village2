import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { UserProfile } from '@/types/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser, setProfile } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        setUser(data.user);

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        setProfile(profile as UserProfile);
        router.replace('/(app)');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal login. Silakan periksa kembali.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-12">
          <View className="mb-10 items-center">
            <View className="h-20 w-20 items-center justify-center rounded-3xl bg-blue-500 shadow-lg">
              <Text className="text-4xl font-bold text-white">M</Text>
            </View>
            <Text className="mt-6 text-3xl font-bold text-slate-800">Sistem Padukuhan</Text>
            <Text className="mt-2 text-slate-500">Mandingan Lor Singkong</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="mb-2 text-sm font-semibold text-slate-700">Email</Text>
              <TextInput
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800"
                placeholder="nama@email.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className="mt-4">
              <Text className="mb-2 text-sm font-semibold text-slate-700">Password</Text>
              <TextInput
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error && (
              <View className="mt-4 rounded-lg bg-red-50 p-3">
                <Text className="text-sm text-red-600">{error}</Text>
              </View>
            )}

            <TouchableOpacity
              className={`mt-8 h-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg ${loading ? 'opacity-70' : ''}`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-lg font-bold text-white">Masuk</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity className="mt-6 items-center">
              <Text className="text-slate-500">
                Belum punya akun? <Text className="font-bold text-blue-600">Hubungi RT</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
