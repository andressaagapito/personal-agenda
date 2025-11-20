/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_VOICE: string
  readonly VITE_ENABLE_TRANSLATIONS: string
  readonly VITE_ENABLE_DARK_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

