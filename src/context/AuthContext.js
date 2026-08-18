import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const TOKEN_KEY = 'itrola_access_token';
const PHONE_KEY = 'itrola_user_phone';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [phone, setPhone] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      const storedPhone = await AsyncStorage.getItem(PHONE_KEY);
      setToken(storedToken);
      setPhone(storedPhone);
      setIsLoading(false);
    })();
  }, []);

  const login = async (accessToken, userPhone) => {
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(PHONE_KEY, userPhone);
    setToken(accessToken);
    setPhone(userPhone);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(PHONE_KEY);
    setToken(null);
    setPhone(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, phone, isLoading, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
