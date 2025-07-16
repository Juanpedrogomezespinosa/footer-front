import { Component, ElementRef, HostListener, ViewChild } from "@angular/core";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
  standalone: true,
  imports: [NgIf],
})
export class NavbarComponent {
  searchActive: boolean = false;
  mobileMenuActive: boolean = false;
  isLoggedIn: boolean = false; // Sustituir por lógica real de autenticación

  @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild("searchInputMobile")
  searchInputMobile!: ElementRef<HTMLInputElement>;

  toggleSearch(): void {
    this.searchActive = !this.searchActive;
    this.mobileMenuActive = false;

    setTimeout(() => {
      if (this.searchActive) {
        const isMobileDevice = window.innerWidth <= 600;
        if (isMobileDevice && this.searchInputMobile) {
          this.searchInputMobile.nativeElement.focus();
        } else if (!isMobileDevice && this.searchInput) {
          this.searchInput.nativeElement.focus();
        }
      }
    }, 100);
  }

  submitSearch(): void {
    const isMobileDevice = window.innerWidth <= 600;
    const searchInputElement = isMobileDevice
      ? this.searchInputMobile.nativeElement
      : this.searchInput.nativeElement;

    const searchValue = searchInputElement.value.trim();

    if (searchValue) {
      console.log("Buscar:", searchValue);
      this.searchActive = false;

      // Limpiar el valor del input después de buscar
      searchInputElement.value = "";
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuActive = !this.mobileMenuActive;

    if (this.mobileMenuActive) {
      this.searchActive = false;
    }
  }

  @HostListener("document:click", ["$event"])
  handleDocumentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;

    const clickedInsideSearch =
      this.searchInput?.nativeElement.contains(clickedElement) ||
      this.searchInputMobile?.nativeElement.contains(clickedElement) ||
      clickedElement.closest(".search-wrapper") !== null;

    const clickedOnMenuToggle =
      clickedElement.closest('button[aria-label="Abrir menú"]') !== null;

    if (!clickedInsideSearch && !clickedOnMenuToggle) {
      this.searchActive = false;
    }

    if (!clickedOnMenuToggle && !clickedElement.closest(".mobile-menu")) {
      this.mobileMenuActive = false;
    }
  }

  reloadPage(): void {
    window.location.reload();
  }
}
