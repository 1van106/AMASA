/**
 * Tokens extraídos del diseño "Cambio Fisico v2" (Claude Design).
 * Tema oscuro, tipografía Space Grotesk + IBM Plex Mono.
 */

export const colors = {
  bg: '#0A0B0D',
  surface: '#141619',
  surfaceAlt: '#1C1F24',
  surfaceDim: '#101215',
  future: '#0E1013',
  /** Días ya pasados sin actividad: se hunden para que "hoy" sea la frontera. */
  pasado: '#0B0C0F',
  border: '#17191D',
  borderAlt: '#1C1F24',
  borderTab: '#16181C',

  text: '#F2F3F5',
  textSoft: '#D6D9DE',
  textMid: '#C3C8D0',
  muted: '#9BA3AF',
  dim: '#6B7280',
  faint: '#5A6069',
  fainter: '#4B5158',
  outside: '#3C4149',
  dash: '#2A2E35',

  empuje: '#4D7CFE',
  tiron: '#00D68F',
  pierna: '#B46BFF',
  prio: '#FFB020',
  carrera: '#FF8A3D',
  danger: '#FF6B5E',
} as const;

export type GrupoMuscular = 'empuje' | 'tiron' | 'pierna';

export const grupoColor: Record<GrupoMuscular, string> = {
  empuje: colors.empuje,
  tiron: colors.tiron,
  pierna: colors.pierna,
};

/**
 * Con fuentes personalizadas React Native no sintetiza pesos:
 * hay que nombrar la variante exacta en fontFamily.
 */
export const fonts = {
  sans: 'SpaceGrotesk_400Regular',
  sansMedium: 'SpaceGrotesk_500Medium',
  sansSemi: 'SpaceGrotesk_600SemiBold',
  sansBold: 'SpaceGrotesk_700Bold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemi: 'IBMPlexMono_600SemiBold',
} as const;

/** Padding lateral de todas las pantallas (22px en el diseño). */
export const PAGE_X = 22;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 22,
  pill: 99,
} as const;

/** rgba() a partir de un hex de 6 dígitos, para los fondos tintados del diseño. */
export const alpha = (hex: string, a: number): string => {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
