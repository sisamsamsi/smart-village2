import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutasiList } from '@/hooks/useMutasi';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft, 
  Plus, 
  Baby, 
  Skull, 
  ArrowRightLeft, 
  MapPin, 
  Calendar, 
  Clock,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const { width } = Dimensions.get('window');

export default function MutasiListScreen() {
  const router = useRouter();
  const { data: mutasi, isLoading, refetch } = useMutasiList();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#1B5E20" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>Mutasi Penduduk</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.subtitle}>Riwayat perubahan data penduduk Mandingan</Text>
      </View>

      {/* Stats/Summary Area */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>TOTAL RIWAYAT</Text>
            <Text style={styles.summaryValue}>{mutasi?.length || 0}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/mutasi/tambah')}
            style={styles.addButton}
          >
            <Plus color="white" size={24} />
            <Text style={styles.addButtonText}>Tambah</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List Section */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#1B5E20" />}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#1B5E20" size="large" />
          </View>
        ) : mutasi?.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <ArrowRightLeft size={48} color="#E2E8F0" />
            </View>
            <Text style={styles.emptyText}>Belum Ada Mutasi</Text>
            <Text style={styles.emptySubtext}>
              Data mutasi (kelahiran, kematian, pindah) akan muncul di sini.
            </Text>
          </View>
        ) : (
          <View style={{ paddingBottom: 40 }}>
            {mutasi?.map((item) => (
              <MutasiCard key={item.id} item={item} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MutasiCard({ item }: { item: any }) {
  const getIcon = () => {
    switch(item.jenis_mutasi) {
      case 'kelahiran': return <Baby size={20} color="#059669" />;
      case 'kematian': return <Skull size={20} color="#DC2626" />;
      case 'pindah_keluar': return <ArrowRightLeft size={20} color="#D97706" />;
      case 'pindah_masuk': return <ArrowRightLeft size={20} color="#2563EB" />;
      default: return <ArrowRightLeft size={20} color="#64748B" />;
    }
  }

  const getLabel = () => {
    switch(item.jenis_mutasi) {
      case 'kelahiran': return 'Kelahiran';
      case 'kematian': return 'Kematian';
      case 'pindah_keluar': return 'Pindah Keluar';
      case 'pindah_masuk': return 'Pindah Masuk';
      default: return item.jenis_mutasi;
    }
  }

  const getBgColor = () => {
    switch(item.jenis_mutasi) {
      case 'kelahiran': return 'rgba(16, 185, 129, 0.05)';
      case 'kematian': return 'rgba(239, 68, 68, 0.05)';
      case 'pindah_keluar': return 'rgba(245, 158, 11, 0.05)';
      case 'pindah_masuk': return 'rgba(59, 130, 246, 0.05)';
      default: return 'rgba(100, 116, 139, 0.05)';
    }
  }

  const getTargetName = () => {
    if (item.jenis_mutasi === 'kelahiran') return item.nama_bayi;
    return item.wargas?.nama_lengkap;
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrapper, { backgroundColor: getBgColor() }]}>
          {getIcon()}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>{getLabel()}</Text>
          <Text style={styles.cardTitle}>{getTargetName()}</Text>
        </View>
        <View style={styles.rtBadge}>
          <Text style={styles.rtText}>RT {item.wargas?.rts?.nomor_rt || '?'}</Text>
        </View>
      </View>

      <View style={styles.divider} />
      
      <View style={styles.cardFooter}>
        <View style={styles.dateInfo}>
          <Calendar size={14} color="#94A3B8" />
          <Text style={styles.dateText}>
            {format(new Date(item.tanggal_mutasi), 'dd MMMM yyyy', { locale: id })}
          </Text>
        </View>
        {item.keterangan && (
          <Text style={styles.noteText} numberOfLines={1}>{`"${item.keterangan}"`}</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
  },
  summarySection: {
    paddingHorizontal: 24,
    marginTop: -10,
    zIndex: 10,
  },
  summaryCard: {
    backgroundColor: '#1B5E20',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '800',
    marginLeft: 8,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: 24,
    paddingTop: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    height: 48,
    width: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  rtBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rtText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
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
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#475569',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  }
});
