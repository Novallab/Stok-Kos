# RoomCheck - Week 7: Sprint 06 (Device Sensor — From API to Device Sensor)

## Deskripsi Sprint 06
Pada pertemuan ketujuh (Week 7), aplikasi RoomCheck dihubungkan dengan **sensor fisik perangkat** menggunakan `expo-sensors`, sesuai materi `week7.pdf`.

### Target Sprint 06:
1. **Mengenal Sensor Perangkat**: Accelerometer, Gyroscope, Magnetometer.
2. **Sensor API via expo-sensors**: Mengakses sensor melalui library yang menyediakan interface ke OS.
3. **Runtime Permission**: Menangani izin akses sensor (terutama BODY_SENSORS).
4. **Membaca Data Real-Time**: Subscribe ke listener, data ter-update berkelanjutan.
5. **Mengolah Data Sensor**: Menginterpretasikan nilai X/Y/Z menjadi informasi bermakna (arah kompas, status gerakan).
6. **Menampilkan di UI**: Tab "Sensor" baru dengan dashboard data sensor yang informatif.

### Alur Sensor API:
```
Aplikasi RoomCheck
     ↓ (import dari expo-sensors)
Sensor API / Library
     ↓ (memanggil OS)
Android / iOS Operating System
     ↓ (membaca hardware)
Device Sensor Fisik (Accelerometer, Gyroscope, Magnetometer)
     ↓ (data numerik X, Y, Z)
Sensor Data real-time
     ↓ (tampil di UI)
Tab "Sensor" di RoomCheck
```

### Fitur Baru (Tab Sensor):
- **🏃 Accelerometer**: Baca gerakan X/Y/Z + interpretasi status (Diam, Getaran, Gerakan Aktif)
- **🔄 Gyroscope**: Baca rotasi pitch/roll/yaw dalam rad/s
- **🧲 Magnetometer**: Baca medan magnet + hitung arah kompas (°)
- **Status Sensor**: Indikator hijau/kuning/merah per sensor

### Cara Menjalankan:
```bash
# Terminal 1: Server API
cd RoomCheck/Week-7
npm run api

# Terminal 2: Aplikasi
npm install
npx expo start
```

> **Catatan**: Sensor hardware hanya berfungsi pada perangkat fisik (tidak di emulator). Buka tab "📡 Sensor" untuk melihat data real-time.
