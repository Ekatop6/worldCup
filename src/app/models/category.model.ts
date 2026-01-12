export interface Category {
  id: string;
  name: string;
  gender: 'M' | 'F' | 'Mixed';
  estilo: 'Kata' | 'Kumite';
  minAge: number;
  maxAge?: number;
  minWeight?: number;
  maxWeight?: number;
  beltLevel?: string;
  competitorIds?: string[];
  competitorNames?: string[];
}
