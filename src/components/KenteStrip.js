import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

/**
 * Thin repeating stripe used as a brand accent under headers / on cards.
 * A subtle nod to kente cloth without being literal or heavy-handed.
 */
export default function KenteStrip({ height = 6, style }) {
  const blocks = new Array(12).fill(0);
  return (
    <View style={[styles.row, { height }, style]}>
      {blocks.map((_, i) => (
        <View
          key={i}
          style={[
            styles.block,
            {
              backgroundColor:
                i % 3 === 0 ? colors.gold : i % 3 === 1 ? colors.forestGreen : colors.kenteRed,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', width: '100%', overflow: 'hidden' },
  block: { flex: 1 },
});
