// services/congregacaoService.ts
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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Congregacao } from "@/types";

const congregacoesCollection = collection(db, "congregacoes");

export const congregacaoService = {
  async create(congregacao: Omit<Congregacao, 'id'>) {
    const docRef = await addDoc(congregacoesCollection, {
      ...congregacao,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...congregacao };
  },

  async getAll() {
    const q = query(congregacoesCollection, orderBy("nome"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Congregacao));
  },

  async getByRegiao(regiaoId: string) {
    const q = query(congregacoesCollection, where("regiaoId", "==", regiaoId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Congregacao));
  },

  async update(id: string, data: Partial<Congregacao>) {
    const docRef = doc(db, "congregacoes", id);
    await updateDoc(docRef, { ...data, updatedAt: new Date() });
  },

  async delete(id: string) {
    const docRef = doc(db, "congregacoes", id);
    await deleteDoc(docRef);
  }
};