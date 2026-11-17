# RoomCheck - Week 2: Sprint 01 (Mobile Interface, Responsive & Inclusive UI)

## Deskripsi Sprint 01
Pada pertemuan kedua (Week 2), fokus utama adalah membangun antarmuka pengguna (Mobile UI) aplikasi **RoomCheck** yang adaptif, responsif, dan menerapkan prinsip **Inclusive Design & Accessibility** sesuai panduan `week2.pdf`.

### Checklist Sprint 01:
- [x] **React Native Components**: Memanfaatkan komponen inti (`View`, `Text`, `Pressable`, `ScrollView`, `StyleSheet`).
- [x] **Flexbox Layout**: Tata letak fleksibel untuk kartu informasi kondisi kamar dan tombol aksi.
- [x] **Responsive Layout**: Tampilan tetap proporsional pada berbagai ukuran layar ponsel dan orientasi.
- [x] **Inclusive Design & Accessibility**:
  - `accessible={true}` pada elemen interaktif.
  - `accessibilityLabel` yang jelas untuk screen reader.
  - `accessibilityRole` (`header`, `button`, `tab`).
  - `accessibilityHint` memberikan konteks fungsi tombol.
  - Target sentuh memenuhi standar minimum (minimal 44–48dp).
  - Kontras warna yang nyaman dibaca sesuai standar WCAG.
- [x] **Tab Navigation**: Beranda, Kamar, Laporan Kerusakan, dan Riwayat Inspeksi.

### Cara Menjalankan:
```bash
cd RoomCheck/Week-2
npm install
npx expo start
```
