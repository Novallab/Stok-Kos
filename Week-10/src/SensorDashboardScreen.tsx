import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAccelerometer, useGyroscope, useMagnetometer, SensorStatus } from './useSensors';
import { C, s } from './shared';

// Format nilai sensor: selalu 2 desimal dengan tanda
const fmt = (v: number | undefined) =>
  v === undefined ? '—' : (v >= 0 ? '+' : '') + v.toFixed(2);

function SensorCard({
  icon,
  title,
  subtitle,
  status,
  rows,
}: {
  icon: string;
  title: string;
  subtitle: string;
  status: SensorStatus;
  rows: { label: string; value: string }[];
}) {
  const statusColor =
    status === 'available'
      ? '#16A34A'
      : status === 'unavailable'
      ? '#DC2626'
      : '#D97706';
  const statusText =
    status === 'available'
      ? '● Aktif'
      : status === 'unavailable'
      ? '● Tidak Tersedia'
      : '⏳ Memuat...';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <Text style={[styles.statusBadge, { color: statusColor }]}>{statusText}</Text>
      </View>

      {status === 'unavailable' && (
        <View style={styles.unavailableBox}>
          <Text style={styles.unavailableText}>
            Sensor tidak tersedia pada perangkat ini atau izin ditolak.
          </Text>
        </View>
      )}

      {status === 'available' && (
        <View style={styles.dataGrid}>
          {rows.map((row) => (
            <View key={row.label} style={styles.dataItem}>
              <Text style={styles.dataLabel}>{row.label}</Text>
              <Text style={styles.dataValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function SensorDashboardScreen() {
  const accel = useAccelerometer(100);
  const gyro = useGyroscope(100);
  const mag = useMagnetometer(100);

  // Interpretasi gerakan dari accelerometer (Sprint 06 slide: "mengolah data sensor")
  const getMotionLabel = () => {
    if (!accel.data) return '—';
    const { x, y, z } = accel.data;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    if (magnitude < 0.3) return '🟢 Diam (Stationery)';
    if (magnitude < 1.5) return '🟡 Getaran Ringan';
    return '🔴 Gerakan Aktif';
  };

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.h1} accessibilityRole="header">
        Sensor Perangkat
      </Text>
      <Text style={[s.p, { marginBottom: 16 }]}>
        Data real-time dari sensor fisik perangkat Anda (Sprint 06 — Week 7).
      </Text>

      {/* Accelerometer */}
      <SensorCard
        icon="🏃"
        title="Accelerometer"
        subtitle="Mendeteksi percepatan & pergerakan (X, Y, Z)"
        status={accel.status}
        rows={[
          { label: 'X (kiri-kanan)', value: `${fmt(accel.data?.x)} m/s²` },
          { label: 'Y (depan-belakang)', value: `${fmt(accel.data?.y)} m/s²` },
          { label: 'Z (atas-bawah)', value: `${fmt(accel.data?.z)} m/s²` },
          { label: 'Status Gerakan', value: getMotionLabel() },
        ]}
      />

      {/* Gyroscope */}
      <SensorCard
        icon="🔄"
        title="Gyroscope"
        subtitle="Mendeteksi rotasi perangkat (X, Y, Z)"
        status={gyro.status}
        rows={[
          { label: 'X (pitch)', value: `${fmt(gyro.data?.x)} rad/s` },
          { label: 'Y (roll)', value: `${fmt(gyro.data?.y)} rad/s` },
          { label: 'Z (yaw)', value: `${fmt(gyro.data?.z)} rad/s` },
        ]}
      />

      {/* Magnetometer */}
      <SensorCard
        icon="🧲"
        title="Magnetometer"
        subtitle="Mendeteksi arah & medan magnet (kompas)"
        status={mag.status}
        rows={[
          { label: 'X', value: `${fmt(mag.data?.x)} µT` },
          { label: 'Y', value: `${fmt(mag.data?.y)} µT` },
          { label: 'Z', value: `${fmt(mag.data?.z)} µT` },
          {
            label: 'Arah Kompas',
            value: mag.heading !== null ? `${mag.heading}° ${getCompassDir(mag.heading)}` : '—',
          },
        ]}
      />

      {/* Penjelasan Sensor API (Slide 3-4) */}
      <View style={[s.card, { backgroundColor: '#EFF6FF', marginTop: 8 }]}>
        <Text style={s.bold}>📡 Alur Sensor API (Sprint 06)</Text>
        <Text style={[s.p, { marginTop: 4 }]}>
          {'Aplikasi  →  Sensor API (expo-sensors)\n'}
          {'         →  OS Android/iOS\n'}
          {'         →  Hardware Sensor Fisik\n'}
          {'         →  Data real-time (X, Y, Z)\n'}
          {'         →  Tampil di UI aplikasi'}
        </Text>
      </View>

      <View style={[s.card, { backgroundColor: '#F0FDF4', marginTop: 4 }]}>
        <Text style={s.bold}>🔒 Runtime Permission</Text>
        <Text style={[s.p, { marginTop: 4 }]}>
          Accelerometer & Gyroscope: Tidak memerlukan izin pengguna secara eksplisit di
          sebagian besar perangkat. Sensor ini diakses langsung melalui expo-sensors.
          {'\n\n'}
          Camera & Location: Memerlukan runtime permission — akan diminta saat pertama kali
          fitur digunakan.
        </Text>
      </View>
    </ScrollView>
  );
}

function getCompassDir(deg: number): string {
  const dirs = ['U', 'TL', 'T', 'TS', 'S', 'BD', 'B', 'BT'];
  return dirs[Math.round(deg / 45) % 8];
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  unavailableBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  unavailableText: {
    color: '#991B1B',
    fontSize: 12,
  },
  dataGrid: {
    gap: 8,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dataLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
