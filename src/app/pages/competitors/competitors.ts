import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel
import { CompetitorService } from '../../services/competitors/competitors.service';
import { Competitor } from '../../models/competitor.model';
import { Observable, combineLatest, map, startWith, BehaviorSubject } from 'rxjs';
import { CategoryService } from '../../services/categories/category.service';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-competitors',
  standalone: true,
  imports: [CommonModule, AsyncPipe, FormsModule],
  templateUrl: './competitors.html',
  styleUrls: ['./competitors.css']
})
export class CompetitorsComponent {
  // Streams para los filtros
  private searchSubject = new BehaviorSubject<string>('');
  private orderSubject = new BehaviorSubject<'number' | 'club'>('number');
  filteredCompetitors$: Observable<Competitor[]>;
  searchTerm: string = '';
  orderType: 'number' | 'club' = 'number';
  
  // Para el desplegable de categorías
  selectedCompetitorId: string | null = null;

  isAdmin$: Observable<boolean>;

  constructor(
    private competitorService: CompetitorService,
    private categoryService: CategoryService,
    private authService: AuthService
  ) {
    // Esto es un booleano reactivo
    this.isAdmin$ = this.authService.isAdmin$;
  const allCompetitors$ = this.competitorService.getCompetitors();
  const allCategories$ = this.categoryService.getCategories();

  this.filteredCompetitors$ = combineLatest([
    allCompetitors$,
    allCategories$,
    this.searchSubject,
    this.orderSubject
  ]).pipe(
    map(([competitors, categories, search, order]) => {
      // 1. Unimos los nombres de las categorías a cada competidor
      const enrichedCompetitors = competitors.map(competitor => ({
        ...competitor,
        categoryNames: (competitor.categoryIds || []).map(catId => {
          const cat = categories.find(c => c.id === catId);
          return cat ? cat.name : 'Categoría desconocida';
        })
      }));

      // 2. Aplicamos el filtro de búsqueda
      let filtered = enrichedCompetitors.filter(c => 
        `${c.firstName} ${c.lastName} ${c.club}`.toLowerCase().includes(search.toLowerCase())
      );

      // 3. Aplicamos el ordenamiento
      return filtered.sort((a, b) => {
        if (order === 'number') return (a.dorsal || 0) - (b.dorsal || 0);
        return (a.club || '').localeCompare(b.club || '');
      });
    })
  );
}

  onSearch() {
    this.searchSubject.next(this.searchTerm);
  }

  onOrderChange() {
    this.orderSubject.next(this.orderType);
  }

  toggleDetails(id: string) {
    this.selectedCompetitorId = this.selectedCompetitorId === id ? null : id;
  }

  // edición de competidor
  async updateCompetitor(competitor: Competitor) {
    try {
      // Creamos un objeto con solo los datos que queremos actualizar
      const updatedData = {
        dorsal: Number(competitor.dorsal), // Aseguramos que sea número
        club: competitor.club
      };

      await this.competitorService.updateCompetitor(competitor.id, updatedData);
      alert('Datos actualizados correctamente');
      // Opcional: cerrar el detalle tras editar
      // this.selectedCompetitorId = null; 
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert('Error al actualizar el competidor');
    }
  }
}