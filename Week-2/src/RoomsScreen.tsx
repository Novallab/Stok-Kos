import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Badge, Btn, Chip, Inspection, Room, RS, s, C } from './shared';

export function RoomsScreen({ rooms, onOpen }: { rooms: Room[]; onOpen: (r: Room) => void }) {
  const [q, setQ] = useState('');
  const [f, setF] = useState('Semua');
  const list = rooms.filter((r) => (f === 'Semua' || r.status === f) && r.no.toLowerCase().includes(q.toLowerCase()));
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.h1} accessibilityRole="header">Daftar Kamar</Text>
      <TextInput style={[s.input, { marginTop: 12 }]} placeholder="Cari nomor kamar" value={q} onChangeText={setQ} accessibilityLabel="Cari nomor kamar" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
        {['Semua', 'Terisi', 'Kosong', 'Perlu Dibersihkan', 'Rusak'].map((x) => <Chip key={x} label={x} active={f === x} onPress={() => setF(x)} />)}
      </ScrollView>
      {list.length === 0 && <Text style={s.p}>Tidak ada kamar yang cocok.</Text>}
      {list.map((r) => (
        <Pressable key={r.id} onPress={() => onOpen(r)} accessibilityRole="button"
          accessibilityLabel={`Kamar ${r.no}, ${r.type}, status ${r.status}`} style={[s.card, s.row, { minHeight: 64 }]}>
          <View><Text style={s.bold}>Kamar {r.no}</Text><Text style={s.p}>{r.type}{r.tenant ? ` · ${r.tenant}` : ''}</Text></View>
          <Badge label={r.status} {...RS[r.status]} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function RoomDetail({ room, history, onBack, onStart }: { room: Room; history: Inspection[]; onBack: () => void; onStart: () => void }) {
  const hs = history.filter((h) => h.roomNo === room.no);
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Btn label="Kembali" outline onPress={onBack} />
      <Text style={[s.h1, { marginTop: 16 }]} accessibilityRole="header">Kamar {room.no}</Text>
      <View style={[s.card, { marginTop: 12 }]}>
        <Text style={s.p}>Tipe: {room.type}</Text>
        <Text style={s.p}>Penghuni: {room.tenant ?? '-'}</Text>
        <View style={{ marginTop: 8, alignSelf: 'flex-start' }}><Badge label={room.status} {...RS[room.status]} /></View>
      </View>
      <Btn label="Mulai Inspeksi" onPress={onStart} />
      <Text style={s.h2} accessibilityRole="header">Riwayat pengecekan</Text>
      {hs.length === 0 && <Text style={s.p}>Belum ada riwayat.</Text>}
      {hs.map((h) => <View key={h.id} style={s.card}><Text style={s.bold}>{h.type}</Text><Text style={s.p}>{h.date}</Text><Text style={{ color: C.text }}>{h.note}</Text></View>)}
    </ScrollView>
  );
}
