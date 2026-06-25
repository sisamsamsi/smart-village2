import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "../global.css";

import { queryClient } from '@/lib/query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { UserProfile } from '@/types/auth';
import { UpdateBanner } from '@/components/UpdateBanner';

export const unstable_settings = {
  anchor: '(app)',
};

export default function RootLayout() {
  const { user, profile, initialized, setUser, setProfile, setInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Auto-login bypass: immediately set mock session to go straight to dashboard
    setUser({
      id: 'demo-developer-id',
      email: 'dev@mandingan.id',
    } as any);
    setProfile({
      id: 'demo-developer-id',
      nama_lengkap: 'Developer Mandingan',
      role: 'dukuh',
      rt_id: null,
      dasawisma_id: null,
    });
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = (segments as any[]).includes('(auth)') || (segments as any[]).includes('login');

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (user && profile && inAuthGroup) {
      router.replace('/(app)' as any);
    }
  }, [user, profile, segments, initialized]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack>
          <UpdateBanner />
          <StatusBar style="dark" />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
