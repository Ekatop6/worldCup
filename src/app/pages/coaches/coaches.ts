
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { CoachService } from '../../services/coaches/coach.service';
import { Coach } from '../../models/coach.model';


@Component({
  selector: 'app-coaches',
  standalone: true,
  imports: [CommonModule, AsyncPipe], 
  templateUrl: './coaches.html',
  styleUrls: ['./coaches.css']
})
export class CoachesComponent {
  coaches$: Observable<Coach[]>;

  constructor(private coachService: CoachService) {
    this.coaches$ = this.coachService.getCoaches();
  }
}
