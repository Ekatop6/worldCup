import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/categories/category.service';
import { LeagueService } from '../../services/leagues/league.service';
import { League } from '../../models/league.model';
import { Observable, map } from 'rxjs';
import { Match } from '../../models/match.model';
import { Competitor } from '../../models/competitor.model';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class CategoriesComponent {
  // Guardamos el ID de la liga que el usuario quiere ver desplegada
  expandedLeagueId: string | null = null;
  
  // Agrupación reactiva de ligas
  groupedLeagues$: Observable<any>;

  constructor(
    private categoryService: CategoryService,
    private leagueService: LeagueService
  ) {
    // Obtenemos todas las ligas y las agrupamos por categoría de edad
    this.groupedLeagues$ = this.leagueService.getLeagues().pipe(
      map(leagues => this.groupAndSort(leagues))
    );
  }

  private groupAndSort(leagues: League[]) {
  const groups: { [key: string]: League[] } = {};

  leagues.forEach(league => {
    // Usamos el nombre que inyectamos en el servicio
    const name = league.categoryName || 'Otras';
    const ageGroup = name.split(' ')[0]; 
    
    if (!groups[ageGroup]) groups[ageGroup] = [];
    groups[ageGroup].push(league);
  });

  for (let key in groups) {
    groups[key].sort((a: League, b: League) => {
      // Usamos encadenamiento opcional o strings vacíos para evitar errores
      const nameA = a.categoryName?.toUpperCase() || '';
      const nameB = b.categoryName?.toUpperCase() || '';
      
      const isAKata = nameA.includes('KATA');
      const isBKata = nameB.includes('KATA');

      if (isAKata && !isBKata) return -1;
      if (!isAKata && isBKata) return 1;
      return nameA.localeCompare(nameB);
    });
  }
  return groups;
}

  toggleLeague(leagueId: string) {
    this.expandedLeagueId = this.expandedLeagueId === leagueId ? null : leagueId;
  }

  // Métodos de ayuda para dibujar el árbol
  getRounds(matches: Match[] | undefined): number[] {
    if (!matches) return [];
    const rounds = matches.map(m => m.round);
    return Array.from(new Set(rounds)).sort((a, b) => a - b);
  }

  getMatchesByRound(matches: Match[] | undefined, round: number): Match[] {
    if (!matches) return [];
    return matches.filter(m => m.round === round);
  }

  async setWinner(leagueId: string | undefined, matchId: string | undefined, winner: Competitor | undefined) {
    if (!leagueId || !matchId || !winner) return;
    const confirmacion = confirm(`¿Marcar a ${winner.firstName} ${winner.lastName} como ganador?`);
    if (confirmacion) {
      try {
        await this.leagueService.updateMatchWinner(leagueId, matchId, winner.id);
      } catch (error) {
        console.error(error);
      }
    }
  }

  // Calcula el total (puedes ajustar si quieres quitar la nota más alta y baja, común en Kata)
calculateTotal(match: any): number {
  const scores = [
    match.score1 || 0,
    match.score2 || 0,
    match.score3 || 0,
    match.score4 || 0,
    match.score5 || 0
  ];
  return parseFloat(scores.reduce((a, b) => a + b, 0).toFixed(2));
}

async saveKataScore(leagueId: string, match: any) {
    try {
      const total = this.calculateTotal(match);
      // Llamamos al servicio para actualizar el match con las nuevas notas
      await this.leagueService.updateKataMatchScore(leagueId, match.id, {
        score1: match.score1,
        score2: match.score2,
        score3: match.score3,
        score4: match.score4,
        score5: match.score5,
        totalScore: total
      });
      alert('Puntuación guardada correctamente');
    } catch (error) {
      console.error(error);
      alert('Error al guardar');
    }
  }
}