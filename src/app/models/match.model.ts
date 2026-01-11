export interface Match {
  id: string;
  round: number;
  order: number;
  competitorA?: string;
  competitorB?: string;
  winner?: string;
  nextMatchId?: string;
}
