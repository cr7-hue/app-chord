"use client";

import { useState } from 'react';
import type { Song } from '@/types';
import { ChevronLeft, ChevronRight, X, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SEC_COLORS: Record<string, string> = {
  'Introducción': 'text-cyan-400',
  'Intro':        'text-cyan-400',
  'Verso':        'text-emerald-400',
  'Pre-Coro':     'text-yellow-400',
  'Coro':         'text-orange-400',
  'Puente':       'text-purple-400',
  'Fuga':         'text-pink-400',
  'Solo':         'text-blue-400',
  'Outro':        'text-zinc-400',
};

interface StageViewProps {
  song: Song;
  prevSong?: Song;
  nextSong?: Song;
  setlistIds?: string[];
}

export function StageView({ song, prevSong, nextSong, setlistIds = [] }: StageViewProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const router = useRouter();

  const listParam = setlistIds.length > 0 ? `?list=${setlistIds.join(',')}` : '';

  function goBack() { router.back(); }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-black/95 px-4 pb-4 pt-10">
        <button
          onClick={goBack}
          className="p-2 -ml-1 text-zinc-600 transition-colors hover:text-white active:text-white"
        >
          <X size={22} />
        </button>
        <div className="flex flex-col items-center gap-1">
          <span className="font-bold text-lg leading-tight">{song.title}</span>
          <div className="flex items-center gap-2">
            <span className="rounded px-2 py-0.5 text-xs font-bold bg-orange-950/60 text-orange-400 border border-orange-900/60">
              {song.key}
            </span>
            {song.bpm && (
              <span className="text-xs text-zinc-600">{song.bpm} BPM</span>
            )}
          </div>
        </div>
        <div className="w-8" />
      </div>

      {/* Sections */}
      <div className="flex flex-1 flex-col gap-4 px-4 pb-28 pt-2">
        {song.sections?.map(sec => {
          const isActive = activeSection === sec.id;
          const labelColor = SEC_COLORS[sec.type] ?? 'text-zinc-300';

          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(isActive ? null : sec.id)}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                isActive
                  ? 'border-orange-500/60 bg-orange-950/20'
                  : 'border-zinc-900 bg-zinc-950/80 active:border-zinc-800'
              }`}
            >
              <div className="mb-3 flex items-center gap-2.5">
                <span className={`text-xs font-extrabold uppercase tracking-widest ${labelColor}`}>
                  {sec.type}
                </span>
                {sec.repeat > 1 && (
                  <span className="flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-zinc-500">
                    <RefreshCw size={9} /> ×{sec.repeat}
                  </span>
                )}
              </div>
              <pre className="font-mono text-2xl font-bold leading-snug text-white whitespace-pre-wrap md:text-3xl">
                {sec.chords}
              </pre>
            </button>
          );
        })}
      </div>

      {/* Prev / Next navigation */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center gap-3 border-t border-zinc-900 bg-black/97 px-4 py-3">
        <button
          onClick={() => prevSong && router.push(`/stage/${prevSong.id}${listParam}`)}
          disabled={!prevSong}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-medium transition-colors ${
            prevSong
              ? 'bg-zinc-900 text-zinc-300 active:bg-zinc-800'
              : 'cursor-not-allowed bg-transparent text-zinc-800'
          }`}
        >
          <ChevronLeft size={16} />
          <span className="max-w-[90px] overflow-hidden text-ellipsis whitespace-nowrap">
            {prevSong?.title ?? '—'}
          </span>
        </button>

        <div className="h-6 w-px bg-zinc-900" />

        <button
          onClick={() => nextSong && router.push(`/stage/${nextSong.id}${listParam}`)}
          disabled={!nextSong}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-medium transition-colors ${
            nextSong
              ? 'bg-zinc-900 text-zinc-300 active:bg-zinc-800'
              : 'cursor-not-allowed bg-transparent text-zinc-800'
          }`}
        >
          <span className="max-w-[90px] overflow-hidden text-ellipsis whitespace-nowrap">
            {nextSong?.title ?? '—'}
          </span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
