// src/app/services/Coach.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseService } from '../firebase.service';
import { Coach } from '../../models/coach.model';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class CoachService {
  constructor(private firebase: FirebaseService) { }

  getCoaches(): Observable<Coach[]> {
    return this.firebase.getCollection<Coach>('Coaches');
  }

  addCoach(Coach: Coach) {
    return this.firebase.add<Coach>('Coaches', Coach);
  }

  // En coach.service.ts
  async deleteCoachByName(name: string): Promise<boolean> {
    try {
      // Forzamos el tipo a 'any' o a tu interfaz 'Coach'
      const existing = await this.firebase.getCoachByName(name) as any;

      if (!existing) {
        await Swal.fire('Error', 'No existe ningún entrenador con ese nombre', 'error');
        return false;
      }

      // Ahora ya no marcará error en existing.name
      const result = await Swal.fire({
        title: `¿Borrar a ${existing.name}?`,
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, borrar',
      });

      if (result.isConfirmed) {
        await this.firebase.deleteDocument('coaches', existing.id);
        await Swal.fire('Eliminado', 'Entrenador borrado.', 'success');
        return true;
      }

      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
