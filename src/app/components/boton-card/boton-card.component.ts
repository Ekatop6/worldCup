import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-boton-card',
  templateUrl: './boton-card.component.html',
  styleUrls: ['./boton-card.component.css']
})
export class BotonCardComponent {

  @Input() titulo!: string;
  @Input() ruta!: string;

  constructor(private router: Router) {}

  ir() {
    this.router.navigate([this.ruta]);
  }
}
