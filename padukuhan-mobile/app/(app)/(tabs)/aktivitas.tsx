import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSuratList } from '@/hooks/useSurat';
import { useAuthStore } from '@/stores/authStore';
import { FileText, Clock, CheckCircle2, XCircle, ArrowRight, ShieldAlert } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function AktivitasScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const role = profile?.role;
  const isKader = role === 'kader_dasawisma';

  const { data: suratList, isLoading, error, refetch } = useSuratList();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#FFF3E0', text: '#E65100', label: 'Menunggu' };
      case 'diproses':
        return { bg: '#E3F2FD', text: '#1565C0', label: 'Diproses' };
      case 'selesai':
        return { bg: '#DDF4E7', text: '#67C090', label: 'Selesai' };
      case 'ditolak':
        return { bg: '#FFEBEE', text: '#C62828', label: 'Ditolak' };
      default:
        return { bg: '#F1F5F9', text: '#475569', label: status };
    }
  };

  const getStatusIcon = (status: string, size = 16) => {
    switch (status) {
      case 'pending':
        return <Clock size={size} color="#E65100" />;
      case 'selesai':
        return <CheckCircle2 size={size} color="#67C090" />;
      case 'ditolak':
        return <XCircle size={size} color="#C62828" />;
      default:
        return <Clock size={size} color="#1565C0" />;
    }
  };

  if (isKader) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Text style={styles.title}>Aktivitas RT</Text>
          <Text style={styles.subtitle}>Persetujuan Surat & Administrasi</Text>
        </View>
        <View style={styles.emptyState}>
          <ShieldAlert size={48} color="#94A3B8" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>Akses Terbatas</Text>
          <Text style={styles.emptyText}>
            Fitur persetujuan surat dan administrasi RT hanya tersedia untuk akun Ketua RT dan Dukuh.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Aktivitas RT</Text>
        <Text style={styles.subtitle}>Antrean Persetujuan Surat Pengantar</Text>
      </View>

      {/* Main Content */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color="#67C090" size="large" />
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <XCircle size={48} color="#EF4444" />
          <Text style={styles.emptyTitle}>Gagal memuat data</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : !suratList || suratList.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={48} color="#94A3B8" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>Tidak ada pengajuan</Text>
          <Text style={styles.emptyText}>Belum ada berkas pengajuan surat masuk di wilayah RT Anda.</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {suratList.map((item: any) => {
            const statusConfig = getStatusStyle(item.status);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => router.push(`/surat/${item.id}` as any)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.typeBadge}>
                    <FileText size={16} color="#67C090" style={{ marginRight: 6 }} />
                    <Text style={styles.typeText}>
                      {item.jenis_surat === 'pengantar_rt' ? 'Pengantar RT' : 'Keterangan Domisili'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    {getStatusIcon(item.status, 12)}
                    <Text style={[styles.statusText, { color: statusConfig.text }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.wargaName}>{item.wargas?.nama_lengkap || 'Warga Umum'}</Text>
                  <Text style={styles.wargaNik}>NIK: {item.wargas?.nik || '—'}</Text>
                  <Text style={styles.keperluanText} numberOfLines={2}>
                    {`Keperluan: "${item.keperluan}"`}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                  <View style={styles.actionLink}>
                    <Text style={styles.actionLinkText}>Lihat Detail</Text>
                    <ArrowRight size={14} color="#26667F" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDF4E7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#67C090',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    marginBottom: 16,
  },
  wargaName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  wargaNik: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  keperluanText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#26667F',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#67C090',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
