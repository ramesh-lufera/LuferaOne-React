
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'luferaone_auth_token';
let sessionToken: string | null = null;

export async function saveAuthToken(token: string, remember = true) {
  await removeAuthToken();
  if (Platform.OS === 'web') {
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  } else if (remember) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    sessionToken = token;
  }
}

export async function getAuthToken() {
  if (Platform.OS === 'web') {
    return typeof window === 'undefined' ? null : sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  }
  return sessionToken ?? await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeAuthToken() {
  sessionToken = null;
  if (Platform.OS === 'web') {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}
