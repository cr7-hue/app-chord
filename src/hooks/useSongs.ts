"use client";

import { useState, useEffect } from 'react';
import type { Song } from '@/types';
import { db } from '@/lib/firebaseConfig';
import {
  collection, onSnapshot, query, orderBy,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'songs'), orderBy('title'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Song));
      setSongs(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching songs:', err);
      setError(err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function addSong(data: Omit<Song, 'id'>) {
    await addDoc(collection(db, 'songs'), {
      ...data,
      createdAt: serverTimestamp(),
    });
  }

  async function updateSong(id: string, data: Partial<Omit<Song, 'id'>>) {
    await updateDoc(doc(db, 'songs', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async function deleteSong(id: string) {
    await deleteDoc(doc(db, 'songs', id));
  }

  function getSongById(id: string) {
    return songs.find(s => s.id === id);
  }

  function getSongsByGroup(groupId: string) {
    return songs.filter(s => s.groupIds?.includes(groupId));
  }

  return { songs, loading, error, addSong, updateSong, deleteSong, getSongById, getSongsByGroup };
}
