import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ApiErrorInfo } from './apiError';
import { Btn, C, Inspection, Room, RoomStatus, RS, s } from './shared';

type Props = {
  rooms: Room[];
  loading: boolean;
  errorInfo: ApiErrorInfo | null;
  isRetrying?: boolean;
  onRetry: () => void;
  history: Inspection[];
  onScan: () => void;
  go: (t: 'rooms' | 'reports' | 'history') => void;
};

export default function HomeScreen({
  rooms,
  loading,
  errorInfo,
  onRetry,
  history,
  onScan,
  go,
}: Props) {
  const statuses: RoomStatus[] = ['Terisi', 'Kosong', 'Perlu Dibersihkan', 'Rusak'];

  return (
    <ScrollView
      contentContainerStyle={s.page}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRetry}
          colors={[C.primary]}
          tintColor={C.primary}
        />
      }
    >
      {/* Banner Error / Offline jika ada gangguan API */}
      {errorInfo && (
        <View style={styles.errorBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.errorBannerTitle}>
              {errorInfo.kind === 'offline' ? '📡 ' : '⚠️ '}
              {errorInfo.title}
            </Text>
            <Text style={styles.errorBannerMsg}>{errorInfo.message}</Text>
          </View>
          <Pressable
            onPress={onRetry}
            style={({ pressed }) => [
              styles.errorBannerBtn,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.errorBannerBtnText}>Coba Lagi</Text>
          </Pressable>
        </View>
      )}

      {/* Loading banner jika sedang mengambil data awal */}
      {loading && !errorInfo && rooms.length === 0 && (
        <View style={styles.loadingBanner}>
          <ActivityIndicator size="small" color={C.primary} />
          <Text style={styles.loadingBannerText}>
            Memuat data kamar dari server...
          </Text>
        </View>
      )}

      <View
        style={{
          backgroundColor: C.primary,
          borderRadius: 20,
          padding: 20,
        }}
      >
        <Text style={[s.h1, { color: '#fff' }]} accessibilityRole="header">
          Room Check
        </Text>
        <Text style={{ color: '#E0ECFF', fontSize: 16, marginTop: 4 }}>
          Cek kamar cepat, lengkap dengan bukti foto.
        </Text>
      </View>

      <Text style={s.h2} accessibilityRole="header">
        Kondisi kamar ({rooms.length})
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {statuses.map((st) => (
          <View
            key={st}
            accessible
            accessibilityLabel={`${st}: ${rooms.filter((r) => r.status === st).length} kamar`}
            style={{
              flexGrow: 1,
              flexBasis: '45%',
              backgroundColor: RS[st].bg,
              borderRadius: 16,
              padding: 14,
            }}
          >
            <Text style={{ fontSize: 30, fontWeight: '800', color: RS[st].fg }}>
              {rooms.filter((r) => r.status === st).length}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: RS[st].fg }}>
              {st}
            </Text>
          </View>
        ))}
      </View>

      <Btn
        label="Mulai Inspeksi"
        onPress={() => go('rooms')}
        hint="Pilih kamar yang akan dicek"
      />
      <Btn
        label="Scan QR Kamar"
        outline
        onPress={onScan}
        hint="Buka checklist lewat QR kamar"
      />
      <Btn label="Lapor Kerusakan" outline onPress={() => go('reports')} />

      <Text style={s.h2} accessibilityRole="header">
        Inspeksi terbaru
      </Text>
      {history.slice(0, 3).map((h) => (
        <View key={h.id} style={s.card}>
          <View style={s.row}>
            <Text style={s.bold}>
              Kamar {h.roomNo} · {h.type}
            </Text>
          </View>
          <Text style={s.p}>{h.date}</Text>
          <Text style={s.p}>{h.note}</Text>
        </View>
      ))}

      <View style={[s.card, { backgroundColor: C.soft, marginTop: 14 }]}>
        <Text style={s.bold}>Cara pakai</Text>
        <Text style={s.p}>
          1. Pilih kamar atau scan QR-nya.{'\n'}2. Isi checklist dan tambahkan
          foto.{'\n'}3. Simpan, status kamar dan riwayat terbarui otomatis.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
  },
  errorBannerMsg: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 2,
  },
  errorBannerBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  errorBannerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingBannerText: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '600',
  },
});
