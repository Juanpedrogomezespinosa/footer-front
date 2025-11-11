// src/app/shared/components/product-card/product-card.component.ts
import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
// --- ¡CAMBIO AQUÍ! ---
// Importamos RouterLink para poder usar [routerLink] en el HTML
import { Router, RouterLink } from "@angular/router";
import { Product } from "app/core/services/product.service";
import { CartService } from "app/core/services/cart.service";
import { ToastService } from "app/core/services/toast.service";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-product-card",
  standalone: true,
  // --- ¡CAMBIO AQUÍ! ---
  // Añadimos RouterLink a los imports
  imports: [CommonModule, RouterLink],
  templateUrl: "./product-card.component.html",
  styleUrls: [],
})
export class ProductCardComponent {
  @Input() product!: Product;

  backendUrl: string = "http://localhost:3000";
  defaultImage: string =
    "https://placehold.co/400x400/f0f0f0/6C757D?text=Footer";

  constructor(
    private router: Router,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  // --- ¡NUEVA FUNCIÓN HELPER! ---
  isComplexProduct(): boolean {
    // Productos que sabemos que requieren seleccionar talla
    return (
      this.product.category === "zapatillas" || this.product.category === "ropa"
    );
  }

  getProductImage(): string {
    if (this.product.image && this.product.image.trim() !== "") {
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

  // --- ¡¡¡FUNCIÓN CORREGIDA!!! ---
  addToCart(event: MouseEvent): void {
    // Detiene el clic para que no se propague al div padre
    event.stopPropagation();

    // Con la nueva lógica de variantes, el botón de "añadir"
    // en la tarjeta ya no es fiable.
    // Lo mejor es redirigir al usuario a la página de detalles
    // para que seleccione la variante (color/talla) correcta.
    this.goToProductDetail();

    // --- El código antiguo (que ahora falla) ha sido eliminado ---
  }
}
