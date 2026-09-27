import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { BottomTabInset, MaxContentWidth } from '@/constants/theme';

// ==========================================
// TIPE DATA & DUMMY DATA INVENTARIS KOS
// ==========================================
export type StockStatus = 'aman' | 'menipis' | 'habis';

export interface KosInventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  currentStock: number;
  minStock: number;
  unit: string;
  status: StockStatus;
  updatedAt: string;
}

const INITIAL_ITEMS: KosInventoryItem[] = [
  {
    id: 'item-1',
    name: 'Lampu LED Philips 14W E27',
    category: 'Fasilitas & Kelistrikan',
    location: 'Gudang Lt. 1',
    currentStock: 0,
    minStock: 3,
    unit: 'pcs',
    status: 'habis',
    updatedAt: 'Hari ini, 08.30',
  },
  {
    id: 'item-2',
    name: 'Sabun Cuci Piring Sunlight 750ml',
    category: 'Dapur Bersama',
    location: 'Rak Dapur Utama',
    currentStock: 1,
    minStock: 3,
    unit: 'pouch',
    status: 'menipis',
    updatedAt: 'Kemarin, 14.20',
  },
  {
    id: 'item-3',
    name: 'Tisu Gulung Toilet Paseo',
    category: 'Toilet Bersama',
    location: 'Lemari KM Lt. 2',
    currentStock: 2,
    minStock: 5,
    unit: 'roll',
    status: 'menipis',
    updatedAt: '2 hari lalu',
  },
  {
    id: 'item-4',
    name: 'Galon Air Minum Isi Ulang',
    category: 'Dapur & Konsumsi',
    location: 'Dispenser Dapur',
    currentStock: 1,
    minStock: 2,
    unit: 'galon',
    status: 'menipis',
    updatedAt: 'Hari ini, 07.15',
  },
  {
    id: 'item-5',
    name: 'Karbol Pembersih Lantai Wipol 780ml',
    category: 'Alat & Bahan Kebersihan',
    location: 'Gudang Kebersihan',
    currentStock: 4,
    minStock: 2,
    unit: 'pouch',
    status: 'aman',
    updatedAt: '3 hari lalu',
  },
  {
    id: 'item-6',
    name: 'Sprei Kasur Single Bed Putih',
    category: 'Linen & Kamar Kos',
    location: 'Lemari Linen Lt. 1',
    currentStock: 8,
    minStock: 4,
    unit: 'set',
    status: 'aman',
    updatedAt: '4 hari lalu',
  },
];

// ==========================================
// WARNA IDENTITAS APLIKASI 'STOCK KOS'
// Warna Utama: Emerald Green (#0F766E)
// Melambangkan kesegaran, kebersihan, dan keteraturan kos
// ==========================================
const AppColors = {
  // Brand Identity
  primary: '#0F766E', // Dark Emerald (kontras teks putih sangat tinggi > 5.5:1)
  primaryDark: '#115E59',
  primaryLight: '#0D9488',
  primaryTint: '#CCFBF1',
  primaryTintDark: '#134E4A',

  // Status Colors (Warna Status Stok)
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  dangerText: '#991B1B',

  warning: '#D97706',
  warningBg: '#FEF3C7',
  warningText: '#92400E',

  success: '#059669',
  successBg: '#DCFCE7',
  successText: '#166534',

  // Theme Neutral Colors
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    inputBg: '#F1F5F9',
  },
  dark: {
    background: '#090D16',
    card: '#151D2C',
    border: '#2A364F',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    inputBg: '#1E293B',
  },
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? AppColors.dark : AppColors.light;

  // State inventaris & filter
  const [items, setItems] = useState<KosInventoryItem[]>(INITIAL_ITEMS);
  const [selectedFilter, setSelectedFilter] = useState<'semua' | 'perhatian' | 'aman'>('perhatian');

  // State Modal Tambah Barang
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemStock, setNewItemStock] = useState('');
  const [newItemMinStock, setNewItemMinStock] = useState('2');
  const [newItemUnit, setNewItemUnit] = useState('pcs');

  // Ringkasan Kondisi Stok (Kalkulasi Otomatis)
  const summary = useMemo(() => {
    const total = items.length;
    const habis = items.filter((item) => item.status === 'habis').length;
    const menipis = items.filter((item) => item.status === 'menipis').length;
    const aman = items.filter((item) => item.status === 'aman').length;
    return { total, habis, menipis, aman };
  }, [items]);

  // Filter list item yang ditampilkan
  const displayedItems = useMemo(() => {
    if (selectedFilter === 'perhatian') {
      return items.filter((item) => item.status === 'menipis' || item.status === 'habis');
    }
    if (selectedFilter === 'aman') {
      return items.filter((item) => item.status === 'aman');
    }
    return items;
  }, [items, selectedFilter]);

  // Fungsi tambah stok cepat (+1)
  const handleIncreaseStock = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = item.currentStock + 1;
          const status: StockStatus =
            newStock === 0 ? 'habis' : newStock <= item.minStock ? 'menipis' : 'aman';
          return {
            ...item,
            currentStock: newStock,
            status,
            updatedAt: 'Baru saja diubah',
          };
        }
        return item;
      })
    );
  };

  // Fungsi kurangi stok cepat (-1)
  const handleDecreaseStock = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.currentStock - 1);
          const status: StockStatus =
            newStock === 0 ? 'habis' : newStock <= item.minStock ? 'menipis' : 'aman';
          return {
            ...item,
            currentStock: newStock,
            status,
            updatedAt: 'Baru saja diubah',
          };
        }
        return item;
      })
    );
  };

  // Handler Submit Tambah Barang Baru
  const handleSaveNewItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Data Belum Lengkap', 'Silakan masukkan nama barang perlengkapan kos.');
      return;
    }

    const currentStockNum = parseInt(newItemStock, 10) || 0;
    const minStockNum = parseInt(newItemMinStock, 10) || 1;
    const status: StockStatus =
      currentStockNum === 0 ? 'habis' : currentStockNum <= minStockNum ? 'menipis' : 'aman';

    const newItem: KosInventoryItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory.trim() || 'Perlengkapan Umum',
      location: 'Area Kos',
      currentStock: currentStockNum,
      minStock: minStockNum,
      unit: newItemUnit.trim() || 'pcs',
      status,
      updatedAt: 'Baru saja ditambah',
    };

    setItems((prev) => [newItem, ...prev]);
    setIsModalOpen(false);
    setNewItemName('');
    setNewItemCategory('');
    setNewItemStock('');
    setNewItemMinStock('2');
    setNewItemUnit('pcs');

    Alert.alert('Berhasil', `Barang "${newItem.name}" telah ditambahkan ke inventaris.`);
  };

  // Handler Navigasi Lihat Semua Stok
  const handleNavigateAllStock = () => {
    try {
      router.push('/explore');
    } catch {
      Alert.alert(
        'Katalog Stok',
        'Menampilkan seluruh data stok inventaris kos. Buka tab Explore untuk melihat halaman arsip lengkap.'
      );
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: BottomTabInset + 40 },
        ]}>
        <View style={styles.contentWrapper}>
          {/* ==================================================== */}
          {/* 1) HEADER & IDENTITAS APLIKASI STOCK KOS              */}
          {/* ==================================================== */}
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <View
                style={[
                  styles.kosBadge,
                  { backgroundColor: isDark ? AppColors.primaryTintDark : AppColors.primaryTint },
                ]}>
                <View style={styles.activeDot} />
                <Text
                  style={[
                    styles.kosBadgeText,
                    { color: isDark ? '#5EEAD4' : AppColors.primaryDark },
                  ]}>
                  Kos Graha Asri • Aktif
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Status Notifikasi Stok Kos"
                accessibilityHint="Melihat pemberitahuan barang yang perlu segera dibeli"
                style={({ pressed }) => [
                  styles.notificationButton,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  pressed && styles.pressedState,
                ]}
                onPress={() =>
                  Alert.alert(
                    'Pemberitahuan Stok Kos',
                    `Terdapat ${summary.habis + summary.menipis} barang yang membutuhkan restock segera.`
                  )
                }>
                <Text style={styles.notificationIcon}>🔔</Text>
                {summary.habis + summary.menipis > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {summary.habis + summary.menipis}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            <Text
              accessibilityRole="header"
              style={[styles.appTitle, { color: theme.textPrimary }]}>
              Stock Kos
            </Text>
            <Text style={[styles.appTagline, { color: theme.textSecondary }]}>
              Inventaris Rapi, Kos Nyaman, Operasional Tanpa Kendala
            </Text>
            <Text style={[styles.appSubtitle, { color: theme.textMuted }]}>
              Pantau ketersediaan perlengkapan kamar, kebersihan, dan ATK kos pengelola secara
              real-time.
            </Text>
          </View>

          {/* ==================================================== */}
          {/* 2) RINGKASAN KONDISI STOK (CARDS)                    */}
          {/* ==================================================== */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Ringkasan Kondisi Stok
            </Text>
            <Text style={[styles.sectionSubtitleBadge, { color: theme.textMuted }]}>
              Real-time
            </Text>
          </View>

          <View style={styles.summaryGrid}>
            {/* Card 1: Total Barang */}
            <View
              accessibilityRole="summary"
              accessibilityLabel={`Total barang inventaris: ${summary.total} item`}
              style={[
                styles.summaryCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}>
              <View style={styles.summaryCardHeader}>
                <Text style={styles.summaryEmoji}>📦</Text>
                <Text
                  style={[
                    styles.summaryStatusBadge,
                    { backgroundColor: isDark ? '#1E293B' : '#E2E8F0', color: theme.textPrimary },
                  ]}>
                  Total
                </Text>
              </View>
              <Text style={[styles.summaryNumber, { color: theme.textPrimary }]}>
                {summary.total}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                Total Barang
              </Text>
              <Text style={[styles.summaryNote, { color: theme.textMuted }]}>
                Semua kategori kos
              </Text>
            </View>

            {/* Card 2: Stok Menipis */}
            <View
              accessibilityRole="summary"
              accessibilityLabel={`Stok menipis: ${summary.menipis} item, perlu belanja`}
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDark ? '#2D2010' : '#FFFBEB',
                  borderColor: isDark ? '#78350F' : '#FCD34D',
                },
              ]}>
              <View style={styles.summaryCardHeader}>
                <Text style={styles.summaryEmoji}>⚠️</Text>
                <Text
                  style={[
                    styles.summaryStatusBadge,
                    { backgroundColor: AppColors.warningBg, color: AppColors.warningText },
                  ]}>
                  Perlu Restock
                </Text>
              </View>
              <Text style={[styles.summaryNumber, { color: AppColors.warning }]}>
                {summary.menipis}
              </Text>
              <Text style={[styles.summaryLabel, { color: isDark ? '#FDE68A' : '#78350F' }]}>
                Stok Menipis
              </Text>
              <Text style={[styles.summaryNote, { color: isDark ? '#FCD34D' : '#92400E' }]}>
                Di bawah batas minimal
              </Text>
            </View>

            {/* Card 3: Stok Habis */}
            <View
              accessibilityRole="summary"
              accessibilityLabel={`Stok habis: ${summary.habis} item, kondisi darurat`}
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDark ? '#311414' : '#FEF2F2',
                  borderColor: isDark ? '#7F1D1D' : '#FECACA',
                },
              ]}>
              <View style={styles.summaryCardHeader}>
                <Text style={styles.summaryEmoji}>🚨</Text>
                <Text
                  style={[
                    styles.summaryStatusBadge,
                    { backgroundColor: AppColors.dangerBg, color: AppColors.dangerText },
                  ]}>
                  Kosong
                </Text>
              </View>
              <Text style={[styles.summaryNumber, { color: AppColors.danger }]}>
                {summary.habis}
              </Text>
              <Text style={[styles.summaryLabel, { color: isDark ? '#FECACA' : '#991B1B' }]}>
                Stok Habis
              </Text>
              <Text style={[styles.summaryNote, { color: isDark ? '#F87171' : '#B91C1C' }]}>
                Segera sediakan
              </Text>
            </View>

            {/* Card 4: Stok Aman */}
            <View
              accessibilityRole="summary"
              accessibilityLabel={`Stok aman: ${summary.aman} item`}
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDark ? '#0A261C' : '#F0FDF4',
                  borderColor: isDark ? '#065F46' : '#BBF7D0',
                },
              ]}>
              <View style={styles.summaryCardHeader}>
                <Text style={styles.summaryEmoji}>✅</Text>
                <Text
                  style={[
                    styles.summaryStatusBadge,
                    { backgroundColor: AppColors.successBg, color: AppColors.successText },
                  ]}>
                  Cukup
                </Text>
              </View>
              <Text style={[styles.summaryNumber, { color: AppColors.success }]}>
                {summary.aman}
              </Text>
              <Text style={[styles.summaryLabel, { color: isDark ? '#A7F3D0' : '#14532D' }]}>
                Stok Aman
              </Text>
              <Text style={[styles.summaryNote, { color: isDark ? '#6EE7B7' : '#15803D' }]}>
                Operasional lancar
              </Text>
            </View>
          </View>

          {/* ==================================================== */}
          {/* 3) TOMBOL BESAR AKSI UTAMA                           */}
          {/* ==================================================== */}
          <View style={styles.actionButtonsContainer}>
            {/* Tombol Tambah Barang */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tambah Barang Baru"
              accessibilityHint="Membuka formulir untuk mencatat perlengkapan baru ke daftar stok kos"
              style={({ pressed }) => [
                styles.primaryActionButton,
                { backgroundColor: AppColors.primary },
                pressed && styles.pressedState,
              ]}
              onPress={() => setIsModalOpen(true)}>
              <View style={styles.buttonIconCircle}>
                <Text style={styles.buttonIconPlus}>＋</Text>
              </View>
              <View style={styles.buttonTextWrapper}>
                <Text style={styles.primaryButtonTitle}>Tambah Barang</Text>
                <Text style={styles.primaryButtonSubtitle}>Catat inventaris baru kos</Text>
              </View>
            </Pressable>

            {/* Tombol Lihat Semua Stok */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Lihat Semua Stok Inventaris"
              accessibilityHint="Menuju ke halaman daftar lengkap seluruh barang dan stok kos"
              style={({ pressed }) => [
                styles.secondaryActionButton,
                { backgroundColor: theme.card, borderColor: theme.border },
                pressed && styles.pressedState,
              ]}
              onPress={handleNavigateAllStock}>
              <View
                style={[
                  styles.secondaryIconCircle,
                  { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
                ]}>
                <Text style={styles.secondaryIconEmoji}>📋</Text>
              </View>
              <View style={styles.buttonTextWrapper}>
                <Text style={[styles.secondaryButtonTitle, { color: theme.textPrimary }]}>
                  Lihat Semua Stok
                </Text>
                <Text style={[styles.secondaryButtonSubtitle, { color: theme.textMuted }]}>
                  Katalog & filter lengkap ({summary.total} item)
                </Text>
              </View>
              <Text style={[styles.arrowRight, { color: theme.textMuted }]}>›</Text>
            </Pressable>
          </View>

          {/* ==================================================== */}
          {/* 4) LIST / PREVIEW SINGKAT BARANG PRIORITAS           */}
          {/* ==================================================== */}
          <View style={styles.previewSectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Daftar Pantauan Stok
              </Text>
              <Text style={[styles.previewSectionSubtitle, { color: theme.textSecondary }]}>
                Prioritaskan barang yang perlu restock terlebih dahulu
              </Text>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterChipRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Filter stok butuh perhatian"
                style={[
                  styles.filterChip,
                  selectedFilter === 'perhatian' && {
                    backgroundColor: AppColors.primary,
                    borderColor: AppColors.primary,
                  },
                  selectedFilter !== 'perhatian' && {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => setSelectedFilter('perhatian')}>
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === 'perhatian'
                      ? styles.filterChipTextActive
                      : { color: theme.textSecondary },
                  ]}>
                  ⚠️ Perhatian ({summary.habis + summary.menipis})
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Filter semua barang"
                style={[
                  styles.filterChip,
                  selectedFilter === 'semua' && {
                    backgroundColor: AppColors.primary,
                    borderColor: AppColors.primary,
                  },
                  selectedFilter !== 'semua' && {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => setSelectedFilter('semua')}>
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === 'semua'
                      ? styles.filterChipTextActive
                      : { color: theme.textSecondary },
                  ]}>
                  Semua ({summary.total})
                </Text>
              </Pressable>
            </View>
          </View>

          {/* List Item Cards */}
          <View style={styles.itemsListContainer}>
            {displayedItems.length === 0 ? (
              <View
                style={[
                  styles.emptyStateCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}>
                <Text style={styles.emptyStateEmoji}>🎉</Text>
                <Text style={[styles.emptyStateTitle, { color: theme.textPrimary }]}>
                  Tidak Ada Barang Bermasalah!
                </Text>
                <Text style={[styles.emptyStateDesc, { color: theme.textSecondary }]}>
                  Semua inventaris perlengkapan kos saat ini berada dalam jumlah aman.
                </Text>
              </View>
            ) : (
              displayedItems.map((item) => {
                const isOutOfStock = item.status === 'habis';
                const isLowStock = item.status === 'menipis';

                const statusBg = isOutOfStock
                  ? AppColors.dangerBg
                  : isLowStock
                  ? AppColors.warningBg
                  : AppColors.successBg;

                const statusTextColor = isOutOfStock
                  ? AppColors.dangerText
                  : isLowStock
                  ? AppColors.warningText
                  : AppColors.successText;

                const statusLabel = isOutOfStock
                  ? '🚨 Stok Habis'
                  : isLowStock
                  ? '⚠️ Stok Menipis'
                  : '✅ Stok Aman';

                return (
                  <View
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name}, jumlah ${item.currentStock} ${item.unit}, status ${item.status}`}
                    style={[
                      styles.itemCard,
                      { backgroundColor: theme.card, borderColor: theme.border },
                    ]}>
                    {/* Item Top: Category & Status */}
                    <View style={styles.itemCardTop}>
                      <View style={styles.categoryBadgeWrapper}>
                        <Text style={[styles.categoryBadgeText, { color: theme.textMuted }]}>
                          📍 {item.location} • {item.category}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                        <Text style={[styles.statusBadgeText, { color: statusTextColor }]}>
                          {statusLabel}
                        </Text>
                      </View>
                    </View>

                    {/* Item Middle: Name & Count */}
                    <View style={styles.itemMainRow}>
                      <View style={styles.itemInfo}>
                        <Text style={[styles.itemName, { color: theme.textPrimary }]}>
                          {item.name}
                        </Text>
                        <Text style={[styles.itemSubDetail, { color: theme.textSecondary }]}>
                          Batas aman minimal: {item.minStock} {item.unit}
                        </Text>
                      </View>

                      {/* Stock Quantity Highlight */}
                      <View style={styles.stockCountBox}>
                        <Text
                          style={[
                            styles.stockCountNumber,
                            isOutOfStock
                              ? { color: AppColors.danger }
                              : isLowStock
                              ? { color: AppColors.warning }
                              : { color: AppColors.success },
                          ]}>
                          {item.currentStock}
                        </Text>
                        <Text style={[styles.stockCountUnit, { color: theme.textMuted }]}>
                          {item.unit}
                        </Text>
                      </View>
                    </View>

                    {/* Visual Progress Bar to show ratio */}
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(
                              100,
                              Math.max(8, (item.currentStock / (item.minStock * 2 || 1)) * 100)
                            )}%`,
                            backgroundColor: isOutOfStock
                              ? AppColors.danger
                              : isLowStock
                              ? AppColors.warning
                              : AppColors.success,
                          },
                        ]}
                      />
                    </View>

                    {/* Item Bottom: Quick Stock Adjusters (Min touch target >= 44x44px) */}
                    <View style={styles.itemActionsRow}>
                      <Text style={[styles.itemLastUpdate, { color: theme.textMuted }]}>
                        Update: {item.updatedAt}
                      </Text>

                      <View style={styles.quickAdjusters}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Kurangi 1 ${item.unit} ${item.name}`}
                          accessibilityHint="Mengurangi jumlah stok barang sebanyak satu unit saat digunakan"
                          hitSlop={6}
                          style={({ pressed }) => [
                            styles.counterButton,
                            { backgroundColor: theme.inputBg, borderColor: theme.border },
                            pressed && styles.pressedState,
                          ]}
                          onPress={() => handleDecreaseStock(item.id)}>
                          <Text style={[styles.counterButtonText, { color: theme.textPrimary }]}>
                            −
                          </Text>
                        </Pressable>

                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Tambah 1 ${item.unit} ${item.name}`}
                          accessibilityHint="Menambah jumlah stok barang sebanyak satu unit setelah belanja atau restock"
                          hitSlop={6}
                          style={({ pressed }) => [
                            styles.counterButton,
                            styles.counterButtonPlus,
                            { backgroundColor: isDark ? AppColors.primaryDark : AppColors.primaryTint },
                            pressed && styles.pressedState,
                          ]}
                          onPress={() => handleIncreaseStock(item.id)}>
                          <Text
                            style={[
                              styles.counterButtonText,
                              { color: isDark ? '#5EEAD4' : AppColors.primaryDark },
                            ]}>
                            ＋
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* ==================================================== */}
          {/* 5) INFO SINGKAT CARA PAKAI APLIKASI                  */}
          {/* ==================================================== */}
          <View
            style={[
              styles.guideContainer,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <View style={styles.guideHeader}>
              <View
                style={[
                  styles.guideIconWrapper,
                  { backgroundColor: isDark ? AppColors.primaryDark : AppColors.primaryTint },
                ]}>
                <Text style={styles.guideIconEmoji}>💡</Text>
              </View>
              <View style={styles.guideHeaderTextWrapper}>
                <Text style={[styles.guideTitle, { color: theme.textPrimary }]}>
                  Cara Pakai Stock Kos
                </Text>
                <Text style={[styles.guideSubtitle, { color: theme.textSecondary }]}>
                  Panduan 4 langkah mudah untuk pemilik & pengelola kos
                </Text>
              </View>
            </View>

            <View style={styles.guideStepsList}>
              {/* Step 1 */}
              <View style={styles.guideStepItem}>
                <View
                  style={[
                    styles.stepNumberBadge,
                    { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
                  ]}>
                  <Text style={[styles.stepNumberText, { color: theme.textPrimary }]}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepItemTitle, { color: theme.textPrimary }]}>
                    Catat Barang & Lokasi Simpan
                  </Text>
                  <Text style={[styles.stepItemDesc, { color: theme.textSecondary }]}>
                    Tekan tombol &quot;Tambah Barang&quot; untuk mendaftarkan alat kebersihan, lampu cadangan,
                    atau perlengkapan kos lainnya.
                  </Text>
                </View>
              </View>

              {/* Step 2 */}
              <View style={styles.guideStepItem}>
                <View
                  style={[
                    styles.stepNumberBadge,
                    { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
                  ]}>
                  <Text style={[styles.stepNumberText, { color: theme.textPrimary }]}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepItemTitle, { color: theme.textPrimary }]}>
                    Tentukan Batas Minimal Stok
                  </Text>
                  <Text style={[styles.stepItemDesc, { color: theme.textSecondary }]}>
                    Atur ambang batas aman (misal minimal 3 pcs). Sistem akan otomatis menandai
                    kartu dengan warna kuning saat barang menipis.
                  </Text>
                </View>
              </View>

              {/* Step 3 */}
              <View style={styles.guideStepItem}>
                <View
                  style={[
                    styles.stepNumberBadge,
                    { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
                  ]}>
                  <Text style={[styles.stepNumberText, { color: theme.textPrimary }]}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepItemTitle, { color: theme.textPrimary }]}>
                    Update Cepat Saat Digunakan
                  </Text>
                  <Text style={[styles.stepItemDesc, { color: theme.textSecondary }]}>
                    Gunakan tombol cepat [−] ketika barang diambil untuk anak kos atau cleaning
                    service, dan [+] saat belanjaan baru tiba.
                  </Text>
                </View>
              </View>

              {/* Step 4 */}
              <View style={styles.guideStepItem}>
                <View
                  style={[
                    styles.stepNumberBadge,
                    { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' },
                  ]}>
                  <Text style={[styles.stepNumberText, { color: theme.textPrimary }]}>4</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepItemTitle, { color: theme.textPrimary }]}>
                    Cek Saat Belanja Bulanan
                  </Text>
                  <Text style={[styles.stepItemDesc, { color: theme.textSecondary }]}>
                    Buka filter &quot;Perhatian&quot; sebelum belanja ke toko atau supermarket agar tidak ada
                    perlengkapan kos yang terlewat.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ==================================================== */}
      {/* MODAL FORM TAMBAH BARANG BARU                        */}
      {/* ==================================================== */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Tambah Barang Baru
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  Masukkan perlengkapan baru untuk kos Anda
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tutup formulir tambah barang"
                hitSlop={10}
                style={styles.modalCloseButton}
                onPress={() => setIsModalOpen(false)}>
                <Text style={[styles.modalCloseText, { color: theme.textMuted }]}>✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              {/* Nama Barang */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textPrimary }]}>
                  Nama Barang / Perlengkapan *
                </Text>
                <TextInput
                  value={newItemName}
                  onChangeText={setNewItemName}
                  placeholder="Contoh: Sabun Mandi Cair Refill 450ml"
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                    },
                  ]}
                />
              </View>

              {/* Kategori */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textPrimary }]}>
                  Kategori Perlengkapan
                </Text>
                <TextInput
                  value={newItemCategory}
                  onChangeText={setNewItemCategory}
                  placeholder="Contoh: Kebersihan, Kamar, Dapur, ATK"
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                    },
                  ]}
                />
              </View>

              {/* Grid: Stok Awal & Minimal */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, styles.formCol]}>
                  <Text style={[styles.formLabel, { color: theme.textPrimary }]}>
                    Jumlah Stok Sekarang *
                  </Text>
                  <TextInput
                    value={newItemStock}
                    onChangeText={setNewItemStock}
                    placeholder="0"
                    keyboardType="number-pad"
                    placeholderTextColor={theme.textMuted}
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.border,
                        color: theme.textPrimary,
                      },
                    ]}
                  />
                </View>

                <View style={[styles.formGroup, styles.formCol]}>
                  <Text style={[styles.formLabel, { color: theme.textPrimary }]}>
                    Batas Min. Aman *
                  </Text>
                  <TextInput
                    value={newItemMinStock}
                    onChangeText={setNewItemMinStock}
                    placeholder="2"
                    keyboardType="number-pad"
                    placeholderTextColor={theme.textMuted}
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.border,
                        color: theme.textPrimary,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Satuan */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textPrimary }]}>
                  Satuan Barang
                </Text>
                <TextInput
                  value={newItemUnit}
                  onChangeText={setNewItemUnit}
                  placeholder="pcs, roll, botol, pouch, pack, galon"
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                    },
                  ]}
                />
              </View>

              <View style={styles.modalActionsRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Batal tambah barang"
                  style={({ pressed }) => [
                    styles.modalCancelButton,
                    { borderColor: theme.border },
                    pressed && styles.pressedState,
                  ]}
                  onPress={() => setIsModalOpen(false)}>
                  <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>
                    Batal
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Simpan barang ke inventaris"
                  style={({ pressed }) => [
                    styles.modalSaveButton,
                    { backgroundColor: AppColors.primary },
                    pressed && styles.pressedState,
                  ]}
                  onPress={handleSaveNewItem}>
                  <Text style={styles.modalSaveText}>Simpan Barang</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================
// STYLESHEET (MODERN, RESPONSIF & ACCESSIBLE)
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: 20,
  },

  // 1) Header
  header: {
    marginTop: 6,
    gap: 6,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
    minHeight: 36,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  kosBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: AppColors.danger,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  appSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },

  // 2) Ringkasan Grid
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitleBadge: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      },
    }),
  },
  summaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryEmoji: {
    fontSize: 22,
  },
  summaryStatusBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryNote: {
    fontSize: 11,
    fontWeight: '500',
  },

  // 3) Action Buttons (Besar, Touch Target >= 44x44px)
  actionButtonsContainer: {
    gap: 12,
    marginTop: 4,
  },
  primaryActionButton: {
    minHeight: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: AppColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
      },
    }),
  },
  buttonIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIconPlus: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: -2,
  },
  buttonTextWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  primaryButtonTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButtonSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  secondaryActionButton: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 14,
  },
  secondaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryIconEmoji: {
    fontSize: 18,
  },
  secondaryButtonTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButtonSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  arrowRight: {
    fontSize: 22,
    fontWeight: '600',
    marginRight: 4,
  },

  // 4) Preview List
  previewSectionHeader: {
    gap: 10,
    marginTop: 6,
  },
  previewSectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 44, // Touch target >= 44x44
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  itemsListContainer: {
    gap: 12,
  },
  emptyStateCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyStateEmoji: {
    fontSize: 36,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyStateDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  itemCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  itemCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadgeWrapper: {
    flex: 1,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  itemSubDetail: {
    fontSize: 12,
    fontWeight: '500',
  },
  stockCountBox: {
    alignItems: 'flex-end',
  },
  stockCountNumber: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  stockCountUnit: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  itemActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  itemLastUpdate: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  quickAdjusters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  counterButton: {
    width: 44, // Touch target >= 44x44
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonPlus: {
    borderWidth: 0,
  },
  counterButtonText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },

  // 5) Panduan Cara Pakai
  guideContainer: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    marginTop: 4,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guideIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideIconEmoji: {
    fontSize: 22,
  },
  guideHeaderTextWrapper: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  guideSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  guideStepsList: {
    gap: 14,
  },
  guideStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    gap: 2,
  },
  stepItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepItemDesc: {
    fontSize: 12,
    lineHeight: 18,
  },

  // Modal Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    maxHeight: '90%',
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalBody: {
    maxHeight: 460,
  },
  formGroup: {
    marginBottom: 14,
    gap: 6,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  formInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formCol: {
    flex: 1,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Utility
  pressedState: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
