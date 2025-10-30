// src/app/app.routes.ts
import { Routes } from "@angular/router";

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

  // --- 👇 RUTAS AÑADIDAS ---

  {
    path: "cart",
    loadComponent: () =>
      import("./cart/cart.component").then((m) => m.CartComponent),
  },
  // {
  //   path: "confirmation/:orderId",
  //   loadComponent: () =>
  //     import("./confirmation/confirmation.component").then(
  //       (m) => m.ConfirmationComponent
  //     ),
  // },

  // --- FIN DE RUTAS AÑADIDAS ---

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
