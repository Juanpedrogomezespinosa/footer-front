import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { productsRoutes } from "./products/products.routes";
import { AuthGuard } from "./core/guards/auth.guard"; // <-- 1. IMPORTAR TU GUARD

const routes: Routes = [
  // --- AÑADIDA RUTA HOME ---
  {
    path: "home",
    loadComponent: () =>
      import("./home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "products",
    children: productsRoutes,
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

  // --- 👇 AÑADIDAS RUTAS DE CARRITO Y CONFIRMACIÓN ---
  {
    path: "cart",
    loadComponent: () =>
      import("./cart/cart.component").then((m) => m.CartComponent),
    canActivate: [AuthGuard], // Protegida
  },
  {
    path: "confirmation/:orderId",
    loadComponent: () =>
      import("./confirmation/confirmation.component").then(
        (m) => m.ConfirmationComponent
      ),
    canActivate: [AuthGuard], // Protegida
  },
  // --- FIN DE RUTAS AÑADIDAS ---

  {
    path: "",
    redirectTo: "home", // Redirige a home en lugar de products
    pathMatch: "full",
  },
  {
    path: "**",
    redirectTo: "home", // Redirige a home en lugar de products
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
