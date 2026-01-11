export interface Category {
  id: string;
  name: string;
  gender: 'M' | 'F' | 'Mixed';
  minAge: number;
  maxAge?: number;
  minWeight?: number;
  maxWeight?: number;
  beltLevel?: string;
}
