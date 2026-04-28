"use client";

import { useState } from 'react';
import { Sparkles, X, Loader2, AlertCircle } from 'lucide-react';
import { analyzeSong, type SongAnalysisResult } from '@/ai/actions';
import type { Song } from '@/types';

interface SongAnalysisProps {
  song: Song;
}

const DIFFICULTY_STYLES = {
  'Básico':      { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' },
  'Intermedio':  { bg: 'bg-yellow-500/20',  text: 'text-yellow-400',  border: 'border-yellow-500/40'  },
  'Avanzado':    { bg: 'bg-red-500/20',     text: 'text-red-400',     border: 'border-red-500/40'     },
};

export function SongAnalysis({ song }: SongAnalysisProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SongAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setOpen(true);
    if (result) return;
    setLoading(true);
    setError(null);
    try {
      const sections = (song.sections ?? []).map(s => ({ type: s.type, chords: s.chords }));
      const data = await analyzeSong(song.title, song.key, sections);
      setResult(data);
    } catch {
      setError('No se pudo conectar con la IA. Verificá tu clave de API en .env.local');
    } finally {
      setLoading(false);
    }
  }

  const diffStyle = result ? DIFFICULTY_STYLES[result.difficulty] ?? DIFFICULTY_STYLES['Intermedio'] : null;

  return (
    <>
      {/* Botón en el top bar */}
      <button
        onClick={handleAnalyze}
        className="p-2 -mr-1 text-zinc-600 transition-colors hover:text-orange-400 active:text-orange-400"
        title="Analizar con IA"
      >
        <Sparkles size={20} />
      </button>

      {/* Panel deslizable desde abajo */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Fondo oscuro */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative z-10 rounded-t-2xl bg-zinc-950 border-t border-zinc-800 px-5 pt-5 pb-10 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            {/* Header del panel */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-orange-400" />
                <span className="text-sm font-bold text-white">Análisis IA</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-zinc-600 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Estado: cargando */}
            {loading && (
              <div className="flex flex-col items-center gap-3 py-8 text-zinc-500">
                <Loader2 size={28} className="animate-spin text-orange-400" />
                <p className="text-sm">Analizando con Gemini...</p>
              </div>
            )}

            {/* Estado: error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Estado: resultado */}
            {result && diffStyle && (
              <div className="flex flex-col gap-4">
                {/* Dificultad */}
                <div className={`flex items-center justify-between rounded-xl border p-4 ${diffStyle.bg} ${diffStyle.border}`}>
                  <span className="text-sm text-zinc-400">Dificultad</span>
                  <span className={`text-lg font-extrabold ${diffStyle.text}`}>{result.difficulty}</span>
                </div>

                {/* Acordes a dominar */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Acordes que necesitás dominar
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.chordsNeeded.map(chord => (
                      <span
                        key={chord}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm font-bold text-white"
                      >
                        {chord}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Consejo */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-orange-400">
                    Consejo
                  </p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{result.tip}</p>
                </div>

                {/* Botón re-analizar */}
                <button
                  onClick={() => { setResult(null); handleAnalyze(); }}
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors text-center"
                >
                  Volver a analizar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
