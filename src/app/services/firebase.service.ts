// src/app/services/firebase.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { collection, onSnapshot, addDoc, DocumentData, QuerySnapshot, doc, updateDoc, Firestore,getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { db } from '../firebase/firebase';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

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
      const colRef = collection(db, name);

      const unsubscribe = onSnapshot(colRef, (snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
        observer.next(data);
      });

      return () => unsubscribe();
    });
  }

  add<T>(name: string, data: T) {
    if (!isPlatformBrowser(this.platformId)) return Promise.resolve(null);
    const colRef = collection(db, name);
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
}
