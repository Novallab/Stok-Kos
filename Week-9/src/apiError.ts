export type ApiErrorKind = 'offline' | 'timeout' | 'client' | 'server' | 'unknown';

export interface ApiErrorInfo {
  kind: ApiErrorKind;
  title: string;
  message: string;
  statusCode?: number;
}

export class ApiError extends Error implements ApiErrorInfo {
  kind: ApiErrorKind;
  title: string;
  statusCode?: number;

  constructor(title: string, message: string, kind: ApiErrorKind, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.title = title;
    this.kind = kind;
    this.statusCode = statusCode;
  }
}

export function parseError(err: unknown): ApiErrorInfo {
  if (err instanceof ApiError) {
    return {
      kind: err.kind,
      title: err.title,
      message: err.message,
      statusCode: err.statusCode,
    };
  }

  const msg = err instanceof Error ? err.message : String(err || '');
  const name = err instanceof Error ? err.name : '';

  if (name === 'AbortError' || /timeout|timed out/i.test(msg)) {
    return {
      kind: 'timeout',
      title: 'Waktu habis',
      message: 'Server terlalu lama merespons (timeout).',
    };
  }

  if (
    /network request failed|failed to fetch|network error|offline|internet/i.test(msg) ||
    name === 'TypeError'
  ) {
    return {
      kind: 'offline',
      title: 'Tidak ada koneksi internet.',
      message: 'Periksa koneksi Anda dan coba lagi.',
    };
  }

  return {
    kind: 'unknown',
    title: 'Gagal memuat data',
    message: msg || 'Terjadi kesalahan pada server. Silakan coba lagi.',
  };
}
