"use client";

import { useState, useRef } from 'react';
import type { Song } from '@/types';
import { MUSICAL_KEYS, SECTION_TYPES } from '@/types';
import { importChordAiPdf, type ImportedSection } from '@/ai/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUp, Loader2, Music2, Trash2, Hash, AlertCircle } from 'lucide-react';

interface ImportChordAIProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Song, 'id'>) => Promise<void>;
  defaultGroupIds?: string[];
}

interface ReviewSection extends ImportedSection {
  id: string;
}

function uid() { return Math.random().toString(36).slice(2); }

type Step = 'upload' | 'loading' | 'review';

export default function ImportChordAI({ isOpen, onClose, onSave, defaultGroupIds = [] }: ImportChordAIProps) {
  const [step, setStep] = useState<Step>('upload');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [key, setKey] = useState('Gm');
  const [bpm, setBpm] = useState('');
  const [sections, setSections] = useState<ReviewSection[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetState() {
    setStep('upload');
    setError('');
    setTitle('');
    setKey('Gm');
    setBpm('');
    setSections([]);
    setSaving(false);
  }

  function handleClose() {
    resetState();
    onClose();
  }

  async function handleFile(file: File) {
    if (file.type !== 'application/pdf') {
      setError('Solo se aceptan archivos PDF de ChordAI.');
      return;
    }

    setStep('loading');
    setError('');

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      const result = await importChordAiPdf(formData);

      setTitle(result.title || '');
      setKey(result.key || 'Gm');
      setBpm(result.bpm?.toString() ?? '');
      setSections(result.sections.map(s => ({ ...s, id: uid() })));
      setStep('review');
    } catch {
      setError('No se pudo analizar el PDF. Asegúrate de que es un PDF de ChordAI.');
      setStep('upload');
    }
  }

  function updateSection(id: string, field: keyof ImportedSection, value: string | number) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  function removeSection(id: string) {
    setSections(prev => prev.filter(s => s.id !== id));
  }

  async function handleSave() {
    if (!title.trim() || sections.length === 0) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        key,
        bpm: bpm ? parseInt(bpm) : undefined,
        sections: sections.map(({ id: _id, ...s }) => ({ ...s, id: uid() })),
        groupIds: defaultGroupIds,
      });
      handleClose();
    } catch {
      setSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex h-[90dvh] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            Importar desde ChordAI
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-5 py-4">

          {/* PASO: UPLOAD */}
          {step === 'upload' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Sube el PDF exportado desde ChordAI y la IA organizará los acordes en secciones automáticamente.
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border py-12 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 active:bg-primary/10"
              >
                <div className="rounded-2xl bg-primary/10 p-4 border border-primary/15">
                  <FileUp className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Toca para seleccionar el PDF</p>
                  <p className="text-xs text-muted-foreground mt-1">Solo archivos .pdf de ChordAI</p>
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = '';
                }}
              />

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* PASO: CARGANDO */}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="rounded-2xl bg-primary/10 p-5 border border-primary/15">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Analizando acordes con IA...</p>
                <p className="text-xs text-muted-foreground mt-1">Esto puede tomar unos segundos</p>
              </div>
            </div>
          )}

          {/* PASO: REVISIÓN */}
          {step === 'review' && (
            <div className="flex flex-col gap-5">
              <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                <p className="text-xs font-semibold text-primary/80">
                  ✓ IA detectó {sections.length} sección{sections.length !== 1 ? 'es' : ''}. Revisa y corrige si es necesario.
                </p>
              </div>

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
                    placeholder="154"
                    className="pl-8 focus-visible:ring-primary"
                  />
                </div>
              </div>

              {/* Secciones */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Secciones detectadas
                </label>
                <div className="flex flex-col gap-3">
                  {sections.map(sec => (
                    <div key={sec.id} className="rounded-xl border bg-card p-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {/* Selector de tipo */}
                        <select
                          value={sec.type}
                          onChange={e => updateSection(sec.id, 'type', e.target.value)}
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {SECTION_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>

                        {/* Repeticiones */}
                        <div className="flex gap-1 ml-auto">
                          {[1, 2, 3, 4].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => updateSection(sec.id, 'repeat', n)}
                              className={`h-6 w-6 rounded-md text-xs font-bold transition-all ${
                                sec.repeat === n
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary text-secondary-foreground'
                              }`}
                            >
                              ×{n}
                            </button>
                          ))}
                        </div>

                        {/* Eliminar */}
                        <button
                          type="button"
                          onClick={() => removeSection(sec.id)}
                          className="p-1 text-muted-foreground/40 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Acordes editables */}
                      <Textarea
                        value={sec.chords}
                        onChange={e => updateSection(sec.id, 'chords', e.target.value)}
                        rows={2}
                        className="font-mono text-sm resize-none focus-visible:ring-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </ScrollArea>

        {/* Footer */}
        {step === 'review' && (
          <div className="border-t px-5 py-4 flex flex-col gap-2">
            <Button
              onClick={handleSave}
              disabled={!title.trim() || sections.length === 0 || saving}
              className="w-full"
              size="lg"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
              ) : (
                <><Music2 className="h-4 w-4 mr-2" /> Guardar canción</>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetState}
              className="w-full text-muted-foreground"
            >
              Importar otro PDF
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
