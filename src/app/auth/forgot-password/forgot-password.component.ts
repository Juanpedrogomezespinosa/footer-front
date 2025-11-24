import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from "app/core/services/auth.service";
import { ToastService } from "app/core/services/toast.service";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./forgot-password.component.html",
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = signal(false);
  // Mensaje de éxito que mostramos (la respuesta genérica del backend)
  successMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set(null); // Limpiar mensajes anteriores

    this.authService
      .forgotPassword(this.forgotPasswordForm.value.email)
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          // Mostramos el mensaje genérico que nos da el backend
          this.successMessage.set(response.message);
          this.forgotPasswordForm.reset();
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          const errorMsg =
            err.error?.message ||
            "Error al procesar la solicitud. Inténtalo de nuevo.";
          this.toastService.showError(errorMsg);
        },
      });
  }
}
