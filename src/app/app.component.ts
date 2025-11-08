// src/app/app.component.ts
import { Component, OnInit } from "@angular/core"; // 1. Importar OnInit
import { RouterOutlet, Router, NavigationEnd } from "@angular/router"; // 2. Importar Router y NavigationEnd
import { ToastComponent } from "./shared/components/toast/toast.component";
import { NavbarComponent } from "./shared/components/navbar/navbar.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { CommonModule } from "@angular/common";
import { filter } from "rxjs/operators"; // 3. Importar filter

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastComponent,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrls: [],
})
export class AppComponent implements OnInit {
  // 4. Implementar OnInit
  title = "footer-front";

  // 5. Esta es ahora una propiedad normal, no un getter
  hideLayout: boolean = false;

  constructor(private router: Router) {}

  // 6. Usamos ngOnInit para suscribirnos a los cambios de ruta
  ngOnInit() {
    this.router.events
      .pipe(
        // Filtramos solo los eventos de fin de navegación
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe((event) => {
        // Comprobamos la URL *después* de que la navegación haya terminado
        if (event instanceof NavigationEnd) {
          const currentRoute = event.urlAfterRedirects;

          // 7. AÑADIMOS /admin a tu lógica
          this.hideLayout =
            currentRoute.includes("login") ||
            currentRoute.includes("register") ||
            currentRoute.includes("/admin");
        }
      });
  }

  // 8. Eliminamos el getter 'get hideLayout()'
}
