// services/regiaoService.ts
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Regiao } from "@/types";

const regioesCollection = collection(db, "regioes");

export const regiaoService = {
  async create(regiao: Omit<Regiao, 'id'>) {
    const docRef = await addDoc(regioesCollection, {
      ...regiao,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...regiao };
  },

  async getAll(): Promise<Regiao[]> {
    const q = query(regioesCollection, orderBy("nome"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Regiao));
  },

  async update(id: string, regiao: Partial<Regiao>) {
    const docRef = doc(db, "regioes", id);
    await updateDoc(docRef, {
      ...regiao,
      updatedAt: new Date()
    });
    return { id, ...regiao };
  },

  async delete(id: string) {
    const docRef = doc(db, "regioes", id);
    await deleteDoc(docRef);
  }
};