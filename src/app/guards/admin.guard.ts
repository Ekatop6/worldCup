import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, filter, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  // canActivate ahora devuelve un Observable de booleano
  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.user$.pipe(
      // 1. Filtramos hasta que el estado de auth sea conocido (no null inicial)
      // Nota: Si el usuario no está logueado, AuthService enviará null, 
      // pero necesitamos distinguir entre "cargando" y "no hay nadie".
      // Por eso en el service pusimos el BehaviorSubject.
      
      filter(user => user !== undefined), // Asegúrate de que el Service no empiece en undefined
      take(1), // Tomamos el primer valor real que llegue
      map(user => {
        if (user && user.isAdmin) {
          return true; // Es admin, adelante
        }

        // No es admin, lo mandamos al login o home
        return this.router.parseUrl('/login');
      })
    );
  }
}