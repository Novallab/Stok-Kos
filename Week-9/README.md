# RoomCheck — Week 9: Sprint 07

## Multi-Threading & Komputasi Asinkron di React Native

> **Topik**: Async/Await, Promise.all, Promise.allSettled, useEffect + AbortController, Tri-State Pattern, CRUD API Async

---

## Fitur Baru Week 9

### Tab ⚡ Async Dashboard
- Demonstrasi **Promise.all** (paralel, all-or-nothing)
- Demonstrasi **Promise.allSettled** (paralel, toleran error)
- Perbandingan **serial** vs **paralel** eksekusi
- Visualisasi progress task real-time
- **AbortController** untuk membatalkan request
- Log eksekusi dengan timestamp

### Tab ✅ Todo List (Penugasan Praktik)
- **GET** daftar todo dari JSONPlaceholder API (`/todos?_limit=10`)
- **POST** menambahkan todo baru
- **PATCH** toggle status selesai/belum
- **Tri-State**: loading spinner / data list / error message
- **Optimistic update**: UI langsung berubah sebelum server merespons
- **Refresh** dengan pull-to-refresh
- **AbortController** cleanup saat unmount

### Peningkatan HomeScreen
- Memuat data kamar dengan async/await yang bersih
- AbortController untuk mencegah memory leak

---

## Konsep yang Dipelajari

### 1. async/await + try/catch
```ts
const fetchData = async () => {
  setLoading(true);
  try {
    const res = await fetch(url);
    const data = await res.json();
    setData(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 2. useEffect untuk Async
```ts
useEffect(() => {
  const ctrl = new AbortController();
  const fetchAsync = async () => {
    const data = await fetch(url, { signal: ctrl.signal });
    // ...
  };
  fetchAsync();
  return () => ctrl.abort(); // Cleanup saat unmount
}, []); // [] → jalankan 1x saat mount
```

### 3. Promise.all (Paralel)
```ts
// Semua request dikirim serentak → lebih cepat
const [rooms, reports, history] = await Promise.all([
  fetchRooms(),
  fetchReports(),
  fetchHistory(),
]);
```

### 4. Promise.allSettled (Toleran Error)
```ts
// Semua request jalan, meski ada yang gagal
const results = await Promise.allSettled([fetchA(), fetchB(), fetchC()]);
results.forEach(r => {
  if (r.status === 'fulfilled') console.log(r.value);
  else console.log('Gagal:', r.reason);
});
```

### 5. Tri-State Pattern
```ts
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

if (loading) return <ActivityIndicator />;
if (error)   return <Text>Gagal: {error}</Text>;
return <FlatList data={data} />;
```

---

## Cara Menjalankan

```bash
# Install dependencies
npm install

# Jalankan Expo dev server
npx expo start

# (Opsional) Jalankan mock API lokal
npm run api
```

> **Todo List** menggunakan [JSONPlaceholder](https://jsonplaceholder.typicode.com) — API publik gratis, tidak perlu server lokal.

---

## Struktur Project

```
Week-9/
├── App.tsx                          # Entry point, 7 tab navigation
├── src/
│   ├── todoService.ts               # 🆕 GET/POST/PATCH ke JSONPlaceholder
│   ├── TodoListScreen.tsx           # 🆕 Layar Todo List (penugasan praktik)
│   ├── AsyncDashboardScreen.tsx     # 🆕 Demo Promise.all/allSettled/serial
│   ├── roomService.ts               # Fetch kamar (async/await + error handling)
│   ├── authService.ts               # Auth async
│   ├── authStorage.ts               # SecureStore async
│   ├── SensorDashboardScreen.tsx    # (dari Week 7) Sensor tab
│   ├── HomeScreen.tsx               # Beranda
│   ├── RoomsScreen.tsx              # Daftar kamar
│   ├── ReportsScreen.tsx            # Laporan
│   ├── HistoryScreen.tsx            # Riwayat
│   ├── LoginScreen.tsx              # Auth UI
│   ├── ApiStateView.tsx             # Komponen loading/error
│   ├── DemoSwitcher.tsx             # Demo error simulation
│   ├── config.ts                    # API_URL config
│   ├── shared.tsx                   # Data & tipe bersama
│   ├── apiError.ts                  # ApiError class
│   └── useSensors.ts                # Custom hook sensor
├── db.json                          # Mock data (json-server)
├── package.json
├── app.json
├── tsconfig.json
└── index.ts
```

---

## Progres Sprint

| Sprint | Week | Topik |
|--------|------|-------|
| 00 | 1 | Setup Dasar — Expo + TypeScript |
| 01 | 2 | Mobile UI, Responsive & Inclusive Design |
| 02 | 3 | Authentication & Secure Storage |
| 03 | 4 | Data Modeling & RESTful API |
| 04 | 5 | Secure API (JWT/Bearer Token) |
| 05 | 6 | Error Handling & Offline Reliability |
| 06 | 7 | Device Sensor (Accelerometer, Gyroscope) |
| **07** | **9** | **Multi-Threading & Komputasi Asinkron** ← sekarang |
