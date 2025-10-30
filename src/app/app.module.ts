import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { AuthInterceptor } from "./core/interceptors/auth.interceptor";
import { CoreModule } from "./core/core.module";
// --- Importamos los componentes Standalone que App.component usa ---
import { NavbarComponent } from "./shared/components/navbar/navbar.component";
import { FooterComponent } from "./shared/components/footer/footer.component";

@NgModule({
  // --- 👇 CAMBIO: AppComponent se ha quitado de 'declarations' ---
  declarations: [
    // ...otros componentes "declarados" si los tienes aquí
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CoreModule,
    // --- 👇 CAMBIO: Importamos TODOS los componentes Standalone aquí ---
    AppComponent, // <--- AÑADIDO AQUÍ
    NavbarComponent,
    FooterComponent,
  ],
  providers: [
    // --- (Esto se queda igual) ---
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  // --- 👇 CAMBIO: 'bootstrap' se ha eliminado porque AppComponent es Standalone ---
})
export class AppModule {}
