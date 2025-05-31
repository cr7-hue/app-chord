
import type { Song } from '@/types';

// Helper to format ChordsData into a string for simplicity in this reversion
const formatChordsToString = (chords: Record<string, string | undefined>): string => {
  return Object.entries(chords)
    .filter(([_, value]) => value && value.trim() !== "")
    .map(([key, value]) => {
      let title = key.charAt(0).toUpperCase() + key.slice(1);
      title = title.replace(/([A-Z0-9])/g, ' $1').trim();
      if (key === 'outro') title = "Outro / Fuga";
      return `${title}:\n${value!.trim()}`;
    })
    .join("\n\n");
};

export const DEFAULT_SONGS: Song[] = [
  {
    id: "1",
    title: "Cumbia de los Capos",
    chords: formatChordsToString({
      intro: "Am - F - G - Am",
      verse1: "Am - G - F - E",
      chorus: "C - G - Am - E"
    })
  },
  {
    id: "2",
    title: "Luz de Luna",
    chords: formatChordsToString({
      verse1: "Dm - Gm - A7 - Dm",
      chorus: "Bb - C - F - Dm"
    })
  },
  {
    id: "3",
    title: "Chicha del Sur",
    chords: formatChordsToString({
      intro: "Em - B7 - Em",
      verse1: "Em - Am - B7 - Em",
      chorus: "G - D - Em - C"
    })
  }
];
