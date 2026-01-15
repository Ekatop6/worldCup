// src/app/services/firebase.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { arrayUnion, collection, onSnapshot, addDoc, DocumentData, QuerySnapshot, doc, updateDoc, Firestore, getFirestore, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { deleteDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private platformId = inject(PLATFORM_ID);
  private db: Firestore;

  constructor() {
    // Inicializamos la app y obtenemos la instancia de Firestore
    const app = initializeApp(environment.firebase);
    this.db = getFirestore(app);
  }
  getCollection<T>(name: string): Observable<T[]> {
    if (!isPlatformBrowser(this.platformId)) return new Observable<T[]>(obs => obs.next([]));

    return new Observable<T[]>(observer => {
      // CAMBIO CLAVE: Usar this.db en lugar de db
      const colRef = collection(this.db, name); 

      const unsubscribe = onSnapshot(colRef, (snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
        console.log(`Datos recibidos de ${name}:`, data); // Debug para ver si llegan
        observer.next(data);
      });

      return () => unsubscribe();
    });
  }

  // Asegúrate de cambiar 'db' por 'this.db' también en el método add
  add<T>(name: string, data: T) {
    if (!isPlatformBrowser(this.platformId)) return Promise.resolve(null);
    const colRef = collection(this.db, name); // CAMBIADO A this.db
    return addDoc(colRef, data as any);
  }


  async update(collectionName: string, id: string, data: any): Promise<void> {
    try {
      const documentRef = doc(this.db, collectionName, id);
      return await updateDoc(documentRef, data);
    } catch (error) {
      console.error("Error actualizando documento: ", error);
      throw error;
    }
  }

  async setWithId(collectionName: string, id: string, data: any): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return Promise.resolve();
    try {
      const documentRef = doc(this.db, collectionName, id);
      return await setDoc(documentRef, data);
    } catch (error) {
      console.error("Error al guardar con ID personalizado: ", error);
      throw error;
    }
  }

  // Método auxiliar para comprobar si algo ya existe (útil para el nombre único)
  async exists(collectionName: string, id: string): Promise<boolean> {
    const documentRef = doc(this.db, collectionName, id);
    const docSnap = await getDoc(documentRef);
    return docSnap.exists();
  }

  async getCompetitorById(id: string): Promise<any | null> {
    const docRef = doc(this.db, 'competitors', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  async findCompetitorByName(firstName: string, lastName: string): Promise<any | null> {
    if (!isPlatformBrowser(this.platformId)) return null;

    const colRef = collection(this.db, 'competitors');
    // Buscamos documentos donde coincidan ambos campos
    const q = query(colRef, where("firstName", "==", firstName), where("lastName", "==", lastName));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  }

  async getCategoryById(id: string): Promise<any | null> {
    const docRef = doc(this.db, 'categories', id); // O 'Categories' según tu Firestore
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  async findDuplicateCategorySpecs(newCat: Category): Promise<any | null> {
    const allCategories = await firstValueFrom(this.getCollection<Category>('categories'));

    return allCategories.find(c => {
      // 1. Campos obligatorios: Género y Estilo
      const basicMatch = c.gender === newCat.gender && c.estilo === newCat.estilo;

      // 2. Comparación de números (Edad y Peso)
      // Usamos una función auxiliar para tratar 'undefined' como el mismo valor
      const compare = (val1: any, val2: any) => {
        const n1 = val1 !== undefined && val1 !== null ? Number(val1) : null;
        const n2 = val2 !== undefined && val2 !== null ? Number(val2) : null;
        return n1 === n2;
      };

      return basicMatch &&
        compare(c.minAge, newCat.minAge) &&
        compare(c.maxAge, newCat.maxAge) &&
        compare(c.minWeight, newCat.minWeight) &&
        compare(c.maxWeight, newCat.maxWeight);
    }) || null;
  }

  // 1. Borrar documento


  async deleteDocument(collectionName: string, id: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      // Usamos el ID exacto (el dorsal en string)
      const docRef = doc(this.db, collectionName, id.toString());
      await deleteDoc(docRef);
      console.log(`Documento ${id} eliminado de ${collectionName}`);
    } catch (error) {
      console.error("Error al eliminar documento:", error);
      throw error;
    }
  }

  async replaceCompetitorIdInCategories(categoryIds: string[], oldId: string, newId: string) {
    const promises = categoryIds.map(async (catId) => {
      // IMPORTANTE: Verifica si tu colección es 'categories' o 'Categories'
      const catRef = doc(this.db, 'categories', catId);
      const catSnap = await getDoc(catRef);

      if (catSnap.exists()) {
        const data = catSnap.data();
        let ids: string[] = data['competitorIds'] || [];

        // Filtramos el viejo y añadimos el nuevo
        const updatedIds = ids.filter(id => id !== oldId);
        if (!updatedIds.includes(newId)) {
          updatedIds.push(newId);
        }

        return updateDoc(catRef, { competitorIds: updatedIds });
      }
    });
    return Promise.all(promises);
  }

  async updateCategoriesWithCompetitor(categories: Category[], competitorId: string) {
    // Usamos this.db para mantener la instancia correcta
    const updatePromises = categories.map(cat => {
      // IMPORTANTE: Cambiado a 'categories' (minúscula) para coincidir con tu DB
      const categoryRef = doc(this.db, 'categories', cat.id);
      return updateDoc(categoryRef, {
        competitorIds: arrayUnion(competitorId)
      });
    });

    return Promise.all(updatePromises);
  }

  async getCoachByName(name: string) {
    const colRef = collection(this.db, 'coaches');
    const q = query(colRef, where("name", "==", name));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

}