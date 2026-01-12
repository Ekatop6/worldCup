import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/categories/category.service';
import { LeagueService } from '../../services/leagues/league.service';
import { Category } from '../../models/category.model';
import { League } from '../../models/league.model';
import { Observable } from 'rxjs';
import { Match } from '../../models/match.model';
import { Competitor } from '../../models/competitor.model';
@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.html'
})
export class CategoriesComponent {

  categories$: Observable<Category[]>;
  selectedCategoryId: string | null = null;
  leagues$: Observable<League[]> | null = null;

  constructor(
    private categoryService: CategoryService,
    private leagueService: LeagueService
  ) {
    this.categories$ = this.categoryService.getCategories();
  }

  selectCategory(categoryId: string) {
    this.selectedCategoryId = categoryId;
    this.leagues$ = this.leagueService.getLeagueByCategory(categoryId);
  }
   getRounds(matches: Match[] | undefined): number[] {
  // Si matches es undefined o null, devolvemos un array vacío
  if (!matches) return [];
  
  const rounds = matches.map(m => m.round);
  return Array.from(new Set(rounds)).sort((a, b) => a - b);
}

getMatchesByRound(matches: Match[] | undefined, round: number): Match[] {
  if (!matches) return [];
  
  return matches.filter(m => m.round === round);
}
// Dentro de la clase CategoriesComponent

// En categories.ts
async setWinner(leagueId: string | undefined, matchId: string | undefined, winner: Competitor | undefined) {
  // Si falta cualquiera de los datos, no hacemos nada
  if (!leagueId || !matchId || !winner) {
    return;
  }

  const confirmacion = confirm(`¿Marcar a ${winner.firstName} como ganador?`);
  if (confirmacion) {
    try {
      await this.leagueService.updateMatchWinner(leagueId, matchId, winner.id);
      // ... resto del código
    } catch (error) {
      console.error(error);
    }
  }
}
}
