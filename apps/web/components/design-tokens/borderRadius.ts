/**
 * Border Radius Design Tokens
 * 
 * These tokens define the border radius system for consistent rounded corners.
 */

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',   // Fully rounded
} as const;

export type BorderRadiusKey = keyof typeof borderRadius;

/**
 * Get border radius value
 * @example getBorderRadius('lg') // '0.5rem'
 */
export function getBorderRadius(key: BorderRadiusKey): string {
  return borderRadius[key];
}

/**
 * Component-specific border radius presets
 */
export const radiusPresets = {
  button: {
    sm: borderRadius.md,
    md: borderRadius.lg,
    lg: borderRadius.xl,
  },
  input: {
    default: borderRadius.md,
  },
  card: {
    sm: borderRadius.lg,
    md: borderRadius.xl,
    lg: borderRadius['2xl'],
  },
  modal: {
    default: borderRadius['2xl'],
  },
  avatar: {
    default: borderRadius.full,
    square: borderRadius.lg,
  },
  badge: {
    default: borderRadius.full,
    square: borderRadius.base,
  },
  image: {
    sm: borderRadius.md,
    md: borderRadius.lg,
    lg: borderRadius.xl,
  },
} as const;
