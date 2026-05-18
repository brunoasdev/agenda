// types/index.ts
export interface Regiao {
  id: string;
  nome: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Congregacao {
  id: string;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
  regiaoId: string;
  createdAt?: Date;
  updatedAt?: Date;
}