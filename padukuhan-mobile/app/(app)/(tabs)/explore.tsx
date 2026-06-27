import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { 
  Users, 
  Home, 
  Baby, 
  Heart, 
  Shield, 
  Sparkles, 
  Droplets, 
  Activity, 
  BookOpen, 
  Briefcase, 
  CheckCircle2 
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function RangkumanScreen() {
  const { profile } = useAuthStore();
  const role = profile?.role;
  const rtId = profile?.rt_id;
  const dasawismaId = profile?.dasawisma_id;

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['rangkuman_demografi_v2', role, rtId, dasawismaId],
    queryFn: async () => {
      // 1. Fetch Wargas in Parallel Pages (0-999 and 1000-1999) to bypass postgrest pagination limits
      let selectFields = 'id, tanggal_lahir, jenis_kelamin, status_perkawinan, status_kehamilan, status_menyusui, rt_id, pendidikan, pekerjaan';
      if (role === 'kader_dasawisma' && dasawismaId) {
        selectFields = 'id, tanggal_lahir, jenis_kelamin, status_perkawinan, status_kehamilan, status_menyusui, rumah_tanggas!inner(dasawisma_id), pendidikan, pekerjaan';
      }

      let wargaQuery1 = supabase
        .from('wargas')
        .select(selectFields)
        .eq('status_warga', 'aktif')
        .range(0, 999);

      let wargaQuery2 = supabase
        .from('wargas')
        .select(selectFields)
        .eq('status_warga', 'aktif')
        .range(1000, 1999);

      // 2. Fetch KK (rumah_tanggas)
      let kkQuery = supabase
        .from('rumah_tanggas')
        .select('id, rt_id, dasawisma_id, memiliki_jamban, memiliki_spal, kriteria_rumah, sumber_air')
        .eq('status_aktif', true);

      // Apply access control filters
      if (role === 'kader_dasawisma' && dasawismaId) {
        wargaQuery1 = wargaQuery1.eq('rumah_tanggas.dasawisma_id', dasawismaId);
        wargaQuery2 = wargaQuery2.eq('rumah_tanggas.dasawisma_id', dasawismaId);
        kkQuery = kkQuery.eq('dasawisma_id', dasawismaId);
      } else if (role === 'ketua_rt' && rtId) {
        wargaQuery1 = wargaQuery1.eq('rt_id', rtId);
        wargaQuery2 = wargaQuery2.eq('rt_id', rtId);
        kkQuery = kkQuery.eq('rt_id', rtId);
      }

      const [wargaRes1, wargaRes2, kkRes] = await Promise.all([
        wargaQuery1,
        wargaQuery2,
        kkQuery
      ]);

      if (wargaRes1.error) throw wargaRes1.error;
      if (kkRes.error) throw kkRes.error;

      // Merge wargas pages
      const wargas = [
        ...(wargaRes1.data || []),
        ...(wargaRes2.data || [])
      ];

      const now = new Date();
      
      const res = {
        totalWarga: wargas.length,
        totalKK: kkRes.data?.length ?? 0,
        balita: 0,
        anak: 0,
        produktif: 0,
        lansia: 0,
        wus: 0,
        pus: 0,
        ibuHamil: 0,
        ibuMenyusui: 0,
        lakiLaki: 0,
        perempuan: 0,
        
        // Sanitary & House stats
        jambanSehat: 0,
        spalLayak: 0,
        rumahLayak: 0,
        sumberAir: { pdam: 0, sumur: 0, lainnya: 0 } as Record<string, number>,
        
        // Top list data
        pekerjaanTop: [] as [string, number][],
        pendidikanTop: [] as [string, number][]
      };

      const jobCounts: Record<string, number> = {};
      const eduCounts: Record<string, number> = {};

      wargas.forEach((w: any) => {
        if (w.jenis_kelamin === 'L') res.lakiLaki++;
        if (w.jenis_kelamin === 'P') res.perempuan++;

        if (w.pekerjaan) {
          const job = w.pekerjaan.trim();
          const jobLower = job.toLowerCase();
          const isExcluded = jobLower.includes('pelajar') || 
                             jobLower.includes('mahasiswa') || 
                             jobLower.includes('tidak bekerja') || 
                             jobLower.includes('belum bekerja') || 
                             jobLower.includes('belum/tidak bekerja') || 
                             jobLower === '-';
          if (!isExcluded) {
            jobCounts[job] = (jobCounts[job] || 0) + 1;
          }
        }
        if (w.pendidikan) {
          const edu = w.pendidikan.trim();
          const eduLower = edu.toLowerCase();
          const isExcluded = eduLower.includes('belum') || 
                             eduLower.includes('tidak sekolah') || 
                             eduLower.includes('tidak/belum') || 
                             eduLower.includes('paud') || 
                             eduLower.includes('tk') || 
                             eduLower === '-';
          if (!isExcluded) {
            eduCounts[edu] = (eduCounts[edu] || 0) + 1;
          }
        }

        if (!w.tanggal_lahir) return;
        const birthDate = new Date(w.tanggal_lahir);
        if (isNaN(birthDate.getTime())) return;

        let age = now.getFullYear() - birthDate.getFullYear();
        const m = now.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
          age--;
        }

        if (age < 5) res.balita++;
        else if (age >= 6 && age <= 14) res.anak++;
        else if (age >= 15 && age <= 59) res.produktif++;
        
        if (age >= 60) res.lansia++;

        const isFemale = w.jenis_kelamin === 'P';
        if (isFemale && age >= 15 && age <= 49) {
          res.wus++;
          if (w.status_perkawinan === 'kawin') res.pus++;
        }

        if (w.status_kehamilan === true || w.status_kehamilan === 'true' || w.status_kehamilan === 'Hamil') {
          res.ibuHamil++;
        }
        if (w.status_menyusui === true || w.status_menyusui === 'true' || w.status_menyusui === 1) {
          res.ibuMenyusui++;
        }
      });

      // Sort and get top jobs and education
      res.pekerjaanTop = Object.entries(jobCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      res.pendidikanTop = Object.entries(eduCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      if (kkRes.data) {
        kkRes.data.forEach((kk: any) => {
          if (kk.memiliki_jamban) res.jambanSehat++;
          if (kk.memiliki_spal) res.spalLayak++;
          if (kk.kriteria_rumah === 'sehat_layak_huni') res.rumahLayak++;
          
          const air = kk.sumber_air?.toLowerCase() || 'lainnya';
          if (air === 'pdam') res.sumberAir.pdam++;
          else if (air === 'sumur') res.sumberAir.sumur++;
          else res.sumberAir.lainnya++;
        });
      }

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

  const toTitleCase = (str: string) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
          <ActivityIndicator color="#124170" size="large" />
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
              <Sparkles size={14} color="#124170" style={{ marginRight: 6 }} />
              <Text style={styles.scopeText}>Cakupan: {getScopeLabel()}</Text>
            </View>
          </View>

          {/* Core Stats Row */}
          <View style={styles.coreStatsRow}>
            <View style={[styles.coreCard, { backgroundColor: '#EFF6FF', borderColor: '#124170' }]}>
              <Users size={24} color="#124170" style={{ marginBottom: 8 }} />
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

            {/* Anak-anak Card */}
            <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
              <View style={[styles.statIconWrapper, { backgroundColor: '#D1FAE5' }]}>
                <BookOpen size={22} color="#059669" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statName}>Anak (6 - 14 Th)</Text>
                <Text style={styles.statSub}>Usia wajib belajar dan pembinaan dasar</Text>
              </View>
              <Text style={[styles.statNum, { color: '#059669' }]}>{stats?.anak}</Text>
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

          {/* Sanitary Section */}
          <Text style={styles.sectionTitle}>SANITASI & RUMAH TANGGA SEHAT</Text>
          <View style={styles.sanitaryContainer}>
            <View style={styles.sanitaryCard}>
              <SanitaryRow 
                icon={<CheckCircle2 size={18} color="#10B981" />} 
                label="Jamban Sehat" 
                value={`${stats?.jambanSehat} / ${stats?.totalKK} KK`}
                percentage={getPercentage(stats?.jambanSehat ?? 0, stats?.totalKK ?? 1)}
              />
              <SanitaryRow 
                icon={<CheckCircle2 size={18} color="#10B981" />} 
                label="Pembuangan SPAL Layak" 
                value={`${stats?.spalLayak} / ${stats?.totalKK} KK`}
                percentage={getPercentage(stats?.spalLayak ?? 0, stats?.totalKK ?? 1)}
              />
              <SanitaryRow 
                icon={<Shield size={18} color="#3B82F6" />} 
                label="Rumah Sehat Layak Huni" 
                value={`${stats?.rumahLayak} / ${stats?.totalKK} KK`}
                percentage={getPercentage(stats?.rumahLayak ?? 0, stats?.totalKK ?? 1)}
              />
              <View style={styles.waterInfoRow}>
                <Droplets size={16} color="#0284C7" />
                <Text style={styles.waterLabel}>Sumber Air Bersih:</Text>
                <Text style={styles.waterValue}>
                  PDAM: {stats?.sumberAir.pdam} KK | Sumur: {stats?.sumberAir.sumur} KK
                </Text>
              </View>
            </View>
          </View>

          {/* Employment & Education Breakdown */}
          <Text style={styles.sectionTitle}>DISTRIBUSI PEKERJAAN & PENDIDIKAN</Text>
          <View style={styles.distributionContainer}>
            <View style={styles.distCard}>
              <Text style={styles.distSubtitle}><Briefcase size={14} color="#475569" style={{ marginRight: 6 }} /> Top 3 Pekerjaan Warga</Text>
              {stats?.pekerjaanTop && stats.pekerjaanTop.length > 0 ? (
                stats.pekerjaanTop.map(([jobName, count], index) => (
                  <View key={index} style={styles.jobRow}>
                    <View style={styles.jobTextRow}>
                      <Text style={styles.jobName} numberOfLines={1}>{toTitleCase(jobName || 'Belum Bekerja')}</Text>
                      <Text style={styles.jobVal}>{count} jiwa</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { 
                            width: getPercentage(count, stats?.totalWarga ?? 1) as any, 
                            backgroundColor: '#1E40AF' 
                          }
                        ]} 
                      />
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Tidak ada data pekerjaan.</Text>
              )}

              <View style={styles.divider} />

              <Text style={styles.distSubtitle}><BookOpen size={14} color="#475569" style={{ marginRight: 6 }} /> Top 3 Pendidikan Terakhir</Text>
              {stats?.pendidikanTop && stats.pendidikanTop.length > 0 ? (
                stats.pendidikanTop.map(([eduName, count], index) => (
                  <View key={index} style={styles.jobRow}>
                    <View style={styles.jobTextRow}>
                      <Text style={styles.jobName} numberOfLines={1}>{eduName.toUpperCase()}</Text>
                      <Text style={styles.jobVal}>{count} jiwa</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { 
                            width: getPercentage(count, stats?.totalWarga ?? 1) as any, 
                            backgroundColor: '#7C3AED' 
                          }
                        ]} 
                      />
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Tidak ada data pendidikan.</Text>
              )}
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
                      width: getPercentage(stats?.lakiLaki ?? 0, stats?.totalWarga ?? 1) as any
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.genderBar, 
                    { 
                      backgroundColor: '#EC4899', 
                      width: getPercentage(stats?.perempuan ?? 0, stats?.totalWarga ?? 1) as any
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

function SanitaryRow({ icon, label, value, percentage }: { icon: React.ReactNode; label: string; value: string; percentage: string }) {
  return (
    <View style={styles.sanitaryRow}>
      <View style={styles.sanitaryIconText}>
        {icon}
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.sanitaryLabel}>{label}</Text>
          <Text style={styles.sanitaryValue}>{value}</Text>
        </View>
      </View>
      <View style={styles.percentBadge}>
        <Text style={styles.percentText}>{percentage}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
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
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  scopeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#124170',
  },
  coreStatsRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 16,
  },
  coreCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
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
    marginTop: 24,
    marginBottom: 16,
  },
  statsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
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
  sanitaryContainer: {
    paddingHorizontal: 20,
  },
  sanitaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
  },
  sanitaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sanitaryIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sanitaryLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  sanitaryValue: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  percentText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#124170',
  },
  waterInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  waterLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    marginLeft: 8,
    marginRight: 6,
  },
  waterValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
    flex: 1,
  },
  distributionContainer: {
    paddingHorizontal: 20,
  },
  distCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  distSubtitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#475569',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobRow: {
    marginBottom: 14,
  },
  jobTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  jobName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  jobVal: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  genderContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  genderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
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
