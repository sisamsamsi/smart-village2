import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, AppState, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { RefreshCw, Sparkles, Download, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

/**
 * OTA Update Manager Component
 * 
 * Handles:
 * 1. Auto-check for updates on app launch & app foreground
 * 2. Auto-download updates in background
 * 3. Shows a banner when update is ready to apply
 * 4. User taps "Muat Ulang" to restart with new version
 */
export function UpdateBanner() {
  const { isUpdateAvailable, isUpdatePending, isDownloading } = Updates.useUpdates();
  const [dismissed, setDismissed] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(false);

  // Auto-check for updates on mount
  useEffect(() => {
    if (__DEV__) return; // Skip in development mode

    const checkUpdate = async () => {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) {
          // Auto-download the update
          setDownloadProgress(true);
          await Updates.fetchUpdateAsync();
          setDownloadProgress(false);
        }
      } catch (e) {
        // Silently fail — network issues, etc.
        setDownloadProgress(false);
      }
    };

    // Check on initial load (with slight delay to not block startup)
    const timer = setTimeout(checkUpdate, 3000);

    // Also check when app comes back to foreground
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkUpdate();
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  // Auto-download when useUpdates detects availability
  useEffect(() => {
    if (__DEV__) return;
    
    if (isUpdateAvailable && !isDownloading && !isUpdatePending) {
      (async () => {
        try {
          setDownloadProgress(true);
          await Updates.fetchUpdateAsync();
          setDownloadProgress(false);
        } catch (e) {
          setDownloadProgress(false);
        }
      })();
    }
  }, [isUpdateAvailable, isDownloading, isUpdatePending]);

  // Show download progress banner
  if (downloadProgress || isDownloading) {
    return (
      <View style={styles.container}>
        <View style={[styles.card, styles.downloadCard]}>
          <View style={styles.iconContainer}>
            <Download size={18} color="#124170" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Mengunduh pembaruan...</Text>
            <Text style={styles.subtitle}>Tunggu sebentar, update sedang diunduh</Text>
          </View>
        </View>
      </View>
    );
  }

  // Show "ready to reload" banner
  if (isUpdatePending && !dismissed) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Sparkles size={20} color="#124170" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Pembaruan Tersedia!</Text>
            <Text style={styles.subtitle}>Versi terbaru siap diterapkan</Text>
          </View>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => setDismissed(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={14} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              try {
                await Updates.reloadAsync();
              } catch (error) {
                // Silently fail
              }
            }}
            activeOpacity={0.8}
          >
            <RefreshCw size={14} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>Muat Ulang</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    shadowColor: '#124170',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    width: width - 32,
  },
  downloadCard: {
    borderColor: '#93C5FD',
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A202C',
  },
  subtitle: {
    fontSize: 11,
    color: '#718096',
    marginTop: 1,
  },
  dismissButton: {
    padding: 4,
    marginRight: 6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#124170',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
});
