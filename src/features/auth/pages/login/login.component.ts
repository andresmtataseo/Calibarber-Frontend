import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  constructor() {}

  onSubmit() {
    // TODO: Implementar lógica de inicio de sesión
    console.log('Login form submitted');
  }
}