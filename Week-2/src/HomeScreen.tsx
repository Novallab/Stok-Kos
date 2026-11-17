import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Btn, C, Inspection, Room, RoomStatus, RS, s } from './shared';

type Props = { rooms: Room[]; history: Inspection[]; onScan: () => void; go: (t: 'rooms' | 'reports' | 'history') => void };

export default function HomeScreen({ rooms, history, onScan, go }: Props) {
  const statuses: RoomStatus[] = ['Terisi', 'Kosong', 'Perlu Dibersihkan', 'Rusak'];
  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={{ backgroundColor: C.primary, borderRadius: 20, padding: 20 }}>
        <Text style={[s.h1, { color: '#fff' }]} accessibilityRole="header">Room Check</Text>
        <Text style={{ color: '#E0ECFF', fontSize: 16, marginTop: 4 }}>Cek kamar cepat, lengkap dengan bukti foto.</Text>
      </View>

      <Text style={s.h2} accessibilityRole="header">Kondisi kamar ({rooms.length})</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {statuses.map((st) => (
          <View key={st} accessible accessibilityLabel={`${st}: ${rooms.filter((r) => r.status === st).length} kamar`}
            style={{ flexGrow: 1, flexBasis: '45%', backgroundColor: RS[st].bg, borderRadius: 16, padding: 14 }}>
            <Text style={{ fontSize: 30, fontWeight: '800', color: RS[st].fg }}>{rooms.filter((r) => r.status === st).length}</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: RS[st].fg }}>{st}</Text>
          </View>
        ))}
      </View>

      <Btn label="Mulai Inspeksi" onPress={() => go('rooms')} hint="Pilih kamar yang akan dicek" />
      <Btn label="Scan QR Kamar" outline onPress={onScan} hint="Buka checklist lewat QR kamar" />
      <Btn label="Lapor Kerusakan" outline onPress={() => go('reports')} />

      <Text style={s.h2} accessibilityRole="header">Inspeksi terbaru</Text>
      {history.slice(0, 3).map((h) => (
        <View key={h.id} style={s.card}>
          <View style={s.row}><Text style={s.bold}>Kamar {h.roomNo} · {h.type}</Text></View>
          <Text style={s.p}>{h.date}</Text><Text style={s.p}>{h.note}</Text>
        </View>
      ))}

      <View style={[s.card, { backgroundColor: C.soft, marginTop: 14 }]}>
        <Text style={s.bold}>Cara pakai</Text>
        <Text style={s.p}>1. Pilih kamar atau scan QR-nya.{'\n'}2. Isi checklist dan tambahkan foto.{'\n'}3. Simpan, status kamar dan riwayat terbarui otomatis.</Text>
      </View>
    </ScrollView>
  );
}
