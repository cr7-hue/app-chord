export interface SongSection {
  id: string;
  type: string;
  chords: string;
  repeat: number;
}

export interface Song {
  id: string;
  title: string;
  artist?: string;
  key: string;
  bpm?: number;
  sections: SongSection[];
  groupIds: string[];
}

export interface Group {
  id: string;
  name: string;
  color: string;
}

export const SECTION_TYPES = [
  'Introducción',
  'Verso',
  'Pre-Coro',
  'Coro',
  'Puente',
  'Fuga',
  'Solo',
  'Outro',
  'Personalizado',
] as const;

export const MUSICAL_KEYS = [
  'Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm',
  'A',  'B',  'C',  'D',  'E',  'F',  'G',
] as const;

export const GROUP_COLORS = [
  '#e67700', '#7c3aed', '#0891b2',
  '#059669', '#dc2626', '#db2777',
  '#d97706', '#4f46e5',
] as const;
