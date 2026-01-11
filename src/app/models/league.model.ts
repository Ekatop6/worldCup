import { Match } from './match.model';

export interface League {
  id?: string;
  categoryId: string;
  size: number; // 2, 4, 8, 16, 32
  matches?: Match[];
}
