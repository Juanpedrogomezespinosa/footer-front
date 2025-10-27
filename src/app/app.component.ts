// src/app/app.component.ts
import { Component } from "@angular/core";
import { RouterOutlet, Router } from "@angular/router";
import { ToastComponent } from "./shared/components/toast/toast.component";
import { NavbarComponent } from "./shared/components/navbar/navbar.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { CommonModule } from "@angular/common";

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
export class AppComponent {
  title = "footer-front";

  constructor(private router: Router) {}

  // Propiedad para saber si estamos en login o register
  get hideLayout(): boolean {
    const currentRoute = this.router.url;
    return currentRoute.includes("login") || currentRoute.includes("register");
  }
}
