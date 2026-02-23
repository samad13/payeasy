/**
 * Motion & Animation Design Tokens
 * 
 * These tokens define the animation and transition system.
 */

export const duration = {
  instant: '75ms',
  fast: '150ms',
  base: '200ms',
  moderate: '300ms',
  slow: '400ms',
  slower: '500ms',
  slowest: '700ms',
} as const;

export const easing = {
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeInSmooth: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOutSmooth: 'cubic-bezier(0, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
} as const;

export type DurationKey = keyof typeof duration;
export type EasingKey = keyof typeof easing;

/**
 * Get duration value
 * @example getDuration('base') // '200ms'
 */
export function getDuration(key: DurationKey): string {
  return duration[key];
}

/**
 * Get easing function
 * @example getEasing('smooth') // 'cubic-bezier(0.4, 0, 0.2, 1)'
 */
export function getEasing(key: EasingKey): string {
  return easing[key];
}

/**
 * Create a transition string
 * @example createTransition(['opacity', 'transform'], 'base', 'smooth')
 */
export function createTransition(
  properties: string[],
  durationKey: DurationKey = 'base',
  easingKey: EasingKey = 'smooth'
): string {
  const d = duration[durationKey];
  const e = easing[easingKey];
  return properties.map(prop => `${prop} ${d} ${e}`).join(', ');
}

/**
 * Animation presets for common use cases
 */
export const animations = {
  // Fade animations
  fadeIn: {
    duration: duration.base,
    easing: easing.easeOut,
    keyframes: 'fadeIn',
  },
  fadeOut: {
    duration: duration.base,
    easing: easing.easeIn,
    keyframes: 'fadeOut',
  },
  
  // Slide animations
  slideUp: {
    duration: duration.moderate,
    easing: easing.easeOut,
    keyframes: 'slideUp',
  },
  slideDown: {
    duration: duration.moderate,
    easing: easing.easeOut,
    keyframes: 'slideDown',
  },
  
  // Scale animations
  scaleIn: {
    duration: duration.fast,
    easing: easing.smooth,
    keyframes: 'scaleIn',
  },
  scaleOut: {
    duration: duration.fast,
    easing: easing.smooth,
    keyframes: 'scaleOut',
  },
  
  // Bounce
  bounce: {
    duration: duration.moderate,
    easing: easing.bounce,
    keyframes: 'bounce',
  },
} as const;

/**
 * Transition presets for common interactions
 */
export const transitionPresets = {
  // Default transitions
  default: createTransition(['all'], 'base', 'smooth'),
  fast: createTransition(['all'], 'fast', 'smooth'),
  slow: createTransition(['all'], 'slow', 'smooth'),
  
  // Specific property transitions
  color: createTransition(['color', 'background-color', 'border-color'], 'base', 'smooth'),
  transform: createTransition(['transform'], 'base', 'smooth'),
  opacity: createTransition(['opacity'], 'fast', 'smooth'),
  shadow: createTransition(['box-shadow'], 'base', 'smooth'),
  
  // Interaction transitions
  button: createTransition(['background-color', 'box-shadow', 'transform'], 'fast', 'smooth'),
  link: createTransition(['color'], 'fast', 'smooth'),
  input: createTransition(['border-color', 'box-shadow'], 'base', 'smooth'),
  
  // Complex transitions
  modal: createTransition(['opacity', 'transform'], 'moderate', 'smooth'),
  dropdown: createTransition(['opacity', 'transform'], 'fast', 'easeOut'),
  tooltip: createTransition(['opacity'], 'fast', 'smooth'),
} as const;

/**
 * Motion principles and guidelines
 */
export const motionPrinciples = {
  // Duration guidelines
  durations: {
    micro: duration.instant,     // Instant feedback (hover, focus)
    short: duration.fast,        // Quick transitions (fade, scale)
    medium: duration.base,       // Standard transitions (color, opacity)
    long: duration.moderate,     // Complex animations (slide, expand)
    extended: duration.slow,     // Page transitions
  },
  
  // Performance best practices
  performance: {
    // Prefer these properties (GPU accelerated)
    gpuAccelerated: ['opacity', 'transform', 'filter'],
    
    // Avoid animating these (causes reflow/repaint)
    avoid: ['width', 'height', 'top', 'left', 'margin', 'padding'],
  },
  
  // Accessibility considerations
  accessibility: {
    // Respect user preferences
    respectReducedMotion: true,
    
    // Focus indicators should be instant
    focusTransition: duration.instant,
    
    // Loading states should be perceivable
    minLoadingDuration: '300ms',
  },
} as const;
