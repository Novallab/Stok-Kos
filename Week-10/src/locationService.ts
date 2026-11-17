/**
 * locationService.ts — Week 10 (Sprint 08: Location-Based Services / LBS)
 *
 * Layanan GPS, Reverse Geocoding, Geofencing, dan Battery Optimization.
 * Kompatibel dengan Expo Go (Android/iOS) dan Web Browser.
 */

import * as Location from 'expo-location';
import { Platform } from 'react-native';

// Target Geofence Default: Area Kos RoomCheck / Kampus III UMM Malang
export const TARGET_GEOFENCE = {
  name: 'Kos RoomCheck (Kampus UMM)',
  address: 'Jl. Raya Tlogomas No. 246, Lowokwaru, Kota Malang, Jawa Timur 65144',
  latitude: -7.9208,
  longitude: 112.5992,
  defaultRadiusMeters: 300, // 300 meter
};

export type LocationCoords = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
};

export type AddressInfo = {
  formattedAddress: string;
  street?: string;
  district?: string; // Kecamatan
  city?: string;     // Kota/Kabupaten
  region?: string;   // Provinsi
  postalCode?: string;
  country?: string;
};

export type AccuracyLevel = 'high' | 'balanced' | 'low';

/**
 * Menghitung jarak antara 2 koordinat bumi menggunakan Formula Haversine (dalam meter).
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Radius bumi dalam meter
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Hasil dalam meter
}

/**
 * Meminta izin akses lokasi (Foreground Permission).
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      if (!navigator.geolocation) return false;
      return true;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Memeriksa status izin lokasi saat ini.
 */
export async function checkLocationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      return !!navigator.geolocation;
    }
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Konversi tingkat akurasi ke konfigurasi LocationAccuracy Expo.
 */
function mapAccuracyLevel(level: AccuracyLevel): Location.LocationAccuracy {
  switch (level) {
    case 'high':
      return Location.LocationAccuracy.High;
    case 'balanced':
      return Location.LocationAccuracy.Balanced;
    case 'low':
      return Location.LocationAccuracy.Low;
  }
}

/**
 * Mengambil koordinat posisi saat ini (Get Current Position).
 */
export async function getCurrentPosition(
  accuracy: AccuracyLevel = 'high'
): Promise<LocationCoords> {
  // Fallback untuk Web Browser
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak didukung pada browser ini.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            timestamp: pos.timestamp,
          });
        },
        (err) => reject(new Error(err.message)),
        {
          enableHighAccuracy: accuracy === 'high',
          timeout: 10000,
          maximumAge: 1000,
        }
      );
    });
  }

  // Native Mobile (Expo Location)
  const loc = await Location.getCurrentPositionAsync({
    accuracy: mapAccuracyLevel(accuracy),
  });

  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
    accuracy: loc.coords.accuracy,
    altitude: loc.coords.altitude,
    speed: loc.coords.speed,
    heading: loc.coords.heading,
    timestamp: loc.timestamp,
  };
}

/**
 * Reverse Geocoding: Mengubah koordinat (lat, lng) menjadi alamat teks yang dapat dibaca.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<AddressInfo> {
  try {
    // Coba gunakan Expo Location reverseGeocodeAsync
    if (Platform.OS !== 'web') {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const item = results[0];
        const parts = [
          item.street ? `${item.street} ${item.streetNumber || ''}`.trim() : item.name,
          item.district || item.subregion,
          item.city,
          item.region,
          item.postalCode,
        ].filter(Boolean);

        return {
          formattedAddress: parts.join(', ') || 'Alamat tidak teridentifikasi',
          street: item.street || item.name || undefined,
          district: item.district || item.subregion || undefined,
          city: item.city || undefined,
          region: item.region || undefined,
          postalCode: item.postalCode || undefined,
          country: item.country || undefined,
        };
      }
    }

    // Fallback: Gunakan OpenStreetMap Nominatim (Gratis & bekerja di Web & Mobile)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'RoomCheck-App/1.0',
          Accept: 'application/json',
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const road = addr.road || addr.pedestrian || addr.suburb || '';
      const district = addr.suburb || addr.city_district || addr.county || '';
      const city = addr.city || addr.town || addr.municipality || 'Malang';
      const state = addr.state || 'Jawa Timur';
      const postcode = addr.postcode || '';

      const full = data.display_name || [road, district, city, state, postcode].filter(Boolean).join(', ');

      return {
        formattedAddress: full,
        street: road,
        district: district,
        city: city,
        region: state,
        postalCode: postcode,
        country: addr.country,
      };
    }
  } catch (e) {
    console.warn('Reverse geocode fallback:', e);
  }

  // Fallback default jika offline atau rate-limited
  return {
    formattedAddress: `Area Koordinat (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), Sekitar Malang`,
    district: 'Lowokwaru',
    city: 'Kota Malang',
    region: 'Jawa Timur',
  };
}
