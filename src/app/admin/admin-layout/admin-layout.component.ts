// src/app/admin/admin-layout/admin-layout.component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { Observable } from "rxjs";
import { User } from "../../core/services/auth.service";
import { ModalService } from "../../core/services/modal.service";
import { ProductModalComponent } from "../components/product-modal/product-modal.component";
import { EditProductModalComponent } from "../components/edit-product-modal/edit-product-modal.component";
import { DeleteProductModalComponent } from "../components/delete-product-modal/delete-product-modal.component";
import { OrderDetailsModalComponent } from "../components/order-details-modal/order-details-modal.component";
import { StatusUpdateModalComponent } from "../components/status-update-modal/status-update-modal.component";
import { DeleteUserModalComponent } from "../components/delete-user-modal/delete-user-modal.component";

// --- ¡¡¡1. IMPORTAR EL NUEVO MODAL!!! ---
import { ProductDetailsModalComponent } from "../components/product-details-modal/product-details-modal.component";

@Component({
  selector: "app-admin-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductModalComponent,
    EditProductModalComponent,
    DeleteProductModalComponent,
    OrderDetailsModalComponent,
    StatusUpdateModalComponent,
    DeleteUserModalComponent,
    // --- ¡¡¡2. AÑADIR EL NUEVO MODAL A LOS IMPORTS!!! ---
    ProductDetailsModalComponent,
  ],
  templateUrl: "./admin-layout.component.html",
})
export class AdminLayoutComponent {
  user$: Observable<User | null>;
  isProductModalOpen$: Observable<boolean>;
  isEditModalOpen$: Observable<boolean>;
  isDeleteModalOpen$: Observable<boolean>;
  isOrderDetailsModalOpen$: Observable<boolean>;
  isStatusUpdateModalOpen$: Observable<boolean>;
  isDeleteUserModalOpen$: Observable<boolean>;
  // --- ¡¡¡3. DECLARAR LA NUEVA VARIABLE DE OBSERVABLE!!! ---
  isDetailsModalOpen$: Observable<boolean>;

  // Esta propiedad controla el menú móvil
  isSidebarOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) {
    this.user$ = this.authService.user$;
    this.isProductModalOpen$ = this.modalService.isProductModalOpen$;
    this.isEditModalOpen$ = this.modalService.isEditModalOpen$;
    this.isDeleteModalOpen$ = this.modalService.isDeleteModalOpen$;
    this.isOrderDetailsModalOpen$ = this.modalService.isOrderDetailsModalOpen$;
    this.isStatusUpdateModalOpen$ = this.modalService.isStatusUpdateModalOpen$;
    this.isDeleteUserModalOpen$ = this.modalService.isDeleteUserModalOpen$;
    // --- ¡¡¡4. INICIALIZAR LA NUEVA VARIABLE!!! ---
    this.isDetailsModalOpen$ = this.modalService.isDetailsModalOpen$;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  // Este método controla el menú móvil
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
