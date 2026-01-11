import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';  // 🔹 IMPORTAR FormsModule
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule], // 🔹 AÑADIR FormsModule aquí
  templateUrl: './login.html'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    try {
      const result = await this.auth.login(this.email, this.password);
      console.log('Login result:', result);  // 🔹 Verifica resultado
      console.log('Current user:', this.auth.getCurrentUser());

      if (this.auth.isAdmin()) {
        this.router.navigate(['/add-panel']);
      } else {
        this.router.navigate(['/competitors']);
      }
    } catch (err: any) {
      console.error('Firebase login error:', err);
      alert('Error al iniciar sesión: ' + err.message);
    }
  }
}

