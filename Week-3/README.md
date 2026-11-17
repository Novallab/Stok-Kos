# RoomCheck - Week 3: Sprint 02 (Secure App, Authentication & Secure Storage)

## Deskripsi Sprint 02
Pada pertemuan ketiga (Week 3), mahasiswa mengimplementasikan autentikasi pengguna dan perlindungan data lokal sesuai ketentuan modul `week3.pdf`.

### Target Sprint 02:
1. **Alur Login & Register**: Form login dan registrasi akun petugas kos dengan validasi input yang ketat.
2. **Validasi Kredensial**: Pengecekan input kosong, format email, dan minimal panjang password.
3. **Penyimpanan Aman (Secure Storage)**: Menggunakan library `expo-secure-store` untuk menyimpan token autentikasi. Data sensitif seperti password **tidak disimpan** dalam format plain text.
4. **Pembedaan Data**:
   - Data normal: Preferensi tema, pengaturan filter kamar.
   - Data sensitif: Token autentikasi dan sesi login.
5. **Session Management & Logout**: Fitur logout yang menghapus seluruh token dan sesi dari SecureStore (`deleteItemAsync`).
6. **Security Validation (Testing Matrix)**:
   - Login dengan kredensial benar -> Masuk aplikasi.
   - Login dengan kredensial salah -> Menampilkan pesan error.
   - Input kosong -> Validasi error muncul.
   - Logout -> Sesi dibersihkan.
   - Data sensitif -> Terproteksi di Secure Storage.

### Akun Demo:
- **Email**: `admin@roomcheck.com`
- **Password**: `admin123` (atau kata sandi apapun dengan panjang >= 6 karakter)

### Cara Menjalankan:
```bash
cd RoomCheck/Week-3
npm install
npx expo start
```
