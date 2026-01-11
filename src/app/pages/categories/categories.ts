import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/categories/category.service';
import { LeagueService } from '../../services/leagues/league.service';
import { Category } from '../../models/category.model';
import { League } from '../../models/league.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.html'
})
export class CategoriesComponent {

  categories$: Observable<Category[]>;
  selectedCategoryId: string | null = null;
  league$: Observable<League[]> | null = null;

  constructor(
    private categoryService: CategoryService,
    private leagueService: LeagueService
  ) {
    this.categories$ = this.categoryService.getCategories();
  }

  selectCategory(categoryId: string) {
    this.selectedCategoryId = categoryId;
    this.league$ = this.leagueService.getLeagueByCategory(categoryId);
  }
}
