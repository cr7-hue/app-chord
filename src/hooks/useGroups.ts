"use client";

import { useState, useEffect } from 'react';
import type { Group } from '@/types';
import { db } from '@/lib/firebaseConfig';
import {
  collection, onSnapshot, query, orderBy,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'groups'), orderBy('name'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Group));
      setGroups(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching groups:', err);
      setError(err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function addGroup(data: Omit<Group, 'id'>) {
    await addDoc(collection(db, 'groups'), {
      ...data,
      createdAt: serverTimestamp(),
    });
  }

  async function updateGroup(id: string, data: Partial<Omit<Group, 'id'>>) {
    await updateDoc(doc(db, 'groups', id), data);
  }

  async function deleteGroup(id: string) {
    await deleteDoc(doc(db, 'groups', id));
  }

  return { groups, loading, error, addGroup, updateGroup, deleteGroup };
}
