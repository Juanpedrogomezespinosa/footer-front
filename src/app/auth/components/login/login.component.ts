// src/app/auth/components/login/login.component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import {
  AuthService,
  LoginResponse,
} from "../../../core/services/auth.service"; // 1. Importa LoginResponse
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  form: FormGroup;
  passwordFieldType = "password";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType =
      this.passwordFieldType === "password" ? "text" : "password";
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value;

    // El 'login' ya guarda el token y el usuario (gracias al 'tap' en tu servicio)
    // Aquí solo nos preocupamos de la redirección.
    this.authService.login({ email, password }).subscribe({
      // --- ¡CAMBIO AQUÍ! ---
      // 2. Recibimos la respuesta (response) que incluye el usuario
      next: (response: LoginResponse) => {
        this.toast.showSuccess("Inicio de sesión exitoso");

        // 3. Comprobamos el rol y redirigimos
        if (response.user.role === "admin") {
          this.router.navigate(["/admin"]); // <-- Redirigir a admin
        } else {
          this.router.navigate(["/home"]); // <-- Redirigir a home
        }
      },
      // --------------------

      error: (err) => {
        const message = err?.error?.message || "Error en el inicio de sesión";
        this.toast.showError(message);
      },
    });
  }
}
