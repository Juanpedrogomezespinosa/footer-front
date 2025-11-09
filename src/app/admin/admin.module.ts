// src/app/admin/admin.module.ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";

import { ADMIN_ROUTES } from "./admin.routes";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AdminLayoutComponent } from "./admin-layout/admin-layout.component";

import { AdminProductsComponent } from "./pages/admin-products/admin-products.component";
import { AdminOrdersComponent } from "./pages/admin-orders/admin-orders.component";
import { AdminUsersComponent } from "./pages/admin-users/admin-users.component";
import { ProductModalComponent } from "./components/product-modal/product-modal.component";
import { EditProductModalComponent } from "./components/edit-product-modal/edit-product-modal.component";
import { DeleteProductModalComponent } from "./components/delete-product-modal/delete-product-modal.component";
import { OrderDetailsModalComponent } from "./components/order-details-modal/order-details-modal.component";
import { StatusUpdateModalComponent } from "./components/status-update-modal/status-update-modal.component"; // 1. Importar

@NgModule({
  declarations: [
    // Todos son standalone, así que 'declarations' está vacío
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ADMIN_ROUTES),
    ReactiveFormsModule,

    // Componentes Standalone
    DashboardComponent,
    AdminLayoutComponent,
    AdminProductsComponent,
    AdminOrdersComponent,
    AdminUsersComponent,
    ProductModalComponent,
    EditProductModalComponent,
    DeleteProductModalComponent,
    OrderDetailsModalComponent,
    StatusUpdateModalComponent, // 2. Añadir a imports
  ],
})
export class AdminModule {}
