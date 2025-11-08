// src/app/app.module.ts
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module"; // <-- Este se encarga del lazy loading
import { AuthInterceptor } from "./core/interceptors/auth.interceptor";
import { CoreModule } from "./core/core.module";
import { NavbarComponent } from "./shared/components/navbar/navbar.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
// NO importes AdminModule aquí.

@NgModule({
  declarations: [
    // ...otros componentes "declarados" si los tienes aquí
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, // <-- Este módulo importa tus 'routes' y gestiona el lazy loading
    HttpClientModule,
    BrowserAnimationsModule,
    CoreModule,
    AppComponent,
    NavbarComponent,
    FooterComponent,
    // AdminModule NO VA AQUÍ
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
})
export class AppModule {}
