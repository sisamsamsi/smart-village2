import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Plus } from 'lucide-react-native';
import { QuickActionModal } from '@/components/QuickActionModal';
import { useAuthStore } from '@/stores/authStore';

export default function TabLayout() {
  const theme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [modalVisible, setModalVisible] = useState(false);
  const { profile } = useAuthStore();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[theme].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            height: 64,
            paddingBottom: 10,
            paddingTop: 10,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
          }
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Beranda',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="warga"
          options={{
            title: 'Warga',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.2.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="action"
          options={{
            title: '',
            tabBarButton: () => (
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => setModalVisible(true)}
                style={styles.fabContainer}
              >
                <View style={styles.fabButton}>
                  <Plus size={24} color="#fff" />
                </View>
              </TouchableOpacity>
            )
          }}
        />
        <Tabs.Screen
          name="aktivitas"
          options={{
            title: 'Aktivitas',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="doc.plaintext.fill" color={color} />,
            href: (__DEV__ || profile?.role !== 'kader_dasawisma') ? undefined : null,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Rangkuman',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.bar.fill" color={color} />,
          }}
        />
      </Tabs>

      <QuickActionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  fabButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#67C090',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#67C090',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  }
});
