// types/index.ts

export interface Hold {
  x: number
  y: number
  actualX: number
  actualY: number
  type: 'start' | 'normal' | 'finish'
  order: number
}

export interface ClimbingRoute {
  name: string
  difficulty: string
  description: string
  src: string | null
  holds: Hold[]
  date: string
  originalWidth: number
  originalHeight: number
  previewScale: number
}

export interface HoldType {
  key: 'start' | 'normal' | 'finish'
  label: string
  emoji: string
}

export interface RouteFormData {
  name: string
  difficulty: string
  description: string
  src: string | null
  holds: Hold[]
  originalWidth: number
  originalHeight: number
}

export const DIFFICULTY_OPTIONS = [
  { value: '3a', label: '3a - Très facile' },
  { value: '3b', label: '3b - Très facile' },
  { value: '3c', label: '3c - Très facile' },
  { value: '4a', label: '4a - Facile' },
  { value: '4b', label: '4b - Facile' },
  { value: '4c', label: '4c - Facile' },
  { value: '5a', label: '5a - Peu difficile' },
  { value: '5b', label: '5b - Peu difficile' },
  { value: '5c', label: '5c - Peu difficile' },
  { value: '6a', label: '6a - Assez difficile' },
  { value: '6b', label: '6b - Assez difficile' },
  { value: '6c', label: '6c - Assez difficile' },
  { value: '7a', label: '7a - Difficile' },
  { value: '7b', label: '7b - Difficile' },
  { value: '7c', label: '7c - Difficile' },
  { value: '8a', label: '8a - Très difficile' },
  { value: '8b', label: '8b - Très difficile' },
  { value: '8c', label: '8c - Très difficile' }
] as const

export const HOLD_TYPES: HoldType[] = [
  { key: 'start', label: 'Départ', emoji: '🟢' },
  { key: 'normal', label: 'Normale', emoji: '🔵' },
  { key: 'finish', label: 'Arrivée', emoji: '🔴' }
] as const