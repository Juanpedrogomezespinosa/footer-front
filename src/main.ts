// src/main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient } from "@angular/common/http"; // 👈 Importar
import { provideRouter } from "@angular/router";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // ✅ Aquí lo añades
  ],
}).catch((err) => console.error(err));
