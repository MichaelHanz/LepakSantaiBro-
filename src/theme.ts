export const colors = {
  // Warm, grounded base — like paper in sunlight
  background: '#FAF7F2',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',

  // Text hierarchy — warm, not clinical
  ink: '#1C1C1E',
  inkSoft: '#48484A',
  muted: '#8E8E93',

  // Structural
  line: '#E5E5EA',
  card: '#FFFFFF',
  cream: '#F5F2ED',

  // Trust — deep forest teal, feels safe and grounded
  teal: '#1A6B5A',
  mint: '#E8F5EF',

  // Urgency — warm coral, not neon
  coral: '#E8634A',
  coralSoft: '#FFF0EB',

  // Accents
  yellow: '#F2C94C',
  lilac: '#D8D0F0',

  // On-surface
  onInk: '#FFFFFF',
  onInkMuted: '#F5F2ED',
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
} as const;
