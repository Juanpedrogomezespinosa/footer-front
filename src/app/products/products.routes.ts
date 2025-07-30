import { Routes } from "@angular/router";
import { ProductsListComponent } from "./components/products-list/products-list.component";
import { ProductDetailComponent } from "./components/product-detail/product-detail.component";

export const productsRoutes: Routes = [
  {
    path: "",
    component: ProductsListComponent,
  },
  {
    path: ":id",
    component: ProductDetailComponent,
  },
];
