// src/app/core/guards/admin.guard.ts
import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { AuthService } from "../services/auth.service"; // Importamos tu servicio

@Injectable({
  providedIn: "root",
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // Usamos el observable user$ de tu AuthService
    return this.authService.user$.pipe(
      take(1), // Tomamos solo el primer valor emitido
      map((user) => {
        // Comprobamos si el usuario existe Y si su rol es 'admin'
        if (user && user.role === "admin") {
          return true; // Acceso permitido
        }

        // Si no es admin, registramos un aviso y redirigimos
        console.warn("Acceso denegado. Se requiere rol de administrador.");

        // Creamos un UrlTree para redirigir al 'home'
        return this.router.createUrlTree(["/home"]);
      })
    );
  }
}
