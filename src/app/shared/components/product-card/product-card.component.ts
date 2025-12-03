import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { Product } from "../../../core/services/product.service";
import { CartService } from "../../../core/services/cart.service";
import { ToastService } from "../../../core/services/toast.service";
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

  // URL base del backend sin '/api' y asegurando que no tenga barra final
  private _backendUrl: string = environment.apiUrl
    .replace("/api", "")
    .replace(/\/$/, "");

  defaultImage: string =
    "https://placehold.co/400x400/f0f0f0/6C757D?text=No+Image";

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
    const image = this.product.image;

    if (!image || image.trim() === "") {
      return this.defaultImage;
    }

    // 1. Si es una URL absoluta (Cloudinary, S3, o externa), devolverla tal cual.
    if (image.startsWith("http://") || image.startsWith("https://")) {
      // Corrección específica para imágenes antiguas que apuntaban a localhost
      if (image.includes("localhost:3000")) {
        return image.replace("http://localhost:3000", this._backendUrl);
      }
      return image;
    }

    // 2. Si es una ruta relativa, asegurarnos de construir bien la URL del backend
    // Evitar dobles barras // o falta de barra
    const separator = image.startsWith("/") ? "" : "/";
    return `${this._backendUrl}${separator}${image}`;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    // Evitamos bucle infinito si la imagen por defecto también falla
    if (target.src !== this.defaultImage) {
      console.warn("Error cargando imagen, usando placeholder:", target.src);
      target.src = this.defaultImage;
    }
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
