// services/eventoService.ts

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

import { Evento } from '@/types';

const eventosCollection = collection(
  db,
  'eventos'
);

export const eventoService = {

  async create(
    evento: Omit<Evento, 'id'>
  ) {
    const docRef = await addDoc(
      eventosCollection,
      {
        ...evento,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    return {
      id: docRef.id,
      ...evento
    };
  },

  async getAll() {
    const q = query(
      eventosCollection,
      orderBy('dataHora')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Evento[];
  },

  async getByCongregacao(
    congregacaoId: string
  ) {
    const q = query(
      eventosCollection,
      where(
        'congregacaoId',
        '==',
        congregacaoId
      ),
      orderBy('dataHora')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Evento[];
  },

  async getByTipo(tipo: string) {
    const q = query(
      eventosCollection,
      where('tipo', '==', tipo),
      orderBy('dataHora')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Evento[];
  },

  async update(
    id: string,
    data: Partial<Evento>
  ) {
    const docRef = doc(
      db,
      'eventos',
      id
    );

    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
  },

  async delete(id: string) {
    const docRef = doc(
      db,
      'eventos',
      id
    );

    await deleteDoc(docRef);
  }
};