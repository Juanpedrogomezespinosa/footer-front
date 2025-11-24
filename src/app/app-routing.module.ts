import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { productsRoutes } from "./products/products.routes";
import { AuthGuard } from "./core/guards/auth.guard"; // <-- 1. IMPORTAR GUARD

const routes: Routes = [
  // ---  RUTA HOME ---
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

  // ---  RUTAS DE CARRITO Y CONFIRMACIÓN ---
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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
