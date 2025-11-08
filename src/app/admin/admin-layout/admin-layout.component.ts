// src/app/admin/admin-layout/admin-layout.component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { Observable } from "rxjs";
import { User } from "../../core/services/auth.service";
import { ModalService } from "../../core/services/modal.service";
import { ProductModalComponent } from "../components/product-modal/product-modal.component"; // 1. Importar el Modal

@Component({
  selector: "app-admin-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductModalComponent, // 2. Añadir el Modal a los imports
  ],
  templateUrl: "./admin-layout.component.html",
})
export class AdminLayoutComponent {
  user$: Observable<User | null>;
  isProductModalOpen$: Observable<boolean>; // 3. Añadir la propiedad que faltaba

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) {
    this.user$ = this.authService.user$;
    this.isProductModalOpen$ = this.modalService.isProductModalOpen$; // 4. Asignarla
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
