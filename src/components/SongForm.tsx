"use client";

import { useState, useEffect } from 'react';
import type { Song, SongSection, Group } from '@/types';
import { SECTION_TYPES, MUSICAL_KEYS, TIME_SIGNATURES } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Trash2, GripVertical, Music2, Hash, Check, Pencil, X,
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

function getBeats(ts: string): number {
  return TIME_SIGNATURES.find(t => t.label === ts)?.beats ?? 4;
}

export default function SongForm({ isOpen, onClose, initialData, groups, onSubmit }: SongFormProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('Am');
  const [bpm, setBpm] = useState('');
  const [sections, setSections] = useState<SongSection[]>([]);
  const [groupIds, setGroupIds] = useState<string[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newType, setNewType] = useState<string>('Verso');
  const [newChords, setNewChords] = useState('');
  const [newRepeat, setNewRepeat] = useState(1);
  const [newTimeSignature, setNewTimeSignature] = useState('');
  const [newMeasures, setNewMeasures] = useState<string[][]>([]);
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
      setEditingSection(null);
      setNewChords('');
      setNewType('Verso');
      setNewRepeat(1);
      setNewTimeSignature('');
      setNewMeasures([]);
    }
  }, [isOpen, initialData]);

  function selectTimeSignature(ts: string) {
    if (newTimeSignature === ts) {
      setNewTimeSignature('');
      setNewMeasures([]);
    } else {
      const beats = getBeats(ts);
      setNewTimeSignature(ts);
      setNewMeasures(prev =>
        prev.length === 0
          ? [Array(beats).fill('')]
          : prev.map(m => {
              const r = [...m];
              while (r.length < beats) r.push('');
              return r.slice(0, beats);
            })
      );
    }
  }

  function addMeasure() {
    const beats = getBeats(newTimeSignature);
    setNewMeasures(prev => [...prev, Array(beats).fill('')]);
  }

  function removeMeasure(idx: number) {
    setNewMeasures(prev => prev.filter((_, i) => i !== idx));
  }

  function updateChord(mIdx: number, bIdx: number, value: string) {
    setNewMeasures(prev =>
      prev.map((m, i) => i === mIdx ? m.map((c, j) => j === bIdx ? value : c) : m)
    );
  }

  function handleChordKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    mIdx: number,
    bIdx: number,
  ) {
    const beats = getBeats(newTimeSignature);
    if (e.key === 'Enter') {
      e.preventDefault();
      if (bIdx < beats - 1) {
        document.querySelector<HTMLInputElement>(`[data-mid="${mIdx}"][data-bid="${bIdx + 1}"]`)?.focus();
      } else {
        addMeasure();
        setTimeout(() => {
          document.querySelector<HTMLInputElement>(`[data-mid="${mIdx + 1}"][data-bid="0"]`)?.focus();
        }, 0);
      }
    }
    if (e.key === 'Backspace' && newMeasures[mIdx][bIdx] === '' && bIdx === 0 && mIdx > 0) {
      e.preventDefault();
      removeMeasure(mIdx);
      setTimeout(() => {
        document.querySelector<HTMLInputElement>(`[data-mid="${mIdx - 1}"][data-bid="${beats - 1}"]`)?.focus();
      }, 0);
    }
  }

  function resetSectionForm() {
    setAddOpen(false);
    setEditingSection(null);
    setNewChords('');
    setNewType('Verso');
    setNewRepeat(1);
    setNewTimeSignature('');
    setNewMeasures([]);
  }

  function addSection() {
    if (newTimeSignature) {
      const hasChords = newMeasures.some(m => m.some(c => c.trim()));
      if (!hasChords) return;
      const section: SongSection = {
        id: editingSection ?? uid(),
        type: newType,
        chords: '',
        repeat: newRepeat,
        timeSignature: newTimeSignature,
        measures: newMeasures.map(m => m.join('|')),
      };
      setSections(prev =>
        editingSection
          ? prev.map(s => s.id === editingSection ? section : s)
          : [...prev, section]
      );
    } else {
      if (!newChords.trim()) return;
      const section: SongSection = {
        id: editingSection ?? uid(),
        type: newType,
        chords: newChords.trim(),
        repeat: newRepeat,
      };
      setSections(prev =>
        editingSection
          ? prev.map(s => s.id === editingSection ? section : s)
          : [...prev, section]
      );
    }
    resetSectionForm();
  }

  function startEditSection(sec: SongSection) {
    setNewType(sec.type);
    setNewChords(sec.chords);
    setNewRepeat(sec.repeat);
    setNewTimeSignature(sec.timeSignature ?? '');
    setNewMeasures((sec.measures ?? []).map(m => m.split('|')));
    setEditingSection(sec.id);
    setAddOpen(true);
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
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-xs font-bold ${SEC_COLORS[sec.type] ?? 'bg-zinc-500/10 text-zinc-400'}`}
                        >
                          {sec.type.toUpperCase()}
                        </Badge>
                        {sec.timeSignature && (
                          <span className="text-xs font-bold text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">
                            {sec.timeSignature}
                          </span>
                        )}
                        {sec.repeat > 1 && (
                          <span className="text-xs text-muted-foreground">×{sec.repeat}</span>
                        )}
                      </div>
                      {sec.measures ? (
                        <div className="flex flex-col gap-1">
                          {sec.measures.map((measure, i) => (
                            <div key={i} className="flex gap-1 flex-wrap">
                              {measure.split('|').map((chord, j) => (
                                <span
                                  key={j}
                                  className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 text-foreground min-w-[2rem] text-center"
                                >
                                  {chord || '—'}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <pre className="font-mono text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                          {sec.chords}
                        </pre>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditSection(sec)}
                        className="p-1 text-muted-foreground/40 hover:text-primary transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSection(sec.id)}
                        className="p-1 text-muted-foreground/40 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {addOpen ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary/70">
                    {editingSection ? 'Editar sección' : 'Nueva sección'}
                  </p>

                  {/* Tipo de sección */}
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

                  {/* Compás */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Compás <span className="opacity-60">(opcional)</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {TIME_SIGNATURES.map(ts => (
                        <button
                          key={ts.label}
                          type="button"
                          onClick={() => selectTimeSignature(ts.label)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                            newTimeSignature === ts.label
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {ts.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Acordes: grilla o texto libre */}
                  {newTimeSignature ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-muted-foreground">
                        Acordes por compás —{' '}
                        <span className="font-semibold text-primary">
                          {getBeats(newTimeSignature)} tiempos
                        </span>
                      </p>
                      {newMeasures.map((measure, mIdx) => (
                        <div key={mIdx} className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground/40 w-3 text-right shrink-0 font-mono">
                            {mIdx + 1}
                          </span>
                          <div
                            className="grid flex-1 min-w-0 gap-1"
                            style={{ gridTemplateColumns: `repeat(${measure.length}, 1fr)` }}
                          >
                            {measure.map((chord, bIdx) => (
                              <input
                                key={bIdx}
                                value={chord}
                                onChange={e => updateChord(mIdx, bIdx, e.target.value)}
                                onKeyDown={e => handleChordKeyDown(e, mIdx, bIdx)}
                                data-mid={mIdx}
                                data-bid={bIdx}
                                placeholder="—"
                                className="w-full rounded-md border border-border/60 bg-background px-0.5 py-1 text-center font-mono text-sm font-bold placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMeasure(mIdx)}
                            className={`shrink-0 p-0.5 transition-colors ${
                              newMeasures.length > 1
                                ? 'text-muted-foreground/30 hover:text-destructive'
                                : 'invisible'
                            }`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addMeasure}
                        className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-border/60 py-2 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" /> Agregar compás
                      </button>
                    </div>
                  ) : (
                    <Textarea
                      autoFocus
                      value={newChords}
                      onChange={e => setNewChords(e.target.value)}
                      placeholder={'Ej: Am - G - F - E\nAm - F - G'}
                      rows={3}
                      className="font-mono text-sm resize-none focus-visible:ring-primary"
                    />
                  )}

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
                    <Button
                      variant="outline" size="sm"
                      onClick={resetSectionForm}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={addSection} className="flex-1">
                      {editingSection ? 'Guardar cambios' : 'Agregar'}
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
