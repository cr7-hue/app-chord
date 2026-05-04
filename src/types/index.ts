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
  'Am', 'Bbm/A#m', 'Bm', 'Cm', 'C#m/Dbm', 'Dm', 'Ebm/D#m', 'Em', 'Fm', 'F#m/Gbm', 'Gm', 'Abm/G#m',
  'A',  'Bb/A#',   'B',  'C',  'C#/Db',   'D',  'Eb/D#',   'E',  'F',  'F#/Gb',   'G',  'Ab/G#',
] as const;

export const GROUP_COLORS = [
  '#e67700', '#7c3aed', '#0891b2',
  '#059669', '#dc2626', '#db2777',
  '#d97706', '#4f46e5',
] as const;
