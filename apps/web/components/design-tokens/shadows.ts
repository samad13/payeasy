/**
 * Shadow Design Tokens
 * 
 * These tokens define the shadow system for elevation and depth.
 */

export const shadows = {
  // Elevation shadows
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Colored shadows
  primary: '0 10px 15px -3px rgba(125, 0, 255, 0.2), 0 4px 6px -4px rgba(125, 0, 255, 0.1)',
  accent: '0 10px 15px -3px rgba(49, 120, 198, 0.2), 0 4px 6px -4px rgba(49, 120, 198, 0.1)',
  
  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  innerLg: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)',
  
  // Mobile shadows
  mobile: '0 2px 8px rgba(0, 0, 0, 0.1)',
  mobileLg: '0 4px 16px rgba(0, 0, 0, 0.15)',
  
  // Focus rings
  focus: '0 0 0 3px rgba(125, 0, 255, 0.3)',
  focusAccent: '0 0 0 3px rgba(49, 120, 198, 0.3)',
  
  none: 'none',
} as const;

export type ShadowKey = keyof typeof shadows;

/**
 * Get shadow value
 * @example getShadow('md') // Shadow string
 */
export function getShadow(key: ShadowKey): string {
  return shadows[key];
}

/**
 * Elevation levels mapped to shadows
 */
export const elevationLevels = {
  0: shadows.none,
  1: shadows.xs,
  2: shadows.sm,
  3: shadows.base,
  4: shadows.md,
  5: shadows.lg,
  6: shadows.xl,
  7: shadows['2xl'],
} as const;

/**
 * Component-specific shadow presets
 */
export const shadowPresets = {
  card: {
    default: shadows.base,
    hover: shadows.md,
    pressed: shadows.sm,
  },
  button: {
    default: shadows.sm,
    hover: shadows.md,
    pressed: shadows.xs,
  },
  modal: {
    backdrop: 'none',
    content: shadows['2xl'],
  },
  dropdown: {
    default: shadows.lg,
  },
  tooltip: {
    default: shadows.md,
  },
  input: {
    default: shadows.xs,
    focus: shadows.focus,
    error: '0 0 0 3px rgba(239, 68, 68, 0.3)',
  },
} as const;
