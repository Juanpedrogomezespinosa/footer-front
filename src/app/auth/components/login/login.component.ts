// src/app/auth/components/login/login.component.ts
import { Component, signal } from "@angular/core"; // Importar signal
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import {
  AuthService,
  LoginResponse,
} from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  // --- LÓGICA DEL COMPONENTE ACTUALIZADA ---

  // Señal para controlar qué formulario se muestra: 'login' o 'register'
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
    // Formulario de Login
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });

    // Formulario de Registro (lógica traída de register.component.ts)
    this.registerForm = this.fb.group(
      {
        name: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordMatchValidator() }
    );
  }

  // --- MÉTODOS DE LOGIN ---
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

  // --- MÉTODOS DE REGISTRO ---
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
        // Cambiamos al modo login para que el usuario entre
        this.authMode.set("login");
        this.loginForm.controls["email"].setValue(email); // Rellenamos el email
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err?.error?.message || "Error en el registro";
        this.toast.showError(message);
      },
    });
  }

  // --- MÉTODOS AUXILIARES ---
  togglePasswordVisibility(): void {
    this.passwordFieldType =
      this.passwordFieldType === "password" ? "text" : "password";
  }

  // Validador de contraseñas (traído de register.component.ts)
  private passwordMatchValidator(): ValidatorFn {
    return (form: AbstractControl) => {
      const pass = form.get("password")?.value;
      const confirm = form.get("confirmPassword")?.value;
      return pass && confirm && pass !== confirm
        ? { passwordMismatch: true }
        : null;
    };
  }
}
