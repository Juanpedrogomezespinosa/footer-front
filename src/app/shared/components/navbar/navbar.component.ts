import { Component, ElementRef, HostListener, ViewChild } from "@angular/core";
import { NgIf } from "@angular/common";
import { AuthService } from "../../../core/services/auth.service"; // importar el servicio
import { Router } from "@angular/router";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [NgIf],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent {
  public searchActive = false;
  public mobileMenuActive = false;
  public isLoggedIn = false;

  @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild("searchInputMobile")
  searchInputMobile!: ElementRef<HTMLInputElement>;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.user$.subscribe((user) => {
      this.isLoggedIn = !!user;
    });
  }

  public toggleSearch(): void {
    this.searchActive = !this.searchActive;
    this.mobileMenuActive = false;
    setTimeout(() => {
      const target =
        window.innerWidth <= 600 ? this.searchInputMobile : this.searchInput;
      target?.nativeElement.focus();
    }, 100);
  }

  public submitSearch(): void {
    // lógica de búsqueda…
    this.searchActive = false;
  }

  public toggleMobileMenu(): void {
    this.mobileMenuActive = !this.mobileMenuActive;
    if (this.mobileMenuActive) {
      this.searchActive = false;
    }
  }

  @HostListener("document:click", ["$event"])
  public handleDocumentClick(event: MouseEvent): void {
    const clicked = event.target as HTMLElement;
    if (!clicked.closest(".search-wrapper")) this.searchActive = false;
    if (
      !clicked.closest('button[aria-label="Abrir menú"]') &&
      !clicked.closest(".mobile-menu")
    ) {
      this.mobileMenuActive = false;
    }
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(["/products"]);
  }

  public reloadPage(): void {
    window.location.reload();
  }
}
