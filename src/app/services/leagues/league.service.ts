import { Injectable } from '@angular/core';
import { FirebaseService } from '../firebase.service';
import { CompetitorService } from '../competitors/competitors.service'; // Importante
import { League } from '../../models/league.model';
import { Match } from '../../models/match.model';
import { Competitor } from '../../models/competitor.model';
import { v4 as uuid } from 'uuid';
import { map, Observable, combineLatest } from 'rxjs';
import { firstValueFrom } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class LeagueService {
  constructor(
    private firebase: FirebaseService,
    private competitorService: CompetitorService
  ) {}

  // Obtiene las ligas y sustituye los IDs por objetos Competitor completos
  getLeagueByCategory(categoryId: string): Observable<League[]> {
    return combineLatest([
      this.firebase.getCollection<League>('leagues'),
      this.competitorService.getCompetitors()
    ]).pipe(
      map(([leagues, allCompetitors]) => {
        // 1. Filtramos por categoría
        const filteredLeagues = leagues.filter(l => l.categoryId === categoryId);

        // 2. Mapeamos cada liga para transformar sus matches
        return filteredLeagues.map(league => ({
          ...league,
          matches: league.matches?.map(match => ({
            ...match,
            // Buscamos el objeto competidor completo usando el ID guardado
            competitorA: allCompetitors.find(c => c.id === (match.competitorA as any)),
            competitorB: allCompetitors.find(c => c.id === (match.competitorB as any)),
            winner: allCompetitors.find(c => c.id === (match.winner as any))
          }))
        }));
      })
    );
  }

  createLeague(categoryId: string, competitorIds: string[]) {
    const size = competitorIds.length;
    if (![2, 4, 8, 16, 32].includes(size)) {
      throw new Error('Número de competidores inválido');
    }

    // Al crear, enviamos los IDs. buildMatches los asigna como strings.
    // Firebase los aceptará y luego el GET los transformará en objetos.
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
    let currentIds = [...competitors];

    while (currentIds.length > 1) {
      const nextRoundMatchIds: string[] = [];

      for (let i = 0; i < currentIds.length; i += 2) {
        const matchId = uuid();
        const match: any = { // Usamos any temporalmente para la creación con IDs
          id: matchId,
          round,
          order: i / 2,
          competitorA: currentIds[i] || null,
          competitorB: currentIds[i + 1] || null
        };

        matches.push(match);
        nextRoundMatchIds.push(matchId);
      }

      currentIds = nextRoundMatchIds;
      round++;
    }

    return matches;
  }

  async updateMatchWinner(leagueId: string, matchId: string, winnerId: string) {
    // 1. Obtenemos la liga actual (puedes usar un get directo o desde tu lista)
    const leagues = await firstValueFrom(this.firebase.getCollection<League>('leagues'));
    const league = leagues.find(l => l.id === leagueId);
    
    if (!league || !league.matches) {
      throw new Error('La liga o sus combates no existen');
    }
    // 2. Buscamos el combate actual y el siguiente
    const currentMatchIndex = league.matches.findIndex(m => m.id === matchId);
    const currentMatch = league.matches[currentMatchIndex];
    
    // 3. Marcamos el ganador en el combate actual
    currentMatch.winner = winnerId as any;

    // 4. Lógica para avanzar al siguiente combate
    // Buscamos el combate de la siguiente ronda que corresponde a este cruce
    // Matemáticamente, si el match actual es el 'order' 0 o 1, van al match 0 de la siguiente ronda
    const nextRound = currentMatch.round + 1;
    const nextOrder = Math.floor(currentMatch.order / 2);
    
    const nextMatch = league.matches.find(m => m.round === nextRound && m.order === nextOrder);

    if (nextMatch) {
      // Si el orden actual era par (0, 2, 4...), va al Competidor A
      // Si era impar (1, 3, 5...), va al Competidor B
      if (currentMatch.order % 2 === 0) {
        nextMatch.competitorA = winnerId as any;
      } else {
        nextMatch.competitorB = winnerId as any;
      }
    }

    // 5. Guardamos toda la liga actualizada en Firebase
    // Nota: Asegúrate de que tu firebase.service tenga un método update o set
    return this.firebase.update('leagues', leagueId, league);
  }

}