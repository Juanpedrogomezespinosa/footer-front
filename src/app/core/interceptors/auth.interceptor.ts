import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from "@angular/common/http";
import { Observable } from "rxjs";
// No necesitamos AuthService aquí si leemos desde localStorage

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // No necesitamos inyectar AuthService si usamos localStorage
  constructor() {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // --- LÓGICA DE OBTENCIÓN DE TOKEN ---
    // Asumimos que guardas el token en localStorage después del login
    // con la clave 'token'. Si usas otra clave (ej. 'auth_token'), cámbiala aquí.
    const token = localStorage.getItem("token");

    // Si no hay token, dejamos pasar la petición sin modificarla
    // (Ej: peticiones a /login o /register)
    if (!token) {
      return next.handle(req);
    }

    // Si hay token, clonamos la petición y añadimos la cabecera
    // 'Authorization' con el formato 'Bearer TOKEN'
    const authReq = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${token}`),
    });

    // Enviamos la petición clonada (con el token) al backend
    return next.handle(authReq);
  }
}
