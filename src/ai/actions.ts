'use server';

import { ai } from './genkit';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;

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

export interface ImportedSection {
  type: string;
  chords: string;
  repeat: number;
}

export interface ChordAiImportResult {
  title: string;
  key: string;
  bpm: number | null;
  sections: ImportedSection[];
}

export async function importChordAiPdf(formData: FormData): Promise<ChordAiImportResult> {
  const file = formData.get('pdf') as File | null;
  if (!file) throw new Error('No se recibió ningún archivo');

  const buffer = Buffer.from(await file.arrayBuffer());
  const { text } = await pdfParse(buffer);

  const response = await ai.generate({
    prompt: `Eres un experto en música. Analiza el texto extraído de un PDF de la app ChordAI.

El PDF de ChordAI tiene formato de grilla donde los acordes aparecen distribuidos en filas (compases) y columnas (tiempos). Los números al inicio de cada fila son números de compás.

Texto extraído del PDF:
---
${text}
---

Tu tarea:
1. Extrae el título de la canción, la tonalidad y el BPM del encabezado
2. Lee los acordes compás por compás de izquierda a derecha, ignorando celdas vacías y guiones solitarios
3. Detecta patrones de acordes que se repiten consecutivamente para identificar secciones musicales
4. Agrupa en secciones usando SOLO estos tipos en español: Introducción, Verso, Pre-Coro, Coro, Puente, Fuga, Solo, Outro
5. Para los acordes de cada sección escribe la progresión como "Acorde1 - Acorde2 - Acorde3", usando salto de línea si hay varios compases distintos en la misma sección

Responde ÚNICAMENTE con JSON válido sin texto adicional:
{
  "title": "título de la canción o cadena vacía",
  "key": "tonalidad ej: Gm, Am, Bb",
  "bpm": número o null,
  "sections": [
    { "type": "Introducción", "chords": "Bb - F - Dm - Gm", "repeat": 4 }
  ]
}`,
  });

  const raw = response.text.trim();
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('La IA no devolvió un JSON válido');
  return JSON.parse(match[0]) as ChordAiImportResult;
}
