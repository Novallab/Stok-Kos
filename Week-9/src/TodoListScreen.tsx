/**
 * TodoListScreen.tsx — Week 9 (Sprint 07: Async & Multi-Threading)
 *
 * Layar Todo List yang mendemonstrasikan:
 * 1. Tri-State async: loading / data / error
 * 2. useEffect dengan async function + AbortController cleanup
 * 3. GET data dari REST API (JSONPlaceholder)
 * 4. POST data baru ke REST API
 * 5. PATCH untuk toggle status selesai
 * 6. Refresh data (re-fetch)
 * 7. Error handling dengan try/catch + Alert
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Todo, fetchTodos, addTodo, toggleTodoStatus } from './todoService';

export default function TodoListScreen() {
  // Tri-State: data / loading / error
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // State untuk form tambah todo
  const [inputText, setInputText] = useState('');
  const [adding, setAdding] = useState(false);

  // State untuk toggle sedang berlangsung (track per-id)
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  // Ref untuk AbortController — cleanup saat komponen unmount
  const abortRef = useRef<AbortController | null>(null);

  const notify = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  /**
   * Mengambil data todo dari API.
   * Demonstrasi: useEffect + async function + AbortController
   */
  const loadTodos = useCallback(async (isRefresh = false) => {
    // Batalkan request sebelumnya jika masih berjalan
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      // GET /todos?_limit=10 — asynchronous, tidak memblokir UI
      const data = await fetchTodos(abortRef.current.signal);
      setTodos(data);
      setError(null);
    } catch (err: any) {
      // Jangan tampilkan error jika request sengaja dibatalkan (unmount)
      if (err?.name === 'AbortError') return;
      setError(err?.message ?? 'Gagal memuat data. Coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Jalankan loadTodos saat komponen pertama kali dimuat
  // Dependency array [] → eksekusi hanya 1 kali (saat mount)
  useEffect(() => {
    loadTodos();

    // Cleanup function: batalkan request saat komponen unmount
    return () => {
      abortRef.current?.abort();
    };
  }, [loadTodos]);

  /**
   * Menambahkan todo baru ke API.
   * Demonstrasi: POST request + async/await + try/catch
   */
  const handleAddTodo = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      notify('Perhatian', 'Judul tugas tidak boleh kosong.');
      return;
    }

    setAdding(true);
    try {
      // POST /todos — asynchronous
      const newTodo = await addTodo(trimmed);
      // Tambahkan ke list lokal (JSONPlaceholder tidak menyimpan permanen)
      setTodos((prev) => [{ ...newTodo, id: Date.now() }, ...prev]);
      setInputText('');
    } catch (err: any) {
      notify('Gagal', err?.message ?? 'Tidak dapat menambahkan tugas.');
    } finally {
      setAdding(false);
    }
  };

  /**
   * Toggle status selesai pada todo.
   * Demonstrasi: PATCH request + toggle state + Optimistic Update
   */
  const handleToggle = async (todo: Todo) => {
    // Optimistic update: ubah UI dulu sebelum menunggu server
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, completed: !t.completed } : t
      )
    );
    setTogglingIds((prev) => new Set(prev).add(todo.id));

    try {
      // PATCH /todos/:id — asynchronous
      await toggleTodoStatus(todo.id, !todo.completed);
      // Server merespons 200 OK (data tidak disimpan di JSONPlaceholder)
    } catch (err: any) {
      // Rollback jika gagal
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, completed: todo.completed } : t
        )
      );
      notify('Gagal', 'Tidak dapat mengubah status tugas.');
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(todo.id);
        return next;
      });
    }
  };

  // ── Render: Fase Loading ──
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a56db" />
        <Text style={styles.loadingText}>Memuat daftar tugas dari API...</Text>
        <Text style={styles.loadingSubText}>GET /todos?_limit=10</Text>
      </View>
    );
  }

  // ── Render: Fase Error ──
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Gagal Memuat Data</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadTodos()}>
          <Text style={styles.retryBtnText}>🔄 Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Render: Fase Sukses ──
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a56db" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Todo List Async</Text>
        <Text style={styles.headerSubtitle}>
          Sprint 07 · JSONPlaceholder API
        </Text>
      </View>

      {/* Info Badge */}
      <View style={styles.infoBadge}>
        <Text style={styles.infoBadgeText}>
          ✅ {todos.filter((t) => t.completed).length} selesai &nbsp;·&nbsp;
          ⏳ {todos.filter((t) => !t.completed).length} belum &nbsp;·&nbsp;
          📦 {todos.length} total
        </Text>
      </View>

      {/* Form Tambah Todo */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Tambah tugas baru..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleAddTodo}
            returnKeyType="done"
            editable={!adding}
          />
          <TouchableOpacity
            style={[styles.addBtn, adding && styles.addBtnDisabled]}
            onPress={handleAddTodo}
            disabled={adding}
          >
            {adding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.addBtnText}>+ Tambah</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Daftar Todo (FlatList untuk performa) */}
      <FlatList
        data={todos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTodos(true)}
            colors={['#1a56db']}
            tintColor="#1a56db"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.todoItem, item.completed && styles.todoItemDone]}
            onPress={() => handleToggle(item)}
            activeOpacity={0.7}
          >
            <View style={styles.todoCheckbox}>
              {togglingIds.has(item.id) ? (
                <ActivityIndicator size="small" color="#1a56db" />
              ) : (
                <Text style={styles.todoCheckboxIcon}>
                  {item.completed ? '✅' : '⬜'}
                </Text>
              )}
            </View>
            <View style={styles.todoContent}>
              <Text
                style={[
                  styles.todoTitle,
                  item.completed && styles.todoTitleDone,
                ]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text style={styles.todoMeta}>
                {item.completed ? 'Selesai' : 'Belum selesai'} · ID #{item.id}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada tugas.</Text>
            <Text style={styles.emptySubText}>
              Tambahkan tugas pertama Anda di atas.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff' },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f0f4ff',
  },
  header: {
    backgroundColor: '#1a56db',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: '#a5b4fc', marginTop: 2 },
  infoBadge: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  infoBadgeText: { fontSize: 12, color: '#3730a3', textAlign: 'center' },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#f9fafb',
  },
  addBtn: {
    backgroundColor: '#1a56db',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    minWidth: 80,
  },
  addBtnDisabled: { backgroundColor: '#93c5fd' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  listContent: { padding: 12, gap: 8 },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  todoItemDone: { backgroundColor: '#f0fdf4' },
  todoCheckbox: { width: 32, alignItems: 'center' },
  todoCheckboxIcon: { fontSize: 22 },
  todoContent: { flex: 1 },
  todoTitle: { fontSize: 14, color: '#111827', fontWeight: '500' },
  todoTitleDone: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
    fontWeight: '400',
  },
  todoMeta: { fontSize: 11, color: '#6b7280', marginTop: 3 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#6b7280', fontWeight: '600' },
  emptySubText: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  loadingText: {
    fontSize: 16,
    color: '#1a56db',
    marginTop: 16,
    fontWeight: '600',
  },
  loadingSubText: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  errorIcon: { fontSize: 48, marginBottom: 12 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#dc2626' },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#1a56db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
