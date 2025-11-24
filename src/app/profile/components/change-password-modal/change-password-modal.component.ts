import { Component, Output, EventEmitter, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  UserService,
  UpdatePasswordPayload,
} from "app/core/services/user.service";
import { ToastService } from "app/core/services/toast.service";
import { HttpErrorResponse } from "@angular/common/http";
import { passwordMatchValidator } from "./custom-validators";

@Component({
  selector: "app-change-password-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./change-password-modal.component.html",
})
export class ChangePasswordModalComponent implements OnInit {
  // 'close' es un evento que le dice al componente padre (profile-details) que debe cerrarse.
  @Output() close = new EventEmitter<void>();

  public passwordForm!: FormGroup;
  public submitting: boolean = false;

  // Estado para los botones de mostrar/ocultar contraseña
  public showCurrentPass: boolean = false;
  public showNewPass: boolean = false;
  public showConfirmPass: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ["", [Validators.required]],
        newPassword: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      {
        // Aplicamos el validador personalizado a nivel de grupo
        validators: passwordMatchValidator,
      }
    );
  }

  // Getter para acceso fácil en el HTML (ej: f['currentPassword'])
  get f() {
    return this.passwordForm.controls;
  }

  /**
   * Cierra el modal (llamado por el botón X, Cancelar, o el overlay)
   */
  public onClose(): void {
    if (this.submitting) return; // Evitar cerrar mientras se envía
    this.close.emit();
  }

  /**
   * Envía el formulario de cambio de contraseña
   */
  public onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.toastService.showError("Revisa los campos del formulario.");
      return;
    }

    this.submitting = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    const payload: UpdatePasswordPayload = {
      currentPassword,
      newPassword,
    };

    this.userService.updatePassword(payload).subscribe({
      next: (res) => {
        this.toastService.showSuccess(res.message);
        this.submitting = false;
        this.onClose(); // Cerrar el modal al éxito
      },
      error: (err: HttpErrorResponse) => {
        // El backend nos da un error específico (ej: "Contraseña actual incorrecta")
        const errorMessage =
          err.error?.message || "Error al actualizar la contraseña.";
        this.toastService.showError(errorMessage);
        this.submitting = false;
      },
    });
  }
}
