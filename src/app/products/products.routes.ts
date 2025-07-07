import { Routes } from "@angular/router";
import { ProductsListComponent } from "./components/products-list/products-list.component";

export const productsRoutes: Routes = [
  {
    path: "",
    component: ProductsListComponent,
  },
];
