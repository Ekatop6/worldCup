import { Competitor } from "./competitor.model";

export interface Match {
  id: string;
  round: number;
  order: number;
  competitorA?: Competitor;
  competitorB?: Competitor;
  winner?: Competitor;
  nextMatchId?: string;
}
