import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { ApiErrorInfo, parseError } from './src/apiError';
import ApiStateView from './src/ApiStateView';
import ChecklistScreen from './src/ChecklistScreen';
import DemoSwitcher from './src/DemoSwitcher';
import HistoryScreen from './src/HistoryScreen';
import HomeScreen from './src/HomeScreen';
import ReportsScreen from './src/ReportsScreen';
import { RoomDetail, RoomsScreen } from './src/RoomsScreen';
import SensorDashboardScreen from './src/SensorDashboardScreen';
import AsyncDashboardScreen from './src/AsyncDashboardScreen';
import TodoListScreen from './src/TodoListScreen';
import LbsDashboardScreen from './src/LbsDashboardScreen';
import { DemoSimulationMode, fetchRooms } from './src/roomService';
import {
  C,
  HIST0,
  Inspection,
  REPORTS0,
  Report,
  Room,
  RoomStatus,
} from './src/shared';

type Tab =
  | 'home'
  | 'rooms'
  | 'reports'
  | 'history'
  | 'lbs'
  | 'sensor'
  | 'async'
  | 'todo';

const TABS: [Tab, string, string][] = [
  ['home', 'Beranda', '🏠'],
  ['rooms', 'Kamar', '🚪'],
  ['reports', 'Laporan', '📋'],
  ['history', 'Riwayat', '📅'],
  ['lbs', 'Lokasi', '📍'],
  ['sensor', 'Sensor', '📡'],
  ['async', 'Async', '⚡'],
  ['todo', 'Todo', '✅'],
];

export default function App() {
  const [tab, setTab] = useState<Tab>('lbs'); // Langsung buka tab Lokasi untuk Week 10
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorInfo, setErrorInfo] = useState<ApiErrorInfo | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [simulationMode, setSimulationMode] = useState<DemoSimulationMode>('normal');

  const [reports, setReports] = useState<Report[]>(REPORTS0);
  const [history, setHistory] = useState<Inspection[]>(HIST0);
  const [detail, setDetail] = useState<Room | null>(null);
  const [checking, setChecking] = useState<Room | null>(null);

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
        setErrorInfo(parseError(err));
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
  }, [loadRooms]);

  const handleSelectSimulationMode = (mode: DemoSimulationMode) => {
    setSimulationMode(mode);
    loadRooms(mode);
  };

  const save = (res: { type: string; states: Record<string, any>; photos: Record<string, string>; note: string }) => {
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

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

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
  } else if (tab === 'lbs') {
    body = <LbsDashboardScreen />;
  } else if (tab === 'todo') {
    body = <TodoListScreen />;
  } else if (tab === 'async') {
    body = <AsyncDashboardScreen />;
  } else if (tab === 'sensor') {
    body = <SensorDashboardScreen />;
  } else if (tab === 'home') {
    body = (
      <HomeScreen
        rooms={rooms}
        loading={loading}
        errorInfo={errorInfo}
        isRetrying={isRetrying}
        onRetry={() => loadRooms()}
        history={history}
        go={(t) => setTab(t as Tab)}
        onScan={() => showAlert('Scan QR', 'Akan ditambahkan di tahap berikutnya.')}
      />
    );
  } else if (tab === 'rooms') {
    body = (
      <RoomsScreen
        rooms={rooms}
        loading={loading}
        errorInfo={errorInfo}
        isRetrying={isRetrying}
        onRetry={() => loadRooms()}
        onOpen={setDetail}
      />
    );
  } else if (tab === 'reports') {
    body = <ReportsScreen reports={reports} rooms={rooms} onAdd={(r) => setReports([r, ...reports])} />;
  } else {
    body = <HistoryScreen history={history} />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.bg,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : Platform.OS === 'ios' ? 50 : 0,
      }}
    >
      <StatusBar barStyle="dark-content" />

      {!checking && tab !== 'async' && tab !== 'todo' && tab !== 'lbs' && (
        <DemoSwitcher currentMode={simulationMode} onSelectMode={handleSelectSimulationMode} />
      )}

      <View style={{ flex: 1 }}>{body}</View>

      {!checking && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            maxHeight: 58,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderColor: C.line,
          }}
          contentContainerStyle={{
            flexDirection: 'row',
            alignItems: 'center',
            minWidth: '100%',
          }}
        >
          {TABS.map(([k, label, icon]) => (
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
                paddingHorizontal: 12,
                minHeight: 56,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                borderTopWidth: tab === k ? 2 : 0,
                borderTopColor: C.primary,
              }}
            >
              <Text style={{ fontSize: 16 }}>{icon}</Text>
              <Text
                style={{
                  fontWeight: tab === k ? '800' : '500',
                  color: tab === k ? C.primary : C.muted,
                  fontSize: 10,
                }}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
