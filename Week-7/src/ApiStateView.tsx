import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ApiErrorInfo } from './apiError';
import { C } from './shared';

type Props = {
  type: 'loading' | 'error' | 'empty';
  errorInfo?: ApiErrorInfo | null;
  isRetrying?: boolean;
  onRetry?: () => void;
};

export default function ApiStateView({
  type,
  errorInfo,
  isRetrying = false,
  onRetry,
}: Props) {
  if (type === 'loading') {
    return (
      <View style={styles.centerContainer} accessibilityLiveRegion="polite">
        <ActivityIndicator size="large" color={C.primary} style={styles.spinner} />
        <Text style={styles.title}>
          {isRetrying ? 'Mencoba lagi...' : 'Memuat data...'}
        </Text>
        <Text style={styles.subtitle}>
          {isRetrying ? 'Menghubungkan ke server...' : 'Mohon tunggu sebentar'}
        </Text>
      </View>
    );
  }

  if (type === 'empty') {
    return (
      <View style={styles.centerContainer}>
        {/* Empty state illustration */}
        <View style={[styles.iconCircle, { backgroundColor: '#F1F5F9' }]}>
          <Text style={styles.iconEmoji}>📋</Text>
        </View>
        <Text style={styles.title}>Belum ada data</Text>
        <Text style={styles.subtitle}>
          Belum ada data kamar yang tersedia saat ini.
        </Text>
        {onRetry && (
          <Pressable
            onPress={onRetry}
            style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="Muat Ulang"
          >
            <Text style={styles.btnPrimaryText}>Muat Ulang</Text>
          </Pressable>
        )}
      </View>
    );
  }

  // Error State (covers Offline, Timeout, 4xx, 5xx, General)
  const kind = errorInfo?.kind ?? 'unknown';
  const title = errorInfo?.title || 'Gagal memuat data';
  const message =
    errorInfo?.message || 'Terjadi kesalahan pada server. Silakan coba lagi.';

  // Determine icon & background based on error kind
  let iconContent = '!';
  let circleBg = '#FEE2E2';
  let circleBorder = '#FCA5A5';
  let iconColor = '#DC2626';

  if (kind === 'offline') {
    iconContent = '📡';
    circleBg = '#FEE2E2';
    circleBorder = '#FECACA';
  } else if (kind === 'timeout') {
    iconContent = '⏱️';
    circleBg = '#FEF3C7';
    circleBorder = '#FDE68A';
    iconColor = '#D97706';
  } else if (kind === 'client') {
    iconContent = '⚠️';
    circleBg = '#FEE2E2';
    circleBorder = '#FCA5A5';
  }

  return (
    <View style={styles.centerContainer}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: circleBg, borderColor: circleBorder },
        ]}
      >
        {kind === 'server' || kind === 'unknown' ? (
          <Text style={[styles.exclamationText, { color: iconColor }]}>!</Text>
        ) : (
          <Text style={styles.iconEmoji}>{iconContent}</Text>
        )}
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{message}</Text>

      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.btnRetry, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="Coba Lagi"
        >
          <Text style={styles.btnRetryText}>🔄  Coba Lagi</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  spinner: {
    marginBottom: 16,
    transform: [{ scale: 1.2 }],
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  exclamationText: {
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 48,
  },
  iconEmoji: {
    fontSize: 38,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 320,
  },
  btnRetry: {
    backgroundColor: '#DC2626', // Warna merah sesuai contoh slide PPT/PDF Sprint 05
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnRetryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  btnPrimary: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
