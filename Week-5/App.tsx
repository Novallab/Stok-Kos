import React, { useEffect, useState } from 'react';
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
import LoginScreen from './src/LoginScreen';
import ReportsScreen from './src/ReportsScreen';
import { RoomDetail, RoomsScreen } from './src/RoomsScreen';
import SecurityTestingModal from './src/SecurityTestingModal';
import { login, logout } from './src/authService';
import { getToken, getUserSession } from './src/authStorage';
import {
  C,
  HIST0,
  Inspection,
  REPORTS0,
  Report,
  Room,
  RoomStatus,
} from './src/shared';
import { fetchRooms } from './src/roomService';

type Tab = 'home' | 'rooms' | 'reports' | 'history';
const TABS: [Tab, string][] = [
  ['home', 'Beranda'],
  ['rooms', 'Kamar'],
  ['reports', 'Laporan'],
  ['history', 'Riwayat'],
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showSecTest, setShowSecTest] = useState(false);

  // API state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>('home');
  const [reports, setReports] = useState<Report[]>(REPORTS0);
  const [history, setHistory] = useState<Inspection[]>(HIST0);
  const [detail, setDetail] = useState<Room | null>(null);
  const [checking, setChecking] = useState<Room | null>(null);

  // Periksa sesi tersimpan saat boot
  useEffect(() => {
    (async () => {
      const token = await getToken();
      const user = await getUserSession();
      if (token && user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    })();
  }, []);

  // Muat data kamar dengan Authorization header (Sprint 04: Secure Request)
  const loadRooms = async () => {
    setLoadingRooms(true);
    setApiError(null);
    try {
      const data = await fetchRooms();
      setRooms(data);
    } catch (e: any) {
      setApiError(e?.message ?? 'Gagal mengambil data kamar.');
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadRooms();
  }, [isAuthenticated]);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    setCurrentUser(email);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setRooms([]);
  };

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

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLogin} />;
  }

  let body: React.ReactNode;
  if (checking) {
    body = <ChecklistScreen room={checking} onCancel={() => setChecking(null)} onSave={save} />;
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
        onScan={() => Alert.alert('Scan QR', 'Akan ditambahkan di tahap berikutnya.')}
      />
    );
  } else if (tab === 'rooms') {
    body = <RoomsScreen rooms={rooms} onOpen={setDetail} />;
  } else if (tab === 'reports') {
    body = <ReportsScreen reports={reports} rooms={rooms} onAdd={(r) => setReports([r, ...reports])} />;
  } else {
    body = <HistoryScreen history={history} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 50 }}>
      <StatusBar barStyle="dark-content" />

      {/* Header: Status Sesi Aman (Sprint 04) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: C.line }}>
        <View>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#16A34A' }}>🔒 Bearer Token Aktif</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.text }}>{currentUser}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={() => setShowSecTest(true)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.primary }}>Uji Keamanan</Text>
          </Pressable>
          <Pressable onPress={handleLogout} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FECACA' }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>Keluar</Text>
          </Pressable>
        </View>
      </View>

      {/* API Status banner */}
      {loadingRooms && (
        <View style={{ backgroundColor: '#EFF6FF', padding: 8, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: C.primary }}>⏳ Mengambil data dari REST API dengan Authorization...</Text>
        </View>
      )}
      {apiError && (
        <View style={{ backgroundColor: '#FEF3C7', padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 }}>
          <Text style={{ fontSize: 12, color: '#92400E', flex: 1 }}>⚠️ {apiError}</Text>
          <Pressable onPress={loadRooms}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#D97706' }}>Retry</Text>
          </Pressable>
        </View>
      )}

      <View style={{ flex: 1 }}>{body}</View>

      {!checking && (
        <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: C.line }}>
          {TABS.map(([k, label]) => (
            <Pressable key={k} onPress={() => { setTab(k); setDetail(null); }} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: tab === k }} style={{ flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontWeight: tab === k ? '800' : '500', color: tab === k ? C.primary : C.muted, fontSize: 14 }}>{label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <SecurityTestingModal visible={showSecTest} onClose={() => setShowSecTest(false)} onForceLogout={handleLogout} />
    </View>
  );
}
