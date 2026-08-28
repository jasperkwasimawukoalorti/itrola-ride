import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

/**
 * Simple two-tone accent bar reflecting the itrola true image brand
 * (pink + cyan split), used under headers in place of the previous
 * kente-strip motif, which wasn't part of this brand.
 */
export default function BrandAccent({ height = 6, style }) {
  return (
    <View style={[styles.row, { height }, style]}>
      <View style={[styles.half, { backgroundColor: colors.pink }]} />
      <View style={[styles.half, { backgroundColor: colors.cyan }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', width: '100%', overflow: 'hidden' },
  half: { flex: 1 },
});
