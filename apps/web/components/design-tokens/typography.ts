/**
 * Typography Design Tokens
 * 
 * These tokens define the typography system for the PayEasy application.
 * Use these when you need programmatic access to typography values.
 */

export const fontSizes = {
  // Display Headings
  'display-2xl': { size: '4.5rem', lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' },
  'display-xl': { size: '3.75rem', lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' },
  'display-lg': { size: '3rem', lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' },
  
  // Headings
  h1: { size: '2.25rem', lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' },
  h2: { size: '1.875rem', lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' },
  h3: { size: '1.5rem', lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' },
  h4: { size: '1.25rem', lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' },
  h5: { size: '1.125rem', lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' },
  h6: { size: '1rem', lineHeight: '1.5', letterSpacing: '0', fontWeight: '600' },
  
  // Body Text
  'body-xl': { size: '1.25rem', lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' },
  'body-lg': { size: '1.125rem', lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' },
  'body-base': { size: '1rem', lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' },
  'body-sm': { size: '0.875rem', lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' },
  'body-xs': { size: '0.75rem', lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '400' },
} as const;

export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;

/**
 * Get font size properties
 * @example getFontSize('h1') // { size: '2.25rem', lineHeight: '1.2', ... }
 */
export function getFontSize(size: FontSize) {
  return fontSizes[size];
}

/**
 * Get font weight value
 * @example getFontWeight('bold') // '700'
 */
export function getFontWeight(weight: FontWeight): string {
  return fontWeights[weight];
}

/**
 * Typography presets for common use cases
 */
export const typographyPresets = {
  heroHeading: {
    ...fontSizes['display-2xl'],
    responsive: {
      mobile: fontSizes.h1,
      tablet: fontSizes['display-lg'],
      desktop: fontSizes['display-2xl'],
    },
  },
  pageHeading: {
    ...fontSizes.h1,
    responsive: {
      mobile: fontSizes.h2,
      tablet: fontSizes.h1,
      desktop: fontSizes.h1,
    },
  },
  sectionHeading: {
    ...fontSizes.h2,
    responsive: {
      mobile: fontSizes.h3,
      tablet: fontSizes.h2,
      desktop: fontSizes.h2,
    },
  },
  bodyText: {
    ...fontSizes['body-base'],
    responsive: {
      mobile: fontSizes['body-sm'],
      tablet: fontSizes['body-base'],
      desktop: fontSizes['body-base'],
    },
  },
  caption: {
    ...fontSizes['body-xs'],
  },
} as const;
