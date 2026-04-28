'use server';

import { ai } from './genkit';

export interface SongAnalysisResult {
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  chordsNeeded: string[];
  tip: string;
}

export async function analyzeSong(
  title: string,
  key: string,
  sections: { type: string; chords: string }[]
): Promise<SongAnalysisResult> {
  const chordsText = sections
    .map(s => `${s.type}: ${s.chords}`)
    .join('\n');

  const response = await ai.generate({
    prompt: `Eres un profesor de música experto en guitarra y teclado. Analiza esta canción para un músico que la va a tocar en vivo.

Canción: "${title}" en tonalidad ${key}

Acordes por sección:
${chordsText}

Responde ÚNICAMENTE con un JSON válido con esta estructura, sin texto adicional:
{
  "difficulty": "Básico" o "Intermedio" o "Avanzado",
  "chordsNeeded": ["lista de acordes únicos que aparecen en la canción"],
  "tip": "Un consejo práctico y concreto de máximo 2 oraciones para tocar esta canción mejor en vivo"
}`,
  });

  const text = response.text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Respuesta inválida de la IA');
  return JSON.parse(jsonMatch[0]) as SongAnalysisResult;
}
