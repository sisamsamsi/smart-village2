import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { QueryClientProvider } from '@tanstack/react-query';
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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error || !data) {
            // Development fallback: don't boot the user out, assign a default Dukuh profile
            console.log('No user profile found, using development fallback profile.');
            setUser(session.user);
            setProfile({
              id: session.user.id,
              nama_lengkap: session.user.email || 'Pengurus Padukuhan (Demo)',
              role: 'dukuh',
              rt_id: null,
              dasawisma_id: null,
            });
          } else {
            setUser(session.user);
            setProfile(data as UserProfile);
          }
        } catch (e) {
          // Development fallback on error
          setUser(session.user);
          setProfile({
            id: session.user.id,
            nama_lengkap: session.user.email || 'Pengurus Padukuhan (Demo)',
            role: 'dukuh',
            rt_id: null,
            dasawisma_id: null,
          });
        }
      } else {
        // Keep mock user if already set client-side via Google SSO bypass
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          setUser(null);
          setProfile(null);
        }
      }
      setInitialized(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error || !data) {
            // Development fallback: assign a default Dukuh profile
            setProfile({
              id: session.user.id,
              nama_lengkap: session.user.email || 'Pengurus Padukuhan (Demo)',
              role: 'dukuh',
              rt_id: null,
              dasawisma_id: null,
            });
          } else {
            setProfile(data as UserProfile);
          }
        } catch (e) {
          setProfile({
            id: session.user.id,
            nama_lengkap: session.user.email || 'Pengurus Padukuhan (Demo)',
            role: 'dukuh',
            rt_id: null,
            dasawisma_id: null,
          });
        }
      } else {
        // Keep mock user if already set client-side via Google SSO bypass
        const currentUser = useAuthStore.getState().user;
        if (!currentUser || currentUser.id !== 'demo-developer-id') {
          setUser(null);
          setProfile(null);
        }
      }
    });

    return () => subscription.unsubscribe();
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
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
        <UpdateBanner />
        <StatusBar style="light" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
