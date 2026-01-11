// src/app/services/competitor.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseService } from '../firebase.service';
import { Competitor } from '../../models/competitor.model';

@Injectable({ providedIn: 'root' })
export class CompetitorService {
  constructor(private firebase: FirebaseService) {}

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

  addCompetitor(competitor: Competitor) {
    return this.firebase.add<Competitor>('competitors', competitor);
  }

}
