import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Observable, catchError, of, tap } from "rxjs";
// 🆕 Importamos 'Router' para que esté disponible
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
    //
    // 💡 CAMBIO CLAVE: 'private router' ahora es 'public router'
    //
    public router: Router,
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
      lastName: [{ value: "", disabled: false }, [Validators.maxLength(50)]],
      email: [
        { value: "", disabled: false },
        [Validators.required, Validators.email],
      ],
      phone: [{ value: "", disabled: false }, [Validators.maxLength(20)]],
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
          // Cargamos los campos del backend
          this.profileForm.patchValue({
            username: user.username,
            lastName: user.lastName || "",
            email: user.email,
            phone: user.phone || "",
          });
        }),
        catchError((err) => {
          console.error("Error al cargar el perfil:", err);
          this.loading = false;
          this.toastService.showError(
            "Error al cargar el perfil. Asegúrate de estar autenticado."
          );

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

    // Construir el payload incluyendo todos los campos
    const updatePayload: UpdateProfilePayload = {
      username: formValue.username,
      lastName: formValue.lastName || null,
      email: formValue.email,
      phone: formValue.phone || null,
    };

    if (formValue.newPassword) {
      updatePayload.password = formValue.newPassword;
    }

    this.userService.updateProfile(updatePayload).subscribe({
      next: (res) => {
        // Actualizar el objeto user con los datos devueltos
        this.user = {
          ...this.user,
          ...res.user,
        };

        this.toastService.showSuccess(res.message);
        this.submitting = false;

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
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(["/login"]);
    this.toastService.showSuccess("Has cerrado la sesión.");
  }

  // Método de conveniencia para acceder a los controles del formulario
  get f() {
    return this.profileForm.controls;
  }
}
