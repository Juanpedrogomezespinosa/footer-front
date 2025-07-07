// src/main.ts

import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";

// Si tienes módulos no standalone que quieras importar, los añades aquí con importProvidersFrom()
// import { importProvidersFrom } from '@angular/core';
// import { CoreModule } from './app/core/core.module';
// import { SharedModule } from './app/shared/shared.module';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    // importProvidersFrom(CoreModule, SharedModule), // descomenta si usas módulos no standalone
  ],
}).catch((err) => console.error(err));
