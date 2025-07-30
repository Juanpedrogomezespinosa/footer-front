import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

// Componentes
import { ProductsListComponent } from "./components/products-list/products-list.component";
import { ProductDetailComponent } from "./components/product-detail/product-detail.component";
import { ProductCardComponent } from "../shared/components/product-card/product-card.component";
import { ProductsFiltersComponent } from "../shared/components/filters/products-filters.component";

// Rutas
import { productsRoutes } from "./products.routes";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(productsRoutes),
    ProductsListComponent,
    ProductDetailComponent,
    ProductCardComponent,
    ProductsFiltersComponent,
  ],
})
export class ProductsModule {}
