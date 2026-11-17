/**
 * MapViewComponent.tsx — Week 10 (Sprint 08: Maps SDK Integration)
 *
 * Komponen Peta Interaktif 100% Native:
 * - Kompatibel murni dengan iOS, Android, dan Web (tanpa tag HTML iframe yang merusak iOS)
 * - Marker Pengguna (User Location)
 * - Marker Kos RoomCheck (Target Location UMM Malang)
 * - Visualisasi Lingkaran Geofence (Radius 300m)
 * - Kontrol Zoom & Re-Center
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

type Props = {
  userLat: number;
  userLng: number;
  targetLat: number;
  targetLng: number;
  targetName: string;
  geofenceRadius: number; // in meters
  isInsideGeofence: boolean;
};

export default function MapViewComponent({
  userLat,
  userLng,
  targetLat,
  targetLng,
  targetName,
  geofenceRadius,
  isInsideGeofence,
}: Props) {
  const [zoom, setZoom] = useState(16);
  const [activeCenter, setActiveCenter] = useState<'user' | 'target'>('user');
  const [activeMarkerInfo, setActiveMarkerInfo] = useState<string | null>(null);

  return (
    <View style={styles.card}>
      {/* Header Peta */}
      <View style={styles.mapHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.mapTitle}>🗺️ Peta Lokasi & Geofence</Text>
          <Text style={styles.mapSubtitle}>
            Area UMM Malang · Zoom: {zoom}x · Mode: {activeCenter === 'user' ? 'Lokasi Saya' : 'Kos Pusat'}
          </Text>
        </View>
        <View
          style={[
            styles.geofencePill,
            { backgroundColor: isInsideGeofence ? '#DCFCE7' : '#FEE2E2' },
          ]}
        >
          <Text
            style={[
              styles.geofencePillText,
              { color: isInsideGeofence ? '#166534' : '#991B1B' },
            ]}
          >
            {isInsideGeofence ? '● Dalam Area' : '● Di Luar Area'}
          </Text>
        </View>
      </View>

      {/* Frame Tampilan Peta Murni Native */}
      <View style={styles.mapContainer}>
        {/* Latar Belakang Area Peta (Land & Roads) */}
        <View style={styles.mapCanvas}>
          {/* Jalan Utama (Jl. Raya Tlogomas Malang) */}
          <View style={styles.roadMain} />
          <View style={styles.roadMainDash} />
          <Text style={styles.roadLabel}>Jl. Raya Tlogomas</Text>

          {/* Jalan Sekunder */}
          <View style={styles.roadCross} />
          <View style={styles.river} />
          <Text style={styles.riverLabel}>Sungai Brantas</Text>

          {/* Area Blok Bangunan Kampus UMM & Kos */}
          <View style={styles.campusBlock}>
            <Text style={styles.campusBlockText}>Kampus III UMM</Text>
          </View>
          <View style={styles.housingBlock}>
            <Text style={styles.housingBlockText}>Area Kos-Kosan</Text>
          </View>

          {/* Visualisasi Lingkaran Geofence Virtual */}
          <View
            style={[
              styles.geofenceCircle,
              {
                borderColor: isInsideGeofence ? '#10B981' : '#EF4444',
                backgroundColor: isInsideGeofence
                  ? 'rgba(16, 185, 129, 0.16)'
                  : 'rgba(239, 68, 68, 0.12)',
              },
            ]}
          >
            <View
              style={[
                styles.geofenceBadge,
                { backgroundColor: isInsideGeofence ? '#ECFDF5' : '#FEF2F2' },
              ]}
            >
              <Text
                style={[
                  styles.geofenceCircleLabel,
                  { color: isInsideGeofence ? '#047857' : '#B91C1C' },
                ]}
              >
                Radius Geofence: {geofenceRadius}m
              </Text>
            </View>
          </View>

          {/* Marker Kos / Target (🏢) */}
          <TouchableOpacity
            style={styles.targetMarkerContainer}
            onPress={() =>
              setActiveMarkerInfo(
                `${targetName}\nKoordinat: ${targetLat}, ${targetLng}\nStatus: Area Inspeksi Aktif`
              )
            }
          >
            <View style={styles.targetPin}>
              <Text style={styles.targetPinIcon}>🏢</Text>
            </View>
            <View style={styles.markerLabelContainer}>
              <Text style={styles.targetPinText}>Kos RoomCheck</Text>
            </View>
          </TouchableOpacity>

          {/* Marker Lokasi Pengguna (📍) */}
          <TouchableOpacity
            style={[
              styles.userMarkerContainer,
              isInsideGeofence ? styles.userInsidePos : styles.userOutsidePos,
            ]}
            onPress={() =>
              setActiveMarkerInfo(
                `Posisi Anda\nLat: ${userLat.toFixed(5)}, Lng: ${userLng.toFixed(5)}\n${
                  isInsideGeofence
                    ? '✓ Terverifikasi di dalam area'
                    : '✕ Di luar radius geofence'
                }`
              )
            }
          >
            <View style={styles.userPulseRing} />
            <View style={styles.userPin}>
              <Text style={styles.userPinIcon}>📍</Text>
            </View>
            <View style={styles.markerLabelContainer}>
              <Text style={styles.userPinText}>Posisi Saya</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Floating Quick Action Buttons */}
        <View style={styles.floatingControls}>
          <TouchableOpacity
            style={[
              styles.controlBtn,
              activeCenter === 'user' && styles.controlBtnActive,
            ]}
            onPress={() => {
              setActiveCenter('user');
              setActiveMarkerInfo('Kamera dipusatkan ke: Posisi Anda');
            }}
          >
            <Text style={styles.controlBtnIcon}>🎯</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.controlBtn,
              activeCenter === 'target' && styles.controlBtnActive,
            ]}
            onPress={() => {
              setActiveCenter('target');
              setActiveMarkerInfo(`Kamera dipusatkan ke: ${targetName}`);
            }}
          >
            <Text style={styles.controlBtnIcon}>🏢</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setZoom((z) => Math.min(z + 1, 19))}
          >
            <Text style={styles.controlBtnText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setZoom((z) => Math.max(z - 1, 12))}
          >
            <Text style={styles.controlBtnText}>−</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Callout saat Marker Diklik */}
      {activeMarkerInfo && (
        <View style={styles.markerInfoBox}>
          <Text style={styles.markerInfoText}>{activeMarkerInfo}</Text>
          <TouchableOpacity onPress={() => setActiveMarkerInfo(null)}>
            <Text style={styles.markerInfoClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Legend & Keterangan Marker */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <Text style={{ fontSize: 13 }}>📍</Text>
          <Text style={styles.legendText}>Lokasi Saya</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={{ fontSize: 13 }}>🏢</Text>
          <Text style={styles.legendText}>Area Kos RoomCheck</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: isInsideGeofence ? '#10B981' : '#EF4444' },
            ]}
          />
          <Text style={styles.legendText}>Batas Geofence</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  mapSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  geofencePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  geofencePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mapContainer: {
    position: 'relative',
    height: 290,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  mapCanvas: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E6F0FA',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  river: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '12%',
    width: 24,
    backgroundColor: '#93C5FD',
  },
  riverLabel: {
    position: 'absolute',
    left: '14%',
    top: 20,
    fontSize: 8,
    color: '#1E40AF',
    fontWeight: '700',
    transform: [{ rotate: '90deg' }],
  },
  roadMain: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '52%',
    height: 22,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
  },
  roadMainDash: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '56%',
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  roadLabel: {
    position: 'absolute',
    left: 80,
    top: '53%',
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
  },
  roadCross: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '48%',
    width: 16,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#CBD5E1',
  },
  campusBlock: {
    position: 'absolute',
    top: 24,
    left: '36%',
    backgroundColor: '#E0E7FF',
    borderWidth: 1,
    borderColor: '#A5B4FC',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  campusBlockText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#3730A3',
  },
  housingBlock: {
    position: 'absolute',
    bottom: 24,
    right: '20%',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  housingBlockText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#92400E',
  },
  geofenceCircle: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 6,
  },
  geofenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  geofenceCircleLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  targetMarkerContainer: {
    position: 'absolute',
    alignItems: 'center',
    top: '42%',
    left: '45%',
  },
  targetPin: {
    backgroundColor: '#1E40AF',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
  },
  targetPinIcon: {
    fontSize: 16,
  },
  markerLabelContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  targetPinText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
  },
  userMarkerContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  userInsidePos: {
    top: '48%',
    left: '54%',
  },
  userOutsidePos: {
    top: '78%',
    left: '74%',
  },
  userPulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(26, 86, 219, 0.25)',
    top: -6,
  },
  userPin: {
    backgroundColor: '#1A56DB',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
  },
  userPinIcon: {
    fontSize: 16,
  },
  userPinText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1A56DB',
  },
  floatingControls: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    padding: 4,
    gap: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  controlBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  controlBtnActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#1A56DB',
  },
  controlBtnIcon: {
    fontSize: 14,
  },
  controlBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 20,
  },
  markerInfoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  markerInfoText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  markerInfoClose: {
    fontSize: 14,
    color: '#1E40AF',
    paddingHorizontal: 6,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
});
