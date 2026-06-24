import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKematianList } from '@/hooks/useKematian';
import { useYearStore } from '@/stores/yearStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  ArrowLeft, 
  Plus, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function KematianListScreen() {
  const router = useRouter();
  const { activeYear, setActiveYear } = useYearStore();
  const { isKader } = useAuthStore();
  const { data: kematian, isLoading, refetch } = useKematianList(activeYear);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#1E293B" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>Kematian Warga</Text>
          {!isKader() ? (
            <TouchableOpacity 
              onPress={() => router.push('/kematian/tambah' as any)}
              style={styles.addButton}
            >
              <Plus color="#fff" size={16} />
              <Text style={styles.addButtonText}>Tambah</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
        <Text style={styles.subtitle}>Pencatatan pelaporan kematian warga padukuhan</Text>
      </View>

      {/* Year Switcher */}
      <View style={styles.yearSwitcher}>
        <TouchableOpacity 
          style={styles.yearChangeBtn}
          onPress={() => setActiveYear(activeYear - 1)}
        >
          <ChevronLeft size={18} color="#475569" />
        </TouchableOpacity>
        <View style={styles.yearDisplay}>
          <Calendar size={14} color="#67C090" style={{ marginRight: 6 }} />
          <Text style={styles.yearText}>Tahun Aktif: {activeYear}</Text>
        </View>
        <TouchableOpacity 
          style={styles.yearChangeBtn}
          onPress={() => setActiveYear(activeYear + 1)}
        >
          <ChevronRight size={18} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* List Section */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#67C090" />}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#67C090" size="large" />
          </View>
        ) : !kematian || kematian.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Info size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyText}>Belum Ada Data Kematian</Text>
            <Text style={styles.emptySubtext}>
              Data kematian warga tahun {activeYear} akan muncul di sini.
            </Text>
          </View>
        ) : (
          <View style={{ paddingBottom: 24 }}>
            {kematian.map((item) => (
              <View key={item.id} style={styles.listItemRow}>
                <View style={styles.iconWrapper}>
                  <Info size={16} color="#64748B" />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{item.wargas?.nama_lengkap || 'Warga'}</Text>
                  <View style={styles.itemMetaRow}>
                    <Text style={styles.itemDate}>
                      Wafat: {format(new Date(item.tanggal_mutasi), 'dd MMM yyyy', { locale: localeId })}
                    </Text>
                    <Text style={styles.dividerDot}>•</Text>
                    <Text style={styles.itemRt}>RT {item.wargas?.rts?.nomor_rt || '?'}</Text>
                  </View>
                  {item.sebab_meninggal && (
                    <Text style={styles.itemSebab}>Sebab: {item.sebab_meninggal}</Text>
                  )}
                  {item.keterangan ? (
                    <Text style={styles.itemNote}>"{item.keterangan}"</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
    backgroundColor: '#F1F5F9',
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
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#64748B',
  },
  dividerDot: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 6,
  },
  itemRt: {
    fontSize: 12,
    color: '#64748B',
  },
  itemSebab: {
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
