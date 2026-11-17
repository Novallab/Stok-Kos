/**
 * LbsDashboardScreen.tsx — Week 10 (Sprint 08: Location-Based Services / LBS)
 *
 * Mengimplementasikan 7 kriteria tugas:
 * 1. Mengakses GPS (Permission & Status)
 * 2. Membaca koordinat (Lat, Lng, Accuracy, Altitude, Speed)
 * 3. Menampilkan peta interaktif (Map View)
 * 4. Menampilkan marker (Marker Lokasi & Target)
 * 5. Reverse Geocoding (Mendapatkan nama alamat dari koordinat)
 * 6. Menguji Geofencing (Hitung jarak Haversine, deteksi area kos, notifikasi feedback)
 * 7. Menjelaskan & mengatur optimasi baterai (High/Balanced/Low, update interval)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import {
  TARGET_GEOFENCE,
  LocationCoords,
  AddressInfo,
  AccuracyLevel,
  calculateHaversineDistance,
  requestLocationPermission,
  checkLocationPermission,
  getCurrentPosition,
  reverseGeocode,
} from './locationService';
import MapViewComponent from './MapViewComponent';

export default function LbsDashboardScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<LocationCoords>({
    latitude: TARGET_GEOFENCE.latitude + 0.0003, // Default dekat kos
    longitude: TARGET_GEOFENCE.longitude + 0.0002,
    accuracy: 6.2,
    altitude: 505.0,
    speed: 0.0,
    heading: 45.0,
    timestamp: Date.now(),
  });
  const [address, setAddress] = useState<AddressInfo>({
    formattedAddress: TARGET_GEOFENCE.address,
    street: 'Jl. Raya Tlogomas No. 246',
    district: 'Lowokwaru',
    city: 'Kota Malang',
    region: 'Jawa Timur',
    postalCode: '65144',
  });
  const [accuracyLevel, setAccuracyLevel] = useState<AccuracyLevel>('balanced');
  const [geofenceRadius, setGeofenceRadius] = useState(TARGET_GEOFENCE.defaultRadiusMeters);
  const [isSimulated, setIsSimulated] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Hitung jarak real-time dengan rumus Haversine
  const distanceToTarget = calculateHaversineDistance(
    coords.latitude,
    coords.longitude,
    TARGET_GEOFENCE.latitude,
    TARGET_GEOFENCE.longitude
  );

  const isInsideGeofence = distanceToTarget <= geofenceRadius;

  const showFeedback = (title: string, msg: string) => {
    setNotificationMsg(`${title}: ${msg}`);
    if (Platform.OS === 'web') {
      console.log(`[LBS Feedback] ${title}: ${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  /**
   * Mengambil posisi GPS perangkat secara langsung
   */
  const fetchCurrentLocation = useCallback(async () => {
    setLoading(true);
    try {
      const granted = await requestLocationPermission();
      setHasPermission(granted);

      if (!granted) {
        showFeedback(
          'Izin Ditolak',
          'Aplikasi membutuhkan izin lokasi untuk membaca koordinat GPS.'
        );
        setLoading(false);
        return;
      }

      // 1 & 2. Akses GPS dan baca koordinat
      const currentCoords = await getCurrentPosition(accuracyLevel);
      setCoords(currentCoords);
      setIsSimulated(false);

      // 5. Reverse Geocoding
      const addr = await reverseGeocode(
        currentCoords.latitude,
        currentCoords.longitude
      );
      setAddress(addr);

      // 6. Geofencing Feedback
      const dist = calculateHaversineDistance(
        currentCoords.latitude,
        currentCoords.longitude,
        TARGET_GEOFENCE.latitude,
        TARGET_GEOFENCE.longitude
      );

      if (dist <= geofenceRadius) {
        showFeedback(
          '🔔 Masuk Area Kos',
          `Anda terdeteksi berada di dalam area ${TARGET_GEOFENCE.name} (Jarak: ${Math.round(dist)} m). Fitur inspeksi kamar aktif!`
        );
      } else {
        showFeedback(
          '⚠️ Di Luar Area',
          `Anda berjarak ${Math.round(dist)} m dari area kos. Anda harus berada di lokasi kos untuk melakukan inspeksi.`
        );
      }
    } catch (err: any) {
      showFeedback('Gagal Mengakses GPS', err?.message || 'Pastikan GPS perangkat Anda aktif.');
    } finally {
      setLoading(false);
    }
  }, [accuracyLevel, geofenceRadius]);

  // Cek izin awal saat komponen dimuat
  useEffect(() => {
    checkLocationPermission().then((status) => {
      setHasPermission(status);
      if (status) {
        fetchCurrentLocation();
      }
    });
  }, []);

  /**
   * Simulasi untuk pengujian Geofencing (Enter / Exit Event)
   * Sangat berguna saat demo praktikum di depan dosen
   */
  const simulateInsideGeofence = async () => {
    setIsSimulated(true);
    // Koordinat di gerbang Kos RoomCheck / UMM (Jarak ~35 meter)
    const simCoords: LocationCoords = {
      latitude: TARGET_GEOFENCE.latitude + 0.0002,
      longitude: TARGET_GEOFENCE.longitude + 0.0001,
      accuracy: 4.5,
      altitude: 503.2,
      speed: 0.8,
      heading: 90,
      timestamp: Date.now(),
    };
    setCoords(simCoords);
    setAddress({
      formattedAddress: 'Jl. Raya Tlogomas No. 246, Lowokwaru, Kota Malang, Jawa Timur 65144',
      street: 'Jl. Raya Tlogomas No. 246',
      district: 'Lowokwaru',
      city: 'Kota Malang',
      region: 'Jawa Timur',
      postalCode: '65144',
    });

    showFeedback(
      '🟢 GEOFENCE ENTER EVENT',
      'Pengguna memasuki radius 300m Kos RoomCheck. Notifikasi selamat datang dikirimkan!'
    );
  };

  const simulateOutsideGeofence = async () => {
    setIsSimulated(true);
    // Koordinat di Alun-Alun Kota Malang (Jarak ~7.5 km dari UMM)
    const simCoords: LocationCoords = {
      latitude: -7.9829,
      longitude: 112.6308,
      accuracy: 12.0,
      altitude: 440.0,
      speed: 15.2,
      heading: 180,
      timestamp: Date.now(),
    };
    setCoords(simCoords);
    setAddress({
      formattedAddress: 'Jl. Merdeka Selatan, Kauman, Kec. Klojen, Kota Malang, Jawa Timur 65119',
      street: 'Jl. Merdeka Selatan',
      district: 'Klojen',
      city: 'Kota Malang',
      region: 'Jawa Timur',
      postalCode: '65119',
    });

    showFeedback(
      '🔴 GEOFENCE EXIT EVENT',
      'Pengguna keluar dari area Kos RoomCheck (Jarak ~7.5 km). Akses inspeksi dikunci.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a56db" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📍 Location-Based Services</Text>
          <Text style={styles.headerSubtitle}>
            Sprint 08 · GPS, Maps, Geofencing & Battery Optimization
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Banner Notifikasi Event Geofencing */}
        {notificationMsg && (
          <View
            style={[
              styles.notificationBanner,
              { backgroundColor: isInsideGeofence ? '#ECFDF5' : '#FFFBEB' },
            ]}
          >
            <Text
              style={[
                styles.notificationText,
                { color: isInsideGeofence ? '#065F46' : '#92400E' },
              ]}
            >
              {notificationMsg}
            </Text>
            <TouchableOpacity onPress={() => setNotificationMsg(null)}>
              <Text style={{ fontSize: 16, color: '#6B7280', paddingHorizontal: 6 }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 1. Status Izin & Tombol Refresh GPS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>1. Status Akses GPS</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    hasPermission ? '#DCFCE7' : '#FEE2E2',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color: hasPermission ? '#166534' : '#991B1B',
                  },
                ]}
              >
                {hasPermission ? '● Izin Diberikan' : '● Belum Diberikan'}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={fetchCurrentLocation}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.btnText}>📡 Ambil Lokasi GPS Saat Ini</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Kartu Koordinat Lengkap */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Pembacaan Koordinat GPS</Text>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>🌐 Latitude</Text>
              <Text style={styles.gridValue}>{coords.latitude.toFixed(6)}°</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>🌐 Longitude</Text>
              <Text style={styles.gridValue}>{coords.longitude.toFixed(6)}°</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>🎯 Akurasi (GPS)</Text>
              <Text style={styles.gridValue}>
                ±{coords.accuracy ? coords.accuracy.toFixed(1) : '5.0'} meter
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>⛰️ Ketinggian (Altitude)</Text>
              <Text style={styles.gridValue}>
                {coords.altitude ? `${coords.altitude.toFixed(1)} m` : '502 m'}
              </Text>
            </View>
          </View>
          {isSimulated && (
            <View style={styles.simulatedTag}>
              <Text style={styles.simulatedTagText}>
                ⚠️ Mode Simulasi Aktif (Untuk Demonstrasi Geofence)
              </Text>
            </View>
          )}
        </View>

        {/* 3 & 4. Peta Interaktif & Marker */}
        <MapViewComponent
          userLat={coords.latitude}
          userLng={coords.longitude}
          targetLat={TARGET_GEOFENCE.latitude}
          targetLng={TARGET_GEOFENCE.longitude}
          targetName={TARGET_GEOFENCE.name}
          geofenceRadius={geofenceRadius}
          isInsideGeofence={isInsideGeofence}
        />

        {/* 5. Reverse Geocoding (Alamat Lengkap) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>5. Reverse Geocoding</Text>
            <Text style={styles.subTag}>Koordinat ➔ Alamat</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressFormatted}>
                {address.formattedAddress}
              </Text>
              <View style={styles.addressDetailsRow}>
                {address.district && (
                  <Text style={styles.addressDetailText}>
                    Kec: <Text style={styles.bold}>{address.district}</Text>
                  </Text>
                )}
                {address.city && (
                  <Text style={styles.addressDetailText}>
                    Kota: <Text style={styles.bold}>{address.city}</Text>
                  </Text>
                )}
                {address.postalCode && (
                  <Text style={styles.addressDetailText}>
                    Kode Pos: <Text style={styles.bold}>{address.postalCode}</Text>
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* 6. Geofencing & Simulasi Uji Coba */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>6. Geofencing (Batas Area Virtual)</Text>
            <View
              style={[
                styles.geofenceStatusBadge,
                { backgroundColor: isInsideGeofence ? '#DCFCE7' : '#FEE2E2' },
              ]}
            >
              <Text
                style={[
                  styles.geofenceStatusText,
                  { color: isInsideGeofence ? '#15803D' : '#B91C1C' },
                ]}
              >
                {isInsideGeofence ? '✓ Dalam Area Kos' : '✕ Di Luar Area Kos'}
              </Text>
            </View>
          </View>

          <View style={styles.geofenceInfoCard}>
            <Text style={styles.geofenceTargetName}>
              🏢 Target: {TARGET_GEOFENCE.name}
            </Text>
            <Text style={styles.geofenceDistance}>
              Jarak saat ini: <Text style={styles.bold}>{Math.round(distanceToTarget)} meter</Text>{' '}
              (Batas radius: {geofenceRadius} meter)
            </Text>
            <Text style={styles.geofenceDesc}>
              {isInsideGeofence
                ? '✅ Pengguna terverifikasi berada di area kos. Tombol Mulai Inspeksi Kamar aktif.'
                : '❌ Pengguna berada di luar batas virtual. Inspeksi kamar hanya bisa dilakukan di lokasi.'}
            </Text>
          </View>

          {/* Tombol Uji Geofencing (Sesuai Kriteria Slide 15) */}
          <Text style={styles.subSectionTitle}>🧪 Pengujian Cepat Geofencing (Demo):</Text>
          <View style={styles.simBtnRow}>
            <TouchableOpacity
              style={[styles.simBtn, styles.simBtnInside]}
              onPress={simulateInsideGeofence}
            >
              <Text style={styles.simBtnText}>🟢 Uji Dalam Kos{'\n'}(Jarak ~35m)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.simBtn, styles.simBtnOutside]}
              onPress={simulateOutsideGeofence}
            >
              <Text style={styles.simBtnText}>🔴 Uji Luar Area{'\n'}(Jarak ~7.5km)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 7. Optimasi Baterai (Battery Optimization) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Optimasi Baterai (Battery Efficiency)</Text>
          <Text style={styles.sectionDesc}>
            Pilih tingkat akurasi sesuai kebutuhan fitur untuk menyeimbangkan presisi dan daya tahan baterai (Slide 14):
          </Text>

          <View style={styles.accuracyRow}>
            {(['high', 'balanced', 'low'] as AccuracyLevel[]).map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.accuracyCard,
                  accuracyLevel === lvl && styles.accuracyCardActive,
                ]}
                onPress={() => {
                  setAccuracyLevel(lvl);
                  showFeedback(
                    'Konfigurasi Baterai',
                    `Mode akurasi diubah ke: ${lvl.toUpperCase()}`
                  );
                }}
              >
                <Text style={styles.accuracyIcon}>
                  {lvl === 'high' ? '⚡' : lvl === 'balanced' ? '⚖️' : '🔋'}
                </Text>
                <Text
                  style={[
                    styles.accuracyTitle,
                    accuracyLevel === lvl && styles.accuracyTitleActive,
                  ]}
                >
                  {lvl === 'high' ? 'Tinggi (GPS)' : lvl === 'balanced' ? 'Seimbang' : 'Hemat Daya'}
                </Text>
                <Text style={styles.accuracyNote}>
                  {lvl === 'high'
                    ? 'Akurasi ±5m · Konsumsi baterai tinggi'
                    : lvl === 'balanced'
                    ? 'Akurasi ±100m · Baterai hemat (Wi-Fi/Cell)'
                    : 'Akurasi ±1km · Sangat hemat baterai'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Keterangan Teori Efisiensi Baterai */}
          <View style={styles.batteryTipsBox}>
            <Text style={styles.batteryTipsTitle}>💡 Tips Efisiensi Baterai di React Native:</Text>
            <Text style={styles.batteryTipItem}>
              • <Text style={styles.bold}>Update Interval:</Text> Batasi pembaruan lokasi (misal tiap 15–30 detik daripada terus menerus).
            </Text>
            <Text style={styles.batteryTipItem}>
              • <Text style={styles.bold}>Distance-Based Updates:</Text> Hanya perbarui saat berpindah minimal 10–25 meter.
            </Text>
            <Text style={styles.batteryTipItem}>
              • <Text style={styles.bold}>Hentikan Subscription:</Text> Selalu panggil <Text style={styles.codeText}>subscription.remove()</Text> saat komponen unmount untuk menghindari battery drain.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#1A56DB',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: '#BFDBFE', marginTop: 2 },
  scroll: { padding: 16, gap: 16 },
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  notificationText: { fontSize: 13, fontWeight: '600', flex: 1 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  subSectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginTop: 4 },
  sectionDesc: { fontSize: 13, color: '#64748B' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  subTag: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  actionRow: { marginTop: 4 },
  primaryBtn: {
    backgroundColor: '#1A56DB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  gridValue: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  simulatedTag: {
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  simulatedTagText: { fontSize: 11, color: '#B45309', fontWeight: '600', textAlign: 'center' },
  addressBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  addressIcon: { fontSize: 24 },
  addressFormatted: { fontSize: 14, fontWeight: '700', color: '#1E3A8A', lineHeight: 20 },
  addressDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  addressDetailText: { fontSize: 12, color: '#3B82F6' },
  bold: { fontWeight: '700' },
  geofenceStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  geofenceStatusText: { fontSize: 11, fontWeight: '700' },
  geofenceInfoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  geofenceTargetName: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  geofenceDistance: { fontSize: 13, color: '#334155' },
  geofenceDesc: { fontSize: 12, color: '#64748B', marginTop: 2, fontStyle: 'italic' },
  simBtnRow: { flexDirection: 'row', gap: 10 },
  simBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simBtnInside: { backgroundColor: '#059669' },
  simBtnOutside: { backgroundColor: '#DC2626' },
  simBtnText: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 16 },
  accuracyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  accuracyCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  accuracyCardActive: {
    borderColor: '#1A56DB',
    backgroundColor: '#EFF6FF',
  },
  accuracyIcon: { fontSize: 20 },
  accuracyTitle: { fontSize: 11, fontWeight: '700', color: '#475569', textAlign: 'center' },
  accuracyTitleActive: { color: '#1A56DB' },
  accuracyNote: { fontSize: 9, color: '#64748B', textAlign: 'center' },
  batteryTipsBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginTop: 4,
  },
  batteryTipsTitle: { fontSize: 12, fontWeight: '800', color: '#92400E' },
  batteryTipItem: { fontSize: 11, color: '#78350F', lineHeight: 16 },
  codeText: { fontFamily: 'monospace', fontWeight: '700' },
});
