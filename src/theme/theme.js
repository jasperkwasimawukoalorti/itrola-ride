/**
 * itrola Ride — brand theme
 * Pulled from the itrola true image "Kente & Forest" identity:
 * forest green, gold, cream, with kente-strip accents.
 */
export const colors = {
  forestGreen: '#0F3D2E',   // primary — headers, buttons, active states
  forestGreenDark: '#0A2B20',
  gold: '#D4A017',          // accent — CTAs, highlights, fare/price text
  goldLight: '#E8C766',
  cream: '#FAF6EC',         // background
  kenteRed: '#B3392C',      // used sparingly for alerts/cancel
  charcoal: '#1E1E1E',      // primary text
  slate: '#6B7280',         // secondary text
  border: '#E4DCC8',
  white: '#FFFFFF',
  success: '#2F7A4D',
  warning: '#C9821A',
  danger: '#B3392C',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '800', color: colors.forestGreen },
  h2: { fontSize: 22, fontWeight: '700', color: colors.forestGreen },
  h3: { fontSize: 17, fontWeight: '600', color: colors.charcoal },
  body: { fontSize: 15, fontWeight: '400', color: colors.charcoal },
  caption: { fontSize: 13, fontWeight: '400', color: colors.slate },
  price: { fontSize: 24, fontWeight: '800', color: colors.gold },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
};

export default { colors, spacing, radius, typography, shadow };
