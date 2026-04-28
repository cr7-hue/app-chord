"use client";

import { useState, useEffect } from 'react';
import type { Song, SongSection, Group } from '@/types';
import { SECTION_TYPES, MUSICAL_KEYS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Trash2, GripVertical, Music2, Hash, Check,
} from 'lucide-react';

interface SongFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Song | null;
  groups: Group[];
  onSubmit: (data: Omit<Song, 'id'>) => Promise<void>;
}

const SEC_COLORS: Record<string, string> = {
  'Introducción': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
  'Verso':        'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  'Pre-Coro':     'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  'Coro':         'bg-primary/10 text-primary border-primary/30',
  'Puente':       'bg-purple-500/10 text-purple-500 border-purple-500/30',
  'Fuga':         'bg-pink-500/10 text-pink-500 border-pink-500/30',
  'Solo':         'bg-blue-500/10 text-blue-500 border-blue-500/30',
  'Outro':        'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
};

function uid() { return Math.random().toString(36).slice(2); }

export default function SongForm({ isOpen, onClose, initialData, groups, onSubmit }: SongFormProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('Am');
  const [bpm, setBpm] = useState('');
  const [sections, setSections] = useState<SongSection[]>([]);
  const [groupIds, setGroupIds] = useState<string[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [newType, setNewType] = useState<string>('Verso');
  const [newChords, setNewChords] = useState('');
  const [newRepeat, setNewRepeat] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title ?? '');
      setArtist(initialData?.artist ?? '');
      setKey(initialData?.key ?? 'Am');
      setBpm(initialData?.bpm?.toString() ?? '');
      setSections(initialData?.sections ?? []);
      setGroupIds(initialData?.groupIds ?? []);
      setAddOpen(false);
      setNewChords('');
      setNewType('Verso');
      setNewRepeat(1);
    }
  }, [isOpen, initialData]);

  function addSection() {
    if (!newChords.trim()) return;
    setSections(prev => [
      ...prev,
      { id: uid(), type: newType, chords: newChords.trim(), repeat: newRepeat },
    ]);
    setNewChords('');
    setNewRepeat(1);
    setAddOpen(false);
  }

  function removeSection(id: string) {
    setSections(prev => prev.filter(s => s.id !== id));
  }

  function toggleGroup(id: string) {
    setGroupIds(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        artist: artist.trim() || undefined,
        key,
        bpm: bpm ? parseInt(bpm) : undefined,
        sections,
        groupIds: groupIds ?? [],
      });
      onClose();
    } catch {
      // el error ya fue notificado por el padre con un toast; el modal se queda abierto
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-[90dvh] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Music2 className="h-5 w-5 text-primary" />
            {initialData ? 'Editar canción' : 'Nueva canción'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-5 py-4">
          <div className="flex flex-col gap-5">

            {/* Título */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nombre de la canción
              </label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Nombre de la canción..."
                className="focus-visible:ring-primary"
              />
            </div>

            {/* Artista */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Artista <span className="normal-case font-normal text-muted-foreground/60">(opcional)</span>
              </label>
              <Input
                value={artist}
                onChange={e => setArtist(e.target.value)}
                placeholder="Nombre del artista o banda..."
                className="focus-visible:ring-primary"
              />
            </div>

            {/* Tonalidad */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tonalidad
              </label>
              <div className="flex flex-wrap gap-2">
                {MUSICAL_KEYS.map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKey(k)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                      key === k
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* BPM */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                BPM <span className="normal-case font-normal text-muted-foreground/60">(opcional)</span>
              </label>
              <div className="relative w-32">
                <Hash className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  value={bpm}
                  onChange={e => setBpm(e.target.value)}
                  placeholder="120"
                  className="pl-8 focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* Secciones */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Secciones
              </label>

              <div className="flex flex-col gap-2 mb-3">
                {sections.map(sec => (
                  <div
                    key={sec.id}
                    className="flex items-start gap-2 rounded-xl border bg-card p-3"
                  >
                    <GripVertical className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge
                          variant="outline"
                          className={`text-xs font-bold ${SEC_COLORS[sec.type] ?? 'bg-zinc-500/10 text-zinc-400'}`}
                        >
                          {sec.type.toUpperCase()}
                        </Badge>
                        {sec.repeat > 1 && (
                          <span className="text-xs text-muted-foreground">×{sec.repeat}</span>
                        )}
                      </div>
                      <pre className="font-mono text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {sec.chords}
                      </pre>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSection(sec.id)}
                      className="flex-shrink-0 p-1 text-muted-foreground/40 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {addOpen ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
                  {/* Tipo */}
                  <div className="flex flex-wrap gap-1.5">
                    {SECTION_TYPES.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewType(t)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                          newType === t
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Acordes */}
                  <Textarea
                    autoFocus
                    value={newChords}
                    onChange={e => setNewChords(e.target.value)}
                    placeholder={'Ej: Am - G - F - E\nAm - F - G'}
                    rows={3}
                    className="font-mono text-sm resize-none focus-visible:ring-primary"
                  />

                  {/* Repeticiones */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Repeticiones:</span>
                    {[1, 2, 3, 4].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNewRepeat(n)}
                        className={`h-8 w-8 rounded-lg text-sm font-bold transition-all ${
                          newRepeat === n
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        ×{n}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAddOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={addSection} className="flex-1">
                      Agregar
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="w-full rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Agregar sección
                </button>
              )}
            </div>

            {/* Grupos */}
            {groups.length > 0 && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Grupos
                </label>
                <div className="flex flex-col gap-2">
                  {groups.map(g => {
                    const selected = groupIds.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGroup(g.id)}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                          selected
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-border bg-card hover:border-border/80'
                        }`}
                      >
                        <div
                          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all"
                          style={{
                            borderColor: selected ? g.color : undefined,
                            background: selected ? g.color : undefined,
                          }}
                        >
                          {selected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="flex-1 text-sm font-medium">{g.name}</span>
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: g.color }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-5 py-4">
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
            className="w-full"
            size="lg"
          >
            {saving ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Guardar canción'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
