// src/app/auth/components/login/login.component.ts
import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors, // Importar ValidationErrors
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import {
  AuthService,
  LoginResponse,
} from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";

// --- 👇 NUEVO VALIDADOR DE CONTRASEÑA ---
/**
 * Validador para la robustez de la contraseña.
 * Comprueba:
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos un carácter especial
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null; // No validar si está vacío (para eso está 'required')
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasMinLength = value.length >= 8;

    // Creamos un objeto de errores
    const errors: ValidationErrors = {};

    if (!hasMinLength) {
      errors["minLength"] = true;
    }
    if (!hasUpperCase) {
      errors["requireUppercase"] = true;
    }
    if (!hasSpecialChar) {
      errors["requireSpecialChar"] = true;
    }

    // Devolvemos los errores o null si es válido
    return Object.keys(errors).length > 0 ? errors : null;
  };
}

// Validador de coincidencia de contraseñas (el que ya tenías)
export function passwordMatchValidator(): ValidatorFn {
  return (form: AbstractControl) => {
    const pass = form.get("password")?.value;
    const confirm = form.get("confirmPassword")?.value;
    return pass && confirm && pass !== confirm
      ? { passwordMismatch: true }
      : null;
  };
}
// --- FIN DE VALIDADORES ---

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  authMode = signal<"login" | "register">("login");
  passwordFieldType = "password";
  isLoading = signal(false);

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    // Formulario de Login (sin cambios)
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });

    // Formulario de Registro (actualizado)
    this.registerForm = this.fb.group(
      {
        name: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        // --- 👇 CAMBIO AQUÍ: Aplicar el nuevo validador ---
        password: [
          "",
          [Validators.required, passwordStrengthValidator()], // Reemplaza minLength
        ],
        // --- FIN DEL CAMBIO ---
        confirmPassword: ["", Validators.required],
      },
      { validators: passwordMatchValidator() } // Validador de coincidencia
    );
  }

  // --- MÉTODOS DE LOGIN (Sin cambios) ---
  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;
    this.authService.login({ email, password }).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading.set(false);
        this.toast.showSuccess("Inicio de sesión exitoso");
        if (response.user.role === "admin") {
          this.router.navigate(["/admin"]);
        } else {
          this.router.navigate(["/home"]);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err?.error?.message || "Error en el inicio de sesión";
        this.toast.showError(message);
      },
    });
  }

  // --- MÉTODOS DE REGISTRO (Sin cambios) ---
  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    const { name, email, password } = this.registerForm.value;
    this.authService.register({ username: name, email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.showSuccess("Registro completado. Ahora inicia sesión.");
        this.authMode.set("login");
        this.loginForm.controls["email"].setValue(email);
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err?.error?.message || "Error en el registro";
        this.toast.showError(message);
      },
    });
  }

  // --- MÉTODOS AUXILIARES (Sin cambios) ---
  togglePasswordVisibility(): void {
    this.passwordFieldType =
      this.passwordFieldType === "password" ? "text" : "password";
  }
}
