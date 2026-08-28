import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const TOKEN_KEY = 'itrola_access_token';
const PHONE_KEY = 'itrola_user_phone';
const ROLE_KEY = 'itrola_user_role';   // 'rider' | 'driver'
const USER_ID_KEY = 'itrola_user_id';  // rider or driver id, depending on role

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [phone, setPhone] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [storedToken, storedPhone, storedRole, storedUserId] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(PHONE_KEY),
        AsyncStorage.getItem(ROLE_KEY),
        AsyncStorage.getItem(USER_ID_KEY),
      ]);
      setToken(storedToken);
      setPhone(storedPhone);
      setRole(storedRole);
      setUserId(storedUserId);
      setIsLoading(false);
    })();
  }, []);

  // role: 'rider' | 'driver', userId: the rider's or driver's own id from the backend
  const login = async (accessToken, userPhone, userRole, id) => {
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(PHONE_KEY, userPhone);
    await AsyncStorage.setItem(ROLE_KEY, userRole);
    await AsyncStorage.setItem(USER_ID_KEY, id);
    setToken(accessToken);
    setPhone(userPhone);
    setRole(userRole);
    setUserId(id);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, PHONE_KEY, ROLE_KEY, USER_ID_KEY]);
    setToken(null);
    setPhone(null);
    setRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        phone,
        role,
        userId,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
