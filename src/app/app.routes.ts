// src/app/app.routes.ts
// --- FORZANDO RECARGA DE CACHÉ (v2) ---
import { Routes } from "@angular/router";
import { AuthGuard } from "./core/guards/auth.guard";

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

  // --- Nueva ruta de Perfil de Usuario ---
  {
    path: "profile",
    loadComponent: () =>
      import("./profile/profile.component").then((m) => m.ProfileComponent),
    canActivate: [AuthGuard], // Asegura que solo usuarios autenticados accedan
    title: "Mi Perfil",
  },
  // ----------------------------------------

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
