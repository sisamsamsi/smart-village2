import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Key, LogOut } from 'lucide-react-native';

const PALETTE = {
  veryLightMint: '#EFF6FF',
  navy: '#124170',
  royalBlue: '#26667F',
  white: '#FFFFFF',
  bgGray: '#F8FAFC',
  textDark: '#0F172A',
  textMuted: '#64748B',
  accentRed: '#EF4444',
};

export default function ClaimTokenScreen() {
  const [token, setToken] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, setProfile, setUser } = useAuthStore();

  const handleClaim = async () => {
    if (!token || !fullName || !phone) {
      Alert.alert('Perhatian', 'Semua kolom wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      // Panggil RPC claim_invitation_token
      const { data, error } = await supabase.rpc('claim_invitation_token', {
        token_str: token.trim(),
        full_name: fullName.trim(),
        phone: phone.trim()
      });

      if (error) throw error;

      if (data) {
        Alert.alert('Berhasil', 'Akses pengurus Anda berhasil diklaim!', [
          {
            text: 'OK',
            onPress: async () => {
              // Ambil profil baru yang dibuat
              const { data: dbProfile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user?.id)
                .single();
              
              if (dbProfile) {
                setProfile(dbProfile);
                router.replace('/(app)' as any);
              } else {
                Alert.alert('Gagal', 'Profil pengurus gagal ditemukan setelah klaim.');
              }
            }
          }
        ]);
      }
    } catch (err: any) {
      Alert.alert('Gagal Klaim', err.message || 'Kode undangan tidak valid atau sudah digunakan.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      router.replace('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>SV</Text>
            </View>
            <Text style={styles.title}>Klaim Akses Pengurus</Text>
            <Text style={styles.subtitle}>Masukkan kode undangan untuk masuk ke kamar kerja Anda</Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.welcomeText}>Akun Google Terverifikasi</Text>
            <Text style={styles.emailText}>{user?.email}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nama lengkap Anda"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nomor WhatsApp / HP</Text>
              <View style={styles.inputWrapper}>
                <Phone size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 081234567890"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kode Undangan (Dari Pak Dukuh)</Text>
              <View style={styles.inputWrapper}>
                <Key size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: RT01-7X9B"
                  placeholderTextColor="#94A3B8"
                  value={token}
                  onChangeText={setToken}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.claimButton, loading && styles.buttonDisabled]}
              onPress={handleClaim}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.claimButtonText}>Klaim Akses Sekarang</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={16} color={PALETTE.accentRed} style={{ marginRight: 6 }} />
              <Text style={styles.logoutButtonText}>Keluar / Ganti Akun</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: PALETTE.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: PALETTE.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  logoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: PALETTE.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: PALETTE.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.02,
    shadowRadius: 16,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '700',
    color: PALETTE.textDark,
    textAlign: 'center',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 13,
    color: PALETTE.royalBlue,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: PALETTE.textDark,
    fontWeight: '600',
  },
  claimButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: PALETTE.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: PALETTE.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.accentRed,
  },
});
