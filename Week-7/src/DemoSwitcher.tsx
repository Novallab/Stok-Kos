import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { DemoSimulationMode } from './roomService';
import { C } from './shared';

type Props = {
  currentMode: DemoSimulationMode;
  onSelectMode: (mode: DemoSimulationMode) => void;
};

const OPTIONS: { mode: DemoSimulationMode; label: string; desc: string; icon: string }[] = [
  {
    mode: 'normal',
    label: 'Live API (Normal)',
    desc: 'Request nyata ke server via src/config.ts',
    icon: '🟢',
  },
  {
    mode: 'offline',
    label: 'Simulasi Offline (No Internet)',
    desc: 'Menampilkan pesan offline & icon tidak ada koneksi',
    icon: '📡',
  },
  {
    mode: 'timeout',
    label: 'Simulasi Timeout (Waktu Habis)',
    desc: 'Menampilkan state server terlalu lama merespons',
    icon: '⏱️',
  },
  {
    mode: '404',
    label: 'Simulasi HTTP 404 (Client Error)',
    desc: 'Menampilkan state data tidak ditemukan',
    icon: '⚠️',
  },
  {
    mode: '500',
    label: 'Simulasi HTTP 500 (Server Error)',
    desc: 'Menampilkan state gangguan internal server',
    icon: '💥',
  },
  {
    mode: 'empty',
    label: 'Simulasi Data Kosong (Empty State)',
    desc: 'Menampilkan tampilan belum ada data kamar',
    icon: '📋',
  },
];

export default function DemoSwitcher({ currentMode, onSelectMode }: Props) {
  const [visible, setVisible] = useState(false);

  const activeOption = OPTIONS.find((o) => o.mode === currentMode) ?? OPTIONS[0];

  return (
    <>
      {/* Top Banner untuk Demo Sprint 05 */}
      <View style={styles.banner}>
        <View style={styles.bannerLeft}>
          <Text style={styles.badgeText}>Sprint 05 Demo</Text>
          <Text style={styles.activeModeText} numberOfLines={1}>
            {activeOption.icon} {activeOption.label}
          </Text>
        </View>
        <Pressable
          onPress={() => setVisible(true)}
          style={({ pressed }) => [styles.btnChange, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Ubah Mode Demo"
        >
          <Text style={styles.btnChangeText}>Ganti Tes</Text>
        </Pressable>
      </View>

      {/* Modal Dialog Pilihan Kondisi Pengujian */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pengujian Sprint 05</Text>
              <Text style={styles.modalSub}>
                Pilih kondisi simulasi untuk demonstrasi Sprint 05 (Error Handling & Offline)
              </Text>
            </View>

            {OPTIONS.map((item) => {
              const selected = item.mode === currentMode;
              return (
                <Pressable
                  key={item.mode}
                  onPress={() => {
                    onSelectMode(item.mode);
                    setVisible(false);
                  }}
                  style={({ pressed }) => [
                    styles.optionItem,
                    selected && styles.optionItemSelected,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={styles.optionIcon}>{item.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.optionLabel,
                        selected && { color: C.primary, fontWeight: '700' },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={styles.optionDesc}>{item.desc}</Text>
                  </View>
                  {selected && <Text style={styles.checkIcon}>✓</Text>}
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => setVisible(false)}
              style={styles.btnClose}
              accessibilityRole="button"
            >
              <Text style={styles.btnCloseText}>Tutup</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  bannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeText: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  activeModeText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  btnChange: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  btnChangeText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  optionItemSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  optionIcon: {
    fontSize: 22,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  optionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  checkIcon: {
    color: C.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  btnClose: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  btnCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});
