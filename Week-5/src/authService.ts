import { API_URL } from './config';
import { clearAllSession, saveToken, saveUserSession } from './authStorage';

export async function login(email: string, password: string): Promise<{ access_token: string }> {
  // 1. Kirim request POST ke endpoint /login jika server mendukung
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      const token = data.access_token || data.token || `jwt_${Date.now()}`;
      await saveToken(token);
      await saveUserSession(email);
      return { access_token: token };
    }
  } catch {
    // Fallback untuk mock json-server
  }

  // Verifikasi kredensial demo
  if (password.length < 6) {
    throw new Error('Password minimal harus 6 karakter.');
  }

  const generatedToken = `bearer_jwt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  await saveToken(generatedToken);
  await saveUserSession(email);
  return { access_token: generatedToken };
}

export async function logout(): Promise<void> {
  await clearAllSession();
}
