"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSongs } from '@/hooks/useSongs';
import type { Song } from '@/types'; // Song type now has chords as string
import SongCard from '@/components/SongCard';
import SongForm from '@/components/SongForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, PlusCircle, Edit3, Trash2, Music2, Search as SearchIcon, X as ClearSearchIcon, FileQuestion, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';

// Import Firestore functions for adding, updating, and deleting
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export default function HomePage() {
  // Use the updated hook with loading and error states
  const { songs, loading, error, getSongById } = useSongs();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);

  const filteredSongs = useMemo(() => {
    // Use loading state instead of isInitialized
    if (loading) return [];
    if (!searchTerm) {
      return songs;
    }
    return songs.filter(song => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const titleMatch = song.title.toLowerCase().includes(lowerSearchTerm);
      // Updated search: check chords string directly
      const chordsMatch = song.chords && song.chords.toLowerCase().includes(lowerSearchTerm);
      return titleMatch || chordsMatch;
    }) as Song[]; // Explicitly cast to Song[]
  }, [songs, searchTerm, loading]); // Update dependencies

  useEffect(() => {
    setCurrentSongIndex(0);
  }, [searchTerm]);


  useEffect(() => {
    if (loading) return;

    if (filteredSongs.length > 0) {
      if (currentSongIndex >= filteredSongs.length) {
        setCurrentSongIndex(filteredSongs.length - 1);
      } else if (currentSongIndex < 0 && filteredSongs.length > 0) { 
        setCurrentSongIndex(0);
      }
    } else {
      setCurrentSongIndex(0); 
    }
  }, [filteredSongs, currentSongIndex, loading]);

  const currentSong = filteredSongs.length > 0 && !loading ? filteredSongs[currentSongIndex] : null;

  const handleNextSong = () => {
    if (filteredSongs.length > 0) {
      setCurrentSongIndex((prevIndex) => (prevIndex + 1) % filteredSongs.length);
    }
  };

  const handlePreviousSong = () => {
    if (filteredSongs.length > 0) {
      setCurrentSongIndex((prevIndex) => (prevIndex - 1 + filteredSongs.length) % filteredSongs.length);
    }
  };

  const handleAddSong = () => {
    setEditingSong(null);
    setIsFormOpen(true);
  };

  const handleEditSong = () => {
    if (currentSong) {
      setEditingSong(currentSong);
      setIsFormOpen(true);
    }
  };

  const openDeleteDialog = () => {
    if (currentSong) {
      setSongToDelete(currentSong);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDeleteSong = async () => { // Make function async
    if (songToDelete) {
      try {
        await deleteDoc(doc(db, "songs", songToDelete.id)); // Delete from Firestore
        toast({ title: "Song Deleted", description: `"${songToDelete.title}" has been removed.` });
        setSongToDelete(null);
        setIsDeleteDialogOpen(false);
      } catch (e) {
        console.error("Error removing document: ", e);
        toast({ title: "Error", description: "Failed to delete song.", variant: "destructive" });
      }
    }
  };

  // Modified handleFormSubmit to interact with Firestore
  const handleFormSubmit = async (data: { title: string; chords: string }, id?: string) => {
    try {
      if (id) {
        await updateDoc(doc(db, "songs", id), {
          title: data.title,
          chords: data.chords // Ya no necesitamos el || "" porque chords siempre será string
        });
        toast({ title: "Song Updated", description: `"${data.title}" has been updated.` });
      } else {
        await addDoc(collection(db, "songs"), {
          title: data.title,
          chords: data.chords // Ya no necesitamos el || "" porque chords siempre será string
        });
        toast({ title: "Song Added", description: `"${data.title}" has been added.` });
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error handling form submit:", error);
      toast({ 
        title: "Error", 
        description: "Failed to save song.", 
        variant: "destructive" 
      });
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
        <Music2 className="h-16 w-16 text-primary animate-pulse mb-4" />
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-64 w-full max-w-2xl mb-6" />
        <div className="flex space-x-4">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-24" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
        <FileQuestion className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">Error loading songs</h1>
        <p className="text-muted-foreground text-center">{error.message || "An unknown error occurred while fetching songs."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground items-center pt-6 pb-24 sm:pb-6 px-2 sm:px-4">
      <div className="container mx-auto p-4 relative">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Music2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">ChordFlash</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Song
            </Button>
          </div>
        </div>
      </div>

      {songs.length > 0 && (
        <div className="w-full max-w-2xl mx-auto mb-4 px-2 sm:px-0">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search songs by title or chords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 shadow-sm border-border focus:ring-primary h-10" 
              aria-label="Search songs"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <ClearSearchIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      <main className="flex-grow w-full flex flex-col items-center justify-center px-2">
        {filteredSongs.length === 0 && !loading && !error ? (
          <Card className="w-full max-w-2xl mx-auto shadow-xl">
            <CardHeader className="items-center">
              <Music2 className="h-20 w-20 text-primary mb-4" />
              <CardTitle className="text-center text-2xl text-primary">¡No hay canciones aún!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Parece que tu repertorio está vacío. <br />
                ¡Haz clic en "Add Song" para empezar a añadir tus temas!
              </p>
            </CardContent>
          </Card>
        ) : filteredSongs.length === 0 && searchTerm && !loading && !error ? (
          <Card className="w-full max-w-2xl mx-auto shadow-xl">
            <CardHeader className="items-center">
              <FileQuestion className="h-20 w-20 text-primary mb-4" />
              <CardTitle className="text-center text-2xl text-primary">Sin resultados</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                No se encontraron canciones para "{searchTerm}".
              </p>
              <Button variant="link" className="p-0 h-auto mt-2 text-sm text-primary hover:text-primary/80" onClick={() => setSearchTerm('')}>
                Limpiar búsqueda
              </Button>
            </CardContent>
          </Card>
        ) : currentSong ? (
          <SongCard song={currentSong} />
        ) : null}
      </main>

      {!loading && filteredSongs.length > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border p-3 sm:p-4 shadow-lg">
          <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center justify-center gap-2 w-full sm:w-auto order-2 sm:order-1">
              <Button onClick={handleEditSong} variant="outline" size="lg" className="flex-1 sm:flex-none shadow-sm border-primary text-primary hover:bg-primary/10" disabled={!currentSong}>
                <Edit3 className="h-5 w-5 sm:mr-2" /><span>Edit</span>
              </Button>
              <Button onClick={openDeleteDialog} variant="destructive" size="lg" className="flex-1 sm:flex-none shadow-sm" disabled={!currentSong}>
                <Trash2 className="h-5 w-5 sm:mr-2" /><span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-2">
              <Button onClick={handlePreviousSong} disabled={filteredSongs.length <= 1} variant="outline" size="lg" className="flex-1 sm:flex-none shadow-sm border-primary text-primary hover:bg-primary/10">
                <ChevronLeft className="h-6 w-6" /> <span className="ml-1">Prev</span>
              </Button>
              <div className="text-sm text-muted-foreground tabular-nums whitespace-nowrap hidden sm:block">
                {currentSongIndex + 1} / {filteredSongs.length}
              </div>
              <Button onClick={handleNextSong} disabled={filteredSongs.length <= 1} variant="outline" size="lg" className="flex-1 sm:flex-none shadow-sm border-primary text-primary hover:bg-primary/10">
                <span className="mr-1">Next</span> <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground tabular-nums whitespace-nowrap sm:hidden order-3 pt-2">
              Song {currentSongIndex + 1} of {filteredSongs.length}
            </div>
          </div>
        </footer>
      )}

      <SongForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingSong}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-card-foreground">
              Esta acción no se puede deshacer. Se eliminará permanentemente la canción
              "{songToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-primary text-primary hover:bg-primary/10">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSong} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
