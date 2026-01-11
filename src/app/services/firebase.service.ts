// src/app/services/firebase.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { collection, onSnapshot, addDoc, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private platformId = inject(PLATFORM_ID);

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
}
