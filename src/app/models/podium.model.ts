import { Competitor } from './competitor.model';

export interface Podium {
  categoryId: string;
  first: Competitor;
  second?: Competitor;
  third1?: Competitor;
  third2?: Competitor;
}
