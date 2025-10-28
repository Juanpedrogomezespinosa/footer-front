import { Component, ElementRef, HostListener, ViewChild } from "@angular/core";
import { NgIf, NgFor } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, RouterModule],
  templateUrl: "./navbar.component.html",
  styleUrls: [],
})
export class NavbarComponent {
  /** Indica si el buscador está activo o visible */
  public searchActive: boolean = false;

  /** Indica si el menú móvil está abierto o cerrado */
  public mobileMenuActive: boolean = false;

  /** Indica si el usuario está autenticado */
  public isLoggedIn: boolean = false;

  /** Texto del campo de búsqueda */
  public searchTerm: string = "";

  /** Imagen de perfil del usuario (por defecto una genérica) */
  public userAvatarUrl: string = "/assets/icons/perfil.svg";

  /** Referencias a los campos de búsqueda (desktop y móvil) */
  @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild("searchInputMobile")
  searchInputMobile!: ElementRef<HTMLInputElement>;

  constructor(private router: Router, private authService: AuthService) {
    // Suscribirse al usuario autenticado
    this.authService.user$.subscribe((user: any) => {
      this.isLoggedIn = !!user;

      if (user) {
        // Detectar automáticamente la propiedad de imagen disponible
        const possibleAvatar =
          user.avatarUrl ||
          user.photoURL ||
          user.profileImage ||
          user.image ||
          user.picture;

        this.userAvatarUrl = possibleAvatar
          ? possibleAvatar
          : "/assets/icons/perfil.svg";
      } else {
        this.userAvatarUrl = "/assets/icons/perfil.svg";
      }
    });
  }

  /**
   * Alterna la visibilidad del buscador.
   * Si se activa, enfoca automáticamente el campo correspondiente.
   */
  public toggleSearch(): void {
    this.searchActive = !this.searchActive;
    this.mobileMenuActive = false;

    setTimeout(() => {
      const target =
        window.innerWidth <= 600 ? this.searchInputMobile : this.searchInput;
      target?.nativeElement.focus();
    }, 100);
  }

  /**
   * Envía la búsqueda actual y redirige a la vista de productos.
   */
  public submitSearch(): void {
    const trimmed = this.searchTerm.trim();

    if (trimmed.length > 0) {
      this.router.navigate(["/products"], {
        queryParams: { search: trimmed },
      });
    }

    this.searchActive = false;
    this.searchTerm = "";
  }

  /**
   * Alterna la visibilidad del menú móvil.
   * Si se abre, se cierra el buscador.
   */
  public toggleMobileMenu(): void {
    this.mobileMenuActive = !this.mobileMenuActive;

    if (this.mobileMenuActive) {
      this.searchActive = false;
    }
  }

  /**
   * Cierra buscador o menú al hacer clic fuera del área del navbar.
   */
  @HostListener("document:click", ["$event"])
  public handleDocumentClick(event: MouseEvent): void {
    const clicked = event.target as HTMLElement;

    if (!clicked.closest(".search-wrapper")) {
      this.searchActive = false;
    }

    if (
      !clicked.closest('button[aria-label="Abrir menú"]') &&
      !clicked.closest(".mobile-menu")
    ) {
      this.mobileMenuActive = false;
    }
  }

  /**
   * Cierra sesión del usuario y redirige a la vista de productos.
   */
  public logout(): void {
    this.authService.logout();
    this.router.navigate(["/products"]);
  }

  /**
   * Recarga completamente la página actual.
   */
  public reloadPage(): void {
    window.location.reload();
  }
}
