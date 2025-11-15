// src/main.ts

import { bootstrapApplication } from "@angular/platform-browser";
import {
  provideHttpClient,
  withInterceptorsFromDi, // Necesario para interceptors basados en clases
  HTTP_INTERCEPTORS,
} from "@angular/common/http";

// --- 👇 CAMBIO: Importar 'withInMemoryScrolling' ---
// Esta es la función correcta para tu versión de Angular
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";

import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
import { AuthInterceptor } from "./app/core/interceptors/auth.interceptor";

bootstrapApplication(AppComponent, {
  providers: [
    // --- 👇 CAMBIO: Usar 'withInMemoryScrolling' ---
    provideRouter(
      routes,
      // 'enabled' te lleva arriba en nuevas navegaciones,
      // y restaura el scroll al usar "atrás/adelante"
      withInMemoryScrolling({ scrollPositionRestoration: "enabled" })
    ),
    // --- FIN DEL CAMBIO ---

    provideAnimations(), // Activa animaciones globales

    // Configuración del Interceptor
    provideHttpClient(withInterceptorsFromDi()), // Habilita HttpClient y le dice que use interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor, // Registra tu AuthInterceptor (el que lee el token)
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
