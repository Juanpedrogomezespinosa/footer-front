import { Component, ElementRef, HostListener, ViewChild } from "@angular/core";
import { NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [NgIf, FormsModule, RouterModule],
  templateUrl: "./navbar.component.html",
  styleUrls: [],
})
export class NavbarComponent {
  public searchActive = false;
  public mobileMenuActive = false;
  public isLoggedIn = false;
  public searchTerm = "";

  @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild("searchInputMobile")
  searchInputMobile!: ElementRef<HTMLInputElement>;

  constructor(private router: Router, private authService: AuthService) {
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
    const trimmed = this.searchTerm.trim();
    if (trimmed.length > 0) {
      this.router.navigate(["/products"], {
        queryParams: { search: trimmed },
      });
    }
    this.searchActive = false;
    this.searchTerm = "";
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
