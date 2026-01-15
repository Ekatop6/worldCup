import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map, Observable } from 'rxjs';

import { LeagueService } from '../../services/leagues/league.service';
import { CategoryService } from '../../services/categories/category.service';
import { CompetitorService } from '../../services/competitors/competitors.service';

import { Category } from '../../models/category.model';
import { Competitor } from '../../models/competitor.model';

@Component({
  selector: 'app-league',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './league.html',
  styleUrls: ['./league.css']
})
export class LeagueComponent {

  categories$: Observable<Category[]>;
  competitors$: Observable<Competitor[]>;
  filteredCompetitors$: Observable<Competitor[]>;

  selectedCategoryId: string = '';
  selectedCompetitorIds: string[] = [];

  constructor(
    private leagueService: LeagueService,
    private categoryService: CategoryService,
    private competitorService: CompetitorService
  ) {
    this.categories$ = this.categoryService.getCategories();
    this.competitors$ = this.competitorService.getCompetitors();
    this.filteredCompetitors$ = this.competitors$;
  }

  onCategoryChange() {
  this.selectedCompetitorIds = []; 
  
  if (!this.selectedCategoryId) {
    this.filteredCompetitors$ = this.competitors$;
    return;
  }

  this.filteredCompetitors$ = this.competitors$.pipe(
    map(competitors =>
      // Usamos ?.includes para evitar errores si el campo no existe
      competitors.filter(c => c.categoryIds?.includes(this.selectedCategoryId))
    )
  );
}

  createLeague() {
    if (!this.selectedCategoryId) {
      return alert('Selecciona una categoría');
    }

    if (![2, 4, 8, 16, 32].includes(this.selectedCompetitorIds.length)) {
      return alert('El número de competidores debe ser 2, 4, 8, 16 o 32');
    }

    this.leagueService.createLeague(
      this.selectedCategoryId,
      this.selectedCompetitorIds
    )
    .then(() => alert('Liga creada correctamente'))
    .catch(err => console.error(err));
  }

  toggleCompetitor(id: string, checked: boolean) {
    if (checked) {
      this.selectedCompetitorIds.push(id);
    } else {
      this.selectedCompetitorIds =
        this.selectedCompetitorIds.filter(c => c !== id);
    }
  }

}
