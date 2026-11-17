import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { Badge, Btn, Chip, Report, Room, s } from './shared';

const PR = { Tinggi: { bg: '#FEE2E2', fg: '#991B1B' }, Sedang: { bg: '#FEF3C7', fg: '#92400E' }, Rendah: { bg: '#DCFCE7', fg: '#166534' } };

export default function ReportsScreen({ reports, rooms, onAdd }: { reports: Report[]; rooms: Room[]; onAdd: (r: Report) => void }) {
  const [no, setNo] = useState(rooms[0]?.no ?? '');
  const [desc, setDesc] = useState('');
  const [pr, setPr] = useState<Report['priority']>('Sedang');
  const submit = () => {
    if (!desc.trim()) return Alert.alert('Belum lengkap', 'Tulis deskripsi kerusakan dulu.');
    onAdd({ id: String(Date.now()), roomNo: no, desc: desc.trim(), priority: pr, status: 'Baru', date: new Date().toLocaleDateString('id-ID') });
    setDesc('');
  };
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.h1} accessibilityRole="header">Laporan Kerusakan</Text>
      <View style={[s.card, { marginTop: 12 }]}>
        <Text style={s.bold}>Buat laporan</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
          {rooms.map((r) => <Chip key={r.id} label={r.no} active={no === r.no} onPress={() => setNo(r.no)} />)}
        </ScrollView>
        <TextInput style={s.input} value={desc} onChangeText={setDesc} placeholder="Apa yang rusak?" accessibilityLabel="Deskripsi kerusakan" />
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          {(['Tinggi', 'Sedang', 'Rendah'] as const).map((p) => <Chip key={p} label={p} active={pr === p} onPress={() => setPr(p)} />)}
        </View>
        <Btn label="Kirim Laporan" onPress={submit} />
      </View>
      <Text style={s.h2} accessibilityRole="header">Daftar laporan</Text>
      {reports.map((r) => (
        <View key={r.id} style={s.card}>
          <View style={s.row}><Text style={s.bold}>Kamar {r.roomNo}</Text><Badge label={r.priority} {...PR[r.priority]} /></View>
          <Text style={s.p}>{r.desc}</Text>
          <Text style={s.p}>{r.status} · {r.date}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
