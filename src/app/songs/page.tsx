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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Plus, Music2, LayoutList, LayoutGrid, Pencil, Trash2 } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');

  const filtered = useMemo(() =>
    songs.filter(s => {
      const matchesSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.key?.toLowerCase().includes(search.toLowerCase());
      const matchesGroup =
        selectedGroupId === 'all' || s.groupIds?.includes(selectedGroupId);
      return matchesSearch && matchesGroup;
    }),
    [songs, search, selectedGroupId]
  );

  async function handleSubmit(data: Omit<Song, 'id'>) {
    try {
      const payload = { ...data, groupIds: data.groupIds ?? [] };
      if (editingSong) {
        await updateSong(editingSong.id, payload);
        toast({ title: 'Canción actualizada' });
      } else {
        await addSong(payload);
        toast({ title: 'Canción guardada' });
      }
      setIsFormOpen(false);
      setEditingSong(null);
    } catch (err) {
      toast({ title: 'Error al guardar', variant: 'destructive' });
      throw err;
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
      <header className="px-4 pt-12 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Todas las canciones</h1>
          <div className="flex gap-1 rounded-lg border p-1">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('cards')}
              title="Vista tarjetas"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'compact' ? 'default' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('compact')}
              title="Vista compacta"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título o tonalidad..."
            className="pl-9"
          />
        </div>

        {groups.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedGroupId('all')}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                selectedGroupId === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              Todos
            </button>
            {groups.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGroupId(g.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  selectedGroupId === g.id
                    ? 'text-white border-transparent'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                }`}
                style={selectedGroupId === g.id ? { backgroundColor: g.color, borderColor: g.color } : {}}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className={viewMode === 'cards' ? 'flex flex-col gap-3 px-4' : 'flex flex-col px-4'}>
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className={viewMode === 'cards' ? 'h-28 rounded-2xl' : 'h-12 rounded-lg mb-1'} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Music2 className="mb-3 h-9 w-9 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search ? 'Sin resultados' : 'Sin canciones aún'}
            </p>
          </div>
        ) : viewMode === 'cards' ? (
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
        ) : (
          filtered.map((song, index) => (
            <div
              key={song.id}
              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/60 transition-colors ${
                index !== filtered.length - 1 ? 'border-b border-border/50' : ''
              }`}
              onClick={() => router.push(`/stage/${song.id}`)}
            >
              <span className="w-5 text-xs text-muted-foreground/50 text-right shrink-0">
                {index + 1}
              </span>
              <p className="flex-1 truncate text-sm font-medium">{song.title}</p>
              <Badge variant="outline" className="shrink-0 text-xs font-bold text-primary border-primary/40 bg-primary/5">
                {song.key}
              </Badge>
              {song.bpm && (
                <span className="shrink-0 text-xs text-muted-foreground hidden sm:block">{song.bpm} BPM</span>
              )}
              <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 hover:bg-primary/10"
                  onClick={() => { setEditingSong(song); setIsFormOpen(true); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  onClick={() => setSongToDelete(song)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
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
