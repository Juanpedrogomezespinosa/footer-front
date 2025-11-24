import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem("token");

    if (!token) {
      return next.handle(req);
    }

    const authReq = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${token}`),
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Logueamos el error ANTES de que llegue al componente
        console.warn("🚨 INTERCEPTOR FALLÓ 🚨");
        console.warn("Status:", error.status, "Status Text:", error.statusText);
        console.warn(
          "Cuerpo de error (lo que Express envió, que causó el fallo 200/ok:false):",
          error.error
        );

        // El valor de error.error te dirá si es texto/HTML o un JSON malformado.

        return throwError(() => error); // Re-lanzar el error
      })
    );
  }
}
