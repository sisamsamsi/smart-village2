import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Shield, User, Users } from 'lucide-react-native';

export function RoleSimulator() {
  const { profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const simulateRole = async (role: 'dukuh' | 'ketua_rt' | 'kader_dasawisma') => {
    setLoading(true);
    try {
      if (role === 'dukuh') {
        setProfile({
          id: profile?.id || 'demo-user-id',
          nama_lengkap: 'Dukuh Mandingan (Demo)',
          role: 'dukuh',
          rt_id: null,
          dasawisma_id: null,
        });
      } else if (role === 'ketua_rt') {
        // Ambil RT pertama di database
        const { data: rtData, error } = await supabase
          .from('rts')
          .select('id, nomor_rt')
          .order('nomor_rt')
          .limit(1)
          .single();

        if (error) throw error;

        setProfile({
          id: profile?.id || 'demo-user-id',
          nama_lengkap: `Ketua RT 0${rtData.nomor_rt} (Demo)`,
          role: 'ketua_rt',
          rt_id: rtData.id,
          dasawisma_id: null,
        });
      } else if (role === 'kader_dasawisma') {
        // Ambil Dasawisma pertama di database
        const { data: dwData, error } = await supabase
          .from('dasawismas')
          .select('id, nama_dasawisma, rt_id, rts(nomor_rt)')
          .order('nama_dasawisma')
          .limit(1)
          .single();

        if (error) throw error;

        setProfile({
          id: profile?.id || 'demo-user-id',
          nama_lengkap: `Kader ${dwData.nama_dasawisma} (Demo)`,
          role: 'kader_dasawisma',
          rt_id: dwData.rt_id,
          dasawisma_id: dwData.id,
        });
      }
    } catch (err) {
      console.error('Failed to simulate role:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SIMULATOR AKSES PERAN (DEMO)</Text>
      {loading ? (
        <ActivityIndicator color="#1B5E20" size="small" style={{ marginVertical: 10 }} />
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, profile?.role === 'dukuh' && styles.activeButton]}
            onPress={() => simulateRole('dukuh')}
          >
            <Shield size={16} color={profile?.role === 'dukuh' ? '#fff' : '#1B5E20'} />
            <Text style={[styles.buttonText, profile?.role === 'dukuh' && styles.activeButtonText]}>Dukuh</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, profile?.role === 'ketua_rt' && styles.activeButton]}
            onPress={() => simulateRole('ketua_rt')}
          >
            <User size={16} color={profile?.role === 'ketua_rt' ? '#fff' : '#1B5E20'} />
            <Text style={[styles.buttonText, profile?.role === 'ketua_rt' && styles.activeButtonText]}>RT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, profile?.role === 'kader_dasawisma' && styles.activeButton]}
            onPress={() => simulateRole('kader_dasawisma')}
          >
            <Users size={16} color={profile?.role === 'kader_dasawisma' ? '#fff' : '#1B5E20'} />
            <Text style={[styles.buttonText, profile?.role === 'kader_dasawisma' && styles.activeButtonText]}>Dasawisma</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.status}>
        Aktif: <Text style={{ fontWeight: 'bold' }}>{profile?.nama_lengkap || 'Belum diatur'}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 8,
    paddingVertical: 8,
  },
  activeButton: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B5E20',
  },
  activeButtonText: {
    color: '#fff',
  },
  status: {
    fontSize: 10,
    color: '#475569',
    marginTop: 8,
    textAlign: 'center',
  },
});
