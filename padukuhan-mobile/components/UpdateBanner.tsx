import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import * as Updates from 'expo-updates';
import { RefreshCw, Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export function UpdateBanner() {
  const { isUpdatePending } = Updates.useUpdates();

  // Jika tidak ada update yang siap diterapkan (pending), jangan tampilkan banner
  if (!isUpdatePending) {
    return null;
  }

  const handleReload = async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Gagal memuat ulang aplikasi setelah update:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Sparkles size={20} color="#67C090" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Pembaruan Tersedia!</Text>
          <Text style={styles.subtitle}>Versi terbaru telah selesai diunduh.</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleReload} activeOpacity={0.8}>
          <RefreshCw size={14} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.buttonText}>Muat Ulang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // Tepat di atas Bottom Tab Bar (tinggi tab bar ~64px + margin)
    left: 16,
    right: 16,
    zIndex: 9999, // Pastikan tampil paling atas
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#67C090', // Soft green border
    shadowColor: '#67C090',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    width: width - 32,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DDF4E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A202C',
  },
  subtitle: {
    fontSize: 11,
    color: '#718096',
    marginTop: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#67C090', // Premium green
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
});
