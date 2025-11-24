import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AdminLayoutComponent } from "./pages/admin-layout/admin-layout.component";
import { AdminProductsComponent } from "./pages/admin-products/admin-products.component";
import { AdminOrdersComponent } from "./pages/admin-orders/admin-orders.component";
import { AdminUsersComponent } from "./pages/admin-users/admin-users.component";

export const ADMIN_ROUTES: Routes = [
  {
    path: "",
    component: AdminLayoutComponent,
    children: [
      {
        path: "dashboard",
        component: DashboardComponent,
        title: "Admin Dashboard",
      },
      {
        path: "products",
        component: AdminProductsComponent,
        title: "Gestión de Productos",
      },
      {
        path: "orders",
        component: AdminOrdersComponent,
        title: "Gestión de Pedidos",
      },
      {
        path: "users",
        component: AdminUsersComponent,
        title: "Gestión de Usuarios",
      },
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
    ],
  },
];
