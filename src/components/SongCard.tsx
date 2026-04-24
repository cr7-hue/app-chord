import { Song } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Music2, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface SongCardProps {
  song: Song;
  onEdit?: (song: Song) => void;
  onDelete?: (song: Song) => void;
}

export default function SongCard({ song, onEdit, onDelete }: SongCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <CardHeader className="relative pb-3">
        <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(song)} className="h-7 w-7 hover:bg-primary/10">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(song)} className="h-7 w-7 text-destructive hover:bg-destructive/10">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div className="flex items-start gap-3 pr-16">
          <div className="rounded-full bg-primary/10 p-2 mt-0.5">
            <Music2 className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="line-clamp-1 text-base">{song.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="outline" className="text-xs font-bold text-primary border-primary/40 bg-primary/5">
                {song.key}
              </Badge>
              {song.bpm && (
                <span className="text-xs text-muted-foreground">{song.bpm} BPM</span>
              )}
              <span className="text-xs text-muted-foreground">
                {song.sections?.length ?? 0} sec.
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      {song.sections && song.sections.length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-1.5">
            {song.sections.slice(0, 2).map(sec => (
              <div key={sec.id} className="rounded-md bg-muted p-2">
                <span className="text-xs font-bold text-primary/70 uppercase tracking-wider">
                  {sec.type}{sec.repeat > 1 ? ` ×${sec.repeat}` : ''}
                </span>
                <pre className="mt-0.5 font-mono text-xs text-muted-foreground line-clamp-1 whitespace-pre-wrap">
                  {sec.chords}
                </pre>
              </div>
            ))}
            {song.sections.length > 2 && (
              <p className="text-xs text-muted-foreground pl-1">
                +{song.sections.length - 2} sección{song.sections.length - 2 !== 1 ? 'es' : ''} más
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
