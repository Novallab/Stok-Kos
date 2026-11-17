# RoomCheck - Week 5: Sprint 04 (From API to Secure API — JWT Authentication)

## Deskripsi Sprint 04
Pada pertemuan kelima (Week 5), aplikasi menerapkan keamanan akses API menggunakan **token-based authentication (JWT / Bearer Token)**, sesuai materi `week5.pptx`.

### Target Sprint 04:
1. **Login via API** → POST ke `/login`, terima `access_token` (JWT).
2. **Simpan Token** → Token disimpan di `expo-secure-store` (terenkripsi).
3. **Authorization Header** → Setiap request ke `/rooms` menyertakan header `Authorization: Bearer <token>`.
4. **Protected Endpoint** → Data hanya dikembalikan jika token valid.
5. **Logout & Session Cleared** → Token dihapus dari SecureStore saat keluar.

### Alur Sprint 04:
```
User Login → POST /login → Terima JWT Token
     ↓
Simpan Token di SecureStore (terenkripsi)
     ↓
Aplikasi fetch GET /rooms dengan Authorization: Bearer <token>
     ↓
Server validasi token → Kirim data kamar
     ↓
UI menampilkan daftar kamar real-time
```

### Cara Menjalankan:
```bash
# Terminal 1: Jalankan server
cd RoomCheck/Week-5
npm run api

# Terminal 2: Jalankan aplikasi
npm install
npx expo start
```

**Demo Login:**
- Email: `admin@roomcheck.com`
- Password: `admin123`
