import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Share, StyleSheet, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnnouncementDetail } from '@/hooks/useAnnouncements';
import { 
  ArrowLeft, 
  Share2, 
  Calendar, 
  User, 
  Target,
  Megaphone,
  Globe,
  ChevronRight,
  Clock,
  ShieldCheck
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { formatTanggal } from '@/lib/format';

const { width } = Dimensions.get('window');

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: item, isLoading } = useAnnouncementDetail(id as string);

  const handleShare = async () => {
    if (!item) return;
    try {
      await Share.share({
        message: `${item.judul}\n\n${item.isi}\n\nInformasi dari Padukuhan Mandingan`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) return (
    <SafeAreaView style={styles.loaderContainer}>
      <ActivityIndicator color="#1B5E20" size="large" />
    </SafeAreaView>
  );

  if (!item) return (
    <SafeAreaView style={styles.loaderContainer}>
      <Text style={styles.emptyText}>Pengumuman tidak ditemukan.</Text>
    </SafeAreaView>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} bounces={false} showsVerticalScrollIndicator={false}>
        {/* Dynamic Header / Hero */}
        <View style={styles.heroSection}>
          {item.foto_url ? (
            <Image source={{ uri: item.foto_url }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderHero}>
              <Megaphone size={60} color="#1B5E20" />
            </View>
          )}
          
          <View style={styles.heroOverlay} />
          
          {/* Top Actions */}
          <SafeAreaView style={styles.topActions} edges={['top']}>
            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.actionButton}>
                <ArrowLeft color="#fff" size={24} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                <Share2 color="#fff" size={24} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Content Section */}
        <View style={styles.contentCard}>
          {/* Metadata */}
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {item.rt_pembuat ? `RT ${item.rts?.nomor_rt}` : 'PUSAT'}
              </Text>
            </View>
            <View style={styles.dateInfo}>
              <Calendar size={14} color="#94A3B8" />
              <Text style={styles.dateText}>{formatTanggal(item.created_at)}</Text>
            </View>
          </View>

          <Text style={styles.title}>{item.judul}</Text>

          {/* Quick Info Bar */}
          <View style={styles.infoBar}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconWrapper}>
                <User size={16} color="#1B5E20" />
              </View>
              <View>
                <Text style={styles.infoLabel}>PENERBIT</Text>
                <Text style={styles.infoValue}>{item.rt_pembuat ? 'Ketua RT' : 'Dukuh'}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <View style={styles.infoIconWrapper}>
                <Globe size={16} color="#1B5E20" />
              </View>
              <View>
                <Text style={styles.infoLabel}>VISIBILITAS</Text>
                <Text style={styles.infoValue}>{item.target === 'semua' ? 'PUBLIK' : 'INTERNAL'}</Text>
              </View>
            </View>
          </View>

          {/* Body Text */}
          <View style={styles.bodyWrapper}>
            <Text style={styles.bodyText}>{item.isi}</Text>
          </View>
        </View>
      </ScrollView>
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
  heroSection: {
    height: 380,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderHero: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  topActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  actionButton: {
    height: 48,
    width: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      }
    })
  },
  contentCard: {
    flex: 1,
    marginTop: -40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 60,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryBadge: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    marginLeft: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 34,
    marginBottom: 30,
  },
  infoBar: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 32,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconWrapper: {
    height: 36,
    width: 36,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  infoDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  bodyWrapper: {
    paddingBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 28,
    fontWeight: '500',
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
  }
});
