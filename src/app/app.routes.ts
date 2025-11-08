// src/app/app.routes.ts
import { Routes } from "@angular/router";
import { AuthGuard } from "./core/guards/auth.guard";
import { AdminGuard } from "./core/guards/admin.guard"; // 1. Importamos el AdminGuard

export const routes: Routes = [
  {
    path: "home",
    loadComponent: () =>
      import("./home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "products",
    loadChildren: () =>
      import("./products/products.module").then((m) => m.ProductsModule),
  },
  {
    path: "login",
    loadComponent: () =>
      import("./auth/components/login/login.component").then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./auth/components/register/register.component").then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: "profile",
    loadComponent: () =>
      import("./profile/profile.component").then((m) => m.ProfileComponent),
    canActivate: [AuthGuard],
    title: "Mi Perfil",
    children: [
      {
        path: "", // Ruta por defecto: /profile
        loadComponent: () =>
          import(
            "./profile/components/profile-details/profile-details.component"
          ).then((m) => m.ProfileDetailsComponent),
        title: "Mis Datos",
      },
      {
        path: "orders", // Ruta de historial: /profile/orders
        loadComponent: () =>
          import(
            "./profile/components/order-history/order-history.component"
          ).then((m) => m.OrderHistoryComponent),
        title: "Historial de Pedidos",
      },
      {
        path: "addresses", // Ruta de direcciones: /profile/addresses
        loadComponent: () =>
          import(
            "./profile/components/profile-addresses/profile-addresses.component"
          ).then((m) => m.ProfileAddressesComponent),
        title: "Mis Direcciones",
      },
    ],
  },

  // --- ¡NUEVA RUTA DE ADMIN AÑADIDA! ---
  {
    path: "admin",
    loadChildren: () =>
      import("./admin/admin.module").then((m) => m.AdminModule),
    canActivate: [AuthGuard, AdminGuard], // 2. Protegida por AMBOS guards
  },
  // -------------------------------------

  {
    path: "cart",
    loadComponent: () =>
      import("./cart/cart.component").then((m) => m.CartComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "confirmation/:orderId",
    loadComponent: () =>
      import("./confirmation/confirmation.component").then(
        (m) => m.ConfirmationComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "**",
    redirectTo: "home",
  },
];
