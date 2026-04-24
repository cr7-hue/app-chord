"use client";

import { useState } from 'react';
import { useGroups } from '@/hooks/useGroups';
import { useSongs } from '@/hooks/useSongs';
import GroupCard from '@/components/GroupCard';
import GroupForm from '@/components/GroupForm';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Music2, Plus } from 'lucide-react';
import type { Group } from '@/types';

export default function GroupsPage() {
  const { groups, loading, addGroup, deleteGroup } = useGroups();
  const { songs } = useSongs();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  async function handleAddGroup(data: Omit<Group, 'id'>) {
    try {
      await addGroup(data);
      toast({ title: 'Grupo creado' });
    } catch {
      toast({ title: 'Error al crear grupo', variant: 'destructive' });
    }
  }

  async function handleDeleteGroup(group: Group) {
    try {
      await deleteGroup(group.id);
      toast({ title: `"${group.name}" eliminado` });
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="flex items-center justify-between px-4 pt-12 pb-5">
        <div className="flex items-center gap-2">
          <Music2 className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">ChordFlash</h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="px-4">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tus repertorios
        </p>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Music2 className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">Sin grupos aún</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Crea tu primer repertorio con el botón +
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {groups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                songCount={songs.filter(s => s.groupIds?.includes(group.id)).length}
                onDelete={handleDeleteGroup}
              />
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={() => setIsFormOpen(true)}
        size="icon"
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg shadow-primary/30"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <GroupForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddGroup}
      />
    </div>
  );
}
