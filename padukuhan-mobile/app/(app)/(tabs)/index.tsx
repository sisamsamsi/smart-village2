import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, Platform } from 'react-native';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { Users, Home, FileText, AlertTriangle, Construction, ArrowRightLeft, Megaphone, LogOut, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RoleSimulator } from '@/components/RoleSimulator';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const { data: stats, isLoading } = useDashboardStats();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isKader = profile?.role === 'kader_dasawisma';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header - Premium Green Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTagline}>PADUKUHAN MANDINGAN</Text>
              <Text style={styles.headerGreeting}>
                Halo,{"\n"}{profile?.nama_lengkap?.split(' ')[0] || 'Dukuh'}
              </Text>
              <View style={styles.roleBadge}>
                <View style={styles.roleDot} />
                <Text style={styles.roleText}>{profile?.role?.replace('_', ' ') || 'Admin'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section - Floating */}
        <View style={styles.statsWrapper}>
          <View style={styles.statsCard}>
            {isLoading ? (
              <ActivityIndicator color="#1B5E20" />
            ) : (
              <>
                <StatItem label="Jiwa" value={stats?.totalWarga ?? 0} color="#10B981" />
                <View style={styles.statDivider} />
                <StatItem label="KK" value={stats?.totalKK ?? 0} color="#3B82F6" />
                <View style={styles.statDivider} />
                <StatItem label="Laporan" value={stats?.totalLaporan ?? 0} color="#EF4444" />
              </>
            )}
          </View>
        </View>

        {/* Simulator Role */}
        <RoleSimulator />

        {/* Menu Grid */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>LAYANAN DIGITAL</Text>
          <View style={styles.menuGrid}>
            <MenuCard 
              title="Data Warga" 
              icon={<Users size={24} color="#1B5E20" />} 
              onPress={() => router.push('/warga' as any)}
            />
            <MenuCard 
              title="Pembangunan" 
              icon={<Construction size={24} color="#1B5E20" />} 
              onPress={() => router.push('/program' as any)}
              disabled={isKader}
            />
            <MenuCard 
              title="Mutasi Warga" 
              icon={<ArrowRightLeft size={24} color="#1B5E20" />} 
              onPress={() => router.push('/mutasi' as any)}
              disabled={isKader}
            />
            <MenuCard 
              title="Layanan Surat" 
              icon={<FileText size={24} color="#1B5E20" />} 
              onPress={() => router.push('/surat' as any)}
              disabled={isKader}
            />
            <MenuCard 
              title="Kegiatan PKK" 
              icon={<Home size={24} color="#1B5E20" />} 
              onPress={() => router.push('/pkk' as any)}
            />
          </View>
        </View>

        {/* PKK Stats Section */}
        <View style={styles.pkkStatsSection}>
          <Text style={styles.sectionLabel}>REKAPITULASI PKK & DASAWISMA</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pkkStatsScroll}>
            <PkkStatItem label="Balita" value={stats?.balita ?? 0} color="#0EA5E9" bg="#F0F9FF" />
            <PkkStatItem label="Lansia" value={stats?.lansia ?? 0} color="#6366F1" bg="#EEF2FF" />
            <PkkStatItem label="WUS" value={stats?.wus ?? 0} color="#A855F7" bg="#FAF5FF" />
            <PkkStatItem label="PUS" value={stats?.pus ?? 0} color="#EC4899" bg="#FFF1F2" />
            <PkkStatItem label="Ibu Hamil" value={stats?.ibuHamil ?? 0} color="#F43F5E" bg="#FFF1F2" />
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value, color }: { label: string, value: number | string, color: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function PkkStatItem({ label, value, color, bg }: { label: string, value: number | string, color: string, bg: string }) {
  return (
    <View style={[styles.pkkStatCard, { backgroundColor: bg }]}>
      <Text style={[styles.pkkStatValue, { color }]}>{value}</Text>
      <Text style={styles.pkkStatLabel}>{label}</Text>
    </View>
  )
}

function MenuCard({ title, icon, onPress, disabled }: { title: string, icon: React.ReactNode, onPress?: () => void, disabled?: boolean }) {
  return (
    <TouchableOpacity 
      onPress={disabled ? undefined : onPress} 
      style={[styles.menuCard, disabled && styles.menuCardDisabled]}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <View style={[styles.menuIconWrapper, disabled && styles.menuIconWrapperDisabled]}>
         {icon}
      </View>
      <Text style={[styles.menuTitle, disabled && styles.menuTitleDisabled]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 50 : 30,
    paddingBottom: 80,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTagline: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerGreeting: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  roleDot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
    marginRight: 8,
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logoutButton: {
    height: 48,
    width: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginLeft: 'auto',
  },
  statsWrapper: {
    paddingHorizontal: 24,
    marginTop: -50,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 8,
    height: 110,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  statDivider: {
    height: 40,
    width: 1,
    backgroundColor: '#F1F5F9',
  },
  menuSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  sectionLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    width: (width - 64) / 2,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  menuCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  menuIconWrapper: {
    height: 56,
    width: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(27, 94, 32, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  menuIconWrapperDisabled: {
    backgroundColor: '#E2E8F0',
  },
  menuTitle: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  menuTitleDisabled: {
    color: '#94A3B8',
  },
  pkkStatsSection: {
    paddingTop: 24,
  },
  pkkStatsScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  pkkStatCard: {
    width: 100,
    height: 80,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pkkStatValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  pkkStatLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  }
});
