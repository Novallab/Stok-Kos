# RoomCheck - Week 6: Sprint 05 (Error Handling & Offline: Reliable API)

## Deskripsi Sprint 05
Pada pertemuan keenam (Week 6), aplikasi RoomCheck diperkuat dengan **penanganan error lengkap** dan **offline handling** sesuai materi `week6.pdf`.

### Target Sprint 05:
1. **Loading State** → Indikator saat data sedang dimuat dari API.
2. **Success State (2xx)** → Menampilkan daftar kamar + Pull-to-Refresh.
3. **Client Error (4xx)** → Penanganan 404, 401, 403 dengan pesan informatif.
4. **Server Error (5xx)** → Penanganan 500, 503 dengan pesan gangguan server.
5. **Timeout Handling** → AbortController 10 detik, tampilkan pesan waktu habis.
6. **Offline / Network Error** → Menangkap kegagalan jaringan, tampilkan icon & pesan offline.
7. **Empty State** → Tampilan khusus jika data kamar kosong.
8. **Retry Mechanism** → Tombol "🔄 Coba Lagi" merah di semua kondisi error.
9. **Data Protection** → Data lama tidak tampil saat request gagal (mencegah data stale).
10. **Demo Switcher** → Toolbar khusus untuk demo semua skenario error Sprint 05.

### State Diagram:
```
Idle
 ↓ loadRooms()
Loading (ActivityIndicator)
 ↓ fetch berhasil
Success → Tampilkan daftar kamar
 ↓ fetch gagal
 ├── Offline → Pesan "Tidak ada koneksi"
 ├── Timeout → Pesan "Waktu habis"
 ├── 4xx → Pesan Client Error
 └── 5xx → Pesan Server Error
      ↓ Tekan "Coba Lagi"
     Loading → ...
```

### Cara Menjalankan:
```bash
# Terminal 1: Server API
cd RoomCheck/Week-6
npm run api

# Terminal 2: Aplikasi
npm install
npx expo start
```
Gunakan **Demo Switcher** di bagian atas aplikasi untuk mensimulasikan berbagai kondisi error.
