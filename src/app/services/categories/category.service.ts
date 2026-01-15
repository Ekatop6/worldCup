// src/app/services/Category.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseService } from '../firebase.service';
import { Category } from '../../models/category.model';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private firebase: FirebaseService) { }

  getCategories(): Observable<Category[]> {
    return this.firebase.getCollection<Category>('categories');
  }

  async addCategory(category: Category): Promise<string | void> {
    const categoryData = { ...category };
    const categoryId = categoryData.name.trim().toLowerCase().replace(/\s+/g, '-');

    try {
      const existingByName = await this.firebase.getCategoryById(categoryId);
      const existingBySpecs = await this.firebase.findDuplicateCategorySpecs(categoryData);
      const conflict = existingByName || existingBySpecs;

      if (conflict) {
        const reason = existingByName ? 'NOMBRE REPETIDO' : 'CARACTERÍSTICAS IDÉNTICAS';

        const result = await Swal.fire({
          title: 'Conflicto de Categoría',
          html: `
          <div style="text-align: left; font-size: 0.9em;">
            <p style="color: #d9534f; font-weight: bold;">Motivo: ${reason}</p>
            <table border="1" style="width: 100%; border-collapse: collapse; text-align: center;">
              <tr><th>Campo</th><th>Existente</th><th>Nueva</th></tr>
              <tr><td>Nombre</td><td>${conflict.name}</td><td>${categoryData.name}</td></tr>
              <tr><td>Género</td><td>${conflict.gender}</td><td>${categoryData.gender}</td></tr>
              <tr><td>Estilo</td><td>${conflict.estilo}</td><td>${categoryData.estilo}</td></tr>
              <tr><td>Edad</td><td>${conflict.minAge}-${conflict.maxAge || '∞'}</td><td>${categoryData.minAge}-${categoryData.maxAge || '∞'}</td></tr>
              <tr><td>Peso</td><td>${conflict.minWeight || 0}-${conflict.maxWeight || '∞'}</td><td>${categoryData.minWeight || 0}-${categoryData.maxWeight || '∞'}</td></tr>
            </table>
          </div>
        `,
          icon: 'warning',
          width: '600px',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Crear con otro nombre',
          denyButtonText: 'Reemplazar existente',
          cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
          const { value: newName } = await Swal.fire({
            title: 'Nuevo nombre',
            input: 'text',
            inputLabel: 'Escribe un nombre diferente para la categoría',
            showCancelButton: true,
            inputValidator: (value) => !value && '¡Debes escribir un nombre!'
          });

          if (newName) {
            category.name = newName;
            // CLAVE: El return debe esperar al reintento (recursividad)
            return await this.addCategory(category);
          }
          return; // Usuario canceló el input de texto

        } else if (result.isDenied) {
          const targetId = existingByName ? categoryId : existingBySpecs!.id;
          categoryData.competitorIds = (existingByName || existingBySpecs).competitorIds || [];

          await this.firebase.setWithId('categories', targetId, categoryData);
          Swal.fire('Actualizado', 'Categoría sobrescrita correctamente.', 'success');
          return targetId; // Retornamos el ID para limpiar el form

        } else {
          return; // Cancelar
        }
      }

      // Guardado normal
      categoryData.id = categoryId;
      await this.firebase.setWithId('categories', categoryId, categoryData);
      Swal.fire('Guardado', 'Categoría creada con éxito', 'success');

      return categoryId; // Retornamos el ID para limpiar el form

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo procesar la solicitud', 'error');
      return; // Retorna void en caso de error
    }
  }
}
