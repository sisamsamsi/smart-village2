import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { 
  ArrowLeft, 
  Plus, 
  Megaphone, 
  Calendar, 
  ArrowRight,
  Bell,
  Share2,
  ChevronRight
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { formatTanggal } from '@/lib/format';

const { width } = Dimensions.get('window');

export default function AnnouncementListScreen() {
  const router = useRouter();
  const { data: announcements, isLoading, refetch } = useAnnouncements({ activeOnly: true });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#1B5E20" size={20} />
          </TouchableOpacity>
          <Text style={styles.title}>Pengumuman</Text>
          <TouchableOpacity style={styles.bellButton}>
            <Bell color="#1B5E20" size={20} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Informasi dan berita terbaru untuk warga</Text>
      </View>

      {/* Summary Area */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>BERITA AKTIF</Text>
            <Text style={styles.summaryValue}>{announcements?.length || 0}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/pengumuman/tambah')}
            style={styles.addButton}
          >
            <Plus color="white" size={24} />
            <Text style={styles.addButtonText}>Tulis</Text>
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
        ) : announcements?.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Megaphone size={48} color="#E2E8F0" />
            </View>
            <Text style={styles.emptyText}>Belum Ada Pengumuman</Text>
            <Text style={styles.emptySubtext}>
              Informasi dan berita untuk warga akan muncul di sini.
            </Text>
          </View>
        ) : (
          <View style={{ paddingBottom: 40 }}>
            {announcements?.map((item) => (
              <AnnouncementCard 
                key={item.id} 
                item={item} 
                onPress={() => router.push(`/pengumuman/${item.id}`)} 
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AnnouncementCard({ item, onPress }: { item: any, onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {item.foto_url && (
        <Image 
          source={{ uri: item.foto_url }} 
          style={styles.cardImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={styles.authorBadge}>
            <Text style={styles.authorText}>
              {item.rt_pembuat ? `RT ${item.rts?.nomor_rt}` : 'DUKUH'}
            </Text>
          </View>
          <View style={styles.dateInfo}>
            <Calendar size={12} color="#94A3B8" />
            <Text style={styles.dateText}>{formatTanggal(item.created_at)}</Text>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>{item.judul}</Text>
        <Text style={styles.cardSnippet} numberOfLines={2}>{item.isi}</Text>

        <View style={styles.divider} />
        
        <View style={styles.cardFooter}>
          <View style={styles.readMore}>
            <Text style={styles.readMoreText}>BACA SELENGKAPNYA</Text>
            <ArrowRight size={14} color="#1B5E20" style={{ marginLeft: 4 }} />
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Share2 size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
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
  bellButton: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(27, 94, 32, 0.05)',
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
    borderRadius: 32,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardBody: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  authorText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#475569',
    letterSpacing: 0.5,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 4,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 8,
  },
  cardSnippet: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1B5E20',
    letterSpacing: 1,
  },
  shareButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
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
