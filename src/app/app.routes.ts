import { Routes } from "@angular/router";
import { productsRoutes } from "./products/products.routes";

export const routes: Routes = [
  {
    path: "products",
    children: productsRoutes,
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
