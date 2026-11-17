/**
 * AsyncDashboardScreen.tsx — Week 9 (Sprint 07: Async & Multi-Threading)
 *
 * Layar Dashboard Asinkron yang mendemonstrasikan:
 * 1. Promise.all — eksekusi paralel (lebih cepat)
 * 2. Promise.allSettled — paralel toleran error
 * 3. Perbandingan serial vs paralel (visualisasi waktu)
 * 4. Progress bar untuk setiap task
 * 5. AbortController untuk pembatalan request
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ROOMS } from './shared';

// ── Tipe untuk task async ──
type TaskStatus = 'idle' | 'loading' | 'success' | 'error';

type AsyncTask = {
  id: string;
  label: string;
  endpoint: string;
  status: TaskStatus;
  duration: number; // ms
  result: string;
};

const INITIAL_TASKS: AsyncTask[] = [
  {
    id: 'rooms',
    label: '🏠 Data Kamar',
    endpoint: '/rooms',
    status: 'idle',
    duration: 0,
    result: '',
  },
  {
    id: 'reports',
    label: '📊 Laporan',
    endpoint: '/reports',
    status: 'idle',
    duration: 0,
    result: '',
  },
  {
    id: 'history',
    label: '📜 Riwayat',
    endpoint: '/history',
    status: 'idle',
    duration: 0,
    result: '',
  },
  {
    id: 'users',
    label: '👤 Pengguna',
    endpoint: '/users',
    status: 'idle',
    duration: 0,
    result: '',
  },
];

/** Simulasi fetch async dengan delay acak (meniru kondisi jaringan nyata) */
async function simulateFetch(
  endpoint: string,
  signal: AbortSignal,
  shouldFail = false
): Promise<string> {
  // Delay acak 400ms – 1200ms
  const delay = 400 + Math.random() * 800;
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, delay);
    signal.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('Dibatalkan', 'AbortError'));
    });
  });

  if (shouldFail) {
    throw new Error(`Gagal mengambil ${endpoint} (simulasi error)`);
  }

  // Data simulasi berdasarkan endpoint
  const mockData: Record<string, string> = {
    '/rooms': `${ROOMS.length} kamar ditemukan`,
    '/reports': '12 laporan bulan ini',
    '/history': '48 riwayat pembersihan',
    '/users': '3 pengguna aktif',
  };
  return mockData[endpoint] ?? 'Data berhasil dimuat';
}

export default function AsyncDashboardScreen() {
  const [tasks, setTasks] = useState<AsyncTask[]>(INITIAL_TASKS);
  const [mode, setMode] = useState<'idle' | 'parallel' | 'serial' | 'settled'>(
    'idle'
  );
  const [totalDuration, setTotalDuration] = useState(0);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const abortRef = useRef<AbortController | null>(null);

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setLog((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 14)]);
  }, []);

  const resetTasks = () => {
    setTasks(INITIAL_TASKS.map((t) => ({ ...t, status: 'idle', duration: 0, result: '' })));
    setTotalDuration(0);
    setLog([]);
  };

  const updateTask = (id: string, patch: Partial<AsyncTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  };

  /** ── Mode 1: Promise.all — Paralel (All-or-Nothing) ── */
  const runParallel = async () => {
    resetTasks();
    setMode('parallel');
    setRunning(true);
    addLog('▶ Memulai Promise.all (paralel)...');

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    // Set semua task ke loading
    setTasks((prev) => prev.map((t) => ({ ...t, status: 'loading' })));

    const start = Date.now();
    try {
      // Promise.all — semua request dikirim serentak
      const results = await Promise.all(
        INITIAL_TASKS.map((task) =>
          simulateFetch(task.endpoint, signal).then((result) => {
            const dur = Date.now() - start;
            updateTask(task.id, { status: 'success', result, duration: dur });
            addLog(`✅ ${task.label} selesai (${dur}ms)`);
            return result;
          })
        )
      );
      const total = Date.now() - start;
      setTotalDuration(total);
      addLog(`🏁 Promise.all selesai! Total: ${total}ms (${results.length} task)`);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        addLog('⛔ Dibatalkan oleh pengguna');
      } else {
        addLog(`💥 Promise.all GAGAL: ${err?.message}`);
        setTasks((prev) =>
          prev.map((t) =>
            t.status === 'loading' ? { ...t, status: 'error', result: 'Dibatalkan karena ada yang gagal' } : t
          )
        );
      }
    } finally {
      setRunning(false);
    }
  };

  /** ── Mode 2: Serial (Sequential) ── */
  const runSerial = async () => {
    resetTasks();
    setMode('serial');
    setRunning(true);
    addLog('▶ Memulai eksekusi serial (berurutan)...');

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    const start = Date.now();
    try {
      for (const task of INITIAL_TASKS) {
        if (signal.aborted) break;
        updateTask(task.id, { status: 'loading' });
        addLog(`⏳ Mengambil ${task.label}...`);

        const result = await simulateFetch(task.endpoint, signal);
        const dur = Date.now() - start;
        updateTask(task.id, { status: 'success', result, duration: dur });
        addLog(`✅ ${task.label} selesai (${dur}ms)`);
      }
      const total = Date.now() - start;
      setTotalDuration(total);
      addLog(`🏁 Serial selesai! Total: ${total}ms`);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        addLog('⛔ Dibatalkan oleh pengguna');
      } else {
        addLog(`💥 Error: ${err?.message}`);
      }
    } finally {
      setRunning(false);
    }
  };

  /** ── Mode 3: Promise.allSettled — Paralel Toleran Error ── */
  const runAllSettled = async () => {
    resetTasks();
    setMode('settled');
    setRunning(true);
    addLog('▶ Memulai Promise.allSettled (toleran error)...');

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setTasks((prev) => prev.map((t) => ({ ...t, status: 'loading' })));

    const start = Date.now();
    // Task ke-2 (reports) sengaja dibuat gagal untuk demo
    const results = await Promise.allSettled(
      INITIAL_TASKS.map((task, idx) =>
        simulateFetch(task.endpoint, signal, idx === 1 /* reports gagal */)
      )
    );

    const total = Date.now() - start;
    setTotalDuration(total);

    results.forEach((result, idx) => {
      const task = INITIAL_TASKS[idx];
      if (result.status === 'fulfilled') {
        updateTask(task.id, {
          status: 'success',
          result: result.value,
          duration: total,
        });
        addLog(`✅ ${task.label}: ${result.value}`);
      } else {
        updateTask(task.id, {
          status: 'error',
          result: result.reason?.message ?? 'Error',
          duration: total,
        });
        addLog(`❌ ${task.label}: ${result.reason?.message}`);
      }
    });

    addLog(`🏁 allSettled selesai! Total: ${total}ms (tidak ada yang crash)`);
    setRunning(false);
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    addLog('⛔ Membatalkan semua request...');
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'loading': return '#f59e0b';
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#d1d5db';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'loading': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⬜';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7c3aed" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ Async Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Sprint 07 · Multi-Threading & Promise
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Tombol Aksi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pilih Mode Eksekusi</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.modeBtn, styles.modeBtnParallel, running && styles.btnDisabled]}
              onPress={runParallel}
              disabled={running}
            >
              <Text style={styles.modeBtnText}>⚡ Promise.all{'\n'}(Paralel)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, styles.modeBtnSerial, running && styles.btnDisabled]}
              onPress={runSerial}
              disabled={running}
            >
              <Text style={styles.modeBtnText}>➡️ Serial{'\n'}(Berurutan)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, styles.modeBtnSettled, running && styles.btnDisabled]}
              onPress={runAllSettled}
              disabled={running}
            >
              <Text style={styles.modeBtnText}>🛡️ allSettled{'\n'}(Toleran Error)</Text>
            </TouchableOpacity>
          </View>
          {running && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>⛔ Batalkan</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Status Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Task</Text>
          {tasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskLabel}>{task.label}</Text>
                <View style={[styles.taskBadge, { backgroundColor: getStatusColor(task.status) }]}>
                  {task.status === 'loading' ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.taskBadgeText}>
                      {getStatusIcon(task.status)} {task.status}
                    </Text>
                  )}
                </View>
              </View>
              <Text style={styles.taskEndpoint}>{task.endpoint}</Text>
              {task.result !== '' && (
                <Text style={[styles.taskResult, task.status === 'error' && { color: '#ef4444' }]}>
                  {task.result}
                </Text>
              )}
              {task.duration > 0 && (
                <Text style={styles.taskDuration}>⏱ {task.duration}ms</Text>
              )}
            </View>
          ))}
        </View>

        {/* Ringkasan */}
        {totalDuration > 0 && (
          <View style={[styles.section, styles.summaryCard]}>
            <Text style={styles.summaryTitle}>📊 Hasil</Text>
            <Text style={styles.summaryMode}>
              Mode: {mode === 'parallel' ? '⚡ Promise.all (Paralel)' : mode === 'serial' ? '➡️ Serial' : '🛡️ Promise.allSettled'}
            </Text>
            <Text style={styles.summaryDuration}>
              Total waktu: <Text style={styles.summaryDurationBold}>{totalDuration}ms</Text>
            </Text>
            {mode === 'parallel' || mode === 'settled' ? (
              <Text style={styles.summaryNote}>
                ✅ Semua request dikirim serentak — lebih cepat dari serial!
              </Text>
            ) : (
              <Text style={styles.summaryNote}>
                ⚠️ Request dikirim satu per satu — lebih lambat dari paralel.
              </Text>
            )}
          </View>
        )}

        {/* Log */}
        {log.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Log Eksekusi</Text>
            <View style={styles.logContainer}>
              {log.map((entry, idx) => (
                <Text key={idx} style={styles.logEntry}>{entry}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Penjelasan Konsep */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Konsep Async (Week 9)</Text>
          {[
            {
              title: 'Promise.all()',
              desc: 'Jalankan semua Promise paralel. Jika 1 gagal → semuanya gagal (All-or-Nothing).',
              color: '#eff6ff',
            },
            {
              title: 'Promise.allSettled()',
              desc: 'Jalankan semua Promise paralel. Meskipun ada yang gagal, lainnya tetap selesai (Toleran Error).',
              color: '#f0fdf4',
            },
            {
              title: 'Serial (Sequential)',
              desc: 'Setiap request menunggu yang sebelumnya selesai. Cocok jika data B bergantung pada data A.',
              color: '#fefce8',
            },
            {
              title: 'AbortController',
              desc: 'Membatalkan fetch yang sedang berjalan saat komponen unmount atau pengguna menekan Batalkan.',
              color: '#fef2f2',
            },
          ].map((item) => (
            <View key={item.title} style={[styles.conceptCard, { backgroundColor: item.color }]}>
              <Text style={styles.conceptTitle}>{item.title}</Text>
              <Text style={styles.conceptDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f3ff' },
  header: {
    backgroundColor: '#7c3aed',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: '#c4b5fd', marginTop: 2 },
  scroll: { padding: 16, gap: 16 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  btnRow: { flexDirection: 'row', gap: 8 },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeBtnParallel: { backgroundColor: '#1a56db' },
  modeBtnSerial: { backgroundColor: '#d97706' },
  modeBtnSettled: { backgroundColor: '#059669' },
  btnDisabled: { opacity: 0.5 },
  modeBtnText: { color: '#fff', fontWeight: '700', fontSize: 11, textAlign: 'center' },
  cancelBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  taskCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskLabel: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  taskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  taskBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  taskEndpoint: { fontSize: 11, color: '#6b7280', fontFamily: 'monospace' },
  taskResult: { fontSize: 13, color: '#374151' },
  taskDuration: { fontSize: 11, color: '#9ca3af' },
  summaryCard: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe' },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#1e40af' },
  summaryMode: { fontSize: 13, color: '#374151' },
  summaryDuration: { fontSize: 14, color: '#374151' },
  summaryDurationBold: { fontWeight: '700', color: '#1a56db', fontSize: 18 },
  summaryNote: { fontSize: 13, color: '#374151', fontStyle: 'italic' },
  logContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  logEntry: { fontSize: 11, color: '#d1fae5', fontFamily: 'monospace' },
  conceptCard: {
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  conceptTitle: { fontSize: 13, fontWeight: '700', color: '#1f2937' },
  conceptDesc: { fontSize: 12, color: '#4b5563' },
});
