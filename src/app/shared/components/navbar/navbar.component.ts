import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService, User } from "../../../core/services/auth.service";
import { trigger, transition, style, animate } from "@angular/animations";
import { UiStateService } from "../../../core/services/ui-state.service";
import { Subscription } from "rxjs";
import { environment } from "../../../../environments/environment";

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
export class NavbarComponent implements OnDestroy {
  public isLoggedIn = false;
  public userAvatarUrl = "";
  public mobileMenuActive = false;
  public searchActiveDesktop = false;
  public searchTerm = "";

  // API URL base para archivos legacy (locales) que no empiecen por http
  private readonly API_URL = environment.apiUrl.replace("/api", "");

  private readonly DEFAULT_AVATAR_PLACEHOLDER =
    "https://placehold.co/100x100/60a5fa/FFFFFF?text=";

  private userSubscription?: Subscription;

  @ViewChild("searchInputDesktop")
  searchInputDesktop!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private uiStateService: UiStateService
  ) {
    this.initializeUserSubscription();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private initializeUserSubscription(): void {
    this.userSubscription = this.authService.user$.subscribe({
      next: (user: User | null) => {
        this.isLoggedIn = !!user;
        this.userAvatarUrl = this.buildAvatarUrl(user);
      },
      error: (err) => {},
    });
  }

  private buildAvatarUrl(user: User | null): string {
    if (!user) {
      return `${this.DEFAULT_AVATAR_PLACEHOLDER}NA`;
    }

    if (user.avatarUrl) {
      // Si la URL ya es absoluta (ej: Cloudinary), la usamos tal cual
      if (user.avatarUrl.startsWith("http")) {
        return user.avatarUrl;
      } else {
        // Si es una ruta relativa (archivos antiguos locales), le pegamos el dominio
        // Aseguramos que no haya doble barra
        const baseUrl = this.API_URL.endsWith("/")
          ? this.API_URL.slice(0, -1)
          : this.API_URL;
        const relativePath = user.avatarUrl.startsWith("/")
          ? user.avatarUrl
          : `/${user.avatarUrl}`;
        return `${baseUrl}${relativePath}`;
      }
    }

    const name = user.username || "Usuario";
    const initials = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const placeholderUrl = `${this.DEFAULT_AVATAR_PLACEHOLDER}${initials}`;

    return placeholderUrl;
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

  @HostListener("document:keydown.escape")
  public onEscapeKey(): void {
    if (this.mobileMenuActive) {
      this.closeMobileMenu();
    }
  }
}
