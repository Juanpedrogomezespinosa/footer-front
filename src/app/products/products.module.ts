import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { importProvidersFrom } from "@angular/core";
import { ProductsListComponent } from "./components/products-list/products-list.component";

@NgModule({
  imports: [
    CommonModule,
    ProductsListComponent, // ✅ lo importas, no lo declaras
  ],
})
export class ProductsModule {}
