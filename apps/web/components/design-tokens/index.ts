/**
 * Design Tokens Index
 * 
 * Central export point for all design tokens.
 * Import design tokens from this file for use in components.
 * 
 * @example
 * import { colors, spacing, shadows } from '@/components/design-tokens';
 * 
 * const MyComponent = () => (
 *   <div style={{ 
 *     backgroundColor: colors.primary[500],
 *     padding: spacing[4],
 *     boxShadow: shadows.md 
 *   }}>
 *     Content
 *   </div>
 * );
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
export * from './borderRadius';
export * from './motion';

/**
 * Design Token Version
 */
export const DESIGN_TOKEN_VERSION = '1.0.0';

/**
 * Breakpoints (matches Tailwind config)
 */
export const breakpoints = {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Z-index scale (matches Tailwind config)
 */
export const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

export type ZIndex = keyof typeof zIndex;

/**
 * Get breakpoint value
 * @example getBreakpoint('md') // '768px'
 */
export function getBreakpoint(key: Breakpoint): string {
  return breakpoints[key];
}

/**
 * Get z-index value
 * @example getZIndex('modal') // 1050
 */
export function getZIndex(key: ZIndex): number {
  return zIndex[key];
}

/**
 * Utility to check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Utility to check if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
