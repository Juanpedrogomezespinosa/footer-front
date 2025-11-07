import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { catchError, of, tap } from "rxjs";
import {
  UpdateProfilePayload,
  UserProfile,
  UserService,
} from "app/core/services/user.service";
import { ToastService } from "app/core/services/toast.service";

// --- 1. IMPORTAR EL NUEVO MODAL ---
import { ChangePasswordModalComponent } from "../change-password-modal/change-password-modal.component";

@Component({
  selector: "app-profile-details",
  standalone: true,
  // --- 2. AÑADIR EL MODAL A LOS IMPORTS ---
  // (Esto es correcto y es lo que causa el warning del linter)
  imports: [CommonModule, ReactiveFormsModule, ChangePasswordModalComponent],
  templateUrl: "./profile-details.component.html",
})
export class ProfileDetailsComponent implements OnInit {
  public profileForm!: FormGroup;
  public user: UserProfile | null = null;
  public submitting: boolean = false;
  public loading: boolean = true;

  // --- 3. AÑADIR ESTADO PARA EL MODAL ---
  public showPasswordModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Inicializa el formulario solo con los campos de este componente
    this.profileForm = this.fb.group({
      username: ["", [Validators.required, Validators.maxLength(50)]],
      lastName: ["", [Validators.maxLength(50)]],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.maxLength(20)]],
    });

    this.loadProfileDetails();
  }

  /**
   * Carga los datos del perfil y los aplica al formulario
   */
  private loadProfileDetails(): void {
    this.loading = true;
    this.userService
      .getProfile()
      .pipe(
        tap((user: UserProfile) => {
          this.user = user;
          // Aplicamos los valores al formulario
          this.profileForm.patchValue({
            username: user.username,
            lastName: user.lastName || "",
            email: user.email,
            phone: user.phone || "",
          });
          this.loading = false;
        }),
        catchError((err) => {
          this.loading = false;
          this.toastService.showError("Error al cargar los datos del perfil.");
          console.error("Error loading profile details:", err);
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Envía los datos actualizados del formulario
   * (Esta lógica ya estaba correcta, sin 'password')
   */
  public onSubmit(): void {
    if (this.profileForm.invalid || this.submitting) {
      this.profileForm.markAllAsTouched();
      this.toastService.showError("Por favor, revisa los campos con errores.");
      return;
    }

    this.submitting = true;
    const formValue = this.profileForm.value;

    // El payload solo incluye los campos de este formulario
    const updatePayload: UpdateProfilePayload = {
      username: formValue.username,
      lastName: formValue.lastName || null,
      email: formValue.email,
      phone: formValue.phone || null,
    };

    this.userService.updateProfile(updatePayload).subscribe({
      next: (res) => {
        // Actualizamos el estado local del usuario
        this.user = { ...this.user, ...res.user };
        this.toastService.showSuccess(res.message);
        this.submitting = false;
      },
      error: (err) => {
        this.submitting = false;
        const errorMessage =
          err.error?.message || "Error desconocido al actualizar.";
        this.toastService.showError(errorMessage);
        console.error("Error updating profile:", err);
      },
    });
  }

  // Getter para facilitar el acceso a los controles en el HTML
  get f() {
    return this.profileForm.controls;
  }

  // --- 4. NUEVOS MÉTODOS PARA MANEJAR EL MODAL ---

  /**
   * Abre el modal de cambio de contraseña
   */
  public openPasswordModal(): void {
    this.showPasswordModal = true;
  }

  /**
   * Cierra el modal (llamado por el evento 'close' del componente hijo)
   */
  public onModalClose(): void {
    this.showPasswordModal = false;
  }
}
