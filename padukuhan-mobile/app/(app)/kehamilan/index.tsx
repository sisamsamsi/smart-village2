import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActiveKehamilanList, useKehamilanList, useGugurKehamilan } from '@/hooks/useKehamilan';
import { useYearStore } from '@/stores/yearStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft, 
  Plus, 
  Heart, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function KehamilanListScreen() {
  const router = useRouter();
  const { activeYear, setActiveYear } = useYearStore();
  const { isKader } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'aktif' | 'riwayat'>('aktif');
  
  const { data: activeList, isLoading: isActiveLoading, refetch: refetchActive } = useActiveKehamilanList();
  const { data: historyList, isLoading: isHistoryLoading, refetch: refetchHistory } = useKehamilanList(activeYear);
  const gugurKehamilan = useGugurKehamilan();

  const handleRefetch = () => {
    if (activeTab === 'aktif') refetchActive();
    else refetchHistory();
  };

  const handleGugurKandungan = (warga: any) => {
    Alert.alert(
      'Gugur Kandungan',
      `Apakah Anda yakin ingin mencatat peristiwa gugur kandungan untuk ibu ${warga.nama_lengkap}? Tindakan ini akan menonaktifkan status kehamilan aktif.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Catat Peristiwa',
          style: 'destructive',
          onPress: async () => {
            try {
              await gugurKehamilan.mutateAsync({
                warga_id: warga.id,
                tanggal_mutasi: new Date().toISOString().split('T')[0],
                keterangan: 'Gugur Kandungan'
              });
              Alert.alert('Sukses', 'Peristiwa gugur kandungan berhasil dicatat.');
            } catch (err: any) {
              Alert.alert('Gagal', err.message || 'Gagal menyimpan data.');
            }
          }
        }
      ]
    );
  };

  const getUsiaKehamilan = (hphtStr?: string) => {
    if (!hphtStr) return '-';
    const hpht = new Date(hphtStr);
    const diffMs = new Date().getTime() - hpht.getTime();
    const diffHari = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHari < 0) return 'Belum dimulai';
    return `${Math.floor(diffHari / 7)} minggu ${diffHari % 7} hari`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#1E293B" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>Data Kehamilan</Text>
          <TouchableOpacity 
            onPress={() => router.push('/kehamilan/tambah' as any)}
            style={styles.addButton}
          >
            <Plus color="#fff" size={16} />
            <Text style={styles.addButtonText}>Tambah</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Pemantauan data ibu hamil dan kehamilan padukuhan</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'aktif' && styles.tabBtnActive]}
          onPress={() => setActiveTab('aktif')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'aktif' && styles.tabBtnTextActive]}>Ibu Hamil Aktif</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'riwayat' && styles.tabBtnActive]}
          onPress={() => setActiveTab('aktif' === activeTab ? 'riwayat' : 'aktif')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'riwayat' && styles.tabBtnTextActive]}>Riwayat Laporan</Text>
        </TouchableOpacity>
      </View>

      {/* Year Switcher (Only visible for Riwayat tab) */}
      {activeTab === 'riwayat' && (
        <View style={styles.yearSwitcher}>
          <TouchableOpacity 
            style={styles.yearChangeBtn}
            onPress={() => setActiveYear(activeYear - 1)}
          >
            <ChevronLeft size={18} color="#475569" />
          </TouchableOpacity>
          <View style={styles.yearDisplay}>
            <Calendar size={14} color="#67C090" style={{ marginRight: 6 }} />
            <Text style={styles.yearText}>Tahun Laporan: {activeYear}</Text>
          </View>
          <TouchableOpacity 
            style={styles.yearChangeBtn}
            onPress={() => setActiveYear(activeYear + 1)}
          >
            <ChevronRight size={18} color="#475569" />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefetch} tintColor="#67C090" />}
      >
        {activeTab === 'aktif' ? (
          isActiveLoading ? (
            <ActivityIndicator color="#67C090" size="large" style={{ marginTop: 24 }} />
          ) : !activeList || activeList.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                <Heart size={36} color="#94A3B8" />
              </View>
              <Text style={styles.emptyText}>Tidak Ada Ibu Hamil Aktif</Text>
              <Text style={styles.emptySubtext}>Saat ini tidak ada warga dengan status kehamilan aktif.</Text>
            </View>
          ) : (
            <View style={{ paddingBottom: 24 }}>
              {activeList.map((warga: any) => (
                <View key={warga.id} style={styles.listItemRow}>
                  <View style={styles.iconWrapper}>
                    <Heart size={16} color="#D53F8C" />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{warga.nama_lengkap}</Text>
                    <Text style={styles.itemMeta}>NIK: {warga.nik || '-'} • RT {warga.rts?.nomor_rt || '-'}</Text>
                    
                    {/* Alamat */}
                    {warga.rumah_tanggas?.alamat_detail && (
                      <Text style={styles.itemAddress}>{warga.rumah_tanggas.alamat_detail}</Text>
                    )}

                    {/* Action buttons */}
                    <View style={styles.rowActions}>
                      <TouchableOpacity 
                        style={styles.gugurBtn} 
                        onPress={() => handleGugurKandungan(warga)}
                      >
                        <ShieldAlert size={14} color="#EF4444" style={{ marginRight: 4 }} />
                        <Text style={styles.gugurBtnText}>Gugur Kandungan</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )
        ) : (
          isHistoryLoading ? (
            <ActivityIndicator color="#67C090" size="large" style={{ marginTop: 24 }} />
          ) : !historyList || historyList.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                <Calendar size={36} color="#94A3B8" />
              </View>
              <Text style={styles.emptyText}>Tidak Ada Riwayat Laporan</Text>
              <Text style={styles.emptySubtext}>Belum ada riwayat laporan kehamilan untuk tahun {activeYear}.</Text>
            </View>
          ) : (
            <View style={{ paddingBottom: 24 }}>
              {historyList.map((item: any) => (
                <View key={item.id} style={styles.listItemRow}>
                  <View style={[styles.iconWrapper, { backgroundColor: item.status_kehamilan === 'melahirkan' ? '#DDF4E7' : item.status_kehamilan === 'gugur' ? '#FEE2E2' : '#FCE7F3' }]}>
                    <Heart size={16} color={item.status_kehamilan === 'melahirkan' ? '#67C090' : item.status_kehamilan === 'gugur' ? '#EF4444' : '#D53F8C'} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{item.wargas?.nama_lengkap || 'Warga'}</Text>
                    <View style={styles.itemMetaRow}>
                      <Text style={[styles.statusBadgeText, { color: statusColors(item.status_kehamilan) }]}>
                        {item.status_kehamilan === 'hamil' ? 'Mulai Hamil' : item.status_kehamilan === 'melahirkan' ? 'Melahirkan' : item.status_kehamilan === 'gugur' ? 'Keguguran' : item.status_kehamilan}
                      </Text>
                      <Text style={styles.dividerDot}>•</Text>
                      <Text style={styles.itemDate}>
                        {format(new Date(item.tanggal_mutasi), 'dd MMM yyyy', { locale: localeId })}
                      </Text>
                    </View>
                    
                    {item.hpht && (
                      <Text style={styles.itemDetails}>HPHT: {format(new Date(item.hpht), 'dd MMM yyyy', { locale: localeId })} {item.status_kehamilan === 'hamil' && `(Usia: ${getUsiaKehamilan(item.hpht)})`}</Text>
                    )}
                    {item.hpl && item.status_kehamilan === 'hamil' && (
                      <Text style={styles.itemDetails}>Estimasi Lahir (HPL): {format(new Date(item.hpl), 'dd MMM yyyy', { locale: localeId })}</Text>
                    )}
                    {item.keterangan && !item.keterangan.startsWith('{') && (
                      <Text style={styles.itemNote}>"{item.keterangan}"</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Dynamic styling utility for badges
const statusColors = (status: string) => {
  if (status === 'melahirkan') return '#15803D';
  if (status === 'gugur') return '#B91C1C';
  return '#BE185D';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    height: 36,
    width: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  addButton: {
    backgroundColor: '#67C090',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  tabBtn: {
    flex: 1,
    height: 34,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtnActive: {
    backgroundColor: '#124170',
    borderColor: '#124170',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  yearSwitcher: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  yearChangeBtn: {
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  yearDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listItemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconWrapper: {
    height: 36,
    width: 36,
    borderRadius: 10,
    backgroundColor: '#FFF5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  itemAddress: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  rowActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  gugurBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  gugurBtnText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dividerDot: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 6,
  },
  itemDate: {
    fontSize: 12,
    color: '#64748B',
  },
  itemDetails: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  itemNote: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 4,
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconWrapper: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 24,
  }
});
