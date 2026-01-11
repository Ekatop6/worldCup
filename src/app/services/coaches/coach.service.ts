// src/app/services/Coach.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseService } from '../firebase.service';
import { Coach } from '../../models/coach.model';

@Injectable({ providedIn: 'root' })
export class CoachService {
  constructor(private firebase: FirebaseService) {}

  getCoaches(): Observable<Coach[]> {
    return this.firebase.getCollection<Coach>('Coaches');
  }

  addCoach(Coach: Coach) {
    return this.firebase.add<Coach>('Coaches', Coach);
  }
}
