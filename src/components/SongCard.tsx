import { Song } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Music2, Pencil, Trash2 } from "lucide-react"
import { Button } from "./ui/button"

interface SongCardProps {
  song: Song
  onEdit?: (song: Song) => void
  onDelete?: (song: Song) => void
}

export default function SongCard({ song, onEdit, onDelete }: SongCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:hover:shadow-primary/20">
      <CardHeader className="relative pb-4">
        <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(song)}
              className="h-8 w-8 hover:bg-primary/10"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit song</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(song)}
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete song</span>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Music2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="line-clamp-1">{song.title}</CardTitle>
            <CardDescription>Song chords</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="max-h-[200px] overflow-y-auto rounded-md bg-muted p-4 font-mono text-sm">
          {song.chords || "No chords added yet"}
        </pre>
      </CardContent>
    </Card>
  )
}
