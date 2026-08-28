import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/theme';

/**
 * Lightweight in-app menu built on React Native's own <Modal>, deliberately
 * avoiding @react-navigation/drawer (which pulls in react-native-gesture-handler
 * and react-native-reanimated — real native dependencies that need config
 * changes and a rebuild). This gives the same "tap to see navigation options"
 * experience without touching babel.config.js or risking the Expo Go setup.
 *
 * items: [{ label: string, onPress: () => void, danger?: boolean }]
 */
export default function AppMenu({ visible, onClose, items = [] }) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.panel}>
          {items.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.item, i === items.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => {
                onClose();
                item.onPress();
              }}
            >
              <Text style={[typography.body, item.danger && { color: colors.danger }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

// `light` is for use over the pink hero bars (translucent white circle,
// white glyph). `solid` is for use over variable backgrounds like the live
// map on HomeScreen, where a translucent white-on-white button would have
// no contrast — it gets an opaque white circle with a dark glyph instead.
export function MenuButton({ onPress, variant = 'light' }) {
  const isSolid = variant === 'solid';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.menuButton, isSolid && styles.menuButtonSolid]}
      hitSlop={12}
    >
      <Text style={[styles.menuGlyph, isSolid && styles.menuGlyphSolid]}>☰</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  panel: {
    position: 'absolute',
    top: 56,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  item: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuButton: {
    position: 'absolute',
    top: 48,
    right: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  menuButtonSolid: {
    backgroundColor: colors.white,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  menuGlyph: { fontSize: 20, color: colors.white, fontWeight: '700' },
  menuGlyphSolid: { color: colors.charcoal },
});
