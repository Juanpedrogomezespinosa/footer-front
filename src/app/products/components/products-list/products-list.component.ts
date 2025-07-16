// src/app/products/components/products-list/products-list.component.ts

import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { FooterComponent } from "../../../shared/components/footer/footer.component";
import { ProductService, Product } from "app/core/services/product.service";

@Component({
  selector: "app-products-list",
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    ProductCardComponent,
  ],
  templateUrl: "./products-list.component.html",
  styleUrls: ["./products-list.component.scss"],
})
export class ProductsListComponent {
  products = signal<Product[]>([]);

  constructor(private productService: ProductService) {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe((productsList: Product[]) => {
      if (Array.isArray(productsList)) {
        this.products.set(productsList);
      } else {
        console.error("getProducts no devolvió un array", productsList);
        this.products.set([]);
      }
    });
  }
}
