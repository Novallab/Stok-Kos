import React from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Btn, Inspection, s } from './shared';

export default function HistoryScreen({ history }: { history: Inspection[] }) {
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.h1} accessibilityRole="header">Riwayat Pengecekan</Text>
      <Btn label="Ekspor ke PDF" outline onPress={() => Alert.alert('Ekspor PDF', 'Akan dibuat dengan expo-print pada pengembangan berikutnya.')} />
      <View style={{ marginTop: 14 }}>
        {history.map((h) => (
          <View key={h.id} style={s.card}>
            <Text style={s.bold}>Kamar {h.roomNo} · {h.type}</Text>
            <Text style={s.p}>{h.date}</Text><Text style={s.p}>{h.note}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
