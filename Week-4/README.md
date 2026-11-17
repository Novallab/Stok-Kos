# RoomCheck - Week 4: Sprint 03 (Data Modeling & RESTful API)

## Deskripsi Sprint 03
Pada pertemuan keempat (Week 4), aplikasi beralih dari penyimpanan data statis lokal (dummy) menjadi **aplikasi dinamis yang terhubung ke RESTful API**, sesuai dengan materi pada modul `week4.pdf`.

### Target Sprint 03:
1. **Client-Server Architecture**: Memahami komunikasi HTTP Request & Response antara mobile app dan server REST API.
2. **Struktur Data JSON**: Menyiapkan dataset kamar (`db.json`) dengan properti lengkap (`id`, `nama_kamar`, `tipe`, `status`, `penghuni`, `created_at`, `updated_at`).
3. **DTO (Data Transfer Object) & Data Modeling**:
   - Mendefinisikan interface `RoomDTO` sesuai format data server.
   - Fungsi mapping (`mapRoom`) untuk menyaring hanya properti yang dibutuhkan oleh antarmuka pengguna (`Room`).
4. **Fetch API**: Menggunakan fungsi native JavaScript `fetch()` untuk mengambil data secara asinkron dari endpoint `GET /rooms`.
5. **Dynamic Mobile UI**: Antarmuka RoomCheck menampilkan daftar kamar real-time dari server.

### Cara Menjalankan:
#### 1. Menjalankan REST API Server
```bash
cd RoomCheck/Week-4
npm run api
```
*(Server REST API akan aktif di `http://<IP-Laptop>:3000/rooms`)*

#### 2. Menjalankan Aplikasi Mobile
Buka terminal baru:
```bash
cd RoomCheck/Week-4
npm install
npx expo start
```
