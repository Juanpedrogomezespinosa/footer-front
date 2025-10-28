import { Component, ElementRef, HostListener, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { NgIf } from "@angular/common";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [FormsModule, RouterModule, NgIf],
  templateUrl: "./navbar.component.html",
  styleUrls: [],
})
export class NavbarComponent {
  public isLoggedIn = false;
  public userAvatarUrl = "/assets/icons/perfil.svg";
  public mobileMenuActive = false;
  public searchActiveDesktop = false;
  public searchTerm = "";

  @ViewChild("searchInputDesktop")
  searchInputDesktop!: ElementRef<HTMLInputElement>;

  constructor(private router: Router, private authService: AuthService) {
    this.authService.user$.subscribe((user: any) => {
      this.isLoggedIn = !!user;

      const possibleAvatar =
        user?.avatarUrl ||
        user?.photoURL ||
        user?.profileImage ||
        user?.image ||
        user?.picture;

      this.userAvatarUrl = possibleAvatar || "/assets/icons/perfil.svg";
    });
  }

  /** Envía la búsqueda */
  public submitSearch(): void {
    const trimmed = this.searchTerm.trim();
    if (trimmed.length > 0) {
      this.router.navigate(["/products"], {
        queryParams: { search: trimmed },
      });
    }
    this.searchTerm = "";
    this.searchActiveDesktop = false;
    this.mobileMenuActive = false;
  }

  /** Abre o cierra el buscador desktop */
  public toggleSearchDesktop(): void {
    this.searchActiveDesktop = !this.searchActiveDesktop;
    if (this.searchActiveDesktop) {
      setTimeout(() => this.searchInputDesktop?.nativeElement.focus(), 100);
    }
  }

  /** Menú móvil */
  public toggleMobileMenu(): void {
    this.mobileMenuActive = !this.mobileMenuActive;
    if (this.mobileMenuActive) {
      this.searchActiveDesktop = false;
    }
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(["/products"]);
  }

  @HostListener("document:click", ["$event"])
  public onDocumentClick(event: MouseEvent): void {
    const clicked = event.target as HTMLElement;

    if (
      !clicked.closest(".search-desktop-wrapper") &&
      !clicked.closest(".search-button")
    ) {
      this.searchActiveDesktop = false;
    }

    if (
      !clicked.closest(".mobile-menu") &&
      !clicked.closest('button[aria-label="Abrir menú"]')
    ) {
      this.mobileMenuActive = false;
    }
  }
}
