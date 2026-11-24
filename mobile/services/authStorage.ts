
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'luferaone_auth_token';

export async function saveAuthToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getAuthToken() {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeAuthToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
