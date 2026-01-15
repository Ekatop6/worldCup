// src/app/services/competitor.service.ts
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseService } from '../firebase.service';
import { Competitor } from '../../models/competitor.model';
import { Category } from '../../models/category.model';
import Swal from 'sweetalert2';
@Injectable({ providedIn: 'root' })
export class CompetitorService {
  constructor(private firebase: FirebaseService, private categoryService: FirebaseService,
  ) { }

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


  async addCompetitor(competitor: Competitor): Promise<string | void> {
    const dorsalId = competitor.dorsal.toString();

    // 1. Buscamos por Dorsal (ID directo) y por Nombre/Apellido
    const existingByDorsal = await this.firebase.getCompetitorById(dorsalId);
    const existingByName = await this.firebase.findCompetitorByName(competitor.firstName, competitor.lastName);

    // El "conflicto" es cualquiera de los dos que encontremos (priorizando el dorsal)
    const existingComp = existingByDorsal || existingByName;

    if (existingComp) {
      const motivo = existingByDorsal
        ? `DORSAL ${dorsalId} YA OCUPADO`
        : `NOMBRE REPETIDO`;

      const result = await Swal.fire({
        title: '¿Es la misma persona?',
        html: `
        <div style="text-align: left; font-size: 0.85em;">
          <p style="color: #d9534f; font-weight: bold;">Conflicto: ${motivo}</p>
          <table border="1" style="width: 100%; border-collapse: collapse; text-align: center;">
            <tr style="background: #f2f2f2;"><th>Campo</th><th>En Sistema</th><th>Nuevo</th></tr>
            <tr><td>Dorsal</td><td><b>${existingComp.dorsal}</b></td><td><b>${competitor.dorsal}</b></td></tr>
            <tr><td>Nombre</td><td>${existingComp.firstName} ${existingComp.lastName}</td><td>${competitor.firstName} ${competitor.lastName}</td></tr>
            <tr><td>Club</td><td>${existingComp.club || 'N/A'}</td><td>${competitor.club || 'N/A'}</td></tr>
            <tr><td>Edad/Peso</td><td>${existingComp.age} / ${existingComp.weight}kg</td><td>${competitor.age} / ${competitor.weight}kg</td></tr>
          </table>
        </div>
      `,
        icon: 'warning',
        width: '600px',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Crear como nuevo',
        denyButtonText: 'Reemplazar (Update)',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        // Si elige crear como nuevo pero el dorsal está repetido, hay que obligarle a cambiarlo
        if (existingByDorsal) {
          const { value: newDorsal } = await Swal.fire({
            title: 'Dorsal en uso',
            input: 'number',
            inputLabel: 'Asigna un nuevo dorsal para este competidor',
            showCancelButton: true
          });
          if (!newDorsal) return;
          competitor.dorsal = Number(newDorsal);
          return this.addCompetitor(competitor); // Reintento con el nuevo dorsal
        }
        // Si el dorsal era libre pero el nombre se repetía, sigue abajo normalmente
      } else if (result.isDenied) {

        const updateResult = await this.updateCompetitorId(existingComp.dorsal.toString(), competitor);

        return updateResult || existingComp.dorsal.toString();
      } else {
        return;
      }
    }
    const compAge = Number(competitor.age);
    const compWeight = Number(competitor.weight);
    const compGender = competitor.gender;
    const compStyle = competitor.compite;

    const allCategories = await firstValueFrom(this.categoryService.getCollection<Category>('categories'));

    const matchingCategories = allCategories.filter(cat => {
      const genderMatch = cat.gender === 'Mixed' || cat.gender === compGender;
      const ageMatch = compAge >= Number(cat.minAge) && (!cat.maxAge || compAge <= Number(cat.maxAge));
      let styleMatch = compStyle === 'Both' ? true : cat.estilo === compStyle;
      let weightMatch = true;
      if (cat.estilo === 'Kumite' && (cat.minWeight || cat.maxWeight)) {
        weightMatch = (!cat.minWeight || compWeight >= Number(cat.minWeight)) &&
          (!cat.maxWeight || compWeight <= Number(cat.maxWeight));
      }
      return genderMatch && ageMatch && styleMatch && weightMatch;
    });

    competitor.categoryIds = matchingCategories.map(cat => cat.id);
    competitor.categoryNames = matchingCategories.map(cat => cat.name);

    const finalDorsalId = competitor.dorsal.toString();
    await this.firebase.setWithId('competitors', finalDorsalId, competitor);
  
    if (matchingCategories.length > 0) {
      try {
        await this.firebase.updateCategoriesWithCompetitor(matchingCategories, finalDorsalId);
        Swal.fire('Registrado', `Asignado a: ${competitor.categoryNames.join(', ')}`, 'success');
      } catch (catError) {
        console.error("Error vinculando categorías:", catError);
        Swal.fire('Atención', 'Competidor guardado, pero hubo un problema al asignarlo a las categorías automáticamente.', 'warning');
      }
    } else {
      Swal.fire('Registrado', 'Sin categorías compatibles.', 'info');
    }

    return finalDorsalId;

  }

  updateCompetitor(id: string, data: Partial<Competitor>) {
    return this.firebase.update('competitors', id, data);
  }

  async updateCompetitorId(oldDorsal: string, newCompetitorData: Competitor): Promise<string | void> {
    const newDorsalId = newCompetitorData.dorsal.toString();

    try {
      // 1. Crear el nuevo documento con el nuevo ID
      await this.firebase.setWithId('competitors', newDorsalId, newCompetitorData);

      // 2. Si el ID ha cambiado realmente, borrar el anterior
      if (oldDorsal !== newDorsalId) {
        await this.firebase.deleteDocument('competitors', oldDorsal);

        if (newCompetitorData.categoryIds && newCompetitorData.categoryIds.length > 0) {
          await this.firebase.replaceCompetitorIdInCategories(
            newCompetitorData.categoryIds,
            oldDorsal,
            newDorsalId
          );
        }

      }

      Swal.fire('Éxito', 'Dorsal y datos actualizados correctamente', 'success');
      return newDorsalId;
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo actualizar el ID del competidor', 'error');
    }
  }

  async deleteCompetitorByDorsal(dorsal: number): Promise<boolean> {
  const id = dorsal.toString();
  
  // 1. Verificar si existe antes de intentar borrar
  const existing = await this.firebase.getCompetitorById(id);
  if (!existing) {
    await Swal.fire('Error', 'No existe ningún competidor con ese dorsal', 'error');
    return false;
  }

  // 2. Confirmación de seguridad
  const result = await Swal.fire({
    title: `¿Borrar a ${existing.firstName} ${existing.lastName}?`,
    text: "Esta acción no se puede deshacer y el competidor será eliminado de todas las categorías.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, borrar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      // 3. Borrar el documento principal
      await this.firebase.deleteDocument('competitors', id);
      
      // 4. Limpiar el ID de este competidor en todas las categorías donde aparezca
      if (existing.categoryIds && existing.categoryIds.length > 0) {
        // Necesitamos un método que limpie el ID viejo (pasamos null como nuevo ID para solo borrar)
        await this.firebase.replaceCompetitorIdInCategories(existing.categoryIds, id, ''); 
      }

      await Swal.fire('Eliminado', 'El competidor ha sido borrado.', 'success');
      return true;
    } catch (error) {
      console.error(error);
      await Swal.fire('Error', 'Hubo un problema al borrar el documento.', 'error');
      return false;
    }
  }
  return false;
}

}
