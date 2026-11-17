import { API_URL } from './config';
import { ApiError } from './apiError';
import { ROOMS, Room, RoomStatus } from './shared';

// DTO: bentuk data apa adanya dari server (GET /rooms)
export type RoomDTO = {
  id: number;
  nama_kamar: string;
  tipe: string;
  status: 'terisi' | 'kosong' | 'perlu_dibersihkan' | 'rusak';
  penghuni: string | null;
  created_at?: string;
  updated_at?: string;
};

export type DemoSimulationMode = 'normal' | 'offline' | 'timeout' | '404' | '500' | 'empty';

const STATUS_MAP: Record<RoomDTO['status'], RoomStatus> = {
  terisi: 'Terisi',
  kosong: 'Kosong',
  perlu_dibersihkan: 'Perlu Dibersihkan',
  rusak: 'Rusak',
};

// Mapping: ambil field yang dibutuhkan UI saja
export const mapRoom = (d: RoomDTO): Room => ({
  id: String(d.id),
  no: d.nama_kamar,
  type: d.tipe,
  status: STATUS_MAP[d.status] ?? 'Kosong',
  tenant: d.penghuni ?? undefined,
});

/**
 * Normalisasi URL agar aman bila mahasiswa lupa menuliskan prefix 'http://'
 */
function getNormalizedBaseUrl(): string {
  const trimmed = (API_URL || '').trim();
  if (!trimmed) return 'http://localhost:3000';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, '');
  }
  return `http://${trimmed.replace(/\/+$/, '')}`;
}

/**
 * Mengambil daftar kamar dengan penanganan error sesuai ketentuan Sprint 05 (Week 6):
 * - Memeriksa status HTTP 2xx, 4xx, 5xx
 * - Timeout handling (10 detik)
 * - Offline / Network error handling
 * - Simulasi pengujian untuk demo sprint
 */
export async function fetchRooms(simulationMode: DemoSimulationMode = 'normal'): Promise<Room[]> {
  // Simulasi pengujian untuk demo sprint 05
  if (simulationMode === 'offline') {
    await new Promise((resolve) => setTimeout(resolve, 800));
    throw new ApiError(
      'Tidak ada koneksi internet.',
      'Periksa koneksi Anda dan coba lagi.',
      'offline'
    );
  }

  if (simulationMode === 'timeout') {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    throw new ApiError(
      'Waktu habis',
      'Server terlalu lama merespons (timeout).',
      'timeout'
    );
  }

  if (simulationMode === '404') {
    await new Promise((resolve) => setTimeout(resolve, 800));
    throw new ApiError(
      'Data tidak ditemukan',
      'Kamar yang Anda cari tidak tersedia (404 Not Found).',
      'client',
      404
    );
  }

  if (simulationMode === '500') {
    await new Promise((resolve) => setTimeout(resolve, 800));
    throw new ApiError(
      'Terjadi kesalahan pada server.',
      'Server sedang mengalami gangguan. Silakan coba lagi nanti (500 Internal Server Error).',
      'server',
      500
    );
  }

  if (simulationMode === 'empty') {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return [];
  }

  // Permintaan API nyata
  const baseUrl = getNormalizedBaseUrl();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000); // Batas waktu 10 detik

  try {
    const res = await fetch(`${baseUrl}/rooms`, {
      headers: { Accept: 'application/json' },
      signal: ctrl.signal,
    });

    // Periksa status code response
    if (!res.ok) {
      if (res.status === 404) {
        throw new ApiError(
          'Data tidak ditemukan',
          'Kamar yang Anda cari tidak tersedia (404 Not Found).',
          'client',
          404
        );
      }
      if (res.status === 401) {
        throw new ApiError(
          'Belum terautentikasi',
          'Sesi login telah berakhir atau token tidak valid (401 Unauthorized).',
          'client',
          401
        );
      }
      if (res.status === 403) {
        throw new ApiError(
          'Akses ditolak',
          'Anda tidak memiliki izin untuk melihat daftar ini (403 Forbidden).',
          'client',
          403
        );
      }
      if (res.status >= 400 && res.status < 500) {
        throw new ApiError(
          'Kesalahan Permintaan Client',
          `Permintaan tidak dapat diproses (${res.status} Client Error).`,
          'client',
          res.status
        );
      }
      if (res.status === 500) {
        throw new ApiError(
          'Terjadi kesalahan pada server.',
          'Server sedang mengalami gangguan (500 Internal Server Error). Silakan coba lagi.',
          'server',
          500
        );
      }
      if (res.status === 503) {
        throw new ApiError(
          'Layanan tidak tersedia',
          'Server sedang maintenance atau tidak dapat menerima request (503 Service Unavailable).',
          'server',
          503
        );
      }
      if (res.status >= 500) {
        throw new ApiError(
          'Terjadi kesalahan pada server.',
          `Server merespons dengan kode gangguan (${res.status} Server Error).`,
          'server',
          res.status
        );
      }
      throw new ApiError(
        'Gagal mengambil data.',
        `Respons server tidak normal (Status: ${res.status}).`,
        'unknown',
        res.status
      );
    }

    const data: RoomDTO[] = await res.json();
    return data.map(mapRoom);
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err?.name === 'AbortError') {
      throw new ApiError(
        'Waktu habis',
        'Server terlalu lama merespons (timeout).',
        'timeout'
      );
    }
    // Network / TypeError / fetch failed -> Offline
    throw new ApiError(
      'Tidak ada koneksi internet.',
      'Periksa koneksi Anda dan coba lagi.',
      'offline'
    );
  } finally {
    clearTimeout(timer);
  }
}
