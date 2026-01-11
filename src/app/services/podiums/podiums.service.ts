// src/app/services/Podium.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseService } from '../firebase.service';
import { Podium } from '../../models/podium.model';

@Injectable({ providedIn: 'root' })
export class PodiumService {
  constructor(private firebase: FirebaseService) {}

  getPodiums(): Observable<Podium[]> {
    return this.firebase.getCollection<Podium>('Podiums');
  }

  addPodium(Podium: Podium) {
    return this.firebase.add<Podium>('Podiums', Podium);
  }
}
