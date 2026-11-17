import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const C = { primary: '#1E40AF', dark: '#1E3A8A', soft: '#DBEAFE', bg: '#F1F5F9', card: '#FFFFFF', text: '#0F172A', muted: '#475569', line: '#CBD5E1' };

export type RoomStatus = 'Terisi' | 'Kosong' | 'Perlu Dibersihkan' | 'Rusak';
export type ItemState = 'Baik' | 'Perlu Perbaikan' | 'Rusak';
export type Room = { id: string; no: string; type: string; status: RoomStatus; tenant?: string };
export type Report = { id: string; roomNo: string; desc: string; priority: 'Tinggi' | 'Sedang' | 'Rendah'; status: 'Baru' | 'Diproses' | 'Selesai'; date: string };
export type Inspection = { id: string; roomNo: string; type: string; date: string; note: string };

export const RS: Record<RoomStatus, { bg: string; fg: string }> = {
  Terisi: { bg: '#DBEAFE', fg: '#1E3A8A' },
  Kosong: { bg: '#DCFCE7', fg: '#166534' },
  'Perlu Dibersihkan': { bg: '#FEF3C7', fg: '#92400E' },
  Rusak: { bg: '#FEE2E2', fg: '#991B1B' },
};
export const IS: Record<ItemState, { bg: string; fg: string }> = {
  Baik: RS.Kosong, 'Perlu Perbaikan': RS['Perlu Dibersihkan'], Rusak: RS.Rusak,
};

export const ROOMS: Room[] = [
  { id: '1', no: 'A01', type: 'Standar', status: 'Terisi', tenant: 'Budi Santoso' },
  { id: '2', no: 'A02', type: 'Standar', status: 'Kosong' },
  { id: '3', no: 'A03', type: 'Standar', status: 'Perlu Dibersihkan', tenant: 'Rina Wulandari' },
  { id: '4', no: 'B01', type: 'AC', status: 'Terisi', tenant: 'Dewi Lestari' },
  { id: '5', no: 'B02', type: 'AC', status: 'Rusak' },
  { id: '6', no: 'B03', type: 'AC', status: 'Kosong' },
];
export const ITEMS = ['Kebersihan', 'Lampu', 'AC / kipas', 'Kran & kamar mandi', 'Kasur', 'Lemari', 'Pintu & kunci'];
export const REPORTS0: Report[] = [
  { id: 'r1', roomNo: 'B02', desc: 'AC tidak dingin dan menetes', priority: 'Tinggi', status: 'Diproses', date: '05/10/2026' },
  { id: 'r2', roomNo: 'A03', desc: 'Lampu kamar mandi berkedip', priority: 'Rendah', status: 'Baru', date: '06/10/2026' },
];
export const HIST0: Inspection[] = [
  { id: 'h1', roomNo: 'A01', type: 'Rutin', date: '06/10/2026 08.30', note: 'Semua item baik' },
  { id: 'h2', roomNo: 'B02', type: 'Check-out', date: '05/10/2026 16.10', note: '1 item rusak: AC / kipas' },
];

export function Badge({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return <View style={[s.badge, { backgroundColor: bg }]}><Text style={[s.badgeT, { color: fg }]}>{label}</Text></View>;
}

export function Btn({ label, onPress, outline, hint }: { label: string; onPress: () => void; outline?: boolean; hint?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityHint={hint}
      style={({ pressed }) => [s.btn, outline ? s.btnO : s.btnP, pressed && { opacity: 0.8 }]}>
      <Text style={[s.btnT, { color: outline ? C.primary : '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Pilih ${label}`} accessibilityState={{ selected: active }}
      style={[s.chip, active && { backgroundColor: C.primary, borderColor: C.primary }]}>
      <Text style={{ color: active ? '#fff' : C.text, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 32 },
  h1: { fontSize: 28, fontWeight: '800', color: C.text },
  h2: { fontSize: 19, fontWeight: '700', color: C.text, marginTop: 24, marginBottom: 10 },
  p: { fontSize: 15, color: C.muted, lineHeight: 22 },
  card: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 14, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  bold: { fontSize: 16, fontWeight: '700', color: C.text },
  badge: { borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  badgeT: { fontSize: 12, fontWeight: '700' },
  btn: { minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 10 },
  btnP: { backgroundColor: C.primary },
  btnO: { borderWidth: 2, borderColor: C.primary, backgroundColor: '#fff' },
  btnT: { fontSize: 16, fontWeight: '700' },
  chip: { minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, borderColor: C.line, backgroundColor: '#fff', justifyContent: 'center', marginRight: 8 },
  input: { minHeight: 48, borderWidth: 1, borderColor: C.line, borderRadius: 12, backgroundColor: '#fff', paddingHorizontal: 12, fontSize: 16, color: C.text },
});
