import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { colors, spacing, typography, radius, shadow } from '../theme/theme';
import BrandAccent from '../components/BrandAccent';
import LogoMark from '../components/LogoMark';
import PrimaryButton from '../components/PrimaryButton';
import AppMenu, { MenuButton, buildAccountMenuItems } from '../components/AppMenu';
import { getTrip, cancelTrip } from '../api/client';
import { useAuth } from '../context/AuthContext';

const STATUS_COPY = {
  requested: { label: 'Finding you a driver…', tone: colors.slate },
  matched: { label: 'Driver assigned — on the way to you', tone: colors.pink },
  en_route: { label: 'Driver is en route', tone: colors.pink },
  in_progress: { label: 'Trip in progress', tone: colors.cyan },
  completed: { label: 'Trip completed', tone: colors.success },
  cancelled: { label: 'Trip cancelled', tone: colors.danger },
};

const POLL_INTERVAL_MS = 4000;
// If a trip sits in "requested" (unmatched) for this long, tell the rider
// outright rather than leaving them staring at "Finding you a driver…"
// indefinitely with no explanation.
const NO_DRIVER_TIMEOUT_MS = 45000;

export default function TripTrackingScreen({ route, navigation }) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showNoDriverNotice, setShowNoDriverNotice] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const pollRef = useRef(null);
  const noDriverTimerRef = useRef(null);
  const auth = useAuth();

  const fetchTrip = async () => {
    try {
      const res = await getTrip(tripId);
      setTrip(res.data);

      if (res.data.status !== 'requested' && noDriverTimerRef.current) {
        clearTimeout(noDriverTimerRef.current);
        noDriverTimerRef.current = null;
        setShowNoDriverNotice(false);
      }

      if (res.data.status === 'completed') {
        clearInterval(pollRef.current);
        navigation.replace('Payment', { tripId, fare: res.data.fare_estimate });
      }
      if (res.data.status === 'cancelled') {
        clearInterval(pollRef.current);
      }
    } catch (err) {
      // transient network hiccups shouldn't spam alerts during polling
      console.warn('trip poll failed', err?.message);
    }
  };

  useEffect(() => {
    fetchTrip();
    pollRef.current = setInterval(fetchTrip, POLL_INTERVAL_MS);
    noDriverTimerRef.current = setTimeout(() => {
      setShowNoDriverNotice(true);
    }, NO_DRIVER_TIMEOUT_MS);
    return () => {
      clearInterval(pollRef.current);
      if (noDriverTimerRef.current) clearTimeout(noDriverTimerRef.current);
    };
  }, [tripId]);

  const handleCancel = () => {
    Alert.alert('Cancel this trip?', 'This cannot be undone.', [
      { text: 'Keep trip', style: 'cancel' },
      {
        text: 'Cancel trip',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await cancelTrip(tripId);
            clearInterval(pollRef.current);
            navigation.navigate('Home');
          } catch (err) {
            Alert.alert('Could not cancel', err?.response?.data?.detail || 'Please try again.');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  if (!trip) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.pink} />
      </View>
    );
  }

  const status = STATUS_COPY[trip.status] || { label: trip.status, tone: colors.slate };
  const canCancel = ['requested', 'matched', 'en_route'].includes(trip.status);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <LogoMark size={40} />
        <Text style={styles.heroLabel}>itrola Ride</Text>
        <MenuButton onPress={() => setMenuVisible(true)} />
      </View>
      <BrandAccent height={8} />

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={[styles.statusCard, shadow.card]}>
          <View style={[styles.statusDot, { backgroundColor: status.tone }]} />
          <Text style={[typography.h3, { color: status.tone, flex: 1 }]}>{status.label}</Text>
        </View>

        {trip.status === 'requested' && showNoDriverNotice && (
          <View style={[styles.noticeCard, shadow.card]}>
            <Text style={[typography.body, { fontWeight: '600' }]}>
              No drivers available nearby right now
            </Text>
            <Text style={[typography.caption, { marginTop: spacing.xs }]}>
              We're still looking — you can keep waiting or cancel and try again shortly.
            </Text>
          </View>
        )}

        {trip.fare_estimate != null && (
          <View style={styles.fareRow}>
            <Text style={typography.body}>Estimated fare</Text>
            <Text style={typography.price}>GH₵ {trip.fare_estimate.toFixed(2)}</Text>
          </View>
        )}

        {trip.driver_id && (
          <Text style={[typography.caption, { marginTop: spacing.sm }]}>
            Driver ID: {trip.driver_id}
          </Text>
        )}

        <View style={{ flex: 1, minHeight: spacing.xl }} />

        {canCancel && (
          <PrimaryButton
            title="Cancel trip"
            onPress={handleCancel}
            loading={cancelling}
            variant="danger"
          />
        )}

        {trip.status === 'cancelled' && (
          <PrimaryButton title="Back to Home" onPress={() => navigation.navigate('Home')} />
        )}
      </ScrollView>

      <AppMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={buildAccountMenuItems(auth)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  hero: { backgroundColor: colors.pink, paddingTop: 70, paddingBottom: spacing.lg, alignItems: 'center' },
  heroLabel: { fontSize: 20, fontWeight: '800', color: colors.cyan, marginTop: spacing.sm },
  body: { flexGrow: 1, padding: spacing.lg },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noticeCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.sm },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
  },
});
