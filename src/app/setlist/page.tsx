"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGroups } from '@/hooks/useGroups';
import { useSongs } from '@/hooks/useSongs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Plus, X, List } from 'lucide-react';
import type { Song } from '@/types';

export default function SetlistPage() {
  const router = useRouter();
  const { groups, loading: loadingGroups } = useGroups();
  const { songs, loading: loadingSongs } = useSongs();

  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [setlistIds, setSetlistIds] = useState<string[]>([]);

  const activeGroupId = selectedGroupId || groups[0]?.id || '';

  const groupSongs = useMemo(() =>
    songs.filter(s => s.groupIds?.includes(activeGroupId)),
    [songs, activeGroupId]
  );

  const setlistSongs = useMemo(() =>
    setlistIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[],
    [setlistIds, songs]
  );

  const available = useMemo(() =>
    groupSongs.filter(s => !setlistIds.includes(s.id)),
    [groupSongs, setlistIds]
  );

  function addToSetlist(id: string) {
    setSetlistIds(prev => [...prev, id]);
  }

  function removeFromSetlist(id: string) {
    setSetlistIds(prev => prev.filter(x => x !== id));
  }

  function startStage() {
    if (setlistSongs.length === 0) return;
    router.push(`/stage/${setlistSongs[0].id}?list=${setlistIds.join(',')}`);
  }

  function changeGroup(id: string) {
    setSelectedGroupId(id);
    setSetlistIds([]);
  }

  if (loadingGroups || loadingSongs) {
    return (
      <div className="min-h-screen px-4 pt-12 pb-24">
        <Skeleton className="mb-4 h-8 w-40" />
        <div className="flex gap-2 mb-5">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="px-4 pt-12 pb-4">
        <h1 className="mb-4 text-xl font-bold">Setlist de Hoy</h1>

        {/* Group selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => changeGroup(g.id)}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                activeGroupId === g.id
                  ? 'text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
              style={activeGroupId === g.id ? { background: g.color } : {}}
            >
              {g.name}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-5 px-4">
        {/* Setlist actual */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mi setlist ({setlistSongs.length})
          </p>

          {setlistSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-10 text-center">
              <List className="mb-2 h-6 w-6 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Agrega canciones del repertorio</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {setlistSongs.map((song, i) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5"
                >
                  <span className="w-5 text-center text-xs font-bold text-primary">{i + 1}</span>
                  <span className="flex-1 truncate text-sm font-medium">{song.title}</span>
                  <Badge variant="outline" className="text-xs font-bold text-primary border-primary/40">
                    {song.key}
                  </Badge>
                  <button
                    onClick={() => removeFromSetlist(song.id)}
                    className="text-muted-foreground/40 hover:text-destructive transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Repertorio disponible */}
        {available.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Repertorio
            </p>
            <div className="flex flex-col gap-1">
              {available.map(song => (
                <button
                  key={song.id}
                  onClick={() => addToSetlist(song.id)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-secondary/60"
                >
                  <Plus className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                  <span className="flex-1 truncate text-sm text-muted-foreground">{song.title}</span>
                  <Badge variant="outline" className="text-xs font-bold text-primary border-primary/40">
                    {song.key}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botón iniciar */}
        {setlistSongs.length > 0 && (
          <Button onClick={startStage} size="lg" className="w-full gap-2 shadow-lg shadow-primary/25">
            <Play className="h-5 w-5" fill="currentColor" />
            Iniciar Modo Escenario
          </Button>
        )}
      </div>
    </div>
  );
}
