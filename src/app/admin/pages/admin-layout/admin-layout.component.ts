// src/app/admin/pages/admin-layout/admin-layout.component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { Observable } from "rxjs";
import { User } from "../../../core/services/auth.service";
import { ModalService } from "../../../core/services/modal.service";
import { ProductModalComponent } from "../../components/product-modal/product-modal.component";
import { EditProductModalComponent } from "../../components/edit-product-modal/edit-product-modal.component";
import { DeleteProductModalComponent } from "../../components/delete-product-modal/delete-product-modal.component";
import { OrderDetailsModalComponent } from "../../components/order-details-modal/order-details-modal.component";
import { StatusUpdateModalComponent } from "../../components/status-update-modal/status-update-modal.component";
import { DeleteUserModalComponent } from "../../components/delete-user-modal/delete-user-modal.component";
import { ProductDetailsModalComponent } from "../../components/product-details-modal/product-details-modal.component";

// --- ¡¡¡RUTA DE IMPORTACIÓN CORREGIDA!!! ---
// (Desde 'pages/admin-layout', subimos 2 niveles a 'admin', luego entramos a 'components')
import { UserDetailsModalComponent } from "../../components/user-details-modal/user-details-modal.component";

@Component({
  selector: "app-admin-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductModalComponent,
    EditProductModalComponent,
    ProductDetailsModalComponent, // <-- Modal de Detalles de Producto
    DeleteProductModalComponent,
    OrderDetailsModalComponent,
    StatusUpdateModalComponent,
    DeleteUserModalComponent,
    UserDetailsModalComponent, // <-- ¡AÑADIDO!
  ],
  templateUrl: "./admin-layout.component.html",
})
export class AdminLayoutComponent {
  user$: Observable<User | null>;
  isProductModalOpen$: Observable<boolean>;
  isEditModalOpen$: Observable<boolean>;
  isDetailsModalOpen$: Observable<boolean>; // Detalles de Producto
  isDeleteModalOpen$: Observable<boolean>;
  isOrderDetailsModalOpen$: Observable<boolean>;
  isStatusUpdateModalOpen$: Observable<boolean>;
  isDeleteUserModalOpen$: Observable<boolean>;
  // --- ¡¡¡DECLARAR LA NUEVA VARIABLE!!! ---
  isUserDetailsModalOpen$: Observable<boolean>;

  isSidebarOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) {
    this.user$ = this.authService.user$;
    this.isProductModalOpen$ = this.modalService.isProductModalOpen$;
    this.isEditModalOpen$ = this.modalService.isEditModalOpen$;
    this.isDetailsModalOpen$ = this.modalService.isDetailsModalOpen$;
    this.isDeleteModalOpen$ = this.modalService.isDeleteModalOpen$;
    this.isOrderDetailsModalOpen$ = this.modalService.isOrderDetailsModalOpen$;
    this.isStatusUpdateModalOpen$ = this.modalService.isStatusUpdateModalOpen$;
    this.isDeleteUserModalOpen$ = this.modalService.isDeleteUserModalOpen$;
    // --- ¡¡¡INICIALIZAR LA NUEVA VARIABLE!!! ---
    this.isUserDetailsModalOpen$ = this.modalService.isUserDetailsModalOpen$;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
