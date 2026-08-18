import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { colors, spacing, radius, typography } from '../theme/theme';

/**
 * Simple address text entry that geocodes via the device's geocoder.
 * Good enough for MVP; swap for Google Places Autocomplete later for a
 * proper type-ahead experience (needs a Places API key + billing).
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
      const results = await Location.geocodeAsync(text.trim());
      if (results.length === 0) {
        setError('Could not find that place. Try a more specific address.');
        return;
      }
      const { latitude, longitude } = results[0];
      onSelect({ lat: latitude, lng: longitude, label: text.trim() });
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
