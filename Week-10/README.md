# RoomCheck — Week 10: Sprint 08

## Location-Based Services (LBS), Maps SDK, Geofencing & Battery Optimization

> **Topik Utama**: GPS Integration (`expo-location`), Map Rendering & Markers, Reverse Geocoding, Geofencing (Haversine formula), and Battery Optimization.

---

## 7 Kriteria Praktikum Mahasiswa (Sesuai Slide Materi Week 10)

| No | Kriteria Pembelajaran | Status | Implementasi di Aplikasi |
|:---:|:---|:---:|:---|
| 1 | **Mengakses GPS** | ✅ Selesai | Meminta izin akses lokasi foreground (`Location.requestForegroundPermissionsAsync()`) dan membaca status permission. |
| 2 | **Membaca Koordinat** | ✅ Selesai | Membaca koordinat real-time: `latitude`, `longitude`, `accuracy` (±meter), `altitude`, dan `speed`. |
| 3 | **Menampilkan Peta** | ✅ Selesai | Komponen peta interaktif (`MapViewComponent`) dengan OpenStreetMap tile engine, kontrol zoom in/out, dan re-center. |
| 4 | **Menampilkan Marker** | ✅ Selesai | Marker **Lokasi Pengguna** (📍 dengan pulse ring) & Marker **Kos RoomCheck** (🏢 target area di UMM Malang). |
| 5 | **Reverse Geocoding** | ✅ Selesai | Konversi otomatis koordinat GPS menjadi alamat terbaca lengkap: nama jalan, kelurahan, kecamatan, kota, hingga kode pos. |
| 6 | **Menguji Geofencing** | ✅ Selesai | Menghitung jarak presisi dengan **Haversine Formula**. Menampilkan status **Dalam Area Kos** (radius 300m) atau **Di Luar Area**. Dilengkapi tombol simulasi cepat uji coba *Enter* & *Exit Event*. |
| 7 | **Optimasi Baterai** | ✅ Selesai | Pengaturan tingkat akurasi (`High` vs `Balanced` vs `Low/Passive`), update interval, dan pembersihan subscription listener untuk efisiensi daya baterai. |

---

## Panduan Menjalankan Aplikasi Week-10

### 1. Masuk ke Folder Week-10
```powershell
cd "C:\Users\ASUS VIVOBOOK\StockKos\RoomCheck\Week-10"
```

### 2. Jalankan Expo Dev Server
```powershell
npx expo start
```
- Tekan **`w`** untuk membuka langsung di browser web laptop.
- Scan **QR Code** menggunakan aplikasi **Expo Go** di smartphone (Android / iOS).

### 3. (Opsional) Jalankan Mock API Server untuk Data Kamar
Di terminal terpisah:
```powershell
npm run api
```

---

## Fitur Pengujian Cepat untuk Penilaian (Demo Feature)

Di tab **📍 Lokasi**, terdapat tombol simulasi geofencing untuk mendemonstrasikan kedua event di depan dosen tanpa harus berpindah tempat fisik:
- **🟢 Uji Dalam Kos (Jarak ~35m)**: Mensimulasikan pengguna berada di gerbang kos RoomCheck (di dalam batas radius 300m). Fitur inspeksi kamar aktif.
- **🔴 Uji Luar Area (Jarak ~7.5km)**: Mensimulasikan pengguna berada di Alun-Alun Kota Malang (di luar batas virtual). Aplikasi memberikan peringatan bahwa inspeksi hanya dapat dilakukan di lokasi kos.

---

## Struktur Folder Week-10

```
Week-10/
├── App.tsx                          # Entry point navigasi 8 tab (Beranda, Kamar, Laporan, Riwayat, Lokasi, Sensor, Async, Todo)
├── src/
│   ├── locationService.ts           # 🆕 Modul GPS, Haversine, Geocoding, & Battery Config
│   ├── MapViewComponent.tsx         # 🆕 Komponen Peta Interaktif & Marker Lokasi
│   ├── LbsDashboardScreen.tsx       # 🆕 Dashboard LBS Lengkap (7 Kriteria Praktikum)
│   ├── todoService.ts               # CRUD Async JSONPlaceholder (Sprint 07)
│   ├── TodoListScreen.tsx           # Layar Todo List Async
│   ├── AsyncDashboardScreen.tsx     # Demo Promise.all, allSettled, & serial
│   ├── SensorDashboardScreen.tsx    # Sensor Accelerometer, Gyroscope, Magnetometer
│   ├── HomeScreen.tsx               # Beranda RoomCheck
│   ├── RoomsScreen.tsx              # Manajemen & daftar kamar
│   ├── ReportsScreen.tsx            # Laporan kerusakan fasilitas
│   ├── HistoryScreen.tsx            # Riwayat pengecekan
│   ├── ChecklistScreen.tsx          # Form inspeksi kamar
│   ├── roomService.ts               # Integrasi API kamar & mock server
│   ├── config.ts                    # Konfigurasi URL API
│   ├── shared.tsx                   # Tipe data, tema warna, & data dummy
│   ├── apiError.ts                  # Standardisasi error handling
│   └── useSensors.ts                # Custom hook sensor perangkat
├── app.json                         # Konfigurasi perizinan GPS Android & iOS
├── package.json                     # Dependensi: expo-location, expo-sensors, dll.
├── tsconfig.json
├── index.ts
└── db.json                          # Database mock API json-server
```
