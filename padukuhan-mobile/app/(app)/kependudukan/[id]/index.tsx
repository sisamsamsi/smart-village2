import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  User, 
  Home, 
  Briefcase, 
  Heart, 
  Clock, 
  Edit2, 
  UserPlus, 
  ChevronDown, 
  ChevronUp, 
  CreditCard,
  XCircle,
  MoreVertical
} from 'lucide-react-native';
import { useWargaDetail, useWargaMutasi } from '@/hooks/useKependudukan';

const { width } = Dimensions.get('window');

const getAge = (dobString: string | null) => {
  if (!dobString) return '';
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return `${age} th`;
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export default function WargaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const wargaId = Array.isArray(id) ? id[0] : id;
  const { data: warga, isLoading, error } = useWargaDetail(wargaId as string);
  const { data: mutasiList, isLoading: isMutasiLoading } = useWargaMutasi(wargaId as string);

  const [expandedSections, setExpandedSections] = useState({
    biodata: true,
    kependudukan: true,
    sosialEkonomi: true,
    kesehatanPkk: true,
    riwayatMutasi: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
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

  const noKk = warga.rumah_tanggas?.no_kk;
  const isMale = warga.jenis_kelamin === 'L';
  const ageStr = getAge(warga.tanggal_lahir);
  const formattedDob = warga.tanggal_lahir 
    ? `${warga.tempat_lahir ?? '-'}, ${formatDate(warga.tanggal_lahir)} ${ageStr ? `(${ageStr})` : ''}`
    : '-';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/' as any)} style={styles.backIconButton}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Warga</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical color="#1E293B" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Green Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileMainRow}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <User size={48} color="#2E7D32" />
            </View>
            
            {/* Name and Basic Info */}
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName} numberOfLines={1}>{warga.nama_lengkap}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{warga.status_warga?.toUpperCase() || 'AKTIF'}</Text>
                </View>
              </View>
              
              <View style={styles.infoMetaRow}>
                <Home size={14} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.infoMetaText}>
                  RT {warga.rts?.nomor_rt ? `0${warga.rts.nomor_rt}` : '-'} / RW 01
                </Text>
              </View>
              
              <View style={[styles.infoMetaRow, { marginTop: 4 }]}>
                <CreditCard size={14} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.infoMetaText}>No. KK {noKk || '-'}</Text>
              </View>
            </View>
          </View>
          
          {/* Sub Badges at the bottom of card */}
          <View style={styles.badgeRow}>
            <View style={[styles.cardSubBadge, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.cardSubBadgeText, { color: '#2E7D32' }]}>
                {warga.hubungan_keluarga || 'Anggota Keluarga'}
              </Text>
            </View>
            <View style={[styles.cardSubBadge, { backgroundColor: isMale ? '#E3F2FD' : '#FCE7F3' }]}>
              <Text style={[styles.cardSubBadgeText, { color: isMale ? '#1565C0' : '#C2185B' }]}>
                {isMale ? 'Laki-laki' : 'Perempuan'}
              </Text>
            </View>
          </View>
        </View>

        {/* Edit Data & Buat Mutasi buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.actionButtonOutline}
            onPress={() => router.push(`/kependudukan/${wargaId}/edit`)}
          >
            <Edit2 size={16} color="#1E293B" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Edit Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButtonOutline}
            onPress={() => router.push({ pathname: '/mutasi/tambah', params: { wargaId } })}
          >
            <UserPlus size={16} color="#1E293B" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Buat Mutasi</Text>
          </TouchableOpacity>
        </View>

        {/* Collapsible Section: Biodata */}
        <CollapsibleSection
          title="Biodata"
          icon={<User size={18} color="#2563EB" />}
          iconBg="#DBEAFE"
          isExpanded={expandedSections.biodata}
          onToggle={() => toggleSection('biodata')}
        >
          <InfoRow label="Tempat, Tgl Lahir" value={formattedDob} />
          <InfoRow label="Jenis Kelamin" value={isMale ? 'Laki-laki' : 'Perempuan'} />
          <InfoRow label="Agama" value={warga.agama ?? '-'} />
          <InfoRow label="Status Perkawinan" value={warga.status_perkawinan ?? '-'} />
        </CollapsibleSection>

        {/* Collapsible Section: Kependudukan */}
        <CollapsibleSection
          title="Kependudukan"
          icon={<Home size={18} color="#16A34A" />}
          iconBg="#DCFCE7"
          isExpanded={expandedSections.kependudukan}
          onToggle={() => toggleSection('kependudukan')}
        >
          <InfoRow label="No. KK" value={noKk || '-'} />
          <InfoRow label="Hubungan Keluarga" value={warga.hubungan_keluarga ?? '-'} />
          <InfoRow label="RT / RW" value={`RT 0${warga.rts?.nomor_rt ?? '-'} / RW 01`} />
          <InfoRow label="Status Warga" value={warga.status_warga ?? 'Aktif'} isLast />
        </CollapsibleSection>

        {/* Collapsible Section: Sosial Ekonomi */}
        <CollapsibleSection
          title="Sosial Ekonomi"
          icon={<Briefcase size={18} color="#0D9488" />}
          iconBg="#CCFBF1"
          isExpanded={expandedSections.sosialEkonomi}
          onToggle={() => toggleSection('sosialEkonomi')}
        >
          <InfoRow label="Pekerjaan" value={warga.pekerjaan ?? '-'} />
          <InfoRow label="Pendidikan Terakhir" value={warga.pendidikan ?? '-'} isLast />
        </CollapsibleSection>

        {/* Collapsible Section: Kesehatan & PKK */}
        <CollapsibleSection
          title="Kesehatan & PKK"
          icon={<Heart size={18} color="#7C3AED" />}
          iconBg="#F3E8FF"
          isExpanded={expandedSections.kesehatanPkk}
          onToggle={() => toggleSection('kesehatanPkk')}
        >
          <InfoRow label="Status Kehamilan" value={warga.status_kehamilan ? 'Hamil' : 'Tidak Hamil'} />
          <InfoRow label="Status Menyusui" value={warga.status_menyusui ? 'Ya' : 'Tidak'} isLast />
        </CollapsibleSection>

        {/* Collapsible Section: Riwayat Mutasi */}
        <CollapsibleSection
          title="Riwayat Mutasi"
          icon={<Clock size={18} color="#475569" />}
          iconBg="#F1F5F9"
          isExpanded={expandedSections.riwayatMutasi}
          onToggle={() => toggleSection('riwayatMutasi')}
          headerRight={
            <TouchableOpacity onPress={() => router.push('/mutasi')}>
              <Text style={styles.linkText}>Lihat Semua</Text>
            </TouchableOpacity>
          }
        >
          {isMutasiLoading ? (
            <ActivityIndicator size="small" color="#2E7D32" />
          ) : !mutasiList || mutasiList.length === 0 ? (
            <Text style={styles.emptyTimelineText}>Belum ada riwayat mutasi.</Text>
          ) : (
            <View style={styles.timelineContainer}>
              {mutasiList.map((item, idx) => {
                // Map mutation types to human-readable names
                let eventName = 'Mutasi';
                if (item.jenis_mutasi === 'kelahiran') eventName = 'Kelahiran';
                else if (item.jenis_mutasi === 'kematian') eventName = 'Kematian';
                else if (item.jenis_mutasi === 'pindah_keluar') eventName = 'Pindah Keluar';
                else if (item.jenis_mutasi === 'pindah_masuk') eventName = 'Pindah Masuk';
                else if (item.jenis_mutasi === 'kehamilan') eventName = 'Kehamilan';

                let subText = item.keterangan || '';
                if (item.jenis_mutasi === 'pindah_keluar' && item.tujuan_daerah) {
                  subText = `Tujuan: ${item.tujuan_daerah}`;
                } else if (item.jenis_mutasi === 'pindah_masuk' && item.asal_daerah) {
                  subText = `Asal: ${item.asal_daerah}`;
                }

                return (
                  <View key={item.id} style={styles.timelineItem}>
                    {/* Circle and Line */}
                    <View style={styles.timelineGraphic}>
                      <View style={styles.timelineCircle} />
                      {idx < mutasiList.length - 1 && <View style={styles.timelineLine} />}
                    </View>
                    
                    {/* Content */}
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineDate}>{formatDate(item.tanggal_mutasi)}</Text>
                      <Text style={styles.timelineTitle}>{eventName}</Text>
                      {subText ? <Text style={styles.timelineSub}>{subText}</Text> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </CollapsibleSection>
      </ScrollView>
    </SafeAreaView>
  );
}

function CollapsibleSection({ 
  title, 
  icon, 
  iconBg, 
  isExpanded, 
  onToggle, 
  headerRight, 
  children 
}: { 
  title: string; 
  icon: React.ReactNode; 
  iconBg: string; 
  isExpanded: boolean; 
  onToggle: () => void; 
  headerRight?: React.ReactNode;
  children: React.ReactNode; 
}) {
  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity style={styles.sectionHeader} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionIconBg, { backgroundColor: iconBg }]}>
            {icon}
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionHeaderRight}>
          {headerRight && <View style={{ marginRight: 12 }}>{headerRight}</View>}
          {isExpanded ? <ChevronUp size={20} color="#64748B" /> : <ChevronDown size={20} color="#64748B" />}
        </View>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );
}

function InfoRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View style={[styles.infoRow, isLast && { borderBottomWidth: 0 }]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backIconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  moreButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  profileMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginRight: 8,
    flexShrink: 1,
  },
  statusBadge: {
    backgroundColor: '#C8E6C9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: '800',
  },
  infoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoMetaText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  cardSubBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cardSubBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconBg: {
    height: 36,
    width: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionContent: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  timelineContainer: {
    paddingLeft: 4,
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 64,
  },
  timelineGraphic: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  timelineCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2E7D32',
    backgroundColor: '#fff',
    marginTop: 6,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    top: 14,
    bottom: -10,
    width: 2,
    backgroundColor: '#A5D6A7',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineDate: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  timelineSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  emptyTimelineText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
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
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  backButtonLargeText: {
    color: '#fff',
    fontWeight: '800',
  }
});

