// src/app/admin/admin-layout/admin-layout.component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router"; // 1. Importar RouterModule y Router
import { AuthService } from "../../core/services/auth.service"; // 2. Importar AuthService
import { Observable } from "rxjs";
import { User } from "../../core/services/auth.service";

@Component({
  selector: "app-admin-layout",
  standalone: true,
  imports: [CommonModule, RouterModule], // 3. Importar CommonModule y RouterModule
  templateUrl: "./admin-layout.component.html",
})
export class AdminLayoutComponent {
  user$: Observable<User | null>;

  constructor(private authService: AuthService, private router: Router) {
    this.user$ = this.authService.user$; // 4. Obtener el observable del usuario
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]); // 5. Redirigir al login al cerrar sesión
  }
}
