import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'access_token';

export const saveToken = async (t: string) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(KEY, t);
    } catch {}
    return;
  }
  return SecureStore.setItemAsync(KEY, t);
};

export const getToken = async () => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(KEY);
};

export const clearToken = async () => {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    return;
  }
  return SecureStore.deleteItemAsync(KEY);
};

// Alias pendukung
export const getStoredToken = getToken;
