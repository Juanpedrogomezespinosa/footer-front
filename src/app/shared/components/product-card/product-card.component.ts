import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Product } from "app/core/services/product.service";
// --- ¡SERVICIOS RESTAURADOS! ---
import { CartService } from "app/core/services/cart.service";
import { ToastService } from "app/core/services/toast.service";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-product-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./product-card.component.html",
  styleUrls: [],
})
export class ProductCardComponent {
  @Input() product!: Product;

  backendUrl: string = "http://localhost:3000";
  // --- Imagen por defecto actualizada ---
  defaultImage: string =
    "https://placehold.co/400x400/f0f0f0/6C757D?text=Footer";

  constructor(
    private router: Router,
    // --- ¡SERVICIOS RESTAURADOS! ---
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  getProductImage(): string {
    if (this.product.image && this.product.image.trim() !== "") {
      // Ruta corregida para incluir /uploads/
      return `${this.backendUrl}/uploads/${this.product.image}`;
    } else {
      return this.defaultImage;
    }
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    console.error("Error al cargar la imagen:", target.src);
    target.src = this.defaultImage;
  }

  // --- ¡FUNCIONALIDAD RESTAURADA! ---
  // (Usando la ruta original de tu fichero)
  goToProductDetail(): void {
    if (!this.product || !this.product.id) {
      console.error("Producto o ID inválido, no se puede navegar.");
      return;
    }
    // He mantenido tu ruta original de 'products/product/:id'
    this.router.navigate(["/products", "product", this.product.id]);
  }

  // --- ¡FUNCIONALIDAD RESTAURADA! ---
  addToCart(event: MouseEvent): void {
    // Detiene el clic para que no se propague al div padre (que navega al detalle)
    event.stopPropagation();

    this.cartService.addToCart(this.product.id, 1).subscribe({
      next: () => {
        this.toastService.showSuccess("Producto añadido al carrito");
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error al añadir al carrito:", err);
        this.toastService.showError(
          err.error?.message || "No se pudo añadir el producto."
        );
      },
    });
  }

  // --- getStars() ELIMINADO ---
  // (La nueva card no lo usa)
}
