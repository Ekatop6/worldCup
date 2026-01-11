// src/app/services/leagues/league.service.ts
import { Injectable } from '@angular/core';
import { FirebaseService } from '../firebase.service';
import { League } from '../../models/league.model';
import { Match } from '../../models/match.model';
import { v4 as uuid } from 'uuid';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LeagueService {

  constructor(private firebase: FirebaseService) {}
  getLeagues(): Observable<League[]> {
        return this.firebase.getCollection<League>('leagues');
  }
  getLeagueByCategory(categoryId: string): Observable<League[]> {
  return this.firebase.getCollection<League>('leagues')
    .pipe(
      map(leagues => leagues.filter(l => l.categoryId === categoryId))
    );
}


  createLeague(categoryId: string, competitorIds: string[]) {
    const size = competitorIds.length;

    if (![4, 8, 16, 32].includes(size)) {
      throw new Error('Número de competidores inválido');
    }

    const matches = this.buildMatches(competitorIds);

    const league: League = {
      categoryId,
      size,
      matches,
    };

    return this.firebase.add('leagues', league);
  }

  private buildMatches(competitors: string[]): Match[] {
    const matches: Match[] = [];
    let round = 1;
    let current = [...competitors];

    while (current.length > 1) {
      const next: string[] = [];

      for (let i = 0; i < current.length; i += 2) {
        const match: Match = {
          id: uuid(),
          round,
          order: i / 2,
          competitorA: current[i],
          competitorB: current[i + 1]
        };

        matches.push(match);
        next.push(match.id);
      }

      current = next;
      round++;
    }

    return matches;
  }
}
