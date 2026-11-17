import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'roomcheck_auth_token';
const USER_KEY = 'roomcheck_user_session';

// Memory fallback untuk lingkungan Web di mana SecureStore tidak didukung
let memoryStorage: Record<string, string> = {};

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    memoryStorage[TOKEN_KEY] = token;
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return memoryStorage[TOKEN_KEY] ?? null;
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  if (Platform.OS === 'web') {
    delete memoryStorage[TOKEN_KEY];
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function saveUserSession(email: string): Promise<void> {
  if (Platform.OS === 'web') {
    memoryStorage[USER_KEY] = email;
    return;
  }
  await SecureStore.setItemAsync(USER_KEY, email);
}

export async function getUserSession(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return memoryStorage[USER_KEY] ?? null;
  }
  return await SecureStore.getItemAsync(USER_KEY);
}

export async function clearAllSession(): Promise<void> {
  await removeToken();
  if (Platform.OS === 'web') {
    delete memoryStorage[USER_KEY];
    return;
  }
  await SecureStore.deleteItemAsync(USER_KEY);
}
