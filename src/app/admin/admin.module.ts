import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";

import { ADMIN_ROUTES } from "./admin.routes";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AdminLayoutComponent } from "./pages/admin-layout/admin-layout.component";

import { AdminProductsComponent } from "./pages/admin-products/admin-products.component";
import { AdminOrdersComponent } from "./pages/admin-orders/admin-orders.component";
import { AdminUsersComponent } from "./pages/admin-users/admin-users.component";
import { ProductModalComponent } from "./components/product-modal/product-modal.component";
import { EditProductModalComponent } from "./components/edit-product-modal/edit-product-modal.component";
import { DeleteProductModalComponent } from "./components/delete-product-modal/delete-product-modal.component";
import { OrderDetailsModalComponent } from "./components/order-details-modal/order-details-modal.component";
import { StatusUpdateModalComponent } from "./components/status-update-modal/status-update-modal.component";
import { DeleteUserModalComponent } from "./components/delete-user-modal/delete-user-modal.component";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(ADMIN_ROUTES),
    ReactiveFormsModule,

    DashboardComponent,
    AdminLayoutComponent,
    AdminProductsComponent,
    AdminOrdersComponent,
    AdminUsersComponent,
    ProductModalComponent,
    EditProductModalComponent,
    DeleteProductModalComponent,
    OrderDetailsModalComponent,
    StatusUpdateModalComponent,
    DeleteUserModalComponent,
  ],
})
export class AdminModule {}
