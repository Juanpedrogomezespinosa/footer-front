import { Component, Input, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Product, ProductService } from "app/core/services/product.service";
import { ProductCardComponent } from "../product-card/product-card.component";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-related-products",
  standalone: true,
  // Importamos ProductCardComponent para poder usar <app-product-card>
  imports: [CommonModule, ProductCardComponent, RouterModule],
  templateUrl: "./related-products.component.html",
})
export class RelatedProductsComponent implements OnInit {
  // Recibimos el ID del producto actual para excluirlo
  @Input() currentProductId!: number;

  public relatedProducts = signal<Product[]>([]);
  public isLoading = signal(true);

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    if (!this.currentProductId) {
      this.isLoading.set(false);
      return;
    }

    // Llamamos al nuevo método del servicio
    this.productService.getRelatedProducts(this.currentProductId).subscribe({
      next: (products) => {
        this.relatedProducts.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Error al cargar productos relacionados:", err);
        this.isLoading.set(false);
      },
    });
  }
}
