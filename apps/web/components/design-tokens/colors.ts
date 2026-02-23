/**
 * Color Design Tokens
 * 
 * These tokens define the color palette for the PayEasy application.
 * Import and use these tokens in JavaScript/TypeScript when you need
 * programmatic access to colors (e.g., for charts, dynamic styles).
 * 
 * For CSS/Tailwind usage, use the utility classes directly.
 */

export const colors = {
  primary: {
    50: '#F5EBFF',
    100: '#E6CCFF',
    200: '#CC99FF',
    300: '#B366FF',
    400: '#9933FF',
    500: '#7D00FF',  // Main brand color
    600: '#6400CC',
    700: '#4B0099',
    800: '#320066',
    900: '#190033',
    950: '#0D001A',
  },
  secondary: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
  accent: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3178C6',  // Main accent color
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  info: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },
} as const;

export type ColorScale = keyof typeof colors;
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

/**
 * Get a color value by scale and shade
 * @example getColor('primary', 500) // '#7D00FF'
 */
export function getColor(scale: ColorScale, shade: ColorShade): string | undefined {
  const colorScale = colors[scale] as Record<number, string>;
  return colorScale[shade];
}

/**
 * Semantic color mappings for common use cases
 */
export const semanticColors = {
  brand: {
    primary: colors.primary[500],
    primaryHover: colors.primary[600],
    primaryActive: colors.primary[700],
  },
  text: {
    primary: colors.secondary[900],
    secondary: colors.secondary[600],
    tertiary: colors.secondary[500],
    disabled: colors.secondary[400],
    inverse: '#FFFFFF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: colors.secondary[50],
    tertiary: colors.secondary[100],
    inverse: colors.secondary[900],
  },
  border: {
    default: colors.secondary[200],
    hover: colors.secondary[300],
    focused: colors.primary[500],
    error: colors.error[500],
  },
  state: {
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
    info: colors.info[500],
  },
} as const;
