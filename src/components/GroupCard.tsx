import { Group } from '@/types';
import { Music2, Trash2, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

interface GroupCardProps {
  group: Group;
  songCount: number;
  onDelete?: (group: Group) => void;
}

export default function GroupCard({ group, songCount, onDelete }: GroupCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl transition-all duration-200 active:scale-[0.97]"
      style={{ boxShadow: `0 4px 20px ${group.color}25` }}
    >
      {/* Fondo degradado con color del grupo */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${group.color}22 0%, ${group.color}0a 60%, transparent 100%)`,
        }}
      />
      <div className="absolute inset-0 rounded-2xl border border-border/60" />

      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.preventDefault(); onDelete(group); }}
          className="absolute right-2 top-2 h-7 w-7 z-10 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-opacity"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}

      <Link href={`/groups/${group.id}`} className="relative block p-4">
        {/* Ícono del grupo */}
        <div
          className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl shadow-sm"
          style={{ background: group.color + '28', border: `1.5px solid ${group.color}40` }}
        >
          <Music2 className="h-5 w-5" style={{ color: group.color }} />
        </div>

        <p className="font-bold text-foreground leading-tight">{group.name}</p>

        <div className="mt-1.5 flex items-center justify-between">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: group.color + '20', color: group.color }}
          >
            {songCount} {songCount !== 1 ? 'canciones' : 'canción'}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
        </div>
      </Link>
    </div>
  );
}
