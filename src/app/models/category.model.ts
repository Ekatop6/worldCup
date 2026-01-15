import { Tatami } from "./tatami.model";

export interface Category {
  id: string;
  name: string;
  gender: 'M' | 'F' | 'Mixed';
  estilo: 'Kata' | 'Kumite';
  minAge: number;
  maxAge?: number;
  minWeight?: number;
  maxWeight?: number;
  competitorIds?: string[];
  competitorNames?: string[];
  tatamiNumber?: Tatami;
}
