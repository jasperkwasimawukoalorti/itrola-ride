import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { colors, spacing, typography, radius, shadow } from '../theme/theme';
import BrandAccent from '../components/BrandAccent';
import LogoMark from '../components/LogoMark';
import PrimaryButton from '../components/PrimaryButton';
import AppMenu, { MenuButton } from '../components/AppMenu';
import {
  setDriverAvailability,
  updateDriverLocation,
  getCurrentDriverTrip,
  startTrip,
  completeTrip,
  cancelTrip,
} from '../api/client';
import { useAuth } from '../context/AuthContext';

const POLL_INTERVAL_MS = 4000;

export default function DriverHomeScreen() {
  const { userId, phone, logout } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [trip, setTrip] = useState(null);
  const [busy, setBusy] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const watcherRef = useRef(null);
  const pollRef = useRef(null);

  const hasActiveTrip = trip && (trip.status === 'matched' || trip.status === 'en_route' || trip.status === 'in_progress');

  const stopTracking = useCallback(() => {
    if (watcherRef.current) {
      watcherRef.current.remove();
      watcherRef.current = null;
    }
  }, []);

  const startTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location needed', 'itrola Ride needs your location to send you nearby trip requests.');
      return;
    }
    watcherRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 20 },
      (loc) => {
        const { latitude, longitude, heading } = loc.coords;
        updateDriverLocation(userId, latitude, longitude, heading || undefined).catch(() => {});
      }
    );
  }, [userId]);

  const pollTrip = useCallback(async () => {
    try {
      const res = await getCurrentDriverTrip();
      setTrip(res.data);
    } catch (err) {
      if (err?.response?.status === 404) setTrip(null);
    }
  }, []);

  useEffect(() => {
    pollTrip();
    pollRef.current = setInterval(pollTrip, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [pollTrip]);

  useEffect(() => () => stopTracking(), [stopTracking]);

  // --- Keep the local "online/offline" state truthful ---
  // The backend flips a driver's is_available flag automatically the moment
  // a trip is matched (back to true on complete/cancel). The UI has no way
  // to fetch that raw flag directly (there's no GET /drivers/me endpoint),
  // but the presence/absence of an active trip tells us the same thing:
  // if we're polling and a trip shows up as matched/in_progress, the
  // backend has already marked us unavailable — so the toggle must reflect
  // that, rather than silently drifting out of sync with reality.
  useEffect(() => {
    if (hasActiveTrip) {
      setIsAvailable(false);
    }
  }, [hasActiveTrip]);

  const handleToggle = async (value) => {
    if (hasActiveTrip) {
      // Shouldn't be reachable since the switch is disabled during a trip,
      // but guard anyway rather than letting the UI and backend disagree.
      return;
    }
    setToggling(true);
    try {
      await setDriverAvailability(userId, value);
      setIsAvailable(value);
      if (value) {
        await startTracking();
      } else {
        stopTracking();
      }
    } catch (err) {
      Alert.alert(
        'Could not update availability',
        err?.response?.data?.detail || 'Something went wrong. Please try again.'
      );
    } finally {
      setToggling(false);
    }
  };

  const handleStart = async () => {
    setBusy(true);
    try {
      await startTrip(trip.id);
      await pollTrip();
    } catch (err) {
      Alert.alert('Could not start trip', err?.response?.data?.detail || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleComplete = async () => {
    setBusy(true);
    try {
      const res = await completeTrip(trip.id);
      Alert.alert('Trip completed', `Fare: GH₵ ${res.data.fare_final?.toFixed?.(2) ?? res.data.fare_final}`);
      setTrip(null);
      // Backend sets is_available back to true on completion — mirror that
      // here so the toggle doesn't sit on a stale "false" after the trip ends.
      setIsAvailable(true);
    } catch (err) {
      Alert.alert('Could not complete trip', err?.response?.data?.detail || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel this trip?', 'The rider will be notified.', [
      { text: 'Keep trip', style: 'cancel' },
      {
        text: 'Cancel trip',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await cancelTrip(trip.id);
            setTrip(null);
            // Backend also restores is_available to true on cancel.
            setIsAvailable(true);
          } catch (err) {
            Alert.alert('Could not cancel', err?.response?.data?.detail || 'Please try again.');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const availabilityLabel = hasActiveTrip
    ? 'On a trip'
    : isAvailable
    ? 'Online — receiving requests'
    : 'Offline';

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <LogoMark size={44} />
        <Text style={styles.logoText}>itrola Ride</Text>
        <Text style={styles.tagline}>Driver</Text>
        <MenuButton onPress={() => setMenuVisible(true)} />
      </View>
      <BrandAccent height={8} />

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={[typography.caption, { marginBottom: spacing.md }]}>{phone}</Text>

        <View style={[styles.availabilityRow, shadow.card]}>
          <Text style={typography.h3}>{availabilityLabel}</Text>
          {toggling ? (
            <ActivityIndicator color={colors.pink} />
          ) : (
            <Switch
              value={isAvailable}
              onValueChange={handleToggle}
              disabled={hasActiveTrip}
              trackColor={{ false: colors.border, true: colors.cyan }}
              thumbColor={colors.pink}
            />
          )}
        </View>

        {!hasActiveTrip && isAvailable && (
          <View style={[styles.card, shadow.card]}>
            <Text style={typography.body}>Waiting for a trip request…</Text>
          </View>
        )}

        {trip && trip.status === 'matched' && (
          <View style={[styles.card, shadow.card]}>
            <Text style={[typography.h3, { color: colors.pink }]}>New trip request</Text>
            {trip.fare_estimate != null && (
              <Text style={[typography.price, { marginTop: spacing.xs }]}>
                GH₵ {trip.fare_estimate.toFixed(2)}
              </Text>
            )}
            <View style={{ height: spacing.md }} />
            <PrimaryButton title="Start Trip" onPress={handleStart} loading={busy} />
            <PrimaryButton
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              disabled={busy}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}

        {trip && trip.status === 'in_progress' && (
          <View style={[styles.card, shadow.card]}>
            <Text style={[typography.h3, { color: colors.cyan }]}>Trip in progress</Text>
            {trip.fare_estimate != null && (
              <Text style={[typography.price, { marginTop: spacing.xs }]}>
                GH₵ {trip.fare_estimate.toFixed(2)}
              </Text>
            )}
            <View style={{ height: spacing.md }} />
            <PrimaryButton title="Complete Trip" onPress={handleComplete} loading={busy} variant="accent" />
          </View>
        )}
      </ScrollView>

      <AppMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={[{ label: 'Log out', danger: true, onPress: logout }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { backgroundColor: colors.pink, paddingTop: 70, paddingBottom: spacing.lg, alignItems: 'center' },
  logoText: { fontSize: 26, fontWeight: '800', color: colors.cyan, marginTop: spacing.sm },
  tagline: { fontSize: 13, color: colors.white, marginTop: 2 },
  body: { flexGrow: 1, padding: spacing.lg },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
});
