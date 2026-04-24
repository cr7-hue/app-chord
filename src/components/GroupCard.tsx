import { Group } from '@/types';
import { Card, CardContent } from './ui/card';
import { Music2, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

interface GroupCardProps {
  group: Group;
  songCount: number;
  onDelete?: (group: Group) => void;
}

export default function GroupCard({ group, songCount, onDelete }: GroupCardProps) {
  return (
    <Card
      className="group relative overflow-hidden transition-all duration-200 hover:shadow-md active:scale-[0.98]"
      style={{ borderTopColor: group.color, borderTopWidth: 3 }}
    >
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.preventDefault(); onDelete(group); }}
          className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-opacity z-10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}

      <Link href={`/groups/${group.id}`} className="block">
        <CardContent className="p-4">
          <div
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: group.color + '20' }}
          >
            <Music2 className="h-5 w-5" style={{ color: group.color }} />
          </div>
          <p className="font-semibold text-foreground leading-tight">{group.name}</p>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {songCount} canción{songCount !== 1 ? 'es' : ''}
            </p>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
