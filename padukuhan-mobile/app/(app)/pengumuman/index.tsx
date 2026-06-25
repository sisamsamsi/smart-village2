import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { ArrowLeft, Plus, Megaphone, Calendar, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { formatTanggal } from '@/lib/format';

export default function AnnouncementListScreen() {
  const router = useRouter();
  const { data: announcements, isLoading, refetch } = useAnnouncements({ activeOnly: true });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Pengumuman</Text>
          <Text style={styles.headerSub}>{announcements?.length ?? 0} informasi aktif</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/pengumuman/tambah' as any)} style={styles.addBtn}>
          <Plus size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#124170" />}
      >
        {isLoading ? (
          <ActivityIndicator color="#124170" style={{ marginTop: 48 }} />
        ) : announcements?.length === 0 ? (
          <View style={styles.empty}>
            <Megaphone size={36} color="#E2E8F0" />
            <Text style={styles.emptyTitle}>Belum Ada Pengumuman</Text>
            <Text style={styles.emptySub}>Informasi dan berita untuk warga akan muncul di sini.</Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {announcements?.map((item: any, idx: number) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.row, idx === (announcements?.length ?? 0) - 1 && { borderBottomWidth: 0 }]}
                onPress={() => router.push(`/pengumuman/${item.id}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.rowIconBox}>
                  <Megaphone size={16} color="#124170" />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{item.judul}</Text>
                  <Text style={styles.rowSnippet} numberOfLines={1}>{item.isi}</Text>
                  <View style={styles.rowMeta}>
                    <Calendar size={11} color="#94A3B8" />
                    <Text style={styles.rowDate}>{formatTanggal(item.created_at)}</Text>
                    {item.lokasi && (
                      <>
                        <View style={styles.dot} />
                        <Text style={styles.rowDate} numberOfLines={1}>{item.lokasi}</Text>
                      </>
                    )}
                  </View>
                </View>
                <ChevronRight size={16} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, marginHorizontal: 12 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  headerSub: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  addBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#124170', alignItems: 'center', justifyContent: 'center',
  },

  list: { flex: 1 },
  listCard: {
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  rowIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EFF6FF', alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
  rowSnippet: { fontSize: 12, color: '#64748B', marginBottom: 4, lineHeight: 16 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowDate: { fontSize: 11, color: '#94A3B8' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CBD5E1' },

  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#475569', marginTop: 12 },
  emptySub: { fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center', lineHeight: 18 },
});
