import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useQuery } from '@tanstack/react-query';
import { useDraftStore } from '@/hooks/useDraftStore';
import { useCreateMutasi } from '@/hooks/useMutasi';
import { useTambahWarga } from '@/hooks/useKependudukan';
import { 
  Users, 
  Home as HomeIcon, 
  FileText, 
  AlertTriangle, 
  Construction, 
  ArrowRightLeft, 
  Megaphone, 
  LogOut, 
  ChevronDown, 
  Bell, 
  Baby, 
  Heart, 
  TrendingUp, 
  Grid,
  MapPin,
  Clock,
  User,
  Coffee,
  Calendar
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RoleSimulator } from '@/components/RoleSimulator';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

// Color Palette Definition
const PALETTE = {
  veryLightMint: '#DDF4E7',
  softMediumGreen: '#67C090',
  tealBlueGreen: '#26667F',
  darkNavyBlue: '#124170',
  white: '#FFFFFF',
  bgGray: '#F8FAFC',
  textDark: '#0F172A',
  textMuted: '#64748B',
  accentRed: '#EF4444',
  accentOrange: '#F97316',
};

export default function DashboardScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();
  const [activeChartTab, setActiveChartTab] = useState<'umur' | 'gender' | 'pekerjaan'>('umur');

  const { drafts, deleteDraft } = useDraftStore();
  const [syncing, setSyncing] = useState(false);
  const createMutasi = useCreateMutasi();
  const { mutateAsync: tambahWarga } = useTambahWarga();

  const handleSyncDrafts = async () => {
    if (drafts.length === 0) return;
    setSyncing(true);
    let successCount = 0;
    let failCount = 0;

    for (const draft of drafts) {
      try {
        if (draft.type === 'warga') {
          await tambahWarga(draft.data);
        } else if (draft.type === 'mutasi') {
          await createMutasi.mutateAsync(draft.data);
        }
        deleteDraft(draft.id);
        successCount++;
      } catch (err) {
        console.error('Gagal sinkronisasi draf:', err);
        failCount++;
      }
    }

    setSyncing(false);
    if (failCount === 0) {
      Alert.alert('Sinkronisasi Sukses', `Berhasil mengirim ${successCount} data ke server.`);
    } else {
      Alert.alert('Sinkronisasi Selesai', `Berhasil mengirim ${successCount} data. ${failCount} data gagal terkirim.`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isKader = profile?.role === 'kader_dasawisma';

  // 1. Fetch Demographic Data for Charts
  const { data: wargas, isLoading: isWargasLoading } = useQuery({
    queryKey: ['wargas_demographics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wargas')
        .select('tanggal_lahir, jenis_kelamin, pekerjaan')
        .eq('status_warga', 'aktif');
      if (error) throw error;
      return data || [];
    }
  });

  // 4. Fetch Announcements (top 3)
  const { data: announcementsData, isLoading: isAnnouncementsLoading } = useAnnouncements({ activeOnly: true });
  const announcements = (announcementsData || []).slice(0, 3);

  // --- CHART DATA PROCESSING ---
  const now = new Date();
  const ageBuckets = { '0-4': 0, '5-14': 0, '15-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55-64': 0, '65+': 0 };
  let maleCount = 0;
  let femaleCount = 0;
  const jobCounts: { [key: string]: number } = {};

  if (wargas) {
    wargas.forEach((w: any) => {
      // Gender ratio
      if (w.jenis_kelamin === 'L') maleCount++;
      if (w.jenis_kelamin === 'P') femaleCount++;

      // Age buckets
      if (w.tanggal_lahir) {
        const birthDate = new Date(w.tanggal_lahir);
        let age = now.getFullYear() - birthDate.getFullYear();
        const m = now.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age <= 4) ageBuckets['0-4']++;
        else if (age <= 14) ageBuckets['5-14']++;
        else if (age <= 24) ageBuckets['15-24']++;
        else if (age <= 34) ageBuckets['25-34']++;
        else if (age <= 44) ageBuckets['35-44']++;
        else if (age <= 54) ageBuckets['45-54']++;
        else if (age <= 64) ageBuckets['55-64']++;
        else ageBuckets['65+']++;
      }

      // Jobs
      const job = w.pekerjaan || 'Tidak Bekerja';
      jobCounts[job] = (jobCounts[job] || 0) + 1;
    });
  }

  // Find max value in age buckets for scaling the chart
  const maxAgeCount = Math.max(...Object.values(ageBuckets), 1);
  const totalGender = maleCount + femaleCount || 1;

  // Process top jobs
  const sortedJobs = Object.entries(jobCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxJobCount = sortedJobs.length > 0 ? sortedJobs[0][1] : 1;

  // Helper to format large numbers (e.g. 1250 -> 1.250)
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'selesai':
        return { bg: '#DDF4E7', text: '#67C090', label: 'Selesai' };
      case 'proses':
        return { bg: '#FFF3E0', text: '#E65100', label: 'Proses' };
      default:
        return { bg: '#F1F5F9', text: '#475569', label: 'Menunggu' };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.dropdownSelector}>
              <View style={styles.logoBadge}>
                <HomeIcon size={16} color={PALETTE.white} />
              </View>
              <View>
                <Text style={styles.headerSubtitle}>Padukuhan</Text>
                <View style={styles.headerTitleRow}>
                  <Text style={styles.headerTitle}>Mandingan</Text>
                  <ChevronDown size={14} color={PALETTE.textDark} style={{ marginLeft: 4 }} />
                </View>
              </View>
            </View>
            <View style={styles.headerRightActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Bell size={20} color={PALETTE.textDark} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={[styles.iconButton, { marginLeft: 8 }]}>
                <LogOut size={20} color={PALETTE.textDark} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerBanner}>
            <View style={styles.headerBannerLeft}>
              <Text style={styles.greetingSub}>Selamat pagi, Dukuh</Text>
              <Text style={styles.greetingName}>{profile?.nama_lengkap || 'Budi Santoso'}</Text>
              <Text style={styles.greetingDate}>
                Berikut ringkasan data Padukuhan Mandingan per hari ini,{' '}
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.headerBannerRight}>
              <View style={styles.illustrationContainer}>
                {/* Custom stylized vector illustration using View elements */}
                <View style={styles.illHillsBack} />
                <View style={styles.illHillsFront} />
                <View style={styles.illHouse}>
                  <View style={styles.illRoof} />
                  <View style={styles.illDoor} />
                  <View style={styles.illWindow} />
                </View>
                <View style={styles.illTree1} />
                <View style={styles.illTree2} />
              </View>
            </View>
          </View>
        </View>

        {/* ROLE SIMULATOR FLOATING BAR */}
        <RoleSimulator />

        {/* DRAFT OFFLINE BANNER */}
        {drafts.length > 0 && (
          <View style={styles.draftBannerContainer}>
            <View style={styles.draftBanner}>
              <View style={styles.draftBannerLeft}>
                <Clock size={20} color="#D97706" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.draftBannerTitle}>Draf Offline Penduduk ({drafts.length})</Text>
                  <Text style={styles.draftBannerDesc}>
                    Ada {drafts.length} data tersimpan di HP. Kirim/sinkronkan ke server sekarang.
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.draftBannerBtn, syncing && { opacity: 0.7 }]} 
                onPress={handleSyncDrafts}
                disabled={syncing}
              >
                {syncing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.draftBannerBtnText}>Kirim</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* RINGKASAN DATA (Floating Cards) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ringkasan Data</Text>
          <View style={styles.statsRow}>
            {isStatsLoading ? (
              <ActivityIndicator color={PALETTE.tealBlueGreen} style={{ flex: 1, height: 100 }} />
            ) : (
              <>
                <View style={styles.statCard}>
                  <View style={[styles.statIconCircle, { backgroundColor: '#E0F2FE' }]}>
                    <Users size={20} color="#0284C7" />
                  </View>
                  <Text style={styles.statValue}>{formatNumber(stats?.totalWarga ?? 0)}</Text>
                  <Text style={styles.statLabel}>Total Jiwa</Text>
                  <View style={styles.statGrowthRow}>
                    <TrendingUp size={10} color="#10B981" />
                    <Text style={styles.statGrowthText}>+12 bln lalu</Text>
                  </View>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconCircle, { backgroundColor: '#EEF2FF' }]}>
                    <HomeIcon size={20} color="#4F46E5" />
                  </View>
                  <Text style={styles.statValue}>{formatNumber(stats?.totalKK ?? 0)}</Text>
                  <Text style={styles.statLabel}>Total KK</Text>
                  <View style={styles.statGrowthRow}>
                    <TrendingUp size={10} color="#10B981" />
                    <Text style={styles.statGrowthText}>+4 bln lalu</Text>
                  </View>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconCircle, { backgroundColor: '#FDF2F8' }]}>
                    <FileText size={20} color="#DB2777" />
                  </View>
                  <Text style={styles.statValue}>{formatNumber(stats?.totalLaporan ?? 0)}</Text>
                  <Text style={styles.statLabel}>Surat Aktif</Text>
                  <View style={styles.statGrowthRow}>
                    <TrendingUp size={10} color="#EF4444" />
                    <Text style={[styles.statGrowthText, { color: '#EF4444' }]}>+6 bln lalu</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* STATISTIK PKK */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Statistik PKK</Text>
            <TouchableOpacity onPress={() => router.push('/pkk' as any)}>
              <Text style={styles.sectionLinkText}>Lihat detail</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pkkGrid}>
            {isStatsLoading ? (
              <ActivityIndicator color={PALETTE.tealBlueGreen} style={{ flex: 1, height: 120 }} />
            ) : (
              <>
                <View style={[styles.pkkCard, { backgroundColor: '#F0FDF4' }]}>
                  <Baby size={20} color="#15803D" />
                  <Text style={styles.pkkValue}>{stats?.balita ?? 0}</Text>
                  <Text style={styles.pkkLabel}>Balita</Text>
                </View>

                <View style={[styles.pkkCard, { backgroundColor: '#FAF5FF' }]}>
                  <Heart size={20} color="#7E22CE" />
                  <Text style={styles.pkkValue}>{stats?.lansia ?? 0}</Text>
                  <Text style={styles.pkkLabel}>Lansia</Text>
                </View>

                <View style={[styles.pkkCard, { backgroundColor: '#FEF3C7' }]}>
                  <User size={20} color="#B45309" />
                  <Text style={styles.pkkValue}>{stats?.wus ?? 0}</Text>
                  <Text style={styles.pkkLabel}>WUS</Text>
                </View>

                <View style={[styles.pkkCard, { backgroundColor: '#FCE7F3' }]}>
                  <Users size={20} color="#BE185D" />
                  <Text style={styles.pkkValue}>{stats?.pus ?? 0}</Text>
                  <Text style={styles.pkkLabel}>PUS</Text>
                </View>

                <View style={[styles.pkkCard, { backgroundColor: '#EFF6FF' }]}>
                  <Heart size={20} color="#1D4ED8" />
                  <Text style={styles.pkkValue}>{stats?.ibuHamil ?? 0}</Text>
                  <Text style={styles.pkkLabel}>Bumil</Text>
                </View>

                <View style={[styles.pkkCard, { backgroundColor: '#E0F2FE' }]}>
                  <Coffee size={20} color="#0369A1" />
                  <Text style={styles.pkkValue}>{stats?.ibuMenyusui ?? 0}</Text>
                  <Text style={styles.pkkLabel}>Busui</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* MENU CEPAT */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Menu Cepat</Text>
          <View style={styles.menuCepatGrid}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/warga' as any)}>
              <View style={[styles.menuIconBox, { backgroundColor: '#EBF8FF' }]}>
                <Users size={24} color="#2B6CB0" />
              </View>
              <Text style={styles.menuLabel}>Kependudukan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/mutasi' as any)}>
              <View style={[styles.menuIconBox, { backgroundColor: '#EDF2F7' }]}>
                <ArrowRightLeft size={24} color="#4A5568" />
              </View>
              <Text style={styles.menuLabel}>Mutasi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/surat' as any)}>
              <View style={[styles.menuIconBox, { backgroundColor: '#FEEBC8' }]}>
                <FileText size={24} color="#C05621" />
              </View>
              <Text style={styles.menuLabel}>Surat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/pengumuman' as any)}>
              <View style={[styles.menuIconBox, { backgroundColor: '#EBF8FF' }]}>
                <Megaphone size={24} color="#2B6CB0" />
              </View>
              <Text style={styles.menuLabel}>Pengumuman</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/program' as any)}>
              <View style={[styles.menuIconBox, { backgroundColor: '#E6FFFA' }]}>
                <Construction size={24} color="#319795" />
              </View>
              <Text style={styles.menuLabel}>Program</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/pkk' as any)}>
              <View style={[styles.menuIconBox, { backgroundColor: '#FFF5F5' }]}>
                <Heart size={24} color="#C53030" />
              </View>
              <Text style={styles.menuLabel}>PKK / Dasawisma</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CTA LENGKAPI DATA BANNER */}
        <View style={[styles.sectionContainer, { paddingHorizontal: 20 }]}>
          <View style={styles.bannerCta}>
            <View style={styles.bannerCtaLeft}>
              <Text style={styles.bannerCtaTitle}>Ayo lengkapi data Padukuhan!</Text>
              <Text style={styles.bannerCtaDesc}>
                Pastikan data selalu terbarui untuk pelayanan yang lebih baik.
              </Text>
              <TouchableOpacity style={styles.bannerCtaBtn} onPress={() => router.push('/warga' as any)}>
                <Text style={styles.bannerCtaBtnText}>Lengkapi Sekarang</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bannerCtaRight}>
              <View style={styles.clipboardIllustration}>
                <View style={styles.clipBoardBody}>
                  <View style={styles.clipClip} />
                  <View style={styles.clipLine1} />
                  <View style={styles.clipLine2} />
                  <View style={styles.clipLine3} />
                  <View style={styles.clipCheck} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* GRAFIK PENDUDUK */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Grafik Penduduk</Text>
            <TouchableOpacity onPress={() => router.push('/explore' as any)}>
              <Text style={styles.sectionLinkText}>Lihat detail</Text>
            </TouchableOpacity>
          </View>

          {/* Tab buttons using Palette Accent Teal/Navy */}
          <View style={styles.chartTabsContainer}>
            <TouchableOpacity 
              style={[styles.chartTabBtn, activeChartTab === 'umur' && styles.chartTabBtnActive]} 
              onPress={() => setActiveChartTab('umur')}
            >
              <Text style={[styles.chartTabBtnText, activeChartTab === 'umur' && styles.chartTabBtnTextActive]}>Umur</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.chartTabBtn, activeChartTab === 'gender' && styles.chartTabBtnActive]} 
              onPress={() => setActiveChartTab('gender')}
            >
              <Text style={[styles.chartTabBtnText, activeChartTab === 'gender' && styles.chartTabBtnTextActive]}>Jenis Kelamin</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.chartTabBtn, activeChartTab === 'pekerjaan' && styles.chartTabBtnActive]} 
              onPress={() => setActiveChartTab('pekerjaan')}
            >
              <Text style={[styles.chartTabBtnText, activeChartTab === 'pekerjaan' && styles.chartTabBtnTextActive]}>Pekerjaan</Text>
            </TouchableOpacity>
          </View>

          {/* Chart Content Area */}
          <View style={styles.chartContentCard}>
            {isWargasLoading ? (
              <ActivityIndicator color={PALETTE.tealBlueGreen} style={{ height: 160 }} />
            ) : (
              <>
                {/* 1. AGE DISTRIBUTION CHART */}
                {activeChartTab === 'umur' && (
                  <View style={styles.barChartContainer}>
                    <View style={styles.barChartYAxis}>
                      <Text style={styles.chartAxisLabel}>500</Text>
                      <Text style={styles.chartAxisLabel}>400</Text>
                      <Text style={styles.chartAxisLabel}>300</Text>
                      <Text style={styles.chartAxisLabel}>200</Text>
                      <Text style={styles.chartAxisLabel}>100</Text>
                      <Text style={styles.chartAxisLabel}>0</Text>
                    </View>
                    <View style={styles.barChartGraphWrapper}>
                      <View style={styles.barGridLines}>
                        <View style={styles.gridLine} />
                        <View style={styles.gridLine} />
                        <View style={styles.gridLine} />
                        <View style={styles.gridLine} />
                        <View style={styles.gridLine} />
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barChartScroll}>
                        {Object.entries(ageBuckets).map(([key, val]) => {
                          const barHeight = Math.max((val / maxAgeCount) * 120, 4);
                          return (
                            <View key={key} style={styles.barChartCol}>
                              <View style={styles.barHoverValueContainer}>
                                <Text style={styles.barHoverValue}>{val}</Text>
                              </View>
                              <View style={[styles.barChartBar, { height: barHeight }]} />
                              <Text style={styles.barChartLabel}>{key}</Text>
                            </View>
                          );
                        })}
                      </ScrollView>
                    </View>
                  </View>
                )}

                {/* 2. GENDER RATIO CHART */}
                {activeChartTab === 'gender' && (
                  <View style={styles.genderChartContainer}>
                    <View style={styles.genderRow}>
                      <View style={styles.genderLabelWrapper}>
                        <Text style={styles.genderName}>Laki-laki</Text>
                        <Text style={styles.genderCount}>{maleCount} Jiwa ({Math.round((maleCount / totalGender) * 100)}%)</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${(maleCount / totalGender) * 100}%`, backgroundColor: PALETTE.tealBlueGreen }]} />
                      </View>
                    </View>

                    <View style={[styles.genderRow, { marginTop: 20 }]}>
                      <View style={styles.genderLabelWrapper}>
                        <Text style={styles.genderName}>Perempuan</Text>
                        <Text style={styles.genderCount}>{femaleCount} Jiwa ({Math.round((femaleCount / totalGender) * 100)}%)</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${(femaleCount / totalGender) * 100}%`, backgroundColor: PALETTE.softMediumGreen }]} />
                      </View>
                    </View>
                  </View>
                )}

                {/* 3. OCCUPATION CHART */}
                {activeChartTab === 'pekerjaan' && (
                  <View style={styles.jobsChartContainer}>
                    {sortedJobs.length === 0 ? (
                      <Text style={styles.emptyText}>Tidak ada data pekerjaan.</Text>
                    ) : (
                      sortedJobs.map(([jobName, val]) => {
                        const ratio = (val / maxJobCount) * 100;
                        return (
                          <View key={jobName} style={styles.jobRow}>
                            <View style={styles.jobTextRow}>
                              <Text style={styles.jobName} numberOfLines={1}>{jobName}</Text>
                              <Text style={styles.jobVal}>{val} jiwa</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                              <View style={[styles.progressBarFill, { width: `${ratio}%`, backgroundColor: PALETTE.softMediumGreen }]} />
                            </View>
                          </View>
                        );
                      })
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* PENGUMUMAN TERBARU */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Pengumuman Terbaru</Text>
            <TouchableOpacity onPress={() => router.push('/pengumuman' as any)}>
              <Text style={styles.sectionLinkText}>Lihat semua</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listCardWrapper}>
            {isAnnouncementsLoading ? (
              <ActivityIndicator color={PALETTE.tealBlueGreen} style={{ padding: 20 }} />
            ) : announcements.length === 0 ? (
              <View style={styles.emptyStateCard}>
                <Megaphone size={32} color={PALETTE.textMuted} style={{ marginBottom: 8 }} />
                <Text style={styles.emptyText}>Belum ada pengumuman.</Text>
              </View>
            ) : (
              announcements.map((item: any) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.listItemRow}
                  onPress={() => router.push(`/pengumuman/${item.id}` as any)}
                >
                  <View style={[styles.listItemIconWrapper, { backgroundColor: PALETTE.veryLightMint }]}>
                    <Megaphone size={18} color={PALETTE.tealBlueGreen} />
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{item.judul}</Text>
                    <View style={styles.listItemSubRow}>
                      <Text style={styles.listItemSubText}>
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Text>
                      {item.lokasi && (
                        <>
                          <View style={styles.dotSeparator} />
                          <Text style={styles.listItemSubText} numberOfLines={1}>{item.lokasi}</Text>
                        </>
                      )}
                    </View>
                  </View>
                  <Text style={styles.listItemTime}>
                    {new Date(item.created_at).getHours()}.00
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Padding Bottom for scroll view */}
        <View style={{ height: 40 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.white, // Clean white dominant background
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 20,
    backgroundColor: PALETTE.white,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    height: 32,
    width: 32,
    borderRadius: 10,
    backgroundColor: PALETTE.softMediumGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerSubtitle: {
    fontSize: 10,
    color: PALETTE.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PALETTE.textDark,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: PALETTE.bgGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: PALETTE.accentRed,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: PALETTE.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  headerBanner: {
    flexDirection: 'row',
    backgroundColor: PALETTE.white,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  headerBannerLeft: {
    flex: 1.2,
    justifyContent: 'center',
  },
  greetingSub: {
    fontSize: 12,
    fontWeight: '600',
    color: PALETTE.softMediumGreen,
    marginBottom: 4,
  },
  greetingName: {
    fontSize: 22,
    fontWeight: '900',
    color: PALETTE.textDark,
    marginBottom: 8,
  },
  greetingDate: {
    fontSize: 10,
    color: PALETTE.textMuted,
    lineHeight: 14,
  },
  headerBannerRight: {
    flex: 0.8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: 100,
    height: 80,
    overflow: 'hidden',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    position: 'relative',
  },
  illHillsBack: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    width: 80,
    height: 50,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
  },
  illHillsFront: {
    position: 'absolute',
    bottom: -20,
    right: -10,
    width: 90,
    height: 60,
    borderRadius: 45,
    backgroundColor: '#C2F3D3',
  },
  illHouse: {
    position: 'absolute',
    bottom: 10,
    left: 35,
    width: 30,
    height: 25,
    backgroundColor: PALETTE.white,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  illRoof: {
    position: 'absolute',
    top: -12,
    left: -3,
    width: 34,
    height: 12,
    backgroundColor: PALETTE.softMediumGreen,
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
  },
  illDoor: {
    position: 'absolute',
    bottom: 0,
    left: 6,
    width: 8,
    height: 14,
    backgroundColor: PALETTE.tealBlueGreen,
  },
  illWindow: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    backgroundColor: '#FEF08A',
  },
  illTree1: {
    position: 'absolute',
    bottom: 8,
    left: 15,
    width: 12,
    height: 20,
    backgroundColor: PALETTE.tealBlueGreen,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  illTree2: {
    position: 'absolute',
    bottom: 5,
    right: 15,
    width: 16,
    height: 26,
    backgroundColor: PALETTE.softMediumGreen,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: PALETTE.white,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PALETTE.textDark,
    marginBottom: 16,
  },
  sectionLinkText: {
    fontSize: 13,
    color: PALETTE.softMediumGreen,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 56) / 3,
    backgroundColor: PALETTE.white,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
  },
  statIconCircle: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PALETTE.textDark,
  },
  statLabel: {
    fontSize: 10,
    color: PALETTE.textMuted,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 8,
  },
  statGrowthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statGrowthText: {
    fontSize: 8,
    color: '#10B981',
    fontWeight: 'bold',
    marginLeft: 3,
  },
  pkkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pkkCard: {
    width: (width - 52) / 3,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  pkkValue: {
    fontSize: 22,
    fontWeight: '900',
    color: PALETTE.textDark,
    marginTop: 8,
  },
  pkkLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.textMuted,
    marginTop: 2,
  },
  menuCepatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: (width - 40) / 4,
    alignItems: 'center',
    marginBottom: 20,
  },
  menuIconBox: {
    height: 52,
    width: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: PALETTE.textDark,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  bannerCta: {
    backgroundColor: '#EDFDF5',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bannerCtaLeft: {
    flex: 1.3,
  },
  bannerCtaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PALETTE.textDark,
    marginBottom: 6,
  },
  bannerCtaDesc: {
    fontSize: 11,
    color: PALETTE.textMuted,
    lineHeight: 16,
    marginBottom: 14,
  },
  bannerCtaBtn: {
    backgroundColor: PALETTE.softMediumGreen,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  bannerCtaBtnText: {
    color: PALETTE.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  bannerCtaRight: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  clipboardIllustration: {
    width: 60,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clipBoardBody: {
    width: 46,
    height: 58,
    backgroundColor: PALETTE.white,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: PALETTE.tealBlueGreen,
    padding: 6,
    position: 'relative',
  },
  clipClip: {
    position: 'absolute',
    top: -6,
    left: 13,
    width: 20,
    height: 8,
    backgroundColor: PALETTE.tealBlueGreen,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  clipLine1: {
    width: 20,
    height: 2,
    backgroundColor: '#CBD5E1',
    marginTop: 6,
  },
  clipLine2: {
    width: 26,
    height: 2,
    backgroundColor: '#CBD5E1',
    marginTop: 6,
  },
  clipLine3: {
    width: 16,
    height: 2,
    backgroundColor: '#CBD5E1',
    marginTop: 6,
  },
  clipCheck: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: PALETTE.softMediumGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartTabsContainer: {
    flexDirection: 'row',
    backgroundColor: PALETTE.bgGray,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  chartTabBtnActive: {
    backgroundColor: PALETTE.softMediumGreen,
  },
  chartTabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.textMuted,
  },
  chartTabBtnTextActive: {
    color: PALETTE.white,
  },
  chartContentCard: {
    backgroundColor: PALETTE.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    minHeight: 180,
  },
  barChartContainer: {
    flexDirection: 'row',
    height: 150,
  },
  barChartYAxis: {
    justifyContent: 'space-between',
    paddingRight: 10,
    height: 120,
  },
  chartAxisLabel: {
    fontSize: 9,
    color: PALETTE.textMuted,
    textAlign: 'right',
  },
  barChartGraphWrapper: {
    flex: 1,
    position: 'relative',
    height: 150,
  },
  barGridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  barChartScroll: {
    alignItems: 'flex-end',
    height: 150,
    paddingRight: 10,
  },
  barChartCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 36,
    height: 150,
    marginRight: 8,
  },
  barHoverValueContainer: {
    marginBottom: 4,
    backgroundColor: PALETTE.bgGray,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  barHoverValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: PALETTE.textDark,
  },
  barChartBar: {
    width: 14,
    backgroundColor: PALETTE.softMediumGreen,
    borderRadius: 4,
  },
  barChartLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: PALETTE.textMuted,
    marginTop: 6,
  },
  genderChartContainer: {
    paddingVertical: 10,
  },
  genderRow: {
    width: '100%',
  },
  genderLabelWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  genderName: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.textDark,
  },
  genderCount: {
    fontSize: 12,
    color: PALETTE.textMuted,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 12,
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  jobsChartContainer: {
    paddingVertical: 6,
  },
  jobRow: {
    marginBottom: 16,
  },
  jobTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  jobName: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.textDark,
    flex: 0.75,
  },
  jobVal: {
    fontSize: 11,
    color: PALETTE.textMuted,
    fontWeight: '600',
    flex: 0.25,
    textAlign: 'right',
  },
  listCardWrapper: {
    backgroundColor: PALETTE.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  emptyStateCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: PALETTE.textMuted,
    textAlign: 'center',
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  listItemIconWrapper: {
    height: 36,
    width: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
    marginRight: 10,
  },
  listItemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: PALETTE.textDark,
  },
  listItemSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  listItemSubText: {
    fontSize: 10,
    color: PALETTE.textMuted,
  },
  dotSeparator: {
    height: 3,
    width: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 6,
  },
  listItemTime: {
    fontSize: 11,
    color: PALETTE.textMuted,
    fontWeight: '600',
  },
  statusBadgeTextWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  agendaItemRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  agendaCalendarBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  agendaCalDay: {
    fontSize: 16,
    fontWeight: '900',
    color: PALETTE.softMediumGreen,
    lineHeight: 18,
  },
  agendaCalMonth: {
    fontSize: 9,
    fontWeight: 'bold',
    color: PALETTE.tealBlueGreen,
  },
  agendaContent: {
    flex: 1,
  },
  agendaTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: PALETTE.textDark,
    marginBottom: 4,
  },
  agendaMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agendaMetaText: {
    fontSize: 10,
    color: PALETTE.textMuted,
  },
  draftBannerContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  draftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FEF3C7',
  },
  draftBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  draftBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
  },
  draftBannerDesc: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
    fontWeight: '500',
  },
  draftBannerBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftBannerBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});
