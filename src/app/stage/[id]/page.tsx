"use client";

import { useParams, useSearchParams } from 'next/navigation';
import { useSongs } from '@/hooks/useSongs';
import { StageView } from '@/components/StageView';
import { Skeleton } from '@/components/ui/skeleton';

export default function StagePage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { songs, loading } = useSongs();

  const song = songs.find(s => s.id === id);

  // Setlist desde URL: /stage/[id]?list=s1,s2,s3
  const listParam = searchParams.get('list');
  const setlistIds = listParam ? listParam.split(',') : [];

  const setlist = setlistIds.length > 0
    ? setlistIds.map(sid => songs.find(s => s.id === sid)).filter(Boolean)
    : [];

  const currentIdx = setlist.findIndex(s => s?.id === id);
  const prevSong = currentIdx > 0 ? setlist[currentIdx - 1] : undefined;
  const nextSong = currentIdx < setlist.length - 1 ? setlist[currentIdx + 1] : undefined;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col gap-4 bg-black px-4 pt-10">
        <Skeleton className="h-8 w-48 bg-zinc-900" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl bg-zinc-900" />)}
      </div>
    );
  }

  if (!song) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-500 text-sm">
        Canción no encontrada
      </div>
    );
  }

  return (
    <StageView
      song={song}
      prevSong={prevSong ?? undefined}
      nextSong={nextSong ?? undefined}
    />
  );
}
