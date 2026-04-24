"use client";

import { useState, useEffect } from 'react';
import type { Group } from '@/types';
import { GROUP_COLORS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Check, Users } from 'lucide-react';

interface GroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Group | null;
  onSubmit: (data: Omit<Group, 'id'>) => Promise<void>;
}

export default function GroupForm({ isOpen, onClose, initialData, onSubmit }: GroupFormProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(GROUP_COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name ?? '');
      setColor(initialData?.color ?? GROUP_COLORS[0]);
    }
  }, [isOpen, initialData]);

  async function handleSubmit() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), color });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {initialData ? 'Editar grupo' : 'Nuevo grupo'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-1">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nombre
            </label>
            <Input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Nombre del grupo..."
              className="focus-visible:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Color
            </label>
            <div className="flex gap-2.5">
              {GROUP_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-transform active:scale-90"
                  style={{ background: c }}
                >
                  {color === c && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
            className="w-full"
          >
            {saving ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Crear grupo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
