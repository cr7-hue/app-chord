"use client";

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGroups } from '@/hooks/useGroups';
import { useSongs } from '@/hooks/useSongs';
import SongCard from '@/components/SongCard';
import SongForm from '@/components/SongForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Search, Plus, Music2 } from 'lucide-react';
import type { Song } from '@/types';

export default function RepertorioPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { groups, loading: loadingGroups } = useGroups();
  const { songs, loading: loadingSongs, addSong, updateSong, deleteSong } = useSongs();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);

  const group = groups.find(g => g.id === id);

  const groupSongs = useMemo(() =>
    songs.filter(s =>
      s.groupIds?.includes(id) &&
      s.title.toLowerCase().includes(search.toLowerCase())
    ),
    [songs, id, search]
  );

  async function handleSubmit(data: Omit<Song, 'id'>) {
    try {
      const songData = { ...data, groupIds: [...(data.groupIds ?? []), id].filter((v, i, a) => a.indexOf(v) === i) };
      if (editingSong) {
        await updateSong(editingSong.id, songData);
        toast({ title: 'Canción actualizada' });
      } else {
        await addSong(songData);
        toast({ title: 'Canción agregada' });
      }
      setIsFormOpen(false);
      setEditingSong(null);
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' });
    }
  }

  async function handleDelete() {
    if (!songToDelete) return;
    try {
      await deleteSong(songToDelete.id);
      toast({ title: `"${songToDelete.title}" eliminada` });
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    } finally {
      setSongToDelete(null);
    }
  }

  function openEdit(song: Song) {
    setEditingSong(song);
    setIsFormOpen(true);
  }

  if (loadingGroups || loadingSongs) {
    return (
      <div className="min-h-screen px-4 pt-12 pb-24">
        <Skeleton className="mb-5 h-8 w-48" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Music2 className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Grupo no encontrado</p>
        <Button variant="outline" onClick={() => router.push('/')}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="px-4 pt-12 pb-4">
        <div className="mb-4 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="-ml-2 h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{group.name}</h1>
            <p className="text-xs text-muted-foreground">
              {groupSongs.length} canción{groupSongs.length !== 1 ? 'es' : ''}
            </p>
          </div>
          <div className="h-3 w-3 rounded-full" style={{ background: group.color }} />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar canción..."
            className="pl-9"
          />
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4">
        {groupSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Music2 className="mb-3 h-9 w-9 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search ? 'Sin resultados' : 'Sin canciones en este grupo'}
            </p>
          </div>
        ) : (
          groupSongs.map(song => (
            <div
              key={song.id}
              className="cursor-pointer"
              onClick={() => router.push(`/stage/${song.id}?list=${groupSongs.map(s => s.id).join(',')}`)}
            >
              <SongCard
                song={song}
                onEdit={e => { e.stopPropagation?.(); openEdit(song); }}
                onDelete={s => { setSongToDelete(s); }}
              />
            </div>
          ))
        )}
      </div>

      <Button
        onClick={() => { setEditingSong(null); setIsFormOpen(true); }}
        size="icon"
        className="fixed bottom-6 right-4 h-14 w-14 rounded-full shadow-lg shadow-primary/30"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <SongForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingSong(null); }}
        initialData={editingSong}
        groups={groups}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!songToDelete} onOpenChange={open => !open && setSongToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar canción?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará "{songToDelete?.title}" permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
