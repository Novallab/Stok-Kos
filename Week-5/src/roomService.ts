import { API_URL } from './config';
import { getToken } from './authStorage';
import { Room, RoomStatus } from './shared';

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

export const mapRoom = (d: RoomDTO): Room => ({
  id: String(d.id),
  no: d.nama_kamar,
  type: d.tipe,
  status: STATUS_MAP[d.status] ?? 'Kosong',
  tenant: d.penghuni ?? undefined,
});

/**
 * Mengakses Protected Endpoint GET /rooms dengan Bearer Token (Sprint 04)
 */
export async function fetchRooms(): Promise<Room[]> {
  const token = await getToken();
  if (!token) {
    throw new Error('Akses ditolak (401 Unauthorized): Sesi belum terautentikasi atau token tidak ada.');
  }

  const url = `${API_URL}/rooms`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`, // Mengirim Authorization Header
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Akses ditolak (401 Unauthorized): Token kedaluwarsa atau tidak valid.');
    }
    throw new Error(`Server mengembalikan status ${res.status}`);
  }

  const data: RoomDTO[] = await res.json();
  return data.map(mapRoom);
}
