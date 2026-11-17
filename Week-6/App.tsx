import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { ApiErrorInfo, parseError } from './src/apiError';
import ChecklistScreen, { Result } from './src/ChecklistScreen';
import DemoSwitcher from './src/DemoSwitcher';
import HistoryScreen from './src/HistoryScreen';
import HomeScreen from './src/HomeScreen';
import ReportsScreen from './src/ReportsScreen';
import { RoomDetail, RoomsScreen } from './src/RoomsScreen';
import { DemoSimulationMode, fetchRooms } from './src/roomService';
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
  const [errorInfo, setErrorInfo] = useState<ApiErrorInfo | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [simulationMode, setSimulationMode] = useState<DemoSimulationMode>('normal');

  const [reports, setReports] = useState<Report[]>(REPORTS0);
  const [history, setHistory] = useState<Inspection[]>(HIST0);
  const [detail, setDetail] = useState<Room | null>(null);
  const [checking, setChecking] = useState<Room | null>(null);

  // Ambil data kamar dari REST API dengan error handling lengkap Sprint 05
  const loadRooms = useCallback(
    async (modeToUse?: DemoSimulationMode) => {
      const mode = modeToUse ?? simulationMode;
      setLoading(true);
      setErrorInfo(null);
      setIsRetrying(true);

      try {
        const data = await fetchRooms(mode);
        setRooms(data);
        setErrorInfo(null);
      } catch (err: unknown) {
        const parsed = parseError(err);
        setErrorInfo(parsed);
        // Sesuai checklist Slide 9: "Data tidak ditampilkan ketika request gagal"
        setRooms([]);
      } finally {
        setLoading(false);
        setIsRetrying(false);
      }
    },
    [simulationMode]
  );

  useEffect(() => {
    loadRooms('normal');
  }, []);

  const handleSelectSimulationMode = (mode: DemoSimulationMode) => {
    setSimulationMode(mode);
    loadRooms(mode);
  };

  const handleRetry = () => {
    // Skenario 2 Slide 12: Jika sedang dalam simulasi offline dan tombol retry ditekan,
    // mahasiswa dapat mencoba lagi atau kembali ke mode normal jika diinginkan.
    loadRooms();
  };

  const save = (res: Result) => {
    if (!checking) return;
    const now = new Date();
    const date = now.toLocaleString('id-ID');
    const bad = Object.entries(res.states)
      .filter(([, v]) => v === 'Rusak')
      .map(([k]) => k);
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
        loading={loading}
        errorInfo={errorInfo}
        isRetrying={isRetrying}
        onRetry={handleRetry}
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
    body = (
      <RoomsScreen
        rooms={rooms}
        loading={loading}
        errorInfo={errorInfo}
        isRetrying={isRetrying}
        onRetry={handleRetry}
        onOpen={setDetail}
      />
    );
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
        paddingTop:
          Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 50,
      }}
    >
      <StatusBar barStyle="dark-content" />

      {/* Demo Switcher Bar untuk demonstrasi Sprint 05 Week 6 */}
      {!checking && (
        <DemoSwitcher
          currentMode={simulationMode}
          onSelectMode={handleSelectSimulationMode}
        />
      )}

      {/* Main Content Area */}
      <View style={{ flex: 1 }}>{body}</View>

      {/* Bottom Tabs Navigation: tetap tampil sesuai standar UX Slide 5, 8, 9, 10, 11 */}
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
    </View>
  );
}
