import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StatusBar,
  Text,
  View,
} from 'react-native';
import ChecklistScreen, { Result } from './src/ChecklistScreen';
import HistoryScreen from './src/HistoryScreen';
import HomeScreen from './src/HomeScreen';
import ReportsScreen from './src/ReportsScreen';
import { RoomDetail, RoomsScreen } from './src/RoomsScreen';
import { fetchRooms } from './src/roomService';
import {
  Btn,
  C,
  HIST0,
  Inspection,
  REPORTS0,
  Report,
  Room,
  RoomStatus,
  s,
} from './src/shared';

type Tab = 'home' | 'rooms' | 'reports' | 'history';
const TABS: [Tab, string][] = [
  ['home', 'Beranda'],
  ['rooms', 'Kamar'],
  ['reports', 'Laporan'],
  ['history', 'Riwayat'],
];

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reports, setReports] = useState<Report[]>(REPORTS0);
  const [history, setHistory] = useState<Inspection[]>(HIST0);
  const [detail, setDetail] = useState<Room | null>(null);
  const [checking, setChecking] = useState<Room | null>(null);

  // Mengambil data kamar dari REST API (Sprint 03)
  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRooms();
      setRooms(data);
    } catch (e: any) {
      setError(e?.message ?? 'Gagal mengambil data dari REST API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const save = (res: Result) => {
    if (!checking) return;
    const now = new Date();
    const date = now.toLocaleString('id-ID');
    const bad = Object.entries(res.states).filter(([, v]) => v === 'Rusak').map(([k]) => k);
    const warn = Object.entries(res.states).filter(([, v]) => v !== 'Baik').length;
    let status: RoomStatus = checking.status;
    if (bad.length) status = 'Rusak';
    else if (res.states['Kebersihan'] !== 'Baik') status = 'Perlu Dibersihkan';
    else if (res.type === 'Check-out') status = 'Kosong';
    else if (res.type === 'Check-in') status = 'Terisi';

    setRooms(rooms.map((r) => (r.id === checking.id ? { ...r, status } : r)));
    setHistory([
      {
        id: String(now.getTime()),
        roomNo: checking.no,
        type: res.type,
        date,
        note: res.note || (warn ? `${warn} item perlu perhatian` : 'Semua item baik'),
      },
      ...history,
    ]);
    setReports([
      ...bad.map(
        (b, i): Report => ({
          id: `${now.getTime()}${i}`,
          roomNo: checking.no,
          desc: `${b} rusak (dari inspeksi)`,
          priority: 'Sedang',
          status: 'Baru',
          date: now.toLocaleDateString('id-ID'),
        })
      ),
      ...reports,
    ]);
    setChecking(null);
    setDetail(null);
    setTab('history');
  };

  let body: React.ReactNode;
  if (loading) {
    body = (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={s.p}>Menghubungkan ke REST API & memuat data...</Text>
      </View>
    );
  } else if (error) {
    body = (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={s.h1}>Koneksi API Gagal</Text>
        <Text style={[s.p, { marginTop: 8 }]}>{error}</Text>
        <Text style={[s.p, { marginTop: 8 }]}>
          Pastikan server json-server aktif (`npm run api`) dan IP di src/config.ts sudah sesuai.
        </Text>
        <Btn label="Coba Lagi" onPress={loadRooms} />
      </View>
    );
  } else if (checking) {
    body = (
      <ChecklistScreen
        room={checking}
        onCancel={() => setChecking(null)}
        onSave={save}
      />
    );
  } else if (detail) {
    body = (
      <RoomDetail
        room={rooms.find((r) => r.id === detail.id) ?? detail}
        history={history}
        onBack={() => setDetail(null)}
        onStart={() => setChecking(detail)}
      />
    );
  } else if (tab === 'home') {
    body = (
      <HomeScreen
        rooms={rooms}
        history={history}
        go={(t) => setTab(t)}
        onScan={() =>
          Alert.alert(
            'Scan QR',
            'Pemindai QR (expo-camera) akan ditambahkan di tahap berikutnya.'
          )
        }
      />
    );
  } else if (tab === 'rooms') {
    body = <RoomsScreen rooms={rooms} onOpen={setDetail} />;
  } else if (tab === 'reports') {
    body = (
      <ReportsScreen
        reports={reports}
        rooms={rooms}
        onAdd={(r) => setReports([r, ...reports])}
      />
    );
  } else {
    body = <HistoryScreen history={history} />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.bg,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 50,
      }}
    >
      <StatusBar barStyle="dark-content" />

      {/* Top Banner Status API Dinamis (Sprint 03) */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: '#0F172A',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: '#E2E8F0', fontSize: 12, fontWeight: '700' }}>
          🌐 Sprint 03: RESTful API Connected
        </Text>
        <Text style={{ color: '#93C5FD', fontSize: 12 }}>
          {rooms.length} Kamar Dimuat
        </Text>
      </View>

      <View style={{ flex: 1 }}>{body}</View>

      {!checking && !loading && !error && (
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderColor: C.line,
          }}
        >
          {TABS.map(([k, label]) => (
            <Pressable
              key={k}
              onPress={() => {
                setTab(k);
                setDetail(null);
              }}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: tab === k }}
              style={{
                flex: 1,
                minHeight: 56,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontWeight: tab === k ? '800' : '500',
                  color: tab === k ? C.primary : C.muted,
                  fontSize: 14,
                }}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
