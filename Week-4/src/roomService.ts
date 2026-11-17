import { API_URL } from './config';
import { Room, RoomStatus } from './shared';

// 1. DTO (Data Transfer Object) - Bentuk data mentah dari server REST API
export type RoomDTO = {
  id: number;
  nama_kamar: string;
  tipe: string;
  status: 'terisi' | 'kosong' | 'perlu_dibersihkan' | 'rusak';
  penghuni: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_MAP: Record<RoomDTO['status'], RoomStatus> = {
  terisi: 'Terisi',
  kosong: 'Kosong',
  perlu_dibersihkan: 'Perlu Dibersihkan',
  rusak: 'Rusak',
};

// 2. Data Mapping - Memilih field yang diperlukan saja oleh UI aplikasi
export const mapRoom = (d: RoomDTO): Room => ({
  id: String(d.id),
  no: d.nama_kamar,
  type: d.tipe,
  status: STATUS_MAP[d.status] ?? 'Kosong',
  tenant: d.penghuni ?? undefined,
});

// 3. Fetch Data dari RESTful API Endpoint (GET /rooms)
export async function fetchRooms(): Promise<Room[]> {
  const url = `${API_URL}/rooms`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Server mengembalikan status ${res.status}`);
  }

  // Parse JSON ke format objek JavaScript
  const data: RoomDTO[] = await res.json();
  
  // Transformasikan / petakan data menggunakan mapRoom
  return data.map(mapRoom);
}
