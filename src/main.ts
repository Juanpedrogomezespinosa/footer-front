import { bootstrapApplication } from "@angular/platform-browser";
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from "@angular/common/http";

import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";

import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
import { AuthInterceptor } from "./app/core/interceptors/auth.interceptor";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: "enabled" })
    ),

    provideAnimations(),

    // Configuración del Interceptor
    provideHttpClient(withInterceptorsFromDi()), // Habilita HttpClient y le dice que use interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor, // Registra tu AuthInterceptor (el que lee el token)
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
