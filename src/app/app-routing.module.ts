import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { productsRoutes } from "./products/products.routes";

const routes: Routes = [
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
  {
    path: "",
    redirectTo: "products",
    pathMatch: "full",
  },
  {
    path: "**",
    redirectTo: "products",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
