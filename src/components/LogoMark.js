import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

/**
 * Placeholder logo mark. No image asset exists yet for itrola Ride, so this
 * renders a simple branded badge instead of leaving the hero area with text
 * only. Swap this out for an <Image source={require('../../assets/logo.png')} />
 * once a real logo file is available — every screen already imports this
 * component, so the swap only needs to happen in one place.
 */
export default function LogoMark({ size = 56 }) {
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.glyph, { fontSize: size * 0.48 }]}>i</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.cyan,
  },
  glyph: {
    fontWeight: '900',
    fontStyle: 'italic',
    color: colors.pink,
  },
});
