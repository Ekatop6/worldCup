// src/app/services/competitor.service.ts
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseService } from '../firebase.service';
import { Competitor } from '../../models/competitor.model';
import { Category } from '../../models/category.model';

@Injectable({ providedIn: 'root' })
export class CompetitorService {
  constructor(private firebase: FirebaseService,private categoryService: FirebaseService,
  ) {}

  getCompetitors(): Observable<Competitor[]> {
    return this.firebase.getCollection<Competitor>('competitors');
  }

  async getById(id: string): Promise<Competitor | undefined> {
    const docRef = doc(db, 'competitors', id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Competitor;
    }
    return undefined;
  }


  async addCompetitor(competitor: Competitor) {
    // 1. Normalización de datos del competidor
    const compAge = Number(competitor.age);
    const compWeight = Number(competitor.weight);
    const compGender = competitor.gender; // "M" o "F"
    const compStyle = competitor.compite; // "Kata", "Kumite" o "Both"

    // IMPORTANTE: Verifica si tu colección se llama 'categories' o 'Categories'
    const allCategories = await firstValueFrom(this.categoryService.getCollection<Category>('categories'));

    console.log("Categorías recuperadas:", allCategories.length); // Debug para ver si llegan datos

    const matchingCategories = allCategories.filter(cat => {
      // FILTRO A: Género (M coincide con M o Mixed)
      const genderMatch = cat.gender === 'Mixed' || cat.gender === compGender;
      
      // FILTRO B: Edad (Senior Men Kata tiene minAge 18, Ekaitz tiene 20 -> OK)
      // Usamos Number() por si acaso Firebase lo trajo como string
      const ageMatch = compAge >= Number(cat.minAge) && 
                      (!cat.maxAge || compAge <= Number(cat.maxAge));
      
      // FILTRO C: Estilo
      let styleMatch = false;
      if (compStyle === 'Both') {
        styleMatch = true; // Si compite en ambos, es apto para cualquier cat de Kata o Kumite
      } else {
        styleMatch = cat.estilo === compStyle;
      }

      // FILTRO D: Peso (Solo si la categoría es Kumite y tiene límites)
      let weightMatch = true;
      if (cat.estilo === 'Kumite'   && (cat.minWeight || cat.maxWeight)) {
        weightMatch = (!cat.minWeight || compWeight >= Number(cat.minWeight)) &&
                      (!cat.maxWeight || compWeight <= Number(cat.maxWeight));
      }

      return genderMatch && ageMatch && styleMatch && weightMatch;
    });

    console.log("Categorías que coinciden:", matchingCategories);

    // Asignamos los resultados al objeto
    competitor.categoryIds = matchingCategories.map(cat => cat.id);
    competitor.categoryNames = matchingCategories.map(cat => cat.name);

    // Guardamos el competidor
    const docRef = await this.firebase.add<Competitor>('competitors', competitor);
    
    if (!docRef) {
      throw new Error('No se pudo crear el competidor');
    }

    // Actualizamos las categorías para que incluyan al competidor en su lista
    if (matchingCategories.length > 0) {
      await this.firebase.updateCategoriesWithCompetitor(matchingCategories, docRef.id);
      alert(`Asignado a: ${competitor.categoryNames.join(', ')}`);
    } else {
      alert('No se encontró ninguna categoría compatible.');
    }

    return docRef;
  }

  updateCompetitor(id: string, data: Partial<Competitor>) {
    return this.firebase.update('competitors', id, data);
  }

}
