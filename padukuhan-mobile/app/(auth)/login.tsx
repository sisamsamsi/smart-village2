import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { UserProfile } from '@/types/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, LogIn, Globe } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

// Color Palette Definition
const PALETTE = {
  veryLightMint: '#EFF6FF',
  navy: '#124170',
  royalBlue: '#26667F',
  darkNavyBlue: '#124170',
  white: '#FFFFFF',
  bgGray: '#F8FAFC',
  textDark: '#0F172A',
  textMuted: '#64748B',
  accentRed: '#EF4444',
  accentOrange: '#F97316',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const router = useRouter();
  const { setUser, setProfile } = useAuthStore();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Buka dulu Google SSO - Placeholder Login untuk mempermudah pengerjaan
      console.log('Google SSO bypass triggered: logging in using admin account...');
      const loginPromise = supabase.auth.signInWithPassword({
        email: 'admin@mandingan.id',
        password: 'adminmandingan',
      });

      // Increase timeout to 10s in production/preview, 2s in development
      const timeoutMs = __DEV__ ? 2000 : 10000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeoutMs)
      );

      const { data, error: authError } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (authError) {
        console.log('Supabase Auth failed (offline?), using mock developer credentials');
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
        router.replace('/(app)' as any);
      } else if (data.user) {
        setUser(data.user);
        
        // Also race the profile fetch
        const profilePromise = supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const { data: dbProfile, error: profileError } = await Promise.race([
          profilePromise,
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs))
        ]);

        if (profileError || !dbProfile) {
          setProfile({
            id: data.user.id,
            nama_lengkap: 'Admin Mandingan (Offline)',
            role: 'dukuh',
            rt_id: null,
            dasawisma_id: null,
          });
        } else {
          setProfile(dbProfile);
        }
        router.replace('/(app)' as any);
      }
    } catch (err: unknown) {
      console.log('Error in login bypass, applying client-side mock credentials');
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
      router.replace('/(app)' as any);
    } finally {
      setLoading(false);
    }
  };

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
        router.replace('/(app)' as any);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal login. Silakan periksa kembali.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>SV</Text>
            </View>
            <Text style={styles.title}>Smart Village</Text>
            <Text style={styles.subtitle}>Sistem Informasi Padukuhan Mandingan</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formCard}>
            <Text style={styles.welcomeText}>Selamat Datang</Text>
            <Text style={styles.instructionText}>Silakan masuk ke akun pengurus Anda</Text>

            {/* Google SSO Button as Primary Auth Method */}
            <TouchableOpacity
              style={[styles.googleButton, loading && styles.buttonDisabled]}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              {loading && !showEmailLogin ? (
                <ActivityIndicator color={PALETTE.textDark} />
              ) : (
                <>
                  <Globe size={20} color={PALETTE.navy} style={{ marginRight: 10 }} />
                  <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Collapsible Traditional Email Login */}
            {!showEmailLogin ? (
              <TouchableOpacity 
                style={styles.expandEmailButton}
                onPress={() => setShowEmailLogin(true)}
              >
                <Text style={styles.expandEmailButtonText}>Masuk dengan Email / Password</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ gap: 16 }}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="admin@mandingan.id"
                      placeholderTextColor="#94A3B8"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#94A3B8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#94A3B8"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Masuk Sekarang</Text>
                      <LogIn size={18} color="#fff" style={{ marginLeft: 8 }} />
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.collapseEmailButton}
                  onPress={() => setShowEmailLogin(false)}
                >
                  <Text style={styles.collapseEmailText}>Kembali ke pilihan utama</Text>
                </TouchableOpacity>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerText}>
                Lupa password? <Text style={styles.footerLinkText}>Hubungi Admin</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.versionText}>v1.0.2 • Mandingan Digital</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bgGray,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    height: 64,
    width: 64,
    backgroundColor: PALETTE.navy,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PALETTE.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  logoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: PALETTE.darkNavyBlue,
    marginTop: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: PALETTE.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: PALETTE.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '800',
    color: PALETTE.darkNavyBlue,
  },
  instructionText: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 20,
  },
  googleButton: {
    backgroundColor: '#fff',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    marginTop: 8,
    marginBottom: 16,
  },
  googleButtonText: {
    color: PALETTE.textDark,
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  expandEmailButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  expandEmailButtonText: {
    color: PALETTE.navy,
    fontSize: 13,
    fontWeight: '700',
  },
  collapseEmailButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  collapseEmailText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.bgGray,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: PALETTE.textDark,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: PALETTE.navy,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: PALETTE.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    color: PALETTE.accentRed,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: PALETTE.textMuted,
  },
  footerLinkText: {
    color: PALETTE.royalBlue,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  }
});
