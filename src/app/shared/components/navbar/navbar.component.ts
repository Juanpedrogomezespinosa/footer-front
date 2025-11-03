import { Component, ElementRef, HostListener, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService, User } from "../../../core/services/auth.service"; // 🆕 Importamos la interfaz User
import { trigger, transition, style, animate } from "@angular/animations";
import { UiStateService } from "../../../core/services/ui-state.service";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./navbar.component.html",
  styleUrls: [],
  animations: [
    trigger("slideFromRight", [
      transition(":enter", [
        style({ transform: "translateX(100%)" }),
        animate(
          "300ms cubic-bezier(0.4, 0, 0.2, 1)",
          style({ transform: "translateX(0)" })
        ),
      ]),
      transition(":leave", [
        animate(
          "250ms cubic-bezier(0.4, 0, 0.2, 1)",
          style({ transform: "translateX(100%)" })
        ),
      ]),
    ]),
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("300ms ease-out", style({ opacity: 1 })),
      ]),
      transition(":leave", [animate("250ms ease-in", style({ opacity: 0 }))]),
    ]),
  ],
})
export class NavbarComponent {
  public isLoggedIn = false;
  public userAvatarUrl = "";
  public mobileMenuActive = false;
  public searchActiveDesktop = false;
  public searchTerm = "";

  // 🆕 Constantes para construir la URL del avatar
  private readonly API_URL = "http://localhost:3000";
  private readonly DEFAULT_AVATAR_PLACEHOLDER =
    "https://placehold.co/100x100/60a5fa/FFFFFF?text=";

  @ViewChild("searchInputDesktop")
  searchInputDesktop!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private uiStateService: UiStateService
  ) {
    // 🆕 Lógica de suscripción al avatar actualizada
    this.authService.user$.subscribe((user: User | null) => {
      this.isLoggedIn = !!user;

      if (!user) {
        // Si no hay usuario, usamos un placeholder genérico
        this.userAvatarUrl = `${this.DEFAULT_AVATAR_PLACEHOLDER}NA`;
        return;
      }

      // 1. Verificar si el usuario tiene un avatarUrl desde el backend
      if (user.avatarUrl) {
        // 2. Construir la URL completa
        // Si la URL ya es absoluta (ej. Google/Pravatar), la usa.
        // Si es relativa (empieza con /uploads/), le añade la URL de la API.
        if (user.avatarUrl.startsWith("http")) {
          this.userAvatarUrl = user.avatarUrl;
        } else {
          this.userAvatarUrl = `${this.API_URL}${user.avatarUrl}`;
        }
      } else {
        // 3. Si no hay avatarUrl, crear placeholder con iniciales
        const name = user?.username || "Usuario";
        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();
        this.userAvatarUrl = `${this.DEFAULT_AVATAR_PLACEHOLDER}${initials}`;
      }
    });
  }

  public submitSearch(): void {
    const trimmed = this.searchTerm.trim();
    if (trimmed.length > 0) {
      this.router.navigate(["/products"], {
        queryParams: { name: trimmed },
      });
    }
    this.searchTerm = "";
    this.searchActiveDesktop = false;
    this.closeMobileMenu();
  }

  public toggleSearchDesktop(): void {
    this.searchActiveDesktop = !this.searchActiveDesktop;
    if (this.searchActiveDesktop) {
      setTimeout(() => this.searchInputDesktop?.nativeElement.focus(), 100);
    }
  }

  public toggleMobileMenu(): void {
    this.mobileMenuActive = !this.mobileMenuActive;
    this.uiStateService.isMobileMenuOpen.set(this.mobileMenuActive);
    if (this.mobileMenuActive) {
      this.searchActiveDesktop = false;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }

  public closeMobileMenu(): void {
    this.mobileMenuActive = false;
    this.uiStateService.isMobileMenuOpen.set(false);
    document.body.style.overflow = "auto";
  }

  public logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(["/home"]);
  }

  @HostListener("document:click", ["$event"])
  public onDocumentClick(event: MouseEvent): void {
    const clicked = event.target as HTMLElement;
    if (clicked.classList.contains("mobile-menu-backdrop")) {
      this.closeMobileMenu();
    }
  }

  @HostListener("document:keydown.escape", ["$event"])
  public onEscapeKey(): void {
    if (this.mobileMenuActive) {
      this.closeMobileMenu();
    }
  }
}
