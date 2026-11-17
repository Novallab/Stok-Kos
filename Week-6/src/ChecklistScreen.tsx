import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Btn, C, Chip, IS, ITEMS, ItemState, Room, s } from './shared';

type Result = { type: string; states: Record<string, ItemState>; photos: Record<string, string>; note: string };

export default function ChecklistScreen({ room, onCancel, onSave }: { room: Room; onCancel: () => void; onSave: (r: Result) => void }) {
  const [type, setType] = useState('Rutin');
  const [states, setStates] = useState<Record<string, ItemState>>(Object.fromEntries(ITEMS.map((i) => [i, 'Baik' as ItemState])));
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [note, setNote] = useState('');
  const opts: ItemState[] = ['Baik', 'Perlu Perbaikan', 'Rusak'];

  // Simulasi foto: catat waktu. Ganti dengan expo-image-picker/expo-camera untuk kamera asli.
  const addPhoto = (i: string) => setPhotos({ ...photos, [i]: new Date().toLocaleString('id-ID') });

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.h1} accessibilityRole="header">Inspeksi Kamar {room.no}</Text>
      <Text style={[s.h2, { marginTop: 14 }]}>Jenis pengecekan</Text>
      <View style={{ flexDirection: 'row' }}>{['Check-in', 'Check-out', 'Rutin'].map((t) => <Chip key={t} label={t} active={type === t} onPress={() => setType(t)} />)}</View>
      <Text style={s.h2}>Checklist</Text>
      {ITEMS.map((i) => (
        <View key={i} style={s.card}>
          <Text style={s.bold}>{i}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 8 }}>
            {opts.map((o) => (
              <Pressable key={o} onPress={() => setStates({ ...states, [i]: o })} accessibilityRole="radio"
                accessibilityLabel={`${i}: ${o}`} accessibilityState={{ selected: states[i] === o }}
                style={{ minHeight: 44, paddingHorizontal: 12, borderRadius: 12, justifyContent: 'center', borderWidth: 2,
                  borderColor: states[i] === o ? IS[o].fg : C.line, backgroundColor: states[i] === o ? IS[o].bg : '#fff' }}>
                <Text style={{ fontWeight: '700', color: states[i] === o ? IS[o].fg : C.muted }}>{o}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => addPhoto(i)} accessibilityRole="button" accessibilityLabel={`Ambil foto ${i}`}
            style={{ minHeight: 44, justifyContent: 'center', marginTop: 8 }}>
            <Text style={{ color: C.primary, fontWeight: '700' }}>{photos[i] ? `Foto ✓ ${photos[i]}` : '+ Tambah foto bukti'}</Text>
          </Pressable>
        </View>
      ))}
      <Text style={s.h2}>Catatan</Text>
      <TextInput style={[s.input, { minHeight: 80, textAlignVertical: 'top', paddingTop: 10 }]} multiline value={note} onChangeText={setNote}
        placeholder="Tambahkan catatan (opsional)" accessibilityLabel="Catatan inspeksi" />
      <Btn label="Simpan Inspeksi" onPress={() => { onSave({ type, states, photos, note }); Alert.alert('Tersimpan', `Inspeksi kamar ${room.no} berhasil disimpan.`); }} />
      <Btn label="Batal" outline onPress={onCancel} />
    </ScrollView>
  );
}
export type { Result };
