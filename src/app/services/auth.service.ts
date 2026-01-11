import { Injectable } from '@angular/core';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = getAuth();
  private currentUser: any = null;

  constructor() {
    onAuthStateChanged(this.auth, async (user: User | null) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data() as { isAdmin?: boolean };
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          isAdmin: userData?.isAdmin ?? false
        };
      } else {
        this.currentUser = null;
      }
    });
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return this.auth.signOut();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAdmin() {
    return this.currentUser?.isAdmin ?? false;
  }
}
