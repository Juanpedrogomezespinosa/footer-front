import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { catchError, of, tap } from "rxjs";
import { Router, RouterModule } from "@angular/router"; // Importar RouterModule
import { UserProfile, UserService } from "app/core/services/user.service";
import { AuthService } from "app/core/services/auth.service";
import { ToastService } from "app/core/services/toast.service";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, RouterModule], // Quitar ReactiveFormsModule, Añadir RouterModule
  templateUrl: "./profile.component.html",
  styleUrls: [],
})
export class ProfileComponent implements OnInit {
  // Estado (Simplificado para el layout)
  public user: UserProfile | null = null;
  public loading: boolean = true;

  // Estado para la subida de avatar (Se mantiene)
  public uploadingAvatar: boolean = false;
  public selectedAvatarPreview: string | ArrayBuffer | null = null;
  private selectedFile: File | null = null;
  private readonly API_URL = "http://localhost:3000"; // URL base del backend

  constructor(
    private userService: UserService,
    public router: Router,
    public toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Solo cargamos el perfil para el saludo y avatar
    this.loadProfile();
  }

  // Carga solo los datos del perfil para el 'aside' (saludo, email, avatar)
  private loadProfile(): void {
    this.loading = true;
    this.userService
      .getProfile()
      .pipe(
        tap((user: UserProfile) => {
          this.user = user;
        }),
        catchError((err) => {
          console.error("Error al cargar el perfil:", err);
          this.loading = false;
          this.toastService.showError(
            "Error al cargar el perfil. Asegúrate de estar autenticado."
          );

          if (err.status === 401 || err.status === 403) {
            this.authService.logout(); // Deslogueamos si hay error de auth
            this.router.navigate(["/login"]);
          }

          return of(null);
        })
      )
      .subscribe(() => {
        this.loading = false;
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
