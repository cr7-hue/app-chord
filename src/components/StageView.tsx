"use client";

import { useState } from 'react';
import type { Song } from '@/types';
import { ChevronLeft, ChevronRight, X, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SongAnalysis } from './SongAnalysis';

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
      <div className="sticky top-0 z-10 flex items-center justify-between bg-black/95 backdrop-blur-sm px-4 pb-3 pt-10">
        <button
          onClick={goBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 transition-colors hover:text-white active:bg-zinc-800"
        >
          <X size={18} />
        </button>
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-bold text-base leading-tight">{song.title}</span>
          {song.artist && (
            <span className="text-xs text-zinc-500">{song.artist}</span>
          )}
          <div className="flex items-center gap-2">
            <span className="rounded-lg px-2.5 py-0.5 text-xs font-extrabold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {song.key}
            </span>
            {song.bpm && (
              <span className="text-xs text-zinc-600">{song.bpm} BPM</span>
            )}
          </div>
        </div>
        <SongAnalysis song={song} />
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
              className={`w-full rounded-2xl border p-4 text-left transition-all duration-150 ${
                isActive
                  ? 'border-orange-500/50 bg-orange-500/10 shadow-lg shadow-orange-500/10'
                  : 'border-zinc-800/80 bg-zinc-950 active:border-zinc-700 active:bg-zinc-900/50'
              }`}
            >
              <div className="mb-3 flex items-center gap-2.5 flex-wrap">
                <span className={`text-xs font-extrabold uppercase tracking-widest ${labelColor}`}>
                  {sec.type}
                </span>
                {sec.timeSignature && (
                  <span className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-xs font-bold text-zinc-400">
                    {sec.timeSignature}
                  </span>
                )}
                {sec.repeat > 1 && (
                  <span className="flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-zinc-500">
                    <RefreshCw size={9} /> ×{sec.repeat}
                  </span>
                )}
              </div>
              {sec.measures ? (
                <div className="flex flex-col gap-3">
                  {sec.measures.map((measure, i) => (
                    <div key={i} className="flex items-center flex-wrap gap-1">
                      {measure.split('|').map((chord, j) => (
                        <div key={j} className="flex items-center gap-1">
                          <span className="font-mono text-3xl font-extrabold text-white md:text-4xl min-w-[2.5rem] text-center">
                            {chord || <span className="text-zinc-700">—</span>}
                          </span>
                          {j < measure.length - 1 && (
                            <span className="text-zinc-700 text-xl font-light select-none">|</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="font-mono text-3xl font-extrabold leading-snug text-white whitespace-pre-wrap md:text-4xl">
                  {sec.chords}
                </pre>
              )}
            </button>
          );
        })}
      </div>

      {/* Prev / Next navigation */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center gap-2 border-t border-zinc-800/60 bg-black/95 backdrop-blur-sm px-4 py-4">
        <button
          onClick={() => prevSong && router.push(`/stage/${prevSong.id}${listParam}`)}
          disabled={!prevSong}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all ${
            prevSong
              ? 'bg-zinc-900 text-zinc-200 active:bg-zinc-800 active:scale-[0.97]'
              : 'cursor-not-allowed bg-zinc-950 text-zinc-800'
          }`}
        >
          <ChevronLeft size={18} />
          <span className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
            {prevSong?.title ?? 'Anterior'}
          </span>
        </button>

        <button
          onClick={() => nextSong && router.push(`/stage/${nextSong.id}${listParam}`)}
          disabled={!nextSong}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all ${
            nextSong
              ? 'bg-orange-500/90 text-white active:bg-orange-600 active:scale-[0.97]'
              : 'cursor-not-allowed bg-zinc-950 text-zinc-800'
          }`}
        >
          <span className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
            {nextSong?.title ?? 'Siguiente'}
          </span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
