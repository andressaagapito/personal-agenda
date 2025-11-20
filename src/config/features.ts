export const FEATURES = {
  VOICE_RECOGNITION: import.meta.env.VITE_ENABLE_VOICE === 'true',
  TRANSLATIONS: import.meta.env.VITE_ENABLE_TRANSLATIONS === 'true',
  DARK_MODE: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
} as const;

export type FeatureKey = keyof typeof FEATURES;

