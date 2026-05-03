import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, CreditCard, Calendar, MapPin, Briefcase, Heart, Users, Printer, Edit2, Shield, XCircle } from 'lucide-react-native';
import { useWargaDetail } from '@/hooks/useKependudukan';

const { width } = Dimensions.get('window');

type WargaDetail = {
  nama_lengkap: string;
  nik: string | null;
  jenis_kelamin: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  agama: string | null;
  pekerjaan: string | null;
  status_perkawinan: string | null;
  hubungan_keluarga?: string | null;
  status_warga: string | null;
  rumah_tanggas?: { no_kk?: string | null } | null;
  kk?: { no_kk?: string | null } | null;
  rts?: { nomor_rt: number | string } | null;
};

export default function WargaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const wargaId = Array.isArray(id) ? id[0] : id;
  const { data: warga, isLoading, error } = useWargaDetail(wargaId as string);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </View>
    );
  }

  if (error || !warga) {
    return (
      <View style={styles.emptyContainer}>
        <XCircle color="#EF4444" size={48} style={{ marginBottom: 16 }} />
        <Text style={styles.emptyText}>{error ? "Terjadi kesalahan memuat data." : "Data warga tidak ditemukan"}</Text>
        <TouchableOpacity style={styles.backButtonLarge} onPress={() => router.canGoBack() ? router.back() : router.replace('/' as any)}>
          <Text style={styles.backButtonLargeText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const noKk = (warga as any).rumah_tanggas?.no_kk || (warga as any).kk?.no_kk;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Profile */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/' as any)} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              <User size={60} color="#1B5E20" />
            </View>
            <View style={styles.genderBadge}>
              <Text style={styles.genderIcon}>{(warga as any).jenis_kelamin === 'L' ? '♂️' : '♀️'}</Text>
            </View>
          </View>
          
          <Text style={styles.profileName}>{(warga as any).nama_lengkap}</Text>
          <View style={styles.nikBadge}>
            <CreditCard size={14} color="rgba(255,255,255,0.7)" style={{ marginRight: 6 }} />
            <Text style={styles.nikText}>{(warga as any).nik || 'NIK Belum Terdaftar'}</Text>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          <Section title="IDENTITAS DIRI" icon={<User size={16} color="#1B5E20" />}>
            <InfoRow label="Tempat Lahir" value={(warga as any).tempat_lahir ?? '-'} />
            <InfoRow label="Tanggal Lahir" value={(warga as any).tanggal_lahir ?? '-'} />
            <InfoRow label="Jenis Kelamin" value={(warga as any).jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
            <InfoRow label="Agama" value={(warga as any).agama ?? '-'} />
          </Section>

          <Section title="DATA SOSIAL" icon={<Briefcase size={16} color="#1B5E20" />}>
            <InfoRow label="Pekerjaan" value={(warga as any).pekerjaan ?? '-'} />
            <InfoRow label="Status Perkawinan" value={(warga as any).status_perkawinan?.replace(/_/g, ' ') ?? '-'} />
            <InfoRow label="Status Warga" value={(warga as any).status_warga ?? '-'} />
          </Section>

          <Section title="KEPENDUDUKAN" icon={<Shield size={16} color="#1B5E20" />}>
            <InfoRow label="Nomor Kartu Keluarga" value={noKk || '-'} />
            <InfoRow label="Hubungan Keluarga" value={(warga as any).hubungan_keluarga?.replace(/_/g, ' ') ?? '-'} />
            <InfoRow label="Wilayah RT" value={`RT 0${(warga as any).rts?.nomor_rt ?? '-'}`} />
          </Section>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push(`/kependudukan/${wargaId}/edit`)}
            >
              <Edit2 size={18} color="#1B5E20" style={{ marginRight: 8 }} />
              <Text style={styles.editButtonText}>Perbarui Data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.printButton}>
              <Printer size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.printButtonText}>Cetak Keterangan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrapper}>{icon}</View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
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
  profileHeader: {
    backgroundColor: '#1B5E20',
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 24,
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarContainer: {
    height: 110,
    width: 110,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  genderBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#1B5E20',
  },
  genderIcon: {
    fontSize: 14,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  nikBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  nikText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  content: {
    padding: 24,
    marginTop: -20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconWrapper: {
    height: 32,
    width: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(27, 94, 32, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1B5E20',
    letterSpacing: 1.5,
  },
  sectionContent: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    paddingBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '800',
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
  actionSection: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 12,
    paddingBottom: 40,
  },
  editButton: {
    flex: 1,
    height: 60,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1B5E20',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#1B5E20',
    fontSize: 15,
    fontWeight: '900',
  },
  printButton: {
    flex: 1,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#1B5E20',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  printButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 20,
  },
  backButtonLarge: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  backButtonLargeText: {
    color: '#fff',
    fontWeight: '800',
  }
});
