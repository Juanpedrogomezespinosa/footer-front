import { Component, ElementRef, HostListener, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../../core/services/auth.service";
import { trigger, transition, style, animate } from "@angular/animations";
import { UiStateService } from "../../../core/services/ui-state.service"; // <-- 1. IMPORTAR

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

  @ViewChild("searchInputDesktop")
  searchInputDesktop!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private uiStateService: UiStateService // <-- 2. INYECTAR
  ) {
    this.authService.user$.subscribe((user: any) => {
      this.isLoggedIn = !!user;
      const possibleAvatar =
        user?.avatarUrl ||
        user?.photoURL ||
        user?.profileImage ||
        user?.image ||
        user?.picture;
      if (possibleAvatar) {
        this.userAvatarUrl = possibleAvatar;
      } else {
        const name = user?.username || user?.name || "Usuario";
        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();
        this.userAvatarUrl = `https://placehold.co/100x100/60a5fa/FFFFFF?text=${initials}`;
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
    this.uiStateService.isMobileMenuOpen.set(this.mobileMenuActive); // <-- 3. ACTUALIZAR SIGNAL
    if (this.mobileMenuActive) {
      this.searchActiveDesktop = false;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }

  public closeMobileMenu(): void {
    this.mobileMenuActive = false;
    this.uiStateService.isMobileMenuOpen.set(false); // <-- 3. ACTUALIZAR SIGNAL
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
