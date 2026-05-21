import { Timestamp } from "firebase/firestore";

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

export interface Evento {
  id: string;
  congregacaoId: string;
  tipo: 'SEMANAL' | 'FESTIVIDADE';
  titulo: string;
  tema: string;
  dataHora: string;
  local?: string;
  
  /*
   |--------------------------------------------------------------------------
   | Divulgação
   |--------------------------------------------------------------------------
   */

  bannerUrl?: string;
  videoDivulgUrl?: string;

  /*
   |--------------------------------------------------------------------------
   | Preletor
   |--------------------------------------------------------------------------
   */

  preletorNome?: string;

  preletorFotoUrl?: string;

  /*
   |--------------------------------------------------------------------------
   | Cantor
   |--------------------------------------------------------------------------
   */

  cantorNome?: string;

  cantorFotoUrl?: string;

  /*
   |--------------------------------------------------------------------------
   | Controle
   |--------------------------------------------------------------------------
   */

  createdAt?: Date;

  updatedAt?: Date;
}