// src/app/admin/admin.module.ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms"; // 1. Importar ReactiveFormsModule

import { ADMIN_ROUTES } from "./admin.routes";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AdminLayoutComponent } from "./admin-layout/admin-layout.component";

// 2. Importar los nuevos componentes
import { AdminProductsComponent } from "./pages/admin-products/admin-products.component";
import { AdminOrdersComponent } from "./pages/admin-orders/admin-orders.component";
import { AdminUsersComponent } from "./pages/admin-users/admin-users.component";
import { ProductModalComponent } from "./components/product-modal/product-modal.component";

@NgModule({
  declarations: [
    // Todos son standalone, así que 'declarations' está vacío
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ADMIN_ROUTES),
    ReactiveFormsModule, // 3. Añadir para los formularios

    // Componentes Standalone
    DashboardComponent,
    AdminLayoutComponent,
    AdminProductsComponent, // 4. Añadir nuevas páginas
    AdminOrdersComponent,
    AdminUsersComponent,
    ProductModalComponent, // 5. Añadir el modal
  ],
})
export class AdminModule {}
