/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MAIN_VITE_YOUTUBE_API_KEY: string
  readonly MAIN_VITE_GOO_LAB_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
