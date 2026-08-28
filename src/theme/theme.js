/**
 * itrola Ride — brand theme
 * Matched to the actual itrola true image logo: hot pink/magenta,
 * cyan/blue, and charcoal. (Previous forest-green/gold/kente styling
 * was carried over incorrectly from an unrelated project — this
 * replaces it.)
 */
export const colors = {
  pink: '#EC1E7D',       // primary brand — "it" / "true image" in logo
  pinkDark: '#C4155F',
  cyan: '#00AEEF',        // secondary brand — "rola" in logo
  cyanDark: '#0090C7',
  charcoal: '#2D2D2D',    // badge background, primary text
  slate: '#6B7280',       // secondary text
  border: '#E5E7EB',
  background: '#FFFFFF',  // clean white, matches logo's light backdrop
  white: '#FFFFFF',
  success: '#2F9E5B',
  warning: '#D9A017',
  danger: '#D63A3A',
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
  h1: { fontSize: 28, fontWeight: '800', color: colors.charcoal },
  h2: { fontSize: 22, fontWeight: '700', color: colors.charcoal },
  h3: { fontSize: 17, fontWeight: '600', color: colors.charcoal },
  body: { fontSize: 15, fontWeight: '400', color: colors.charcoal },
  caption: { fontSize: 13, fontWeight: '400', color: colors.slate },
  price: { fontSize: 24, fontWeight: '800', color: colors.pink },
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
