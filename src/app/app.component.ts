import { Component, OnInit } from "@angular/core";
import { RouterOutlet, Router, NavigationEnd } from "@angular/router";
import { ToastComponent } from "./shared/components/toast/toast.component";
import { NavbarComponent } from "./shared/components/navbar/navbar.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { CommonModule } from "@angular/common";
import { filter } from "rxjs/operators";

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
  title = "footer-front";

  hideLayout: boolean = false;

  constructor(private router: Router) {}

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

          this.hideLayout =
            currentRoute.includes("login") ||
            currentRoute.includes("register") ||
            currentRoute.includes("/admin");
        }
      });
  }
}
