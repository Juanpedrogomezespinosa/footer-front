import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "app/core/services/auth.service";
import { ToastService } from "app/core/services/toast.service";

@Component({
  selector: "app-auth-callback",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./auth-callback.component.html",
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // 1. Leer el token del parámetro 'token' en la URL
    const token = this.route.snapshot.queryParamMap.get("token");

    if (token) {
      // 2. Usar el servicio de Auth para guardar el token y el usuario
      const user = this.authService.handleGoogleToken(token);

      if (user) {
        // 3. Redirigir al usuario
        this.toast.showSuccess(`¡Bienvenido, ${user.username}!`);
        // Redirigir según el rol
        if (user.role === "admin") {
          this.router.navigate(["/admin"]);
        } else {
          this.router.navigate(["/home"]);
        }
      } else {
        // El token era inválido (jwt-decode falló)
        this.toast.showError("Error de autenticación. Token inválido.");
        this.router.navigate(["/login"]);
      }
    } else {
      // No había token en la URL
      this.toast.showError("Error de autenticación. No se recibió token.");
      this.router.navigate(["/login"]);
    }
  }
}
