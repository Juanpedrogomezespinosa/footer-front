import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { Product } from "../../../core/services/product.service";
import { CartService } from "../../../core/services/cart.service";
import { ToastService } from "../../../core/services/toast.service";
import { HttpErrorResponse } from "@angular/common/http";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-product-card",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./product-card.component.html",
  styleUrls: [],
})
export class ProductCardComponent {
  @Input() product!: Product;

  // URL dinámica: quitamos '/api' para obtener la raíz del backend (para imágenes)
  backendUrl: string = environment.apiUrl.replace("/api", "");

  defaultImage: string =
    "https://placehold.co/400x400/f0f0f0/6C757D?text=Footer";

  constructor(
    private router: Router,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  isComplexProduct(): boolean {
    return (
      this.product.category === "zapatillas" || this.product.category === "ropa"
    );
  }

  getProductImage(): string {
    if (this.product.image && this.product.image.trim() !== "") {
      // SI la imagen ya viene con http://localhost, la reemplazamos por la de producción
      if (this.product.image.includes("localhost:3000")) {
        return this.product.image.replace(
          "http://localhost:3000",
          this.backendUrl
        );
      }
      // Si la imagen es una URL externa (ej: https://...), la devolvemos tal cual
      if (this.product.image.startsWith("http")) {
        return this.product.image;
      }
      // Si es relativa (/uploads/...), le pegamos la URL del backend
      return `${this.backendUrl}${this.product.image}`;
    } else {
      return this.defaultImage;
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    console.error("Error al cargar la imagen:", target.src);
    target.src = this.defaultImage;
  }

  goToProductDetail(): void {
    if (!this.product || !this.product.id) {
      console.error("Producto o ID inválido, no se puede navegar.");
      return;
    }
    this.router.navigate(["/products", "product", this.product.id]);
  }

  addToCart(event: MouseEvent): void {
    event.stopPropagation();
    this.goToProductDetail();
  }
}
