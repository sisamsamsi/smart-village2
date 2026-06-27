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
    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data: dbProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (dbProfile) {
            setProfile(dbProfile);
          } else {
            setProfile(null);
          }
        } else {
          // If not using demo bypass user, clear
          if (user?.id !== 'demo-developer-id') {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Error checking initial session:', err);
        setProfile(null);
      } finally {
        setInitialized(true);
      }
    };

    checkSession();

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      } else if (session?.user) {
        setUser(session.user);
        try {
          const { data: dbProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (dbProfile) {
            setProfile(dbProfile);
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error('Error updating profile on auth change:', err);
          setProfile(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = (segments as any[]).includes('(auth)') || (segments as any[]).includes('login');
    const isClaimTokenScreen = (segments as any[]).includes('claim-token');

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (user && !profile && !isClaimTokenScreen) {
      // Authenticated but has no profile, redirect to claim-token
      router.replace('/(auth)/claim-token' as any);
    } else if (user && profile && (inAuthGroup || isClaimTokenScreen)) {
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
