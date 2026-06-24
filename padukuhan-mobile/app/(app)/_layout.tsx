import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="kependudukan" options={{ headerShown: false }} />
      <Stack.Screen name="mutasi" options={{ headerShown: false }} />
      <Stack.Screen name="pengumuman" options={{ headerShown: false }} />
      <Stack.Screen name="pkk" options={{ headerShown: false }} />
      <Stack.Screen name="program" options={{ headerShown: false }} />
      <Stack.Screen name="surat" options={{ headerShown: false }} />
    </Stack>
  );
}
