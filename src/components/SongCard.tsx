
import type { Song } from '@/types'; // Song type now has chords as string
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SongCardProps {
  song: Song | null;
}

export default function SongCard({ song }: SongCardProps) {
  if (!song) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">No songs available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Add a song to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl bg-card text-card-foreground border-2 border-border rounded-xl overflow-hidden">
      <CardHeader className="bg-primary/10 p-4 sm:p-6">
        <CardTitle className="text-center text-3xl sm:text-4xl font-bold text-primary break-words">
          {song.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {song.chords && song.chords.trim() !== "" ? ( 
          <pre className="font-mono text-base sm:text-lg whitespace-pre-wrap break-words leading-relaxed text-foreground bg-background p-3 sm:p-4 rounded-md shadow-inner">
            {song.chords.trim()}
          </pre>
        ) : (
          <p className="text-center text-muted-foreground italic">No chords defined for this song.</p>
        )}
      </CardContent>
    </Card>
  );
}
