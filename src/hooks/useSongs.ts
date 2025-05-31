"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Song } from '@/types';
import { db } from "@/lib/firebaseConfig"; // Import db from firebaseConfig
import { collection, onSnapshot, query, orderBy, CollectionReference } from "firebase/firestore"; // Import Firestore functions


export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true); // Add a loading state
  const [error, setError] = useState<Error | null>(null); // Add an error state

  useEffect(() => {
    setLoading(true);
    const songsCollection = collection(db, "songs") as CollectionReference<Song>; // Specify type for better type safety
    // Create a query to order songs by title (optional, adjust as needed)
    const q = query(songsCollection, orderBy("title"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const songsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSongs(songsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching songs from Firestore:", err);
      setError(err);
      setLoading(false);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array means this effect runs once on mount

  const addSong = useCallback((newSongData: Omit<Song, 'id'>) => {
    setSongs(prevSongs => {
      const newSong: Song = { ...newSongData, id: crypto.randomUUID() };
      return [...prevSongs, newSong];
    });
  }, []);
  const updateSong = useCallback((updatedSong: Song) => {
    setSongs(prevSongs =>
      prevSongs.map(song => (song.id === updatedSong.id ? updatedSong : song))
    );
  }, []);
  const deleteSong = useCallback((songId: string) => {
    setSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
  }, []);

  const getSongById = useCallback((songId: string): Song | undefined => {
    return songs.find(song => song.id === songId);
  }, [songs]);

  // Return songs, loading state, and error state
  return { songs, loading, error, getSongById };
}
