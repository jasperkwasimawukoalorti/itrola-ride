import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';

import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import DriverSignupScreen from '../screens/DriverSignupScreen';
import HomeScreen from '../screens/HomeScreen';
import TripTrackingScreen from '../screens/TripTrackingScreen';
import PaymentScreen from '../screens/PaymentScreen';
import DriverHomeScreen from '../screens/DriverHomeScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="DriverSignup" component={DriverSignupScreen} />
    </Stack.Navigator>
  );
}

function RiderStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="TripTracking" component={TripTrackingScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
}

function DriverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  // isAuthenticated already accounts for forceAuthFlow (adding a 2nd role's
  // session) — see AuthContext.js. When that's true, this correctly falls
  // back to AuthStack without touching the session already stored underneath.
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.pink} />
      </View>
    );
  }

  let content;
  if (!isAuthenticated) {
    content = <AuthStack />;
  } else if (role === 'driver') {
    content = <DriverStack />;
  } else {
    content = <RiderStack />;
  }

  return <NavigationContainer>{content}</NavigationContainer>;
}
