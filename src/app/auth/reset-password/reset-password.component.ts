import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { AuthService } from "app/core/services/auth.service";
import { ToastService } from "app/core/services/toast.service";
import { HttpErrorResponse } from "@angular/common/http";

// Validador de robustez
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const hasUpperCase = /[A-Z]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasMinLength = value.length >= 8;
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
    return Object.keys(errors).length > 0 ? errors : null;
  };
}

// Validador de Coincidencia
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
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    if (confirmPassword?.hasError("passwordMismatch")) {
      confirmPassword.setErrors(null);
    }
    return null;
  }
}

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

  passwordFieldType = "password"; // Para controlar la visibilidad

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        newPassword: ["", [Validators.required, passwordStrengthValidator()]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: passwordMatchValidator }
    );
  }

  ngOnInit(): void {
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
          if (err.status === 400 || err.status === 401) {
            this.tokenError.set(errorMsg);
            this.resetPasswordForm.disable();
          }
        },
      });
  }

  /**
   * Cambia la visibilidad del campo de contraseña (texto/password)
   */
  togglePasswordVisibility(): void {
    this.passwordFieldType =
      this.passwordFieldType === "password" ? "text" : "password";
  }
}
