import { Song } from '@/types';
import { Music2, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface SongCardProps {
  song: Song;
  onEdit?: (song: Song) => void;
  onDelete?: (song: Song) => void;
}

export default function SongCard({ song, onEdit, onDelete }: SongCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-200 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 active:scale-[0.99]">

      {/* Gradiente sutil en la parte superior */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-primary/4 to-transparent pointer-events-none" />

      {/* Botones editar/eliminar */}
      <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {onEdit && (
          <Button
            variant="ghost" size="icon"
            onClick={e => { e.stopPropagation(); onEdit(song); }}
            className="h-7 w-7 hover:bg-primary/10"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost" size="icon"
            onClick={e => { e.stopPropagation(); onDelete(song); }}
            className="h-7 w-7 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="p-4 pb-3">
        <div className="flex items-start gap-3 pr-16">
          {/* Ícono */}
          <div className="shrink-0 rounded-xl bg-primary/10 p-2 mt-0.5 border border-primary/15">
            <Music2 className="h-4 w-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-base leading-tight line-clamp-1">{song.title}</p>
            {song.artist && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{song.artist}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Badge tonalidad destacado */}
              <span className="rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-extrabold text-primary border border-primary/20">
                {song.key}
              </span>
              {song.bpm && (
                <span className="text-xs text-muted-foreground">{song.bpm} BPM</span>
              )}
              <span className="text-xs text-muted-foreground">
                {song.sections?.length ?? 0} sec.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview de secciones */}
      {song.sections && song.sections.length > 0 && (
        <div className="px-4 pb-4 pt-0 space-y-1.5">
          {song.sections.slice(0, 2).map(sec => (
            <div key={sec.id} className="rounded-xl bg-muted/70 px-3 py-2">
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
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
      )}
    </div>
  );
}
