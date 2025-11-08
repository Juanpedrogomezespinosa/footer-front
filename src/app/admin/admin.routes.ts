// src/app/admin/admin.routes.ts
import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AdminLayoutComponent } from "./admin-layout/admin-layout.component"; // 1. Importar el Layout

export const ADMIN_ROUTES: Routes = [
  {
    path: "", // La ruta /admin
    component: AdminLayoutComponent, // 2. Carga el layout
    children: [
      // 3. Estas son las rutas hijas que se mostrarán en el <router-outlet>
      {
        path: "dashboard",
        component: DashboardComponent,
        title: "Admin Dashboard",
      },
      // { path: 'products', component: AdminProductsComponent, title: 'Gestión de Productos' },
      // { path: 'users', component: AdminUsersComponent, title: 'Gestión de Usuarios' },
      // { path: 'orders', component: AdminOrdersComponent, title: 'Gestión de Pedidos' },

      {
        path: "", // Redirige /admin a /admin/dashboard
        redirectTo: "dashboard",
        pathMatch: "full",
      },
    ],
  },
];
