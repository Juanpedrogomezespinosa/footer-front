// src/app/app.routes.ts

import { Routes } from "@angular/router";
import { ProductsListComponent } from "./products/components/products-list/products-list.component";

export const routes: Routes = [
  {
    path: "",
    component: ProductsListComponent,
  },
  {
    path: "**",
    redirectTo: "",
  },
];
