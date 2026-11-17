import { API_URL } from './config';
import { saveToken } from './authStorage';

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login gagal (status ${res.status})`);
  const data = await res.json();
  await saveToken(data.access_token);
  return data;
}


