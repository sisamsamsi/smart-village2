import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'expo-router';
import { UserPlus, FileText, ArrowRightLeft, ClipboardList, X, Construction, Users } from 'lucide-react-native';

interface QuickActionModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

export function QuickActionModal({ visible, onClose }: QuickActionModalProps) {
  const router = useRouter();
  const { profile } = useAuthStore();
  const role = profile?.role;

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path as any);
  };

  const renderActions = () => {
    if (role === 'kader_dasawisma') {
      return (
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => handleNavigate('/warga')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#E3F2FD' }]}>
              <Users size={28} color="#1565C0" />
            </View>
            <Text style={styles.actionTitle}>Update Data Warga</Text>
            <Text style={styles.actionDesc}>Mutakhirkan profil warga binaan dasawisma</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => handleNavigate('/pkk')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#DDF4E7' }]}>
              <ClipboardList size={28} color="#67C090" />
            </View>
            <Text style={styles.actionTitle}>Input Partisipasi PKK</Text>
            <Text style={styles.actionDesc}>Mencatat program PKK tahunan warga binaan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => handleNavigate('/mutasi/tambah')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#F3E5F5' }]}>
              <ArrowRightLeft size={28} color="#6A1B9A" />
            </View>
            <Text style={styles.actionTitle}>Catat Mutasi Cepat</Text>
            <Text style={styles.actionDesc}>Laporkan status kehamilan, kelahiran, atau kematian warga</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (role === 'dukuh') {
      return (
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => handleNavigate('/kependudukan/tambah')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#DDF4E7' }]}>
              <UserPlus size={28} color="#67C090" />
            </View>
            <Text style={styles.actionTitle}>Tambah Warga</Text>
            <Text style={styles.actionDesc}>Input data warga baru se-padukuhan Mandingan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => handleNavigate('/mutasi/tambah')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#F3E5F5' }]}>
              <ArrowRightLeft size={28} color="#6A1B9A" />
            </View>
            <Text style={styles.actionTitle}>Catat Mutasi</Text>
            <Text style={styles.actionDesc}>Catat warga lahir, wafat, pindah, atau datang se-padukuhan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => handleNavigate('/program/baru')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#FFF3E0' }]}>
              <Construction size={28} color="#E65100" />
            </View>
            <Text style={styles.actionTitle}>Buat Program Kerja</Text>
            <Text style={styles.actionDesc}>Buat program kerja pembangunan baru tingkat padukuhan</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Default: Ketua RT
    return (
      <View style={styles.actionGrid}>
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => handleNavigate('/kependudukan/tambah')}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#DDF4E7' }]}>
            <UserPlus size={28} color="#67C090" />
          </View>
          <Text style={styles.actionTitle}>Tambah Warga RT</Text>
          <Text style={styles.actionDesc}>Input data warga baru khusus di wilayah RT Anda</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => handleNavigate('/surat/tambah')}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#FFF3E0' }]}>
            <FileText size={28} color="#E65100" />
          </View>
          <Text style={styles.actionTitle}>Buat Surat RT</Text>
          <Text style={styles.actionDesc}>Buat surat pengantar RT atau keterangan domisili warga</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => handleNavigate('/mutasi/tambah')}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#F3E5F5' }]}>
            <ArrowRightLeft size={28} color="#6A1B9A" />
          </View>
          <Text style={styles.actionTitle}>Catat Mutasi RT</Text>
          <Text style={styles.actionDesc}>Catat kelahiran, kematian, atau perpindahan warga di RT Anda</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.contentContainer} onStartShouldSetResponder={() => true}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Aksi Cepat</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Action List */}
          <View style={styles.actionsWrapper}>
            {renderActions()}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 20,
    maxHeight: height * 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  closeButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 99,
    padding: 6,
  },
  actionsWrapper: {
    marginTop: 8,
  },
  actionGrid: {
    gap: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
    flexWrap: 'wrap',
  },
});
