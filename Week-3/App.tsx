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
import { clearAllSession, getUserSession } from './src/authStorage';
import {
  C,
  HIST0,
  Inspection,
  REPORTS0,
  Report,
  Room,
  ROOMS,
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showSecTest, setShowSecTest] = useState(false);

  const [tab, setTab] = useState<Tab>('home');
  const [rooms, setRooms] = useState<Room[]>(ROOMS);
  const [reports, setReports] = useState<Report[]>(REPORTS0);
  const [history, setHistory] = useState<Inspection[]>(HIST0);
  const [detail, setDetail] = useState<Room | null>(null);
  const [checking, setChecking] = useState<Room | null>(null);

  // Periksa sesi dari Expo SecureStore saat aplikasi dimulai
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getUserSession();
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await clearAllSession();
    setIsAuthenticated(false);
    setCurrentUser(null);
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  // Jika belum login, tampilkan layar autentikasi (Sprint 02)
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={(email) => {
          setCurrentUser(email);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  let body: React.ReactNode;
  if (checking) {
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

      {/* Top Header Sprint 02: Status Akun Aman & Tombol Logout */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: C.line,
        }}
      >
        <View>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#16A34A' }}>
            🔒 Sesi Terproteksi
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.text }}>
            {currentUser}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => setShowSecTest(true)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 8,
              backgroundColor: '#EFF6FF',
              borderWidth: 1,
              borderColor: '#BFDBFE',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.primary }}>
              Uji Keamanan
            </Text>
          </Pressable>
          <Pressable
            onPress={handleLogout}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 8,
              backgroundColor: '#FEE2E2',
              borderWidth: 1,
              borderColor: '#FECACA',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>
              Keluar
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={{ flex: 1 }}>{body}</View>

      {!checking && (
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

      <SecurityTestingModal
        visible={showSecTest}
        onClose={() => setShowSecTest(false)}
        onForceLogout={handleLogout}
      />
    </View>
  );
}
