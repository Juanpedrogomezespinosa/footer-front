// src/app/products/products.module.ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProductsListComponent } from "./components/products-list/products-list.component";
import { ProductsFiltersComponent } from "../shared/components/filters/products-filters.component";
import { ProductCardComponent } from "../shared/components/product-card/product-card.component";

@NgModule({
  imports: [
    CommonModule,
    ProductsListComponent,
    ProductsFiltersComponent,
    ProductCardComponent,
  ],
})
export class ProductsModule {}
