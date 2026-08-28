import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/theme';

/**
 * Address text entry geocoded via OpenStreetMap's Nominatim API.
 * Android's built-in device geocoder (expo-location's geocodeAsync) is
 * unreliable outside a handful of core regions and consistently fails
 * for Ghanaian addresses — Nominatim is free, needs no API key, and is
 * far more consistent here. Biased toward Ghana via countrycodes=gh.
 */
export default function LocationInput({ label, value, onSelect, markerColor }) {
  const [text, setText] = useState(value || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const query = encodeURIComponent(text.trim());
      const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=gh`;
      const res = await fetch(url, {
        headers: {
          // Nominatim's usage policy asks for an identifying User-Agent.
          'User-Agent': 'itrolaRideApp/1.0 (itrola true image)',
        },
      });
      const results = await res.json();
      if (!results || results.length === 0) {
        setError('Could not find that place. Try a more specific address.');
        return;
      }
      const { lat, lon, display_name } = results[0];
      onSelect({ lat: parseFloat(lat), lng: parseFloat(lon), label: display_name || text.trim() });
    } catch (e) {
      setError('Search failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.dot, { backgroundColor: markerColor }]} />
      <View style={{ flex: 1 }}>
        <Text style={typography.caption}>{label}</Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
          placeholder={`Enter ${label.toLowerCase()} address`}
          placeholderTextColor={colors.slate}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" style={{ marginTop: 4 }} />}
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  input: { fontSize: 15, color: colors.charcoal, paddingVertical: 4 },
  error: { fontSize: 12, color: colors.danger, marginTop: 2 },
});
