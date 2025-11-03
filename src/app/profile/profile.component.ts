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

  // Estado para la subida de avatar
  public uploadingAvatar: boolean = false;
  public selectedAvatarPreview: string | ArrayBuffer | null = null;
  private selectedFile: File | null = null;
  private readonly API_URL = "http://localhost:3000"; // URL base de tu backend

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
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

  // Lógica para enviar el formulario de actualización de TEXTO
  public onSubmit(): void {
    if (this.profileForm.invalid || this.submitting) {
      this.profileForm.markAllAsTouched();
      this.toastService.showError("Por favor, revisa los campos con errores.");
      return;
    }

    this.submitting = true;
    const formValue = this.profileForm.value;

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

        // 🆕 Notificamos al AuthService que el usuario ha cambiado
        // (esto actualizará la navbar si el avatarUrl cambió, aunque esta ruta no lo haga)
        if (res.user.avatarUrl) {
          this.authService.updateUserAvatar(res.user.avatarUrl);
        }

        this.toastService.showSuccess(res.message);
        this.submitting = false;

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

  // Getter para el avatar (con lógica de previsualización)
  public get avatarStyle(): { [key: string]: string } {
    if (this.selectedAvatarPreview) {
      return { "background-image": `url('${this.selectedAvatarPreview}')` };
    }

    if (this.user?.avatarUrl) {
      return {
        "background-image": `url('${this.API_URL}${this.user.avatarUrl}')`,
      };
    }

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

  get f() {
    return this.profileForm.controls;
  }

  // -------------------------------------------
  // LÓGICA DE SUBIDA DE AVATAR
  // -------------------------------------------

  onFileSelect(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList[0]) {
      const file = fileList[0];

      if (!file.type.startsWith("image/")) {
        this.toastService.showError(
          "Por favor, selecciona solo archivos de imagen."
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.toastService.showError("La imagen no puede pesar más de 5MB.");
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedAvatarPreview = e.target?.result ?? null;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Sube la imagen seleccionada al backend.
   */
  uploadAvatar(): void {
    if (!this.selectedFile) {
      this.toastService.showError("No has seleccionado ninguna imagen nueva.");
      return;
    }

    this.uploadingAvatar = true;

    this.userService.updateAvatar(this.selectedFile).subscribe({
      next: (res) => {
        if (this.user) {
          this.user.avatarUrl = res.avatarUrl;

          //
          // 💡 CAMBIO CLAVE: Notificar al AuthService que el avatar cambió
          //
          this.authService.updateUserAvatar(res.avatarUrl);
        }

        this.selectedFile = null;
        this.selectedAvatarPreview = null;
        this.uploadingAvatar = false;
        this.toastService.showSuccess(res.message);
      },
      error: (err) => {
        this.uploadingAvatar = false;
        const errorMessage =
          err.error?.message || "Error desconocido al subir la imagen.";
        this.toastService.showError(errorMessage);
        console.error("Error uploading avatar:", err);
      },
    });
  }

  cancelAvatarUpload(): void {
    this.selectedFile = null;
    this.selectedAvatarPreview = null;
  }
}
