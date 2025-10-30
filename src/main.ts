// src/main.ts

import { bootstrapApplication } from "@angular/platform-browser";
// --- 👇 CAMBIO: Importaciones necesarias para el Interceptor ---
import {
  provideHttpClient,
  withInterceptorsFromDi, // Necesario para interceptors basados en clases
  HTTP_INTERCEPTORS,
} from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";

import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
// --- 👇 CAMBIO: Importar tu AuthInterceptor ---
import { AuthInterceptor } from "./app/core/interceptors/auth.interceptor";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(), // Activa animaciones globales

    // --- 👇 CAMBIO: Configuración del Interceptor ---

    // 1. Habilita HttpClient y le dice que use interceptors
    provideHttpClient(withInterceptorsFromDi()),

    // 2. Registra tu AuthInterceptor (el que lee el token)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    // --- FIN DEL CAMBIO ---
  ],
}).catch((err) => console.error(err));
