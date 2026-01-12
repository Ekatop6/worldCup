import { Injectable } from '@angular/core';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = getAuth();
  
  // Usamos un BehaviorSubject para que cualquier componente pueda suscribirse a los cambios de usuario
  // En auth.service.ts
  private userSubject = new BehaviorSubject<any>(undefined); // undefined = cargando
  user$ = this.userSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, async (user: User | null) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data() as { isAdmin?: boolean };
        
        const fullUser = {
          uid: user.uid,
          email: user.email,
          isAdmin: userData?.isAdmin ?? false
        };
        
        this.userSubject.next(fullUser);
      } else {
        this.userSubject.next(null);
      }
    });
  }

  // Helper para saber si es admin de forma reactiva
  get isAdmin$(): Observable<boolean> {
    return this.user$.pipe(map(user => user?.isAdmin ?? false));
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return this.auth.signOut();
  }
}