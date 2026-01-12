export interface Competitor {
  id: string;
  dorsal: number;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  age: number;
  weight: number;
  belt: string;
  club: string;
  compite: 'Kata' | 'Kumite' | 'Both';
  coachId?: string;
  categoryIds?: string[];
  categoryNames?: string[];
}
