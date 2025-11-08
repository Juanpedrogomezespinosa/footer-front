// src/app/admin/admin.routes.ts
import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AdminLayoutComponent } from "./admin-layout/admin-layout.component";
// 1. Importar los nuevos componentes de página
import { AdminProductsComponent } from "./pages/admin-products/admin-products.component";
import { AdminOrdersComponent } from "./pages/admin-orders/admin-orders.component";
import { AdminUsersComponent } from "./pages/admin-users/admin-users.component";

export const ADMIN_ROUTES: Routes = [
  {
    path: "", // La ruta /admin
    component: AdminLayoutComponent, // Carga el layout
    children: [
      {
        path: "dashboard",
        component: DashboardComponent,
        title: "Admin Dashboard",
      },
      // 2. Añadir las nuevas rutas
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
        path: "", // Redirige /admin a /admin/dashboard
        redirectTo: "dashboard",
        pathMatch: "full",
      },
    ],
  },
];
