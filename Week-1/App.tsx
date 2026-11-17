import React from 'react';
import { StyleSheet, Text, View, Pressable, StatusBar, Platform } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.card}>
        <Text style={styles.badge}>Week 1 - Setup Dasar</Text>
        <Text style={styles.title}>RoomCheck</Text>
        <Text style={styles.subtitle}>
          Aplikasi Manajemen & Inspeksi Kamar Kos Modern Berbasis React Native & Expo.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Tahap Perkembangan:</Text>
        <Text style={styles.bullet}>✓ Instalasi Node.js & npm</Text>
        <Text style={styles.bullet}>✓ Setup Project React Native dengan Expo CLI</Text>
        <Text style={styles.bullet}>✓ Konfigurasi TypeScript dan struktur aplikasi dasar</Text>
        <Text style={styles.bullet}>✓ Pengujian eksekusi di Expo Go</Text>

        <Pressable
          style={styles.button}
          onPress={() => alert('Setup Week 1 Berhasil! Siap melanjutkan ke Week 2.')}
        >
          <Text style={styles.buttonText}>Cek Status Setup</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 50,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badge: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 22,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 10,
  },
  bullet: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
