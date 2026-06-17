import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Users, Home, Baby, Heart, Shield, Sparkles } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function RangkumanScreen() {
  const { profile } = useAuthStore();
  const role = profile?.role;
  const rtId = profile?.rt_id;
  const dasawismaId = profile?.dasawisma_id;

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['rangkuman_demografi', role, rtId, dasawismaId],
    queryFn: async () => {
      // 1. Ambil Warga
      let wargaQuery: any = supabase
        .from('wargas')
        .select('id, tanggal_lahir, jenis_kelamin, status_perkawinan, status_kehamilan, status_menyusui, rt_id')
        .eq('status_warga', 'aktif');

      // 2. Ambil KK (rumah_tanggas)
      let kkQuery = supabase
        .from('rumah_tanggas')
        .select('id, rt_id, dasawisma_id', { count: 'exact' })
        .eq('status_aktif', true);

      // Terapkan filter hak akses
      if (role === 'kader_dasawisma' && dasawismaId) {
        wargaQuery = wargaQuery
          .select('id, tanggal_lahir, jenis_kelamin, status_perkawinan, status_kehamilan, status_menyusui, rumah_tanggas!inner(dasawisma_id)')
          .eq('rumah_tanggas.dasawisma_id', dasawismaId);
        
        kkQuery = kkQuery.eq('dasawisma_id', dasawismaId);
      } else if (role === 'ketua_rt' && rtId) {
        wargaQuery = wargaQuery.eq('rt_id', rtId);
        kkQuery = kkQuery.eq('rt_id', rtId);
      }

      const [wargaRes, kkRes] = await Promise.all([wargaQuery, kkQuery]);

      if (wargaRes.error) throw wargaRes.error;
      if (kkRes.error) throw kkRes.error;

      const wargas = wargaRes.data || [];
      const now = new Date();
      
      const res = {
        totalWarga: wargas.length,
        totalKK: kkRes.count ?? 0,
        balita: 0,
        lansia: 0,
        wus: 0,
        pus: 0,
        ibuHamil: 0,
        ibuMenyusui: 0,
        lakiLaki: 0,
        perempuan: 0,
      };

      wargas.forEach((w: any) => {
        // Gender ratio
        if (w.jenis_kelamin === 'L') res.lakiLaki++;
        if (w.jenis_kelamin === 'P') res.perempuan++;

        if (!w.tanggal_lahir) return;
        const birthDate = new Date(w.tanggal_lahir);
        let age = now.getFullYear() - birthDate.getFullYear();
        const m = now.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
          age--;
        }

        if (age <= 5) res.balita++;
        if (age >= 60) res.lansia++;
        
        if (w.jenis_kelamin === 'P' && age >= 15 && age <= 49) {
          res.wus++;
          if (w.status_perkawinan === 'kawin') res.pus++;
        }

        if (w.status_kehamilan) res.ibuHamil++;
        if (w.status_menyusui) res.ibuMenyusui++;
      });

      return res;
    },
  });

  const getPercentage = (value: number, total: number) => {
    if (!total) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  const getScopeLabel = () => {
    if (role === 'kader_dasawisma') return 'Kelompok Dasawisma';
    if (role === 'ketua_rt') return 'Wilayah RT';
    return 'Padukuhan Mandingan';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rangkuman Data</Text>
        <Text style={styles.subtitle}>Statistik Demografi & Posyandu Aktif</Text>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color="#67C090" size="large" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Gagal memuat statistik</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Info Scope */}
          <View style={styles.scopeBadgeContainer}>
            <View style={styles.scopeBadge}>
              <Sparkles size={14} color="#67C090" style={{ marginRight: 6 }} />
              <Text style={styles.scopeText}>Cakupan: {getScopeLabel()}</Text>
            </View>
          </View>

          {/* Core Stats Row */}
          <View style={styles.coreStatsRow}>
            <View style={[styles.coreCard, { backgroundColor: '#DDF4E7', borderColor: '#67C090' }]}>
              <Users size={24} color="#67C090" style={{ marginBottom: 8 }} />
              <Text style={styles.coreValue}>{stats?.totalWarga}</Text>
              <Text style={styles.coreLabel}>Total Jiwa</Text>
            </View>

            <View style={[styles.coreCard, { backgroundColor: '#E3F2FD', borderColor: '#90CAF9' }]}>
              <Home size={24} color="#1565C0" style={{ marginBottom: 8 }} />
              <Text style={styles.coreValue}>{stats?.totalKK}</Text>
              <Text style={styles.coreLabel}>Kepala Keluarga</Text>
            </View>
          </View>

          {/* Demographic Section */}
          <Text style={styles.sectionTitle}>MONITORING POSYANDU & KADER</Text>
          
          <View style={styles.statsList}>
            {/* Balita Card */}
            <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#FEF3C7' }]}>
                <Baby size={22} color="#D97706" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statName}>Balita (Anak ≤ 5 Th)</Text>
                <Text style={styles.statSub}>Target imunisasi & tumbuh kembang</Text>
              </View>
              <Text style={[styles.statNum, { color: '#D97706' }]}>{stats?.balita}</Text>
            </View>

            {/* Lansia Card */}
            <View style={[styles.statCard, { borderLeftColor: '#6366F1' }]}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#EEF2FF' }]}>
                <Heart size={22} color="#4F46E5" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statName}>Lansia (≥ 60 Th)</Text>
                <Text style={styles.statSub}>Target posyandu lansia & kesehatan</Text>
              </View>
              <Text style={[styles.statNum, { color: '#4F46E5' }]}>{stats?.lansia}</Text>
            </View>

            {/* Ibu Hamil Card */}
            <View style={[styles.statCard, { borderLeftColor: '#EC4899' }]}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#FCE7F3' }]}>
                <Heart size={22} color="#DB2777" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statName}>Ibu Hamil & Menyusui</Text>
                <Text style={styles.statSub}>Hamil: {stats?.ibuHamil} | Menyusui: {stats?.ibuMenyusui}</Text>
              </View>
              <Text style={[styles.statNum, { color: '#DB2777' }]}>
                {(stats?.ibuHamil ?? 0) + (stats?.ibuMenyusui ?? 0)}
              </Text>
            </View>

            {/* WUS & PUS Card */}
            <View style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#F5F3FF' }]}>
                <Users size={22} color="#7C3AED" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statName}>Keluarga Berencana (KB)</Text>
                <Text style={styles.statSub}>WUS: {stats?.wus} | PUS: {stats?.pus}</Text>
              </View>
              <Text style={[styles.statNum, { color: '#7C3AED' }]}>{stats?.pus}</Text>
            </View>
          </View>

          {/* Gender Ratio */}
          <View style={styles.genderContainer}>
            <Text style={styles.sectionTitle}>RASIO GENDER</Text>
            <View style={styles.genderCard}>
              <View style={styles.genderBarContainer}>
                <View 
                  style={[
                    styles.genderBar, 
                    { 
                      backgroundColor: '#3B82F6', 
                      width: getPercentage(stats?.lakiLaki ?? 0, stats?.totalWarga ?? 0) as any
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.genderBar, 
                    { 
                      backgroundColor: '#EC4899', 
                      width: getPercentage(stats?.perempuan ?? 0, stats?.totalWarga ?? 0) as any
                    }
                  ]} 
                />
              </View>
              <View style={styles.genderLabelRow}>
                <View style={styles.genderLabelItem}>
                  <View style={[styles.genderDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={styles.genderLabelText}>Laki-laki ({stats?.lakiLaki})</Text>
                </View>
                <View style={styles.genderLabelItem}>
                  <View style={[styles.genderDot, { backgroundColor: '#EC4899' }]} />
                  <Text style={styles.genderLabelText}>Perempuan ({stats?.perempuan})</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scopeBadgeContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  scopeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 94, 32, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  scopeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#67C090',
  },
  coreStatsRow: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  coreCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  coreValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 34,
  },
  coreLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  statsList: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  statSub: {
    fontSize: 11,
    color: '#64748B',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '900',
    marginLeft: 8,
  },
  genderContainer: {
    marginBottom: 40,
  },
  genderCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  genderBarContainer: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  genderBar: {
    height: '100%',
  },
  genderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderLabelItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  genderLabelText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
});

