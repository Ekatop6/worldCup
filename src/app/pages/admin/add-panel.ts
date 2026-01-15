import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompetitorService } from '../../services/competitors/competitors.service';
import { CoachService } from '../../services/coaches/coach.service';
import { CategoryService } from '../../services/categories/category.service';
import { PodiumService } from '../../services/podiums/podiums.service';
import { Competitor } from '../../models/competitor.model';
import { Coach } from '../../models/coach.model';
import { Category } from '../../models/category.model';
import { Podium } from '../../models/podium.model';
import { Observable } from 'rxjs';
import { LeagueService } from '../../services/leagues/league.service';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-panel.html'
})
export class AdminPanelComponent {
  competitor: Partial<Competitor> = {};
  coach: Partial<Coach> = {};
  category: Partial<Category> = {};
  podium: Partial<Podium> = {};
  competitors$: Observable<Competitor[]>;
  categories$: Observable<Category[]>;
  selectedCategoryId: string = '';
  selectedCompetitorIds: string[] = [];
  constructor(
    private competitorService: CompetitorService,
    private coachService: CoachService,
    private categoryService: CategoryService,
    private podiumService: PodiumService,
    private leagueService: LeagueService,
    private router: Router
  ) {
    this.competitors$ = this.competitorService.getCompetitors();
    this.categories$ = this.categoryService.getCategories();
  }

  addCompetitor() {
    this.onSave();
  }

  addCoach() {
    this.coachService.addCoach(this.coach as Coach)
      .then(() => alert('Coach agregado!'))
      .catch(err => console.error(err));
  }

  async addCategory() {
    const result = await this.categoryService.addCategory(this.category as Category);
    if (result) {
      this.resetCategoryForm();
    }
  }

  resetCategoryForm() {
    this.category = {
      name: '',
      gender: 'M',
      estilo: 'Kata',
      minAge: undefined,
      maxAge: undefined,
      minWeight: undefined,
      maxWeight: undefined
    };
  }

  async addPodium() {
    const first = await this.competitorService.getById(this.podium.first?.id || '');
    const second = await this.competitorService.getById(this.podium.second?.id || '');
    const third1 = await this.competitorService.getById(this.podium.third1?.id || '');
    const third2 = await this.competitorService.getById(this.podium.third2?.id || '');

    if (!first) return alert('Selecciona al menos el primer lugar');

    await this.podiumService.addPodium({
      categoryId: this.podium.categoryId!,
      first,
      second: second || undefined,
      third1: third1 || undefined,
      third2: third2 || undefined
    });
    alert('Podium agregado!');
  }

  createLeague() {
    if (!this.selectedCategoryId) {
      return alert('Selecciona una categoría');
    }

    if (![4, 8, 16, 32].includes(this.selectedCompetitorIds.length)) {
      return alert('El número de competidores debe ser 4, 8, 16 o 32');
    }

    this.leagueService.createLeague(
      this.selectedCategoryId,
      this.selectedCompetitorIds
    )
      .then(() => alert('Liga creada correctamente'))
      .catch(err => console.error(err));
  }

  // En tu add-panel.ts
  async onSave() {
    // Usamos 'as Competitor' para evitar el error del ID missing/undefined
    const result = await this.competitorService.addCompetitor(this.competitor as Competitor);

    if (result) {
      this.resetForm();
      // No hace falta poner un Swal.fire aquí porque ya lo hace tu servicio
    }
  }

  resetForm() {
    this.competitor = {
      firstName: '',
      lastName: '',
      gender: 'M',
      compite: 'Kata',
      club: '',
      categoryIds: [],
      categoryNames: []
    };
  }

  async removeCompetitor(): Promise<void> { // Cambiamos a Promise<void> para evitar exigencias de retorno
    if (!this.competitor.dorsal) {
      await Swal.fire('Atención', 'Escribe el dorsal del competidor que quieres borrar', 'info');
      return; // Añadimos return para salir de la función
    }

    const success = await this.competitorService.deleteCompetitorByDorsal(this.competitor.dorsal);

    if (success) {
      this.resetForm();
    }
  }

  async removeCoach(): Promise<void> {
    if (!this.coach.name) {
      await Swal.fire('Atención', 'Escribe el nombre del entrenador', 'info');
      return;
    }

    const success = await this.coachService.deleteCoachByName(this.coach.name);

    if (success) {
      // Limpiar el objeto coach local
      this.coach = { name: '', club: '' };
    }
  }

}
