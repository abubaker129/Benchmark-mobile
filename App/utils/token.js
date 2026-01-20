import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "token"; 

export async function saveToken(token) {
  if (!token) throw new Error("saveToken: token is required");
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
