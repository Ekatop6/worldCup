import { Competitor } from "./competitor.model";

export interface Match {
  id: string;
  round: number;
  order: number;
  competitorA?: Competitor;
  competitorB?: Competitor;
  winner?: Competitor;
  nextMatchId?: string;
  score1?: number;
  score2?: number;
  score3?: number;
  score4?: number;
  score5?: number;
  totalScore?: number;
}
