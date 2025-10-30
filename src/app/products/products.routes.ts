import { Routes } from "@angular/router";
import { ProductsListComponent } from "./components/products-list/products-list.component";
import { ProductDetailComponent } from "./components/product-detail/product-detail.component";

export const productsRoutes: Routes = [
  {
    // Ruta para categorías: /products/category/zapatillas
    path: "category/:categoryName",
    component: ProductsListComponent,
  },
  {
    // Ruta para un producto específico: /products/product/25
    // Se usa 'product/' para evitar ambigüedad con la ruta de categoría.
    path: "product/:id",
    component: ProductDetailComponent,
  },
  {
    // Ruta genérica o "todos los productos"
    // Debe ir al final.
    path: "",
    component: ProductsListComponent,
    pathMatch: "full",
  },
];
