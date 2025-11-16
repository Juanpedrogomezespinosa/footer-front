// src/app/auth/reset-password/reset-password.component.ts
import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { AuthService } from "app/core/services/auth.service";
import { ToastService } from "app/core/services/toast.service";
import { HttpErrorResponse } from "@angular/common/http";

// --- Validador Personalizado ---
export function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const newPassword = control.get("newPassword");
  const confirmPassword = control.get("confirmPassword");

  if (
    newPassword &&
    confirmPassword &&
    newPassword.value !== confirmPassword.value
  ) {
    // Devuelve el error en el control 'confirmPassword'
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    // Si coinciden, quita el error
    if (confirmPassword?.hasError("passwordMismatch")) {
      confirmPassword.setErrors(null);
    }
    return null;
  }
}
// --- Fin del Validador ---

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./reset-password.component.html",
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = signal(false);
  successMessage = signal<string | null>(null);
  token: string | null = null;
  tokenError = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        newPassword: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: passwordMatchValidator } // Aplicar el validador al grupo
    );
  }

  ngOnInit(): void {
    // Capturar el token de la URL
    this.token = this.route.snapshot.paramMap.get("token");

    if (!this.token) {
      this.tokenError.set(
        "Token no encontrado. Por favor, solicita un nuevo enlace."
      );
      this.resetPasswordForm.disable();
    }
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.token) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { newPassword } = this.resetPasswordForm.value;

    this.authService
      .resetPassword({ token: this.token, newPassword })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set(response.message);
          this.resetPasswordForm.disable();
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            this.router.navigate(["/login"]);
          }, 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          const errorMsg =
            err.error?.message ||
            "Error al procesar la solicitud. Inténtalo de nuevo.";
          this.toastService.showError(errorMsg);
          // Si el token es inválido, mostramos el error y deshabilitamos el form
          if (err.status === 400 || err.status === 401) {
            this.tokenError.set(errorMsg);
            this.resetPasswordForm.disable();
          }
        },
      });
  }
}
