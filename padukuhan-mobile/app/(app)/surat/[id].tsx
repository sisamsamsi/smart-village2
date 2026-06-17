import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSuratDetail, useUpdateSuratStatus } from '@/hooks/useSurat';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Share2,
  Printer,
  Calendar,
  User,
  Info,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Stamp,
  CreditCard
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { formatTanggal } from '@/lib/format';
import { generateSuratPDF, bagikanPDF } from '@/lib/pdf';

const { width } = Dimensions.get('window');

export default function SuratDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const suratId = Array.isArray(id) ? id[0] : id;
  const { data: item, isLoading, error, refetch } = useSuratDetail(suratId as string);
  const updateStatus = useUpdateSuratStatus();
  const { profile } = useAuthStore();

  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    if (processing || !suratId) return;
    
    Alert.alert(
      "Konfirmasi Persetujuan",
      "Apakah Anda yakin ingin menyetujui pengajuan surat ini?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya, Setujui", 
          onPress: async () => {
            setProcessing(true);
            try {
              const nomorSurat = `${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}/RT-${profile?.rt_id?.slice(0,2) || '00'}/${new Date().getFullYear()}`;
              
              await updateStatus.mutateAsync({
                id: suratId as string,
                status: 'approved',
                nomor_surat: nomorSurat,
                tanggal_surat: new Date().toISOString().split('T')[0]
              });

              Alert.alert("Berhasil", "Surat telah disetujui. Silakan cetak atau bagikan.");
              refetch();
            } catch (err: any) {
              Alert.alert("Gagal", err.message || "Gagal menyetujui surat.");
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handlePrint = async () => {
    if (!item || item.status !== 'approved') return;
    
    try {
      setProcessing(true);
      const uri = await generateSuratPDF({
        warga: item.wargas || item.warga, // Support both plural and singular relation names
        rt: {
          nomor_rt: (item.wargas || item.warga)?.rts?.nomor_rt,
          nama_lengkap: profile?.nama_lengkap
        },
        keperluan: item.keperluan || 'Keperluan administrasi',
        nomorSurat: item.nomor_surat,
        tanggalSurat: item.tanggal_surat || new Date().toISOString()
      });
      
      await bagikanPDF(uri);
    } catch (err: any) {
      Alert.alert("Gagal Cetak", err.message || "Gagal membuat file PDF.");
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) return (
    <SafeAreaView style={styles.loaderContainer}>
      <ActivityIndicator color="#67C090" size="large" />
    </SafeAreaView>
  );

  if (error || !item) return (
    <SafeAreaView style={styles.loaderContainer}>
      <XCircle color="#EF4444" size={48} style={{ marginBottom: 16 }} />
      <Text style={styles.emptyText}>{error ? "Terjadi kesalahan memuat data." : "Data tidak ditemukan."}</Text>
      <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/' as any)} style={{ marginTop: 20 }}>
        <Text style={{ color: '#67C090', fontWeight: '800' }}>Kembali</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const status = item.status?.toLowerCase() || 'pending';
  const isPending = status === 'pending';
  const isApproved = status === 'approved' || status === 'selesai';
  const wargaData = item.wargas || item.warga;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/' as any)} style={styles.backButton}>
            <ArrowLeft color="#67C090" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verifikasi Layanan</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Profile Card */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <User color="#67C090" size={32} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.wargaName}>{wargaData?.nama_lengkap || 'Warga Tidak Diketahui'}</Text>
              <View style={styles.nikBadge}>
                <CreditCard size={12} color="#64748B" />
                <Text style={styles.nikText}>NIK: {wargaData?.nik || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          {/* Status Banner */}
          <View style={[styles.statusBanner, isApproved ? styles.statusApproved : isPending ? styles.statusPending : styles.statusRejected]}>
            <View style={styles.bannerInfo}>
              <Text style={styles.bannerLabel}>STATUS PENGAJUAN</Text>
              <Text style={styles.bannerValue}>{status.toUpperCase()}</Text>
            </View>
            <View style={styles.bannerIconWrapper}>
              {isApproved ? <ShieldCheck color="#fff" size={28} /> : <Clock color="#fff" size={28} />}
            </View>
          </View>

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DETAIL SURAT</Text>
            <View style={styles.detailBox}>
              <DetailRow 
                label="Jenis Layanan" 
                value={item.jenis_surat?.replace(/_/g, ' ')} 
                icon={<FileText size={16} color="#67C090" />} 
              />
              <DetailRow 
                label="Keperluan" 
                value={item.keperluan} 
                icon={<Info size={16} color="#67C090" />} 
              />
              <DetailRow 
                label="Diajukan Pada" 
                value={formatTanggal(item.created_at)} 
                icon={<Calendar size={16} color="#67C090" />} 
                isLast={!isApproved || !item.nomor_surat}
              />
              {isApproved && item.nomor_surat && (
                <DetailRow 
                  label="Nomor Surat" 
                  value={item.nomor_surat} 
                  icon={<ShieldCheck size={16} color="#67C090" />} 
                  isLast
                />
              )}
            </View>
          </View>

          {/* Action Area */}
          <View style={styles.actionArea}>
            {isPending ? (
              (profile?.role === 'ketua_rt' || profile?.role === 'dukuh' || __DEV__) ? (
                <>
                  <TouchableOpacity 
                    style={styles.approveButton}
                    onPress={handleApprove}
                    disabled={processing}
                  >
                    {processing ? <ActivityIndicator color="#fff" /> : (
                      <>
                        <CheckCircle2 color="#fff" size={20} />
                        <Text style={styles.approveButtonText}>Approve Sekarang</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton}>
                    <Text style={styles.rejectButtonText}>Tolak Pengajuan</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.infoBoxYellow}>
                  <Info size={18} color="#D97706" style={{ marginRight: 8 }} />
                  <Text style={styles.infoTextYellow}>Menunggu persetujuan dari Ketua RT setempat.</Text>
                </View>
              )
            ) : isApproved && (
              <TouchableOpacity 
                style={styles.printButton}
                onPress={handlePrint}
                disabled={processing}
              >
                {processing ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Printer color="#fff" size={20} />
                    <Text style={styles.printButtonText}>Cetak & Bagikan PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, icon, isLast }: { label: string, value: string, icon: React.ReactNode, isLast?: boolean }) {
  return (
    <View style={[styles.detailRow, isLast && { borderBottomWidth: 0 }]}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value || '-'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 60,
  },
  backButton: {
    height: 44,
    width: 44,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  profileSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  profileCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarCircle: {
    height: 56,
    width: 56,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  wargaName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  nikBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  nikText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 24,
  },
  statusBanner: {
    borderRadius: 28,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  statusApproved: {
    backgroundColor: '#67C090',
  },
  statusPending: {
    backgroundColor: '#1E293B',
  },
  statusRejected: {
    backgroundColor: '#BE123C',
  },
  bannerInfo: {
    flex: 1,
  },
  bannerLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  bannerValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginTop: 4,
  },
  bannerIconWrapper: {
    height: 56,
    width: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  detailBox: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  rowIcon: {
    height: 36,
    width: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
    marginTop: 2,
    lineHeight: 20,
  },
  actionArea: {
    gap: 12,
  },
  approveButton: {
    height: 64,
    backgroundColor: '#67C090',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#67C090',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 10,
  },
  printButton: {
    height: 64,
    backgroundColor: '#67C090',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#67C090',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  printButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 10,
  },
  rejectButton: {
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    color: '#BE123C',
    fontSize: 15,
    fontWeight: '800',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  infoBoxYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FEF3C7',
    marginTop: 12,
  },
  infoTextYellow: {
    fontSize: 13,
    color: '#B45309',
    fontWeight: '600',
    flex: 1,
  }
});
