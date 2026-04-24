"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSongs } from '@/hooks/useSongs';
import { useGroups } from '@/hooks/useGroups';
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
import { Search, Plus, Music2 } from 'lucide-react';
import type { Song } from '@/types';

export default function SongsPage() {
  const router = useRouter();
  const { songs, loading, addSong, updateSong, deleteSong } = useSongs();
  const { groups } = useGroups();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);

  const filtered = useMemo(() =>
    songs.filter(s =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.key?.toLowerCase().includes(search.toLowerCase())
    ),
    [songs, search]
  );

  async function handleSubmit(data: Omit<Song, 'id'>) {
    try {
      if (editingSong) {
        await updateSong(editingSong.id, data);
        toast({ title: 'Canción actualizada' });
      } else {
        await addSong(data);
        toast({ title: 'Canción guardada' });
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

  return (
    <div className="min-h-screen pb-24">
      <header className="px-4 pt-12 pb-4">
        <h1 className="mb-4 text-xl font-bold">Todas las canciones</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título o tonalidad..."
            className="pl-9"
          />
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Music2 className="mb-3 h-9 w-9 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search ? 'Sin resultados' : 'Sin canciones aún'}
            </p>
          </div>
        ) : (
          filtered.map(song => (
            <div
              key={song.id}
              className="cursor-pointer"
              onClick={() => router.push(`/stage/${song.id}`)}
            >
              <SongCard
                song={song}
                onEdit={() => { setEditingSong(song); setIsFormOpen(true); }}
                onDelete={s => setSongToDelete(s)}
              />
            </div>
          ))
        )}
      </div>

      <Button
        onClick={() => { setEditingSong(null); setIsFormOpen(true); }}
        size="icon"
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg shadow-primary/30"
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
