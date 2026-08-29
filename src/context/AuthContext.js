import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const RIDER_KEY = 'itrola_rider_session';   // JSON: { token, phone, userId }
const DRIVER_KEY = 'itrola_driver_session'; // JSON: { token, phone, userId }
const ACTIVE_ROLE_KEY = 'itrola_active_role';
// client.js's axios interceptor reads this exact key on every request — kept
// as-is so client.js itself needs zero changes. AuthContext is responsible
// for keeping it mirrored to whichever session is currently "in front".
const ACTIVE_TOKEN_KEY = 'itrola_access_token';

async function loadSession(key) {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

export function AuthProvider({ children }) {
  const [riderSession, setRiderSession] = useState(null);
  const [driverSession, setDriverSession] = useState(null);
  const [activeRole, setActiveRole] = useState(null); // 'rider' | 'driver' | null
  // True only while actively logging in to ADD a second role's session — the
  // existing session underneath is left completely untouched during this.
  const [forceAuthFlow, setForceAuthFlow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [rider, driver, storedActiveRole] = await Promise.all([
        loadSession(RIDER_KEY),
        loadSession(DRIVER_KEY),
        AsyncStorage.getItem(ACTIVE_ROLE_KEY),
      ]);
      setRiderSession(rider);
      setDriverSession(driver);

      const validStored = storedActiveRole === 'rider' || storedActiveRole === 'driver' ? storedActiveRole : null;
      const resolvedRole =
        validStored && (validStored === 'rider' ? rider : driver)
          ? validStored
          : rider
          ? 'rider'
          : driver
          ? 'driver'
          : null;
      setActiveRole(resolvedRole);

      const activeSession = resolvedRole === 'rider' ? rider : resolvedRole === 'driver' ? driver : null;
      if (activeSession) {
        await AsyncStorage.setItem(ACTIVE_TOKEN_KEY, activeSession.token);
      }
      setIsLoading(false);
    })();
  }, []);

  const mirrorActiveToken = async (session) => {
    if (session) {
      await AsyncStorage.setItem(ACTIVE_TOKEN_KEY, session.token);
    } else {
      await AsyncStorage.removeItem(ACTIVE_TOKEN_KEY);
    }
  };

  // role: 'rider' | 'driver', userId: the rider's or driver's own id from the
  // backend. Adds/replaces ONLY that role's session — the other role's
  // session (if any) is never touched, which is what lets someone be logged
  // in as both rider and driver at once.
  const login = async (accessToken, phone, role, userId) => {
    const session = { token: accessToken, phone, userId };
    const key = role === 'driver' ? DRIVER_KEY : RIDER_KEY;
    await AsyncStorage.setItem(key, JSON.stringify(session));
    if (role === 'driver') {
      setDriverSession(session);
    } else {
      setRiderSession(session);
    }
    await AsyncStorage.setItem(ACTIVE_ROLE_KEY, role);
    setActiveRole(role);
    await mirrorActiveToken(session);
    setForceAuthFlow(false);
  };

  // Switches which already-logged-in session is "in front" — e.g. tapping
  // "Switch to Driver" in the menu. Does NOT touch the other session, so an
  // in-progress trip on the other side survives the switch untouched.
  const switchRole = async (role) => {
    const session = role === 'driver' ? driverSession : riderSession;
    if (!session) return false;
    await AsyncStorage.setItem(ACTIVE_ROLE_KEY, role);
    setActiveRole(role);
    await mirrorActiveToken(session);
    return true;
  };

  // Logs out only the CURRENTLY ACTIVE role's session. If the other role
  // still has a session, that one becomes active automatically — the person
  // only sees the login screen again once both sessions are gone.
  const logout = async () => {
    if (!activeRole) return;
    const key = activeRole === 'driver' ? DRIVER_KEY : RIDER_KEY;
    await AsyncStorage.removeItem(key);

    const otherSession = activeRole === 'driver' ? riderSession : driverSession;
    const otherRole = activeRole === 'driver' ? 'rider' : 'driver';

    if (activeRole === 'driver') {
      setDriverSession(null);
    } else {
      setRiderSession(null);
    }

    const fallbackRole = otherSession ? otherRole : null;
    setActiveRole(fallbackRole);
    await AsyncStorage.setItem(ACTIVE_ROLE_KEY, fallbackRole || '');
    await mirrorActiveToken(otherSession || null);
  };

  // Opens the login/OTP flow to add a session for the OTHER role while the
  // current one stays fully intact underneath. isAuthenticated flips false
  // for the duration, which is what makes RootNavigator show AuthStack.
  const beginAddRoleSession = () => setForceAuthFlow(true);
  const cancelAddRoleSession = () => setForceAuthFlow(false);

  const activeSession =
    activeRole === 'driver' ? driverSession : activeRole === 'rider' ? riderSession : null;

  return (
    <AuthContext.Provider
      value={{
        token: activeSession?.token || null,
        phone: activeSession?.phone || null,
        userId: activeSession?.userId || null,
        role: activeRole,
        isLoading,
        isAuthenticated: !!activeRole && !forceAuthFlow,
        forceAuthFlow,
        hasRiderSession: !!riderSession,
        hasDriverSession: !!driverSession,
        login,
        logout,
        switchRole,
        beginAddRoleSession,
        cancelAddRoleSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
