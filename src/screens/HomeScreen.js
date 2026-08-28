import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, spacing, typography, radius, shadow } from '../theme/theme';
import PrimaryButton from '../components/PrimaryButton';
import LocationInput from '../components/LocationInput';
import { MenuButton } from '../components/AppMenu';
import AppMenu from '../components/AppMenu';
import { requestTrip } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const [region, setRegion] = useState(null);
  const [pickup, setPickup] = useState(null);   // { lat, lng, label }
  const [dropoff, setDropoff] = useState(null); // { lat, lng, label }
  const [requesting, setRequesting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const mapRef = useRef(null);
  const { logout } = useAuth();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location needed', 'Allow location access to set your pickup point.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const initialRegion = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(initialRegion);
      setPickup({ lat: loc.coords.latitude, lng: loc.coords.longitude, label: 'Current location' });
    })();
  }, []);

  const handleRequestRide = async () => {
    if (!pickup || !dropoff) {
      Alert.alert('Set both points', 'Please set a pickup and drop-off location.');
      return;
    }
    setRequesting(true);
    try {
      const res = await requestTrip({
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        dropoff_lat: dropoff.lat,
        dropoff_lng: dropoff.lng,
      });
      navigation.navigate('TripTracking', { tripId: res.data.id });
    } catch (err) {
      Alert.alert(
        'Could not request trip',
        err?.response?.data?.detail || 'Something went wrong. Please try again.'
      );
    } finally {
      setRequesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapWrap}>
        {region ? (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            initialRegion={region}
            showsUserLocation
          >
            {pickup && (
              <Marker
                coordinate={{ latitude: pickup.lat, longitude: pickup.lng }}
                pinColor={colors.pink}
                title="Pickup"
              />
            )}
            {dropoff && (
              <Marker
                coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }}
                pinColor={colors.cyan}
                title="Drop-off"
              />
            )}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={typography.caption}>Getting your location…</Text>
          </View>
        )}

        <MenuButton onPress={() => setMenuVisible(true)} variant="solid" />
      </View>

      <View style={[styles.sheet, shadow.card]}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          style={{ maxHeight: '100%' }}
        >
          <Text style={typography.h2}>Where to?</Text>

          <LocationInput
            label="Pickup"
            value={pickup?.label}
            onSelect={(loc) => setPickup(loc)}
            markerColor={colors.pink}
          />
          <LocationInput
            label="Drop-off"
            value={dropoff?.label}
            onSelect={(loc) => setDropoff(loc)}
            markerColor={colors.cyan}
          />

          <View style={{ height: spacing.md }} />
          <PrimaryButton
            title="Request Ride"
            onPress={handleRequestRide}
            loading={requesting}
            variant="accent"
          />
        </ScrollView>
      </View>

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
  mapWrap: { flex: 1 },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '55%',
  },
});
