import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom, filter } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    try {
      // 1. Iniciar sesión en Firebase Auth
      await this.auth.login(this.email, this.password);
      
      /** * 2. ESPERAR A QUE EL SERVICIO CARGUE LOS DATOS DEL USUARIO
       * Como el AuthService ahora usa un Observable (user$), esperamos 
       * a que emita un valor que no sea nulo.
       */
      const user = await firstValueFrom(
        this.auth.user$.pipe(
          filter(u => u !== null) // Solo continuamos cuando el usuario esté cargado
        )
      );

      console.log('Usuario autenticado con datos de Firestore:', user);

      // 3. Navegación basada en el rol
      if (user.isAdmin) {
        this.router.navigate(['/add-panel']);
      } else {
        this.router.navigate(['/competitors']);
      }

    } catch (err: any) {
      console.error('Error en el login:', err);
      alert('Error al iniciar sesión: ' + err.message);
    }
  }
}