import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import * as SecureStore from "expo-secure-store";
import { saveToken, removeToken } from "../utils/token";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔑 BOOTSTRAP AUTH STATE (THIS WAS MISSING)
useEffect(() => {
  console.log("AUTH BOOTSTRAP START");

  const bootstrapAuth = async () => {
    const token = await SecureStore.getItemAsync("token");
    console.log("BOOTSTRAP TOKEN:", token);

    if (token) {
      console.log("AUTHENTICATED");
      setIsAuthenticated(true);
    } else {
      console.log("NOT AUTHENTICATED");
      setIsAuthenticated(false);
    }

    setLoading(false);
    console.log("AUTH BOOTSTRAP END");
  };

  bootstrapAuth();
}, []);

  const login = async (token) => {
    await saveToken(token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
     console.log("LOGOUT CALLED");
    await removeToken();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
