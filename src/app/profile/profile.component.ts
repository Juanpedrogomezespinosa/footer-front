import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Observable, catchError, of, tap } from "rxjs";
import { Router, RouterModule } from "@angular/router";
import {
  UpdateProfilePayload,
  UserProfile,
  UserService,
} from "app/core/services/user.service";
import { AuthService } from "app/core/services/auth.service";
import { ToastService } from "app/core/services/toast.service";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./profile.component.html",
  styleUrls: [],
})
export class ProfileComponent implements OnInit {
  // Estado
  public user: UserProfile | null = null;
  public profileForm!: FormGroup;
  public submitting: boolean = false;
  public loading: boolean = true;
  public errorMessage: string | null = null;

  // Constructor con inyecciones de dependencia
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    public toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Inicialización del formulario
    this.profileForm = this.fb.group({
      username: [
        { value: "", disabled: false },
        [Validators.required, Validators.maxLength(50)],
      ],
      email: [
        { value: "", disabled: false },
        [Validators.required, Validators.email],
      ],
      phone: [
        { value: "No disponible", disabled: true }, // Campo solo para visualización
      ],
      currentPassword: ["", [Validators.minLength(6)]],
      newPassword: ["", [Validators.minLength(6)]],
    });

    this.loadProfile();
  }

  // Obtiene los datos del perfil del usuario
  private loadProfile(): void {
    this.loading = true;
    this.userService
      .getProfile()
      .pipe(
        tap((user: UserProfile) => {
          this.user = user;
          this.profileForm.patchValue({
            username: user.username,
            email: user.email,
            // Asumimos que el backend devuelve 'phone' o lo dejamos con el valor por defecto
            phone: user.phone || "No disponible",
          });
        }),
        catchError((err) => {
          console.error("Error al cargar el perfil:", err);
          this.loading = false;
          this.toastService.showError(
            "Error al cargar el perfil. Asegúrate de estar autenticado."
          );

          // Si es 401/403 (Token inválido o expirado), redirigir al login
          if (err.status === 401 || err.status === 403) {
            this.router.navigate(["/login"]);
          }

          return of(null);
        })
      )
      .subscribe(() => {
        this.loading = false;
      });
  }

  // Lógica para enviar el formulario de actualización
  public onSubmit(): void {
    if (this.profileForm.invalid || this.submitting) {
      this.profileForm.markAllAsTouched();
      this.toastService.showError("Por favor, revisa los campos con errores.");
      return;
    }

    this.submitting = true;
    const formValue = this.profileForm.value;

    // Construir el payload solo con los campos que maneja el backend (username y email)
    const updatePayload: UpdateProfilePayload = {
      username: formValue.username,
      email: formValue.email,
    };

    // Solo incluimos la contraseña si se ha rellenado el campo 'newPassword'
    // Nota: El campo 'currentPassword' es solo para UX, el backend no lo pide en el controller actual.
    if (formValue.newPassword) {
      updatePayload.password = formValue.newPassword;
    }

    this.userService.updateProfile(updatePayload).subscribe({
      next: (res) => {
        // Actualizar la vista local con los datos devueltos
        this.user = { ...this.user, ...res.user, phone: this.user?.phone };
        this.submitting = false;
        this.toastService.showSuccess(res.message);
        // Resetear solo los campos de contraseña
        this.profileForm.get("currentPassword")?.setValue("");
        this.profileForm.get("newPassword")?.setValue("");
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

  // Getter para crear el estilo de background del avatar de forma segura
  public get avatarStyle(): { [key: string]: string } {
    const defaultUrl = "https://placehold.co/150x150/f0f0f0/6C757D?text=User";
    const userId = this.user?.id || 0;
    const avatarUrl = userId
      ? `https://i.pravatar.cc/150?u=${userId}`
      : defaultUrl;

    return {
      "background-image": `url('${avatarUrl}')`,
    };
  }

  // Maneja el cierre de sesión del usuario
  public onLogout(event: Event): void {
    event.preventDefault(); // Evita la navegación por defecto del <a>
    this.authService.logout(); // Llama al método real de tu servicio de autenticación
    this.router.navigate(["/login"]); // Redirige al inicio o a la página de login
    this.toastService.showSuccess("Has cerrado la sesión.");
  }

  // Método para el botón 'Cambiar Contraseña' (funcionalidad no implementada)
  public onPasswordChangeClick(): void {
    this.toastService.showError(
      "Funcionalidad pendiente: Abrir modal de cambio de contraseña."
    );
  }

  // Método de conveniencia para acceder a los controles del formulario
  get f() {
    return this.profileForm.controls;
  }
}
