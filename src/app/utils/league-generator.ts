import { League } from '../models/league.model';
import { Match } from '../models/match.model';

export function generateLeague(
  categoryId: string,
  competitorIds: string[]
): League {

  const size = competitorIds.length as 2 |4 | 8 | 16 | 32;
  const matches: Match[] = [];

  let matchCounter = 1;
  let previousRoundIds: string[] = [];
  const totalRounds = Math.log2(size);

  for (let round = 1; round <= totalRounds; round++) {
    const matchesInRound = size / Math.pow(2, round);
    const currentRoundIds: string[] = [];

    for (let i = 0; i < matchesInRound; i++) {
      const id = `M${matchCounter++}`;

      matches.push({
        id,
        round,
        order: i,
        competitorA: round === 1 ? competitorIds[i * 2] : undefined,
        competitorB: round === 1 ? competitorIds[i * 2 + 1] : undefined,
        nextMatchId: undefined
      });

      currentRoundIds.push(id);
    }

    previousRoundIds.forEach((prevId, index) => {
      const nextId = currentRoundIds[Math.floor(index / 2)];
      const match = matches.find(m => m.id === prevId);
      if (match) match.nextMatchId = nextId;
    });

    previousRoundIds = currentRoundIds;
  }

  return {
    id: crypto.randomUUID(),
    categoryId,
    size,
    matches
  };
}
