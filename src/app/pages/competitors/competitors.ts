import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompetitorService } from '../../services/competitors/competitors.service';
import { Competitor } from '../../models/competitor.model';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-competitors',
  standalone: true,
  imports: [CommonModule, AsyncPipe], // ✅ importante para *ngFor y async
  templateUrl: './competitors.html',
  styleUrls: ['./competitors.css']
})
export class CompetitorsComponent {
  competitors$: Observable<Competitor[]>;

  constructor(private competitorService: CompetitorService) {
    this.competitors$ = this.competitorService.getCompetitors();
  }
}
